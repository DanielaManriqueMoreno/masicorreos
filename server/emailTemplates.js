const generarPlantilla = (mensaje) => {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>

  <body style="margin:0;padding:0;background-color:#e9f2f7;font-family:Arial,Helvetica,sans-serif;">

    <div style="max-width:650px;margin:30px auto;background:#ffffff;border-radius:6px;overflow:hidden;border:1px solid #d6e4f0;">

      <!-- FRANJA SUPERIOR -->
      <div style="background-color:#0f4c75;height:10px;"></div>

      <!-- HEADER -->
      <div style="padding:25px 30px;text-align:center;">
        <div style="font-size:20px;font-weight:700;color:#0f4c75;letter-spacing:1px;">
          UNIDAD MATERNO INFANTIL DEL TOLIMA
        </div>

        <div style="margin-top:8px;font-size:13px;color:#3282b8;">
          Comprometidos con la salud y el bienestar
        </div>
      </div>

      <!-- LINEA DECORATIVA -->
      <div style="height:3px;background:linear-gradient(to right,#0f4c75,#3282b8);margin:0 30px;"></div>

      <!-- CONTENIDO -->
      <div style="padding:30px;font-size:14px;line-height:1.7;color:#333333;">
        ${mensaje}
      </div>

      <!-- FOOTER -->
      <div style="background-color:#0f4c75;color:#ffffff;padding:25px;text-align:center;font-size:12px;">

        <div style="margin-bottom:10px;font-weight:600;">
          Unidad Materno Infantil del Tolima
        </div>

        <div>
          📍 Ibagué, Tolima – Colombia
        </div>

        <div>
          ☎ 312 432 7635 &nbsp; | &nbsp; 608 277 1686
        </div>

        <div>
          🌐 www.umit.com.co
        </div>

        <div style="margin-top:12px;opacity:0.8;font-size:11px;">
          Este es un mensaje oficial de la Unidad Materno Infantil del Tolima.
          No solicitamos pagos por medios virtuales no autorizados.
        </div>

      </div>

    </div>

  </body>
  </html>
  `;
};

export default generarPlantilla;