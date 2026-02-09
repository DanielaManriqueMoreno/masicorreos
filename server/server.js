// server.js - Servidor Express
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar .env PRIMERO antes de importar otros módulos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Ahora importar los demás módulos
import pool, { testConnection, createUsersTable } from './database.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import * as XLSX from 'xlsx';
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
const upload = multer({ storage: multer.memoryStorage() });

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

// Validar email
const isValidEmail = (email) => {
  if (!email || email === '') return false;
  const emailStr = String(email).trim().toLowerCase();
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!pattern.test(emailStr)) return false;
  const invalidDomains = ['example.com', 'test.com', 'invalid.com', 'email.com'];
  const domain = emailStr.split('@')[1];
  return !invalidDomains.includes(domain);
};

// Formatear fecha para asunto
const formatDateForSubject = (dateValue) => {
  if (!dateValue) return '';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return String(dateValue);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return String(dateValue);
  }
};

// Parsear fecha y hora para programación
const parseDatetime = (dateStr, timeStr) => {
  try {
    if (!dateStr || !timeStr || String(dateStr).trim() === '' || String(timeStr).trim() === '') {
      return null;
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    const [hours, minutes] = String(timeStr).trim().split(':');
    if (!hours || !minutes) return null;
    
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Verificar que la fecha sea en el futuro
    if (date <= new Date()) return null;
    
    return date;
  } catch {
    return null;
  }
};

// Log de actividad
const logActivity = async (userId, username, action, description = '', ipAddress = '') => {
  try {
    await pool.execute(
      'INSERT INTO activity_logs (user_id, username, action, description, ip_address) VALUES (?, ?, ?, ?, ?)',
      [userId, username, action, description, ipAddress]
    );
  } catch (error) {
    console.error('Error registrando actividad:', error);
  }
};

// Log de email
const logEmail = async (userId, recipientEmail, patientName, appointmentDate, subject, status, errorMessage = '') => {
  try {
    await pool.execute(
      'INSERT INTO email_logs (user_id, recipient_email, patient_name, appointment_date, subject, status, error_message) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, recipientEmail, patientName || '', appointmentDate || '', subject || '', status, errorMessage]
    );
  } catch (error) {
    console.error('Error registrando email:', error);
  }
};

// Programar email
const scheduleEmail = async (userId, recipientEmail, patientName, appointmentDate, subject, htmlContent, scheduledDatetime, fromEmail = null, fromPassword = null) => {
  try {
    // Intentar insertar con campos de credenciales si existen en la tabla
    try {
      await pool.execute(
        'INSERT INTO scheduled_emails (user_id, recipient_email, patient_name, appointment_date, subject, html_content, scheduled_datetime, status, from_email, from_password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, recipientEmail, patientName || '', appointmentDate || '', subject || '', htmlContent, scheduledDatetime, 'PENDING', fromEmail, fromPassword]
      );
    } catch (error) {
      // Si los campos no existen, insertar sin ellos
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        await pool.execute(
          'INSERT INTO scheduled_emails (user_id, recipient_email, patient_name, appointment_date, subject, html_content, scheduled_datetime, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [userId, recipientEmail, patientName || '', appointmentDate || '', subject || '', htmlContent, scheduledDatetime, 'PENDING']
        );
      } else {
        throw error;
      }
    }
    return true;
  } catch (error) {
    console.error('Error programando email:', error);
    return false;
  }
};

// ==================== SCHEDULER DE CORREOS PROGRAMADOS ====================

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

// Endpoint: Enviar correos con plantilla personalizada
app.post('/api/send-custom-template', upload.single('file'), async (req, res) => {
  try {
    const { userId, username, templateId, doSend, fromEmail, fromPassword } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporcionó archivo' });
    }

    if (!templateId) {
      return res.status(400).json({ success: false, message: 'templateId es requerido' });
    }

    // Obtener la plantilla de la base de datos
    const [templates] = await pool.execute(
      'SELECT * FROM plantillas WHERE id = ? AND user_id = ? AND is_active = TRUE',
      [templateId, userId]
    );

    if (templates.length === 0) {
      return res.status(404).json({ success: false, message: 'Plantilla no encontrada o inactiva' });
    }

    const template = templates[0];
    const variables = template.variables ? JSON.parse(template.variables) : [];

    // Leer archivo Excel/CSV
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'El archivo está vacío' });
    }

    // Validar que existe la columna Email
    if (!data[0] || !Object.keys(data[0]).includes('Email')) {
      return res.status(400).json({ success: false, message: 'El archivo debe contener una columna "Email"' });
    }

    let sent = 0;
    let scheduled = 0;
    let failed = [];

    // Procesar en lotes
    const BATCH_SIZE = 50;
    const totalRows = data.length;
    
    console.log(`📊 Procesando ${totalRows} filas con plantilla personalizada "${template.nombre}"...`);

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      console.log(`📦 Procesando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(totalRows / BATCH_SIZE)}...`);

      for (let j = 0; j < batch.length; j++) {
        const row = batch[j];
        const rowIndex = i + j + 2;
        
        try {
          // Aceptar "Email" o "Gmail" como columna para destinatarios
          const email = String(row.Email || row.Gmail || row.email || row.gmail || '').trim();
          
          if (!isValidEmail(email)) {
            throw new Error('Email inválido o vacío. Asegúrate de tener una columna "Email" o "Gmail" con correos válidos.');
          }

          // Reemplazar variables en el HTML de la plantilla
          let html = template.html_content;
          const variablesData = {};
          variables.forEach(variable => {
            const value = row[variable] || '';
            variablesData[variable] = value;
            // Reemplazar {{Variable}} con el valor
            const regex = new RegExp(`\\{\\{${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
            html = html.replace(regex, String(value));
          });

          // Reemplazar cualquier variable que no esté en la lista pero esté en el Excel
          Object.keys(row).forEach(key => {
            if (key !== 'Email' && key !== 'Fecha Programada' && key !== 'Hora Programada' && key !== 'Asunto') {
              variablesData[key] = row[key] || '';
              const regex = new RegExp(`\\{\\{${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
              html = html.replace(regex, String(row[key] || ''));
            }
          });

          // Generar asunto (usar primera variable o nombre de plantilla)
          const subject = row['Asunto'] || `Correo: ${template.nombre}`;
          
          // Guardar en base de datos ANTES de enviar
          const variablesDataJson = JSON.stringify(variablesData);
          const remitente = fromEmail && fromEmail.trim() ? fromEmail.trim() : null;

          // Verificar si hay programación
          const fechaProgramada = row['Fecha Programada'];
          const horaProgramada = row['Hora Programada'];
          const scheduledDatetime = parseDatetime(fechaProgramada, horaProgramada);

          // Registrar en base de datos
          const statusToSave = doSend === 'true' 
            ? (scheduledDatetime ? 'PROGRAMADO' : 'ENVIADO')
            : 'PREVIEW_GENERADO';
          
          try {
            await pool.execute(
              'INSERT INTO custom_template_emails (user_id, template_id, recipient_email, subject, status, variables_data, html_content, from_email, scheduled_datetime, sent_datetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [
                parseInt(userId),
                parseInt(templateId),
                email,
                subject,
                statusToSave,
                variablesDataJson,
                html,
                remitente,
                scheduledDatetime || null,
                scheduledDatetime ? null : new Date()
              ]
            );
          } catch (dbError) {
            console.error('Error guardando en BD:', dbError);
            // Continuar aunque falle el guardado en BD
          }

          if (doSend === 'true') {
            if (scheduledDatetime) {
              // Programar envío - incluir credenciales si están disponibles
              const remitenteEmail = fromEmail && fromEmail.trim() ? fromEmail.trim() : null;
              const remitentePassword = fromPassword && fromPassword.trim() ? fromPassword.trim() : null;
              if (await scheduleEmail(parseInt(userId), email, row['Nombre'] || '', '', subject, html, scheduledDatetime, remitenteEmail, remitentePassword)) {
                scheduled++;
                await logEmail(parseInt(userId), email, row['Nombre'] || '', '', subject, 'PROGRAMADO');
              } else {
                // Actualizar estado a FALLIDO en BD con intentos_envio
                const errorMsgProgramacion = 'No se pudo programar el email';
                try {
                  const [updateResult] = await pool.execute(
                    `UPDATE custom_template_emails 
                     SET status = ?, 
                         error_message = ?, 
                         intentos_envio = COALESCE(intentos_envio, 1) + 1,
                         last_attempt_at = NOW()
                     WHERE template_id = ? AND recipient_email = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) 
                     ORDER BY id DESC LIMIT 1`,
                    ['FALLIDO', errorMsgProgramacion, parseInt(templateId), email]
                  );
                  
                  // Si no se actualizó nada, insertar un nuevo registro
                  if (updateResult.affectedRows === 0) {
                    await pool.execute(
                      `INSERT INTO custom_template_emails 
                       (user_id, template_id, recipient_email, subject, status, variables_data, html_content, error_message, intentos_envio, from_email, last_attempt_at, created_at) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                      [
                        parseInt(userId),
                        parseInt(templateId),
                        email,
                        subject,
                        'FALLIDO',
                        variablesDataJson,
                        html,
                        errorMsgProgramacion,
                        1,
                        remitente
                      ]
                    );
                    console.log(`📝 Correo fallido (programación) INSERTADO en custom_template_emails: ${email}`);
                  } else {
                    console.log(`📝 Correo fallido (programación) actualizado en custom_template_emails: ${email}`);
                  }
                } catch (dbError) {
                  console.error('Error guardando correo fallido (programación) en BD:', dbError);
                }
                
                // Registrar en email_logs con status 'ERROR'
                await logEmail(parseInt(userId), email, row['Nombre'] || '', '', subject, 'ERROR', errorMsgProgramacion);
                
                throw new Error(errorMsgProgramacion);
              }
            } else {
              // Envío inmediato - usar correo remitente personalizado si se proporciona
              const remitenteEmail = fromEmail && fromEmail.trim() ? fromEmail.trim() : undefined;
              const remitentePassword = fromPassword && fromPassword.trim() ? fromPassword.trim() : undefined;
              
              try {
                await sendHtmlEmail(email, subject, html, [], remitenteEmail, remitentePassword);
                sent++;
                
                // Actualizar sent_datetime en BD
                await pool.execute(
                  'UPDATE custom_template_emails SET sent_datetime = NOW(), status = ? WHERE template_id = ? AND recipient_email = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE) ORDER BY id DESC LIMIT 1',
                  ['ENVIADO', parseInt(templateId), email]
                );
                
                logEmail(parseInt(userId), email, row['Nombre'] || '', '', subject, 'ENVIADO').catch(err => console.error('Error en log:', err));
                
                // Pausa entre correos
                if (j < batch.length - 1 || i + BATCH_SIZE < data.length) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              } catch (sendError) {
                // Si falla el envío, actualizar el registro a FALLIDO
                const errorMsgEnvio = `Fila ${rowIndex}: Error enviando correo - ${sendError.message}`;
                console.error(`❌ Error enviando correo a ${email}: ${sendError.message}`);
                
                try {
                  const [updateResult] = await pool.execute(
                    `UPDATE custom_template_emails 
                     SET status = ?, 
                         error_message = ?, 
                         intentos_envio = COALESCE(intentos_envio, 1) + 1,
                         last_attempt_at = NOW()
                     WHERE template_id = ? AND recipient_email = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) 
                     ORDER BY id DESC LIMIT 1`,
                    ['FALLIDO', errorMsgEnvio, parseInt(templateId), email]
                  );
                  
                  if (updateResult.affectedRows > 0) {
                    console.log(`📝 Correo fallido (envío) actualizado en custom_template_emails: ${email}`);
                  } else {
                    // Si no se actualizó, insertar nuevo registro
                    await pool.execute(
                      `INSERT INTO custom_template_emails 
                       (user_id, template_id, recipient_email, subject, status, variables_data, html_content, error_message, intentos_envio, from_email, last_attempt_at, created_at) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                      [
                        parseInt(userId),
                        parseInt(templateId),
                        email,
                        subject,
                        'FALLIDO',
                        variablesDataJson,
                        html,
                        errorMsgEnvio,
                        1,
                        remitente
                      ]
                    );
                    console.log(`📝 Correo fallido (envío) INSERTADO en custom_template_emails: ${email}`);
                  }
                } catch (dbError) {
                  console.error('Error guardando correo fallido (envío) en BD:', dbError);
                }
                
                // Registrar en email_logs
                await logEmail(parseInt(userId), email, row['Nombre'] || '', '', subject, 'ERROR', errorMsgEnvio);
                
                // Re-lanzar el error para que se capture en el catch general
                throw sendError;
              }
            }
          } else {
            // Modo preview - solo log
            await logEmail(parseInt(userId), email, row['Nombre'] || '', '', subject, 'PREVIEW_GENERADO');
            sent++;
          }
        } catch (error) {
          const errorMsg = `Fila ${rowIndex}: ${error.message}`;
          failed.push({ row: rowIndex, error: errorMsg });
          console.error(`❌ Error en fila ${rowIndex}: ${error.message}`);
          console.error(`   Stack: ${error.stack}`);
          
          // Obtener el email del destinatario
          const emailToSave = String(row.Email || row.Gmail || row.email || row.gmail || '').trim();
          
          // Obtener el subject (puede que no se haya generado si el error ocurrió antes)
          const subjectForLog = row['Asunto'] || `Correo: ${template.nombre}`;
          
          console.log(`🔍 Intentando guardar correo fallido:`);
          console.log(`   Email: ${emailToSave}`);
          console.log(`   Email válido: ${emailToSave && isValidEmail(emailToSave)}`);
          console.log(`   UserId: ${userId}`);
          console.log(`   TemplateId: ${templateId}`);
          
          // Intentar guardar el correo fallido en BD - SIEMPRE intentar guardar, incluso si el email no es válido
          try {
            // Si el email es válido, intentar actualizar primero
            if (emailToSave && isValidEmail(emailToSave)) {
              // Primero intentar actualizar si existe un registro reciente
              const [updateResult] = await pool.execute(
                `UPDATE custom_template_emails 
                 SET status = ?, 
                     error_message = ?, 
                     intentos_envio = COALESCE(intentos_envio, 1) + 1,
                     last_attempt_at = NOW()
                 WHERE template_id = ? AND recipient_email = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) 
                 ORDER BY id DESC LIMIT 1`,
                ['FALLIDO', errorMsg, parseInt(templateId), emailToSave]
              );
              
              // Si se actualizó alguna fila, ya está guardado
              if (updateResult.affectedRows > 0) {
                console.log(`📝 Correo fallido actualizado en custom_template_emails: ${emailToSave} - Intentos: incrementado`);
              } else {
                // Si no se actualizó nada, significa que no existe el registro, entonces insertar uno nuevo
                // Preparar el HTML con las variables reemplazadas (con manejo de errores)
                let html = template.html_content || '';
                const variablesData = {};
                
                try {
                  // Reemplazar variables en el HTML
                  variables.forEach(variable => {
                    const value = row[variable] || '';
                    variablesData[variable] = value;
                    try {
                      const regex = new RegExp(`\\{\\{${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
                      html = html.replace(regex, String(value));
                    } catch (regexError) {
                      console.warn(`⚠️  Error reemplazando variable ${variable}:`, regexError.message);
                    }
                  });
                  
                  // Reemplazar cualquier otra variable que esté en el Excel
                  Object.keys(row).forEach(key => {
                    if (key !== 'Email' && key !== 'Gmail' && key !== 'email' && key !== 'gmail' && 
                        key !== 'Fecha Programada' && key !== 'Hora Programada' && key !== 'Asunto') {
                      variablesData[key] = row[key] || '';
                      try {
                        const regex = new RegExp(`\\{\\{${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
                        html = html.replace(regex, String(row[key] || ''));
                      } catch (regexError) {
                        console.warn(`⚠️  Error reemplazando variable ${key}:`, regexError.message);
                      }
                    }
                  });
                } catch (htmlError) {
                  console.warn(`⚠️  Error generando HTML para correo fallido:`, htmlError.message);
                  // Usar HTML de la plantilla sin reemplazar si hay error
                  html = template.html_content || '';
                }
                
                const variablesDataJson = JSON.stringify(variablesData);
                const subject = row['Asunto'] || `Correo: ${template.nombre}`;
                const remitente = fromEmail && fromEmail.trim() ? fromEmail.trim() : null;
                
                // Insertar nuevo registro con estado FALLIDO
                await pool.execute(
                  `INSERT INTO custom_template_emails 
                   (user_id, template_id, recipient_email, subject, status, variables_data, html_content, error_message, intentos_envio, from_email, last_attempt_at, created_at) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                  [
                    parseInt(userId),
                    parseInt(templateId),
                    emailToSave,
                    subject,
                    'FALLIDO',
                    variablesDataJson,
                    html,
                    errorMsg,
                    1,
                    remitente
                  ]
                );
                console.log(`📝 Correo fallido INSERTADO en custom_template_emails: ${emailToSave}`);
              }
            } else {
              // Aunque el email no sea válido, intentar guardar con el email que tenemos
              console.warn(`⚠️  Email inválido o vacío (${emailToSave}), pero intentando guardar de todas formas...`);
              
              // Preparar datos mínimos para guardar
              let html = template.html_content || '';
              const variablesData = {};
              
              try {
                // Intentar reemplazar variables si es posible
                variables.forEach(variable => {
                  const value = row[variable] || '';
                  variablesData[variable] = value;
                  try {
                    const regex = new RegExp(`\\{\\{${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
                    html = html.replace(regex, String(value));
                  } catch (regexError) {
                    // Ignorar errores de regex
                  }
                });
              } catch (htmlError) {
                console.warn(`⚠️  Error generando HTML:`, htmlError.message);
              }
              
              const variablesDataJson = JSON.stringify(variablesData);
              const subject = row['Asunto'] || `Correo: ${template.nombre}`;
              const remitente = fromEmail && fromEmail.trim() ? fromEmail.trim() : null;
              const emailFinal = emailToSave || 'email-invalido@error.com';
              
              // Insertar con email inválido pero con información del error
              await pool.execute(
                `INSERT INTO custom_template_emails 
                 (user_id, template_id, recipient_email, subject, status, variables_data, html_content, error_message, intentos_envio, from_email, last_attempt_at, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                  parseInt(userId),
                  parseInt(templateId),
                  emailFinal,
                  subject,
                  'FALLIDO',
                  variablesDataJson,
                  html,
                  `${errorMsg} - Email inválido: ${emailToSave}`,
                  1,
                  remitente
                ]
              );
              console.log(`📝 Correo fallido INSERTADO (con email inválido) en custom_template_emails: ${emailFinal}`);
            }
          } catch (dbError) {
            console.error('❌ Error guardando correo fallido en BD:', dbError);
            console.error('   Detalles:', dbError.message);
            console.error('   Stack:', dbError.stack);
            console.error('   SQL State:', dbError.sqlState);
            console.error('   SQL Message:', dbError.sqlMessage);
            // Continuar aunque falle el guardado en BD para no interrumpir el proceso
          }
          
          // Registrar en email_logs con status 'ERROR'
          await logEmail(parseInt(userId), emailToSave || row.Email || '', row['Nombre'] || '', '', subjectForLog, 'ERROR', errorMsg);
        }
      }

      // Pausa entre lotes
      if (i + BATCH_SIZE < data.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    if (userId && username) {
      await logActivity(parseInt(userId), username, 'ENVIO_CORREOS_PLANTILLA_PERSONALIZADA', `Plantilla: ${template.nombre}, Procesados: ${data.length}, Enviados: ${sent}, Programados: ${scheduled}, Fallidos: ${failed.length}`);
    }

    res.json({
      success: true,
      results: {
        total: data.length,
        sent,
        scheduled,
        failed: failed.length,
        failedDetails: failed
      }
    });
  } catch (error) {
    console.error('Error en send-custom-template:', error);
    res.status(500).json({ success: false, message: error.message });
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

// Obtener correos básicos
app.get('/api/registros/correos', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = `
      SELECT el.*, u.nombre as user_nombre, u.usuario as username
      FROM email_logs el
      JOIN usuarios u ON el.user_id = u.id
    `;
    const params = [];
    
    if (userId && userId !== 'todos') {
      query += ' WHERE el.user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY el.timestamp DESC LIMIT 1000';
    
    const [registros] = await pool.execute(query, params);
    res.json({ success: true, registros });
  } catch (error) {
    console.error('Error obteniendo correos:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener correos con plantillas
app.get('/api/registros/correos-plantillas', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = `
      SELECT cte.*, u.nombre as user_nombre, u.usuario as username, et.nombre as template_name
      FROM custom_template_emails cte
      JOIN usuarios u ON cte.user_id = u.id
      LEFT JOIN plantillas et ON cte.template_id = et.id
    `;
    const params = [];
    
    if (userId && userId !== 'todos') {
      query += ' WHERE cte.user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY cte.created_at DESC LIMIT 1000';
    
    const [registros] = await pool.execute(query, params);
    res.json({ success: true, registros });
  } catch (error) {
    console.error('Error obteniendo correos con plantillas:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener correos fallidos (de todas las tablas)
app.get('/api/registros/correos-fallidos', async (req, res) => {
  try {
    const { userId } = req.query;
    const registros = [];
    
    // Correos fallidos de Sistema de Citas
    let queryCitas = `
      SELECT 
        cf.id, 
        cf.user_id, 
        cf.recipient_email, 
        cf.error_message, 
        COALESCE(cf.intentos_envio, 1) as intentos_envio, 
        cf.created_at,
        'Sistema de Citas' as sistema,
        cf.patient_name, 
        cf.tipo_cita,
        COALESCE(u.nombre, u.usuario, 'N/A') as username
      FROM correosfallidosdesistemascitas cf
      LEFT JOIN usuarios u ON cf.user_id = u.id
    `;
    const paramsCitas = [];
    if (userId && userId !== 'todos') {
      queryCitas += ' WHERE cf.user_id = ?';
      paramsCitas.push(userId);
    }
    queryCitas += ' ORDER BY cf.created_at DESC LIMIT 500';
    const [citas] = await pool.execute(queryCitas, paramsCitas);
    citas.forEach(r => {
      registros.push(r);
    });
    
    // Correos fallidos de Dengue - Calidad
    let queryDengue = `
      SELECT 
        cf.id, 
        cf.user_id, 
        cf.recipient_email, 
        cf.error_message, 
        COALESCE(cf.intentos_envio, 1) as intentos_envio, 
        cf.created_at,
        'Dengue - Calidad' as sistema,
        cf.tipo_plantilla,
        COALESCE(u.nombre, u.usuario, 'N/A') as username
      FROM correosfallidosdengue_calidad cf
      LEFT JOIN usuarios u ON cf.user_id = u.id
    `;
    const paramsDengue = [];
    if (userId && userId !== 'todos') {
      queryDengue += ' WHERE cf.user_id = ?';
      paramsDengue.push(userId);
    }
    queryDengue += ' ORDER BY cf.created_at DESC LIMIT 500';
    const [dengue] = await pool.execute(queryDengue, paramsDengue);
    dengue.forEach(r => {
      registros.push(r);
    });
    
    // Correos fallidos de Cursos Obligatorios
    let queryCursos = `
      SELECT 
        cf.id, 
        cf.user_id, 
        cf.recipient_email, 
        cf.error_message, 
        COALESCE(cf.intentos_envio, 1) as intentos_envio, 
        cf.created_at,
        'Cursos Obligatorios' as sistema,
        cf.nombre_empleado, 
        cf.nombre_curso,
        COALESCE(u.nombre, u.usuario, 'N/A') as username
      FROM correosfallidosdecursosobligatorios cf
      LEFT JOIN usuarios u ON cf.user_id = u.id
    `;
    const paramsCursos = [];
    if (userId && userId !== 'todos') {
      queryCursos += ' WHERE cf.user_id = ?';
      paramsCursos.push(userId);
    }
    queryCursos += ' ORDER BY cf.created_at DESC LIMIT 500';
    const [cursos] = await pool.execute(queryCursos, paramsCursos);
    cursos.forEach(r => {
      registros.push(r);
    });
    
    // Correos fallidos de Plantillas Personalizadas
    let queryPlantillas = `
      SELECT 
        cte.id, 
        cte.user_id, 
        cte.recipient_email, 
        cte.error_message, 
        COALESCE(cte.intentos_envio, 1) as intentos_envio, 
        cte.created_at, 
        cte.last_attempt_at,
        'Plantillas Personalizadas' as sistema,
        cte.template_id, 
        cte.subject,
        COALESCE(u.nombre, u.usuario, 'N/A') as username
      FROM custom_template_emails cte
      LEFT JOIN usuarios u ON cte.user_id = u.id
      WHERE cte.status = 'FALLIDO'
    `;
    const paramsPlantillas = [];
    if (userId && userId !== 'todos') {
      queryPlantillas += ' AND cte.user_id = ?';
      paramsPlantillas.push(userId);
    }
    queryPlantillas += ' ORDER BY cte.created_at DESC LIMIT 500';
    const [plantillas] = await pool.execute(queryPlantillas, paramsPlantillas);
    plantillas.forEach(r => {
      registros.push(r);
    });
    
    // Ordenar todos por fecha
    registros.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    console.log(`📊 Total de correos fallidos encontrados: ${registros.length}`);
    console.log(`   - Sistema de Citas: ${citas.length}`);
    console.log(`   - Dengue - Calidad: ${dengue.length}`);
    console.log(`   - Cursos Obligatorios: ${cursos.length}`);
    console.log(`   - Plantillas Personalizadas: ${plantillas.length}`);
    
    res.json({ success: true, registros: registros.slice(0, 1000) });
  } catch (error) {
    console.error('❌ Error obteniendo correos fallidos:', error);
    console.error('   Stack:', error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener correos programados
app.get('/api/registros/correos-programados', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = `
      SELECT se.*, u.nombre as user_nombre, u.usuario as username
      FROM scheduled_emails se
      JOIN usuarios u ON se.user_id = u.id
    `;
    const params = [];
    
    if (userId && userId !== 'todos') {
      query += ' WHERE se.user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY se.scheduled_datetime DESC LIMIT 1000';
    
    const [registros] = await pool.execute(query, params);
    res.json({ success: true, registros });
  } catch (error) {
    console.error('Error obteniendo correos programados:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancelar un correo programado
app.delete('/api/correos-programados/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId es requerido' });
    }

    // Verificar que el correo pertenece al usuario y está pendiente
    const [existing] = await pool.execute(
      'SELECT id, status FROM scheduled_emails WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Correo programado no encontrado' });
    }

    if (existing[0].status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Solo se pueden cancelar correos con estado PENDING' });
    }

    // Actualizar estado a CANCELADO
    await pool.execute(
      'UPDATE scheduled_emails SET status = ? WHERE id = ?',
      ['CANCELADO', id]
    );

    await logActivity(parseInt(userId), 'Usuario', 'CANCELAR_CORREO_PROGRAMADO', `Correo programado cancelado: ID ${id}`);

    res.json({ success: true, message: 'Correo programado cancelado exitosamente' });
  } catch (error) {
    console.error('Error cancelando correo programado:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reprogramar un correo (cambiar fecha/hora)
app.put('/api/correos-programados/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, nuevaFecha, nuevaHora } = req.body;
    
    if (!userId || !nuevaFecha || !nuevaHora) {
      return res.status(400).json({ success: false, message: 'userId, nuevaFecha y nuevaHora son requeridos' });
    }

    // Verificar que el correo pertenece al usuario y está pendiente
    const [existing] = await pool.execute(
      'SELECT id, status FROM scheduled_emails WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Correo programado no encontrado' });
    }

    if (existing[0].status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Solo se pueden reprogramar correos con estado PENDING' });
    }

    // Parsear nueva fecha
    const nuevaDatetime = parseDatetime(nuevaFecha, nuevaHora);
    if (!nuevaDatetime) {
      return res.status(400).json({ success: false, message: 'Fecha/hora inválida o en el pasado' });
    }

    // Actualizar fecha programada
    await pool.execute(
      'UPDATE scheduled_emails SET scheduled_datetime = ? WHERE id = ?',
      [nuevaDatetime, id]
    );

    await logActivity(parseInt(userId), 'Usuario', 'REPROGRAMAR_CORREO', `Correo reprogramado: ID ${id} para ${nuevaFecha} ${nuevaHora}`);

    res.json({ success: true, message: 'Correo reprogramado exitosamente' });
  } catch (error) {
    console.error('Error reprogramando correo:', error);
    res.status(500).json({ success: false, message: error.message });
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

