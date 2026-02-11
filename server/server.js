// server.js - Servidor Express
import express from 'express';
import fs from 'fs';
import cors from 'cors';
import XLSX from 'xlsx';
import dotenv from 'dotenv';
import path from 'path';
import upload from '../src/components/Envios/utils/multer.js';
import { fileURLToPath } from 'url';

// Cargar .env PRIMERO antes de importar otros módulos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Ahora importar los demás módulos
import pool, { testConnection, createUsersTable } from './database.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import crypto from 'crypto';
import {
  sendHtmlEmail,
  renderCitasTemplate,
  renderReprogramacionTemplate,
  renderDengueTemplate,
  renderCursosTemplate,
  sendPasswordResetEmail
} from './emailService.js';
import cron from 'node-cron';

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


// Configurar multer para archivos
//const upload = multer({ storage: multer.memoryStorage() });

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

    let query = `
      UPDATE usuarios
      SET nombre = ?, correo = ?, estado = ?
    `;
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

    const [rows] = await pool.execute(
      `SELECT documento, nombre, correo, rol, estado
       FROM usuarios
       WHERE documento = ?`,
      [documento]
    );

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
// Obtener todas las áreas
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

// ==================== ENDPOINTS DE RECUPERACIÓN DE CONTRASEÑA ====================

// Solicitar recuperación de contraseña
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { usuario } = req.body;

    // Validaciones
    if (!usuario) {
      return res.status(400).json({ 
        success: false, 
        message: 'El usuario es obligatorio' 
      });
    }

    // Buscar usuario por nombre de usuario
    const [users] = await pool.execute(
      'SELECT documento, nombre, usuario FROM usuarios WHERE usuario = ? AND is_active = TRUE',
      [usuario.trim()]
    );

    // Por seguridad, siempre devolver éxito (no revelar si el usuario existe o no)
    if (users.length === 0) {
      console.log('Intento de recuperación para usuario inexistente:', usuario);
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
      'UPDATE usuarios SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [codigoVerificacion, resetTokenExpires, user.id]
    );

    // Enviar correo de recuperación con el código
    try {
      await sendPasswordResetEmail(user.usuario, codigoVerificacion, user.nombre || user.usuario);
      console.log(`Correo de recuperación enviado a: ${user.usuario}`);
    } catch (emailError) {
      console.error('Error enviando correo de recuperación:', emailError);
      // Limpiar token si falla el envío
      await pool.execute(
        'UPDATE usuarios SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
        [user.id]
      );
      return res.status(500).json({
        success: false,
        message: 'Error al enviar el correo de recuperación. Por favor, intenta más tarde.'
      });
    }

    // Registrar actividad
    await logActivity(user.id, user.usuario, 'SOLICITAR_RECUPERACION_PASSWORD', 'Solicitud de recuperación de contraseña');

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
      'SELECT documento, usuario FROM usuarios WHERE reset_token = ? AND reset_token_expires > NOW()',
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
      'UPDATE usuarios SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    // Registrar actividad
    await logActivity(user.id, user.usuario, 'RESET_PASSWORD', 'Contraseña restablecida exitosamente');

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
  try {
    console.log('➡️ POST /api/envios');

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: 'No se recibió archivo'
      });
    }

    console.log('Archivo recibido:', req.file);

    const {
      plantillaId,
      fromEmail,
      modoEnvio,
      programadoPara
    } = req.body;

    // =========================
    // LEER EXCEL
    // =========================
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).json({
        ok: false,
        message: 'El Excel está vacío'
      });
    }

    console.log('Filas leídas:', rows);

    // Convertimos filas en destinatarios
    const destinatarios = rows.map(row => ({
      email: row.Email || row.email,   
      variables: row
    }));

    // =========================
    // ENVÍO INMEDIATO
    // =========================
    if (modoEnvio === 'inmediato') {
      let enviados = 0;
      let fallidos = 0;

      for (const d of destinatarios) {
        try {
          console.log("Enviando a:", d.email);
          await enviarCorreo({
            to: d.email,
            from: fromEmail,
            plantillaId,
            variables: d.variables
          });
          enviados++;
        } catch (e) {
          fallidos++;
        }
      }

      return res.json({
        ok: true,
        results: {
          total: destinatarios.length,
          sent: enviados,
          failed: fallidos,
          scheduled: 0
        }
      });
    }

    // =========================
    // 3️⃣ ENVÍO PROGRAMADO
    // =========================
    if (modoEnvio === 'programado') {
      await pool.query(
        `INSERT INTO envios_programados
         (plantilla_id, from_email, programado_para, payload)
         VALUES (?, ?, ?, ?)`,
        [
          plantillaId,
          fromEmail,
          programadoPara,
          JSON.stringify(destinatarios)
        ]
      );

      return res.json({
        ok: true,
        results: {
          total: destinatarios.length,
          sent: 0,
          failed: 0,
          scheduled: destinatarios.length
        }
      });
    }

    return res.status(400).json({
      ok: false,
      message: 'Modo de envío no válido'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: 'Error procesando envío'
    });
  }
});

// Procesar correos programados pendientes
const processScheduledEmails = async () => {
  try {
    // Buscar correos que ya deben enviarse (fecha programada <= ahora y status = PENDING)
    const [pendingEmails] = await pool.execute(
      `SELECT * FROM scheduled_emails 
       WHERE status = 'PENDING' 
       AND scheduled_datetime <= NOW() 
       ORDER BY scheduled_datetime ASC 
       LIMIT 50`
    );

    if (pendingEmails.length === 0) {
      return; // No hay correos pendientes
    }

    console.log(`⏰ [SCHEDULER] Procesando ${pendingEmails.length} correo(s) programado(s)...`);

    for (const email of pendingEmails) {
      try {
        // Marcar como "EN_PROCESO" para evitar duplicados
        await pool.execute(
          'UPDATE scheduled_emails SET status = ? WHERE id = ?',
          ['EN_PROCESO', email.id]
        );

        // Enviar el correo - usar credenciales guardadas si están disponibles
        const fromEmail = email.from_email || null;
        const fromPassword = email.from_password || null;
        await sendHtmlEmail(email.recipient_email, email.subject, email.html_content, [], fromEmail, fromPassword);

        // Marcar como enviado
        await pool.execute(
          'UPDATE scheduled_emails SET status = ?, sent_datetime = NOW() WHERE id = ?',
          ['ENVIADO', email.id]
        );

        // Registrar en email_logs
        await logEmail(
          email.user_id,
          email.recipient_email,
          email.patient_name,
          email.appointment_date,
          email.subject,
          'ENVIADO_PROGRAMADO'
        );

        console.log(`✅ [SCHEDULER] Correo enviado a: ${email.recipient_email}`);

        // Pausa de 1 segundo entre correos para no saturar
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (sendError) {
        console.error(`❌ [SCHEDULER] Error enviando a ${email.recipient_email}:`, sendError.message);
        
        // Marcar como fallido
        await pool.execute(
          'UPDATE scheduled_emails SET status = ?, error_message = ? WHERE id = ?',
          ['FALLIDO', sendError.message, email.id]
        );

        // Registrar error en email_logs
        await logEmail(
          email.user_id,
          email.recipient_email,
          email.patient_name,
          email.appointment_date,
          email.subject,
          'ERROR_PROGRAMADO',
          sendError.message
        );
      }
    }

    console.log(`⏰ [SCHEDULER] Procesamiento completado.`);

  } catch (error) {
    console.error('❌ [SCHEDULER] Error en processScheduledEmails:', error.message);
  }
};

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
      `INSERT INTO plantillas 
       (user_id, nom_plantilla, descripcion, html_content, variables, area_id, estado) 
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVO')`,
      [userId, nombre, descripcion || '', htmlContent, variablesJson, area_id]
    );

    await logActivity(parseInt(userId), 'Usuario', 'CREAR_PLANTILLA', `Plantilla creada: ${nombre}`);

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
      `UPDATE plantillas 
       SET ${updateFields.join(', ')} 
       WHERE id = ? AND user_id = ?`,
      updateValues
    );

    await logActivity(
      parseInt(userId),
      'Usuario',
      'ACTUALIZAR_PLANTILLA',
      `Plantilla actualizada: ${id}`
    );

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
      await logActivity(parseInt(userId), 'Usuario', 'ELIMINAR_PLANTILLA', `Plantilla eliminada: ${existing[0].nombre}`);
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
      'Email',
      ...variables,
      'Asunto',
      'Fecha Programada',
      'Hora Programada'
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

// ============================================
// RUTAS PARA VER REGISTROS
// ============================================

// Obtener registros de actividad
app.get('/api/registros/actividad', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = `
      SELECT al.*, u.nombre as user_nombre, u.usuario as username
      FROM activity_logs al
      JOIN usuarios u ON al.user_id = u.id
    `;
    const params = [];
    
    if (userId && userId !== 'todos') {
      query += ' WHERE al.user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY al.timestamp DESC LIMIT 1000';
    
    const [registros] = await pool.execute(query, params);
    res.json({ success: true, registros });
  } catch (error) {
    console.error('Error obteniendo registros de actividad:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener correos fallidos 


// Obtener correos programados


// Cancelar un correo programado


// Reprogramar un correo (cambiar fecha/hora)


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
    
    // PRIMERO: Verificar conexión a MySQL (OBLIGATORIO)
    const connected = await testConnection();
    
    if (!connected) {
      console.error('');
      console.error('❌ ============================================');
      console.error('❌ ERROR: No se pudo conectar a MySQL');
      console.error('❌ ============================================');
      console.error('');
      console.error('El servidor NO se iniciará sin conexión a MySQL.');
      console.error('');
      console.error('Para solucionarlo:');
      console.error('1. Verifica que MySQL esté instalado y corriendo');
      console.error('2. Revisa el archivo .env en la carpeta server/');
      console.error('3. Asegúrate de que las credenciales sean correctas:');
      console.error('   - DB_HOST=localhost');
      console.error('   - DB_USER=root (o tu usuario)');
      console.error('   - DB_PASSWORD=tu_contraseña_mysql');
      console.error('   - DB_NAME=masicorreos_db');
      console.error('   - DB_PORT=3306');
      console.error('');
      process.exit(1);
    }
    
    // SEGUNDO: Crear tabla si no existe
    console.log('🔍 Verificando tabla de usuarios...');
    await createUsersTable();
    
    // TERCERO: Iniciar servidor HTTP (solo si MySQL está conectado)
    app.listen(PORT, () => {
      console.log('');
      console.log('✅ ============================================');
      console.log('✅ SERVIDOR INICIADO CORRECTAMENTE');
      console.log('✅ ============================================');
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
      console.log(`✅ API disponible en http://localhost:${PORT}/api`);
      console.log('✅ MySQL conectado y funcionando');
      console.log('✅ Base de datos lista para guardar datos');
      console.log('');
      
      // CUARTO: Iniciar scheduler de correos programados
      startScheduler();
      console.log('');
    });

  } catch (error) {
    console.error('');
    console.error('❌ ============================================');
    console.error('❌ ERROR INICIANDO SERVIDOR');
    console.error('❌ ============================================');
    console.error('Error:', error.message);
    console.error('');
    console.error('Detalles:', error);
    console.error('');
    process.exit(1);
  }
};

startServer();