import pool from './database.js';
import generarPlantilla from './emailTemplates.js';
import { enviarCorreo } from './mailer.js';

const procesarEnvios = async () => {
  const conn = await pool.getConnection();

  try {
    // Buscar envíos pendientes
    const [envios] = await conn.execute(
      `SELECT * FROM envios WHERE estado = 'pendiente' LIMIT 5`
    );

    for (const envio of envios) {

      console.log("Procesando envío:", envio.id);

      await conn.execute(
        `UPDATE envios SET estado = 'procesando', fecha_inicio = NOW() WHERE id = ?`,
        [envio.id]
      );

      const [destinatarios] = await conn.execute(
        `SELECT * FROM destinatarios_envio WHERE envio_id = ? AND estado = 'pendiente'`,
        [envio.id]
      );

      let enviados = 0;
      let fallidos = 0;

      for (const dest of destinatarios) {

        try {
          let htmlFinal = envio.mensaje;
          let asuntoFinal = envio.asunto;

          const datosOriginal = dest.datos_json
            ? JSON.parse(dest.datos_json)
            : {};

          // Normalizar claves a minúsculas sin espacios
          const datos = {};

          for (const key in datosOriginal) {
            datos[key.trim().toLowerCase()] = datosOriginal[key];
          }

          // Reemplazo inteligente
          htmlFinal = htmlFinal.replace(/{{\s*(.*?)\s*}}/g, (match, p1) => {
            const clave = p1.trim().toLowerCase();
            return datos[clave] ?? match;
          });

          asuntoFinal = asuntoFinal.replace(/{{\s*(.*?)\s*}}/g, (match, p1) => {
            const clave = p1.trim().toLowerCase();
            return datos[clave] ?? match;
          });
          const htmlConLayout = generarPlantilla(htmlFinal);
          await enviarCorreo({
            remitente_id: envio.remitente_id,
            to: dest.correo,
            subject: asuntoFinal,
            html: htmlConLayout
          });

          await conn.execute(
            `UPDATE destinatarios_envio SET estado = 'enviado', fecha_envio = NOW() WHERE id = ?`,
            [dest.id]
          );

          enviados++;

        } catch (err) {

          await conn.execute(
            `UPDATE destinatarios_envio SET estado = 'fallido', mensaje_error = ?, intentos = intentos + 1 WHERE id = ?`,
            [err.message, dest.id]
          );

          fallidos++;
        }
      }

      let estadoFinal = 'completado';

      if (fallidos === destinatarios.length) estadoFinal = 'fallido';
      else if (fallidos > 0) estadoFinal = 'parcial';

      await conn.execute(
        `UPDATE envios SET estado = ?, enviados = ?, fallidos = ?, fecha_fin = NOW() WHERE id = ? `,
        [estadoFinal, enviados, fallidos, envio.id]
      );
    }

  } catch (error) {
    console.error("Error en worker:", error);
  } finally {
    conn.release();
  }
};

// Ejecutar cada 10 segundos
setInterval(procesarEnvios, 10000);

console.log("Worker de envíos iniciado 🚀");