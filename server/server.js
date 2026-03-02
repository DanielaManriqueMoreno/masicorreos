// server.js - Servidor Express
import nodemailer from 'nodemailer';
import express from 'express';
import fs from 'fs';
import cors from 'cors';
import XLSX from 'xlsx';
import dotenv from 'dotenv';
import path from 'path';
import upload from '../src/components/Envios/utils/multer.js';
import { fileURLToPath } from 'url';
import pool, { testConnection } from './database.js';
import { sendPasswordResetEmail } from './emailService.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import crypto from 'crypto';
import cron from 'node-cron';
import generarPlantilla from './emailTemplates.js';

const enviarCorreo = async ({ remitente_id, to, subject, html }) => {

  const [rows] = await pool.execute(
    "SELECT * FROM remitentes WHERE id = ? AND estado = 'ACTIVO'",
    [remitente_id]
  );

  if (!rows.length) {
    throw new Error("Remitente no encontrado o inactivo");
  }

  const remitente = rows[0];

  const transporter = nodemailer.createTransport({
    host: remitente.smtp_host,
    port: remitente.smtp_port,
    secure: !!remitente.secure,
    auth: {
      user: remitente.correo,
      pass: remitente.password_app
    }
  });
  console.log("Configuración SMTP:", {
    host: remitente.smtp_host,
    port: remitente.smtp_port,
    secure: remitente.secure,
    user: remitente.correo
  });
  await transporter.sendMail({
    from: `"${remitente.nombre}" <${remitente.correo}>`,
    to,
    subject,
    html
  });
};

// Cargar .env PRIMERO antes de importar otros módulos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const logActivity = async (userId, action, description, module = null) => {
  try {
    if (!userId || !action) {
      console.warn("logActivity: faltan datos obligatorios");
      return;
    }

    await pool.execute(`INSERT INTO activity_logs (user_id, action, description, module) VALUES (?, ?, ?, ?)`, [userId, action, description || '', module] );

  } catch (error) {
    console.error("Error registrando actividad:", error);
  }
};

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    const [rows] = await pool.execute(
      'SELECT documento, nombre, correo, password, rol, estado FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const usuario = rows[0];

    // Usuario INACTIVO
    if (usuario.estado === "INACTIVO") {
      return res.json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    // Validar contraseña
    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) {
      return res.json({
        success: false,
        message: 'Contraseña incorrecta'
      });
    }

    // Áreas
    const [areas] = await pool.execute(
      'SELECT id_area FROM area_usuario WHERE id_usuario = ?',
      [usuario.documento]
    );

    // Login exitoso
    res.json({
      success: true,
      user: {
        documento: usuario.documento,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        areas: areas.map(a => a.id_area)
      }
    });

  } catch (error) {
    console.error('ERROR LOGIN:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

// Listar usuarios (ADMIN)
app.get('/api/admin/usuarios', async (req, res) => {
  try {
    const [usuarios] = await pool.execute(`
      SELECT 
        documento,
        nombre,
        correo,
        rol,
        estado
      FROM usuarios
      ORDER BY documento DESC
    `);

    res.json({
      success: true,
      usuarios
    });

  } catch (error) {
    console.error('ERROR OBTENER USUARIOS:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo usuarios'
    });
  }
});

// Crear usuario (ADMIN)
app.post('/api/admin/crear-usuario', async (req, res) => {
  try {
  console.log('Recibido: ', req.body);
    const {
      documento,
      nombre,
      correo,
      password,
      rol,
      estado,
      areas,
      usuarioCreadorDocumento
    } = req.body;

    // Validaciones básicas todos los campos deben estare llenos
    if (!documento || !nombre || !correo || !password || !rol) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }

    // Verificar si ya existe usuario
    const [existe] = await pool.execute(
      'SELECT documento FROM usuarios WHERE correo = ? OR documento = ?',
      [correo, documento]
    );

    if (existe.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [result] = await pool.execute(
      `INSERT INTO usuarios 
        (documento, nombre, correo, password, rol, estado, creado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [documento, nombre, correo, passwordHash, rol, estado, usuarioCreadorDocumento]
    );

    // Guardar áreas (si no es administrador)
    if (Array.isArray(areas) && areas.length > 0) {
      for (const area of areas) {
        await pool.execute(
          'INSERT INTO area_usuario (id_usuario, id_area) VALUES (?, ?)',
          [documento, area]
        );
      }
    }

    if (usuarioCreadorDocumento) {
      await logActivity(usuarioCreadorDocumento,'CREAR_USUARIO',`Usuario creado: ${nombre} (${documento})`,'USUARIOS');
    }

    res.json({
      success: true,
      message: 'Usuario creado correctamente'
    });

  } catch (error) {
    console.error('ERROR CREAR USUARIO:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// ACTUALIZAR PERFIL DE USUARIO
app.put("/api/perfil", async (req, res) => {
  try {
    const { documento, nombre, correo, password } = req.body;

    // Validaciones
    if (!documento || !nombre || !correo) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }

    // Verificar que el usuario exista
    const [usuarios] = await pool.execute(
      'SELECT documento FROM usuarios WHERE documento = ?',
      [documento]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que el correo no esté en uso por otro usuario
    const [correoExiste] = await pool.execute(
      'SELECT documento FROM usuarios WHERE correo = ? AND documento != ?',
      [correo, documento]
    );

    if (correoExiste.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya está en uso'
      });
    }

    // Construir query dinámico
    let query = 'UPDATE usuarios SET nombre = ?, correo = ?';
    let params = [nombre, correo];

    if (password && password.trim() !== '') {
      const passwordHash = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(passwordHash);
    }

    query += ' WHERE documento = ?';
    params.push(documento);

    await pool.execute(query, params);

    // Devolver usuario actualizado (sin password)
    const [usuarioActualizado] = await pool.execute(
      'SELECT documento, nombre, correo, rol FROM usuarios WHERE documento = ?',
      [documento]
    );

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: usuarioActualizado[0]
    });
    if (documento) {
      await logActivity(documento,'ACTUALIZAR_PERFIL',`Perfil actualizado`,'USUARIOS');
    }

  } catch (error) {
    console.error('ERROR ACTUALIZAR PERFIL:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

//editar usuarios desde ADMIN
app.put('/api/admin/usuarios/:documento', async (req, res) => {
  const conn = await pool.getConnection();
  const documentoAdmin = req.body.documentoAdmin;

  try {
    const { documento } = req.params;
    const { nombre, correo, estado, password, areas } = req.body;

    if (!nombre || !correo || !estado) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }

    await conn.beginTransaction();

    let query = `UPDATE usuarios SET nombre = ?, correo = ?, estado = ? `;
    const params = [nombre, correo, estado];

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query += `, password = ?`;
      params.push(hash);
    }

    query += ` WHERE documento = ?`;
    params.push(documento);

    await conn.execute(query, params);

    // Borrar áreas actuales
    await conn.execute(
      'DELETE FROM area_usuario WHERE id_usuario = ?',
      [documento]
    );

    // Insertar áreas nuevas
    if (Array.isArray(areas)) {
      for (const areaId of areas) {
        await conn.execute(
          'INSERT INTO area_usuario (id_usuario, id_area) VALUES (?, ?)',
          [documento, areaId]
        );
      }
    }
    await conn.commit();
    res.json({
      success: true,
      message: 'Usuario actualizado correctamente'
    });
    if (documentoAdmin) {
      await logActivity(documentoAdmin,'ACTUALIZAR_USUARIO',`Usuario actualizado: ${documento}`,'USUARIOS');
    }

  } catch (error) {
    await conn.rollback();
    console.error('ERROR EDITAR USUARIO:', error);

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    conn.release();
  }
});

// Obtener detalles de un usuario (ADMIN)
app.get('/api/admin/usuarios/:documento', async (req, res) => {
  try {
    const { documento } = req.params;

    const [userRows] = await pool.execute(
      'SELECT documento, nombre, correo, rol, estado FROM usuarios WHERE documento = ?',
      [documento]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const [areasRows] = await pool.execute(
      'SELECT id_area FROM area_usuario WHERE id_usuario = ?',
      [documento]
    );

    res.json({
      success: true,
      user: {
        ...userRows[0],
        areas: areasRows.map(a => a.id_area)
      }
    });

  } catch (error) {
    console.error('ERROR OBTENER USUARIO:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const { documento } = req.query;

    const [rows] = await pool.execute( `SELECT documento, nombre, correo, rol, estado FROM usuarios WHERE documento = ?`, [documento] );

    if (rows.length === 0) {
      return res.status(401).json({ success: false });
    }

    if (rows[0].estado !== 'ACTIVO') {
      return res.status(401).json({ success: false });
    }

    const [areas] = await pool.execute(
      'SELECT id_area FROM area_usuario WHERE id_usuario = ?',
      [documento]
    );

    res.json({
      success: true,
      user: {
        ...rows[0],
        areas: areas.map(a => a.id_area)
      }
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

//====================== ENDPOINST AREAS ====================
// Obtener las areas activas para asignar a los usuarios y para filtrar plantillas
app.get('/api/areas', async (req, res) => {
  try {
    const [areas] = await pool.execute(
      'SELECT id, nombre FROM areas WHERE estado = "ACTIVO" ORDER BY nombre'
    );

    res.json(areas);
  } catch (error) {
    console.error('Error cargando áreas:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

//Obtener todas las áreas (incluso inactivas) para administración
app.get('/api/admin/areas', async (req, res) => {
  try {
    const [areas] = await pool.execute(
      'SELECT * FROM areas ORDER BY nombre'
    );

    res.json(areas);
    console.log("Áreas admin:", areas);
  } catch (error) {
    console.error('Error cargando áreas admin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

//Crear nueva área
app.post('/api/admin/areas', async (req, res) => {
  try {
    const { nombre } = req.body;
    const documento = req.body.documento;
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre es obligatorio"
      });
    }
    console.log("Documento recibido:", documento);
    await pool.execute(
      'INSERT INTO areas (nombre, estado) VALUES (?, "ACTIVO")',
      [nombre]
    );
    console.log("Documento recibido:", documento);
    if (documento) {
      await logActivity(documento,'CREAR_AREA',`Área creada: ${nombre}`,
        'AREAS'
      );
    }
    res.json({ success: true, message: "Área creada correctamente" });

  } catch (error) {
    console.error("Error creando área:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

//Editar área
app.put('/api/admin/areas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, estado } = req.body;
    const documento = req.body.documento;

    if (!nombre || !estado) {
      return res.status(400).json({
        success: false,
        message: "Nombre y estado son obligatorios"
      });
    }

    await pool.execute(
      'UPDATE areas SET nombre = ?, estado = ? WHERE id = ?',
      [nombre, estado, id]
    );

    if (documento) {
      await logActivity(documento,'ACTUALIZAR_AREA',`Área actualizada: ${nombre}`,'AREAS');
    }
    res.json({ success: true, message: "Área actualizada correctamente" });

  } catch (error) {
    console.error("Error actualizando área:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

//Eliminar Area
app.delete('/api/admin/areas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { documento } = req.query;

    const [areaRows] = await pool.execute('SELECT nombre FROM areas WHERE id = ?', [id]);
    if (!areaRows.length) {
      return res.status(404).json({
        success: false,
        message: "Área no encontrada"
      });
    }
    const nombreArea = areaRows[0].nombre;

    await pool.execute('DELETE FROM areas WHERE id = ?', [id]);

    if (documento) {
      await logActivity(documento, 'ELIMINAR_AREA', `Área eliminada: ${nombreArea}`, 'AREAS' );
    }

    res.json({ success: true });

  } catch (error) {
    console.error("Error eliminando área:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ENDPOINTS DE RECUPERACIÓN DE CONTRASEÑA ====================

// Solicitar recuperación de contraseña
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { correo } = req.body;
    // Validaciones
    if (!correo) {
      return res.status(400).json({ 
        success: false, 
        message: 'El correo es obligatorio' 
      });
    }

    // Buscar usuario por correo
    const [users] = await pool.execute(
      'SELECT documento, nombre, correo FROM usuarios WHERE correo = ? AND estado = "ACTIVO"',
      [correo.trim()]
    );

    // Por seguridad, siempre devolver éxito (no revelar si el usuario existe o no)
    if (users.length === 0) {
      console.log('Intento de recuperación para usuario inexistente:', correo);
      return res.json({
        success: true,
        message: 'Si el usuario existe, recibirás un correo con las instrucciones para recuperar tu contraseña.'
      });
    }

    const user = users[0];

    // Generar código numérico de 6 dígitos
    const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Código válido por 1 hora

    // Guardar código en la base de datos (usamos el campo reset_token para guardar el código)
    await pool.execute(
      'UPDATE usuarios SET reset_token = ?, reset_token_expires = ? WHERE documento = ?',
      [codigoVerificacion, resetTokenExpires, user.documento]
    );

    // Enviar correo de recuperación con el código
    try {
      await sendPasswordResetEmail(user.correo, codigoVerificacion, user.nombre || user.correo);
      console.log(`Correo de recuperación enviado a: ${user.correo}`);
    } catch (emailError) {
      console.error('Error enviando correo de recuperación:', emailError);
      // Limpiar token si falla el envío
      await pool.execute(
        'UPDATE usuarios SET reset_token = NULL, reset_token_expires = NULL WHERE documento = ?',
        [user.documento]
      );
      return res.status(500).json({
        success: false,
        message: 'Error al enviar el correo de recuperación. Por favor, intenta más tarde.'
      });
    }

    // Registrar actividad
    await logActivity(user.documento,'SOLICITAR_RECUPERACION_PASSWORD','Solicitud de recuperación de contraseña','AUTH');

    res.json({
      success: true,
      message: 'Si el usuario existe, recibirás un correo con las instrucciones para recuperar tu contraseña.'
    });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

 // Resetear contraseña con código
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validaciones
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Código de verificación y nueva contraseña son obligatorios' 
      });
    }

    // Validar que el token sea un código numérico de 6 dígitos
    if (!/^\d{6}$/.test(token)) {
      return res.status(400).json({ 
        success: false, 
        message: 'El código de verificación debe ser un número de 6 dígitos' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'La contraseña debe tener al menos 8 caracteres' 
      });
    }

    // Buscar usuario con código válido
    const [users] = await pool.execute(
      'SELECT documento, correo FROM usuarios WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificación inválido o expirado. Por favor, solicita un nuevo código.'
      });
    }

    const user = users[0];

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar token
    await pool.execute(
      'UPDATE usuarios SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE documento = ?',
      [hashedPassword, user.documento]
    );

    // Registrar actividad
    await logActivity(user.documento,'RESET_PASSWORD','Contraseña restablecida exitosamente','AUTH');
    console.log(`✅ Contraseña restablecida para usuario: ${user.usuario}`);

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
    });

  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// ==================== ENDPOINTS DE ENVÍO DE CORREOS ====================
app.post('/api/envios', upload.single('archivo'), async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { documento } = req.body;
    if (!documento) { 
      return res.status(401).json({
        ok: false,
        message: 'Documento requerido'
      });
    }

    const usuarioId = documento;

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: 'Debe subir un archivo Excel'
      });
    }

    const {
      plantilla_id,
      remitente_id,
      modoEnvio,
      programadoPara
    } = req.body;

    // Validaciones básicas
    if (!plantilla_id || !remitente_id) {
      return res.status(400).json({
        ok: false,
        message: 'Debe seleccionar plantilla y remitente'
      });
    }

    if (modoEnvio === 'programado' && !programadoPara) {
      return res.status(400).json({
        ok: false,
        message: 'Debe indicar fecha programada'
      });
    }

    await conn.beginTransaction();

    // VALIDACIÓN REAL DE ACCESO POR ÁREA
  const [usuarios] = await conn.execute(
    'SELECT rol FROM usuarios WHERE documento = ?',
    [documento]
  );

  if (!usuarios.length) {
    await conn.rollback();
    return res.status(404).json({
      ok: false,
      message: 'Usuario no encontrado'
    });
  }

  const rol = usuarios[0].rol;

  let plantillaRows;

  // SI ES ADMIN → no validar área
  if (rol === 'ADMINISTRADOR') {

    const [rows] = await conn.execute(`SELECT p.id, p.nom_plantilla, p.html_content, a.nombre AS nombre_area FROM plantillas p LEFT JOIN areas a ON p.area_id = a.id WHERE p.id = ? AND p.estado = 'ACTIVO'`, [plantilla_id] );

    plantillaRows = rows;

  } else {

    //SI ES USUARIO NORMAL → validar área
    const [rows] = await conn.execute(
      `SELECT p.id, p.nom_plantilla, p.html_content FROM plantillas p INNER JOIN area_usuario au ON au.id_area = p.area_id WHERE p.id = ? AND au.id_usuario = ? AND p.estado = 'ACTIVO' `,
      [plantilla_id, documento]
    );

    plantillaRows = rows;
  }

  if (!plantillaRows.length) {
    await conn.rollback();
    return res.status(403).json({
      ok: false,
      message: 'No tiene acceso a la plantilla'
    });
  }

  const plantilla = plantillaRows[0];

    // Validar que el remitente esté activo
    const [remitenteRows] = await conn.execute(
      `SELECT id FROM remitentes WHERE id = ? AND estado = 'ACTIVO'`,
      [remitente_id]
    );

    if (!remitenteRows.length) {
      await conn.rollback();
      return res.status(400).json({
        ok: false,
        message: 'Remitente inválido o inactivo'
      });
    }

    // Crear registro del envío
    const tipo = modoEnvio === 'programado' ? 'PROGRAMADO' : 'INMEDIATO';
    const estadoInicial = 'pendiente';

    const [envioResult] = await conn.execute(
      `INSERT INTO envios (plantilla_id, remitente_id, asunto, mensaje, tipo, estado, fecha_programada, fecha_envio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plantilla_id,
        remitente_id,
        plantilla.nom_plantilla,
        plantilla.html_content,
        tipo,
        estadoInicial,
        modoEnvio === 'programado' ? programadoPara : null,
        modoEnvio === 'inmediato' ? new Date() : null
      ]
    );
    const envioId = envioResult.insertId;

    // Leer Excel
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      await conn.rollback();
      return res.status(400).json({
        ok: false,
        message: 'El archivo Excel está vacío'
      });
    }

    let enviados = 0;
    let fallidos = 0;
    let total = 0;

    for (const row of rows) {

  const correo = row.Correo || row.correo;
  if (!correo) continue;

  //  Transformar fechas y horas Excel
  for (const key in row) {
    const value = row[key];

    // Fecha Excel (número grande)
    if (typeof value === "number" && value > 30000) {
      const excelDate = new Date((value - 25569) * 86400 * 1000);
      row[key] = excelDate.toLocaleDateString("es-CO");
    }

    // Hora Excel (decimal entre 0 y 1)
    else if (typeof value === "number" && value > 0 && value < 1) {
      const totalSeconds = Math.round(value * 86400);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      row[key] = `${hours}:${minutes.toString().padStart(2, "0")}`;
    }
  }

  await conn.execute(`INSERT INTO destinatarios_envio (envio_id, correo, estado, datos_json) VALUES (?, ?, 'pendiente', ?) `,
    [
      envioId,
      correo,
      JSON.stringify(row)
    ]
  );
}

    //  Estado final
    await conn.execute(
      `UPDATE envios SET total_destinatarios = ? WHERE id = ? `,
      [total, envioId]
    );

    await conn.commit();

    if (usuarioId) {
      await logActivity( usuarioId, 'ENVIO_CORREOS', `Envío realizado - Plantilla "${plantilla.nom_plantilla}" del área "${plantilla.nombre_area}" enviada a ${rows.length} destinatarios`, 'ENVIOS' );
    }
    res.json({
      ok: true,
      results: {
        total: rows.length,
        enviados,
        fallidos,
        programados: modoEnvio === 'programado' ? rows.length : 0
      }
    });

  } catch (error) {
    await conn.rollback();
    console.error('Error en /api/envios:', error);

    res.status(500).json({
      ok: false,
      message: 'Error procesando envío'
    });
    if (usuarioId) {
      await logActivity(usuarioId, 'ENVIO_ERROR', 'Error procesando envío', 'ENVIOS' );
    }
  } finally {
    conn.release();
  }
});

// Procesar correos programados pendientes
const processScheduledEmails = async () => {
  try {
    const [envios] = await pool.execute(
      `SELECT * FROM envios WHERE tipo = 'PROGRAMADO' AND estado = 'pendiente' AND fecha_programada <= NOW()` );
    for (const envio of envios) {

      const [destinatarios] = await pool.execute(
        `SELECT * FROM destinatarios_envio WHERE envio_id = ? AND estado = 'pendiente'`, [envio.id] );
      for (const dest of destinatarios) {
        try {
          await pool.execute(
            `UPDATE destinatarios_envio SET estado = 'enviado' WHERE id = ?`, [dest.id] );

        } catch (err) {
          await pool.execute(
            `UPDATE destinatarios_envio SET estado = 'fallido', error_mensaje = ? WHERE id = ?`,[err.message, dest.id]);
        }
      }

      await pool.execute( `UPDATE envios SET estado = 'enviado', fecha_envio = NOW() WHERE id = ?`, [envio.id]);
    }

  } catch (error) {
    console.error('Error en scheduler:', error);
  }
};

// =============== REMITENTES ==================
// OBTENER REMITENTES ACTIVOS
app.get('/api/remitentes', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, nombre, correo FROM remitentes WHERE estado = 'ACTIVO'"
    );

    res.json(rows);

  } catch (error) {
    console.error("Error obteniendo remitentes:", error);
    res.status(500).json({
      ok: false,
      message: "Error obteniendo remitentes"
    });
  }
});


// Iniciar el scheduler (se ejecuta cada minuto)
const startScheduler = () => {
  console.log('⏰ [SCHEDULER] Iniciando scheduler de correos programados...');
  
  // Ejecutar cada minuto (* * * * *)
  cron.schedule('* * * * *', async () => {
    await processScheduledEmails();
  });

  console.log('✅ [SCHEDULER] Scheduler activo - revisando correos cada minuto');
};

// ==================== ENDPOINTS DE PLANTILLAS ====================
// Listar plantillas por área
app.get('/api/templates', async (req, res) => {
  try {
    const { area_id } = req.query;

    let query = 'SELECT * FROM plantillas WHERE estado = "ACTIVO"';
    const params = [];

    if (area_id) {
      query += ' AND area_id = ?';
      params.push(area_id);
    }

    const [rows] = await pool.execute(query, params);

    res.json(rows);
  } catch (error) {
    console.error('Error cargando plantillas:', error);
    res.status(500).json({ success: false });
  }
});

// Crear nueva plantilla
app.post('/api/templates', async (req, res) => {
  try {
    const { userId, nombre, descripcion, htmlContent, variables, area_id } = req.body;

    if (!userId || !nombre || !htmlContent || !area_id) {
      return res.status(400).json({
        success: false,
        message: 'userId, nombre, htmlContent y area_id son requeridos'
      });
    }

    const variablesJson = variables ? JSON.stringify(variables) : '';

    const [result] = await pool.execute(
      `INSERT INTO plantillas (user_id, nom_plantilla, descripcion, html_content, variables, area_id, estado)  VALUES (?, ?, ?, ?, ?, ?, 'ACTIVO')`, [userId, nombre, descripcion || '', htmlContent, variablesJson, area_id]);
    if (userId) {
      await logActivity(parseInt(userId),'CREAR_PLANTILLA',`Plantilla creada: ${nombre}`,'PLANTILLAS');
    }

    res.status(201).json({
      success: true,
      message: 'Plantilla creada exitosamente',
      templateId: result.insertId
    });

  } catch (error) {
    console.error('Error creando plantilla:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Actualizar plantilla
app.put('/api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, nombre, descripcion, contenido } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId es requerido'
      });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM plantillas WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    const updateFields = [];
    const updateValues = [];

    if (nombre !== undefined) {
      updateFields.push('nom_plantilla = ?');
      updateValues.push(nombre);
    }

    if (descripcion !== undefined) {
      updateFields.push('descripcion = ?');
      updateValues.push(descripcion);
    }

    if (contenido !== undefined) {
      updateFields.push('html_content = ?');
      updateValues.push(contenido);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    updateValues.push(id, userId);

    await pool.execute(
      `UPDATE plantillas SET ${updateFields.join(', ')}  WHERE id = ? AND user_id = ?`, updateValues );
   if (userId) {
      await logActivity(parseInt(userId),'ACTUALIZAR_PLANTILLA',`Plantilla actualizada: ${nombre}`,'PLANTILLAS');
    }

    res.json({
      success: true,
      message: 'Plantilla actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando plantilla:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al actualizar la plantilla'
    });
  }
});

// Eliminar plantilla
app.delete('/api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId es requerido' });
    }

    // Verificar que la plantilla pertenece al usuario
    const [existing] = await pool.execute(
      'SELECT nombre FROM plantillas WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
    }

    await pool.execute(
      'DELETE FROM plantillas WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (userId) {
      await logActivity(parseInt(userId),'ELIMINAR_PLANTILLA',`Plantilla eliminada: ${existing[0].nombre}`,'PLANTILLAS');
    }

    res.json({ success: true, message: 'Plantilla eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando plantilla:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Descargar plantilla 
app.get('/api/templates/:id/download-excel', async (req, res) => {
  try {
    const { id } = req.params;

    const [templates] = await pool.execute(
      'SELECT * FROM plantillas WHERE id = ? AND estado = ?',
      [id, 'ACTIVO']
    );

    if (templates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada o inactiva'
      });
    }

    const template = templates[0];
    let variables = [];

    if (template.variables) {
      try {
        variables = JSON.parse(template.variables)
          .map(v => v.trim())
          .filter(Boolean);
      } catch (e) {
        console.error("Error parseando variables:", template.variables);
      }
    }

    const columns = [
      'Correo',
      ...variables,
      'Asunto',
    ];
    
    const exampleRow = {};
    columns.forEach(col => exampleRow[col] = '');

    const worksheet = XLSX.utils.json_to_sheet([exampleRow], {
      header: columns
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx'
    });

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=plantilla_${template.nom_plantilla}.xlsx`
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.send(buffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error generando el archivo Excel'
    });
  }
});

// Plantillas disponibles para ususario por area
app.get('/api/plantillas-disponibles', async (req, res) => {
  try {
    const { documento } = req.query;

    if (!documento) {
      return res.status(400).json({
        ok: false,
        message: 'Documento requerido'
      });
    }

    const [usuarios] = await pool.execute(
      'SELECT rol FROM usuarios WHERE documento = ?',
      [documento]
    );

    if (!usuarios.length) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado'
      });
    }

    const rol = usuarios[0].rol;

    let query;
    let params = [];

    if (rol === 'ADMINISTRADOR') {

      query = `
        SELECT id, nom_plantilla, html_content FROM plantillas WHERE estado = 'ACTIVO' ORDER BY nom_plantilla `;
    } else {

      query = `SELECT p.id, p.nom_plantilla, p.html_content FROM plantillas p INNER JOIN area_usuario au ON au.id_area = p.area_id WHERE au.id_usuario = ? AND p.estado = 'ACTIVO' ORDER BY p.nom_plantilla `;
      params = [documento];
    }

    const [rows] = await pool.execute(query, params);

    res.json(rows);

  } catch (error) {
    console.error("Error obteniendo plantillas:", error);
    res.status(500).json({
      ok: false,
      message: 'Error obteniendo plantillas'
    });
  }
});

// ============================================
// RUTAS PARA VER REGISTROS
// ============================================

// Obtener registros de actividad
app.get('/api/registros/actividad', async (req, res) => {
  try {
    const { userId, action, fechaInicio, fechaFin, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const offset = (pageNumber - 1) * pageSize;

    let where = `WHERE al.action NOT IN ('SOLICITAR_RECUPERACION_PASSWORD', 'RESET_PASSWORD')`;

    const params = [];

    if (userId && userId !== 'todos') {
      where += ' AND al.user_id = ?';
      params.push(userId);
    }

    if (action && action !== 'todas') {
      where += ' AND al.action = ?';
      params.push(action);
    }

    if (fechaInicio) {
      where += ' AND DATE(al.timestamp) >= ?';
      params.push(fechaInicio);
    }

    if (fechaFin) {
      where += ' AND DATE(al.timestamp) <= ?';
      params.push(fechaFin);
    }

    // Total de registros
    const [totalRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM activity_logs al ${where}`,params
    );

    const total = totalRows[0].total;

    // 📋 Datos paginados
    const [registros] = await pool.execute(
      `SELECT al.*, u.nombre as user_nombre FROM activity_logs al JOIN usuarios u ON al.user_id = u.documento ${where} ORDER BY al.timestamp DESC LIMIT ? OFFSET ?`, [...params, pageSize, offset] );
    res.json({
      success: true,
      registros,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNumber
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// Middleware para manejar rutas API no encontradas 
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Ruta API no encontrada: ${req.method} ${req.path}` 
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    console.log('🔍 Verificando conexión a MySQL...');
    
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ No se pudo conectar a MySQL');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('✅ Servidor iniciado correctamente');
      console.log(`http://localhost:${PORT}`);
      
      startScheduler();
    });

  } catch (error) {
    console.error('❌ ERROR INICIANDO SERVIDOR');
    console.error(error);
    process.exit(1);
  }
};

startServer();