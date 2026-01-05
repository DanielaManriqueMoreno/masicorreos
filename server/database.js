// database.js - Configuración de conexión a MySQL
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar .env explícitamente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'masicorreos_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para crear la base de datos si no existe
export const createDatabaseIfNotExists = async () => {
  try {
    // Crear pool temporal sin especificar la base de datos
    const tempConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
    };
    
    const tempPool = mysql.createPool(tempConfig);
    const dbName = process.env.DB_NAME || 'masicorreos_db';
    
    // Crear base de datos si no existe
    await tempPool.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Base de datos '${dbName}' verificada/creada correctamente`);
    
    await tempPool.end();
    return true;
  } catch (error) {
    console.error('❌ Error creando base de datos:', error.message);
    throw error;
  }
};

// Función para probar la conexión
export const testConnection = async () => {
  try {
    // Primero crear la base de datos si no existe
    await createDatabaseIfNotExists();
    
    // Luego probar la conexión
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    
    // Mensajes de error más específicos
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ MySQL no está corriendo. Inicia el servicio de MySQL primero.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('❌ Error de autenticación. Verifica las credenciales en .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('❌ La base de datos no existe. Se intentará crear automáticamente.');
    }
    
    return false;
  }
};

// Función para crear todas las tablas necesarias
export const createUsersTable = async () => {
  try {
    // Tabla de usuarios
    const usersQuery = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255),
        usuario VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        reset_token VARCHAR(255) DEFAULT NULL,
        reset_token_expires DATETIME DEFAULT NULL,
        INDEX idx_usuario (usuario),
        INDEX idx_reset_token (reset_token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await pool.execute(usersQuery);
    console.log('✅ Tabla de usuarios creada/verificada correctamente');
    
    // Agregar columnas de reset_token si no existen (para bases de datos existentes)
    try {
      // Verificar si las columnas ya existen
      const [columns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'usuarios' 
          AND COLUMN_NAME IN ('reset_token', 'reset_token_expires')
      `);
      
      const existingColumns = columns.map(col => col.COLUMN_NAME);
      
      // Agregar reset_token si no existe
      if (!existingColumns.includes('reset_token')) {
        await pool.execute(`
          ALTER TABLE usuarios 
          ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL
        `);
        console.log('✅ Columna reset_token agregada');
      }
      
      // Agregar reset_token_expires si no existe
      if (!existingColumns.includes('reset_token_expires')) {
        await pool.execute(`
          ALTER TABLE usuarios 
          ADD COLUMN reset_token_expires DATETIME DEFAULT NULL
        `);
        console.log('✅ Columna reset_token_expires agregada');
      }
      
      // Crear índice para reset_token si no existe
      try {
        const [indexes] = await pool.execute(`
          SELECT INDEX_NAME 
          FROM INFORMATION_SCHEMA.STATISTICS 
          WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'usuarios' 
            AND INDEX_NAME = 'idx_reset_token'
        `);
        
        if (indexes.length === 0) {
          await pool.execute(`
            CREATE INDEX idx_reset_token ON usuarios(reset_token)
          `);
          console.log('✅ Índice idx_reset_token creado');
        }
      } catch (indexError) {
        // Índice ya existe o error al crearlo, ignorar
        console.log('ℹ️  Índice idx_reset_token ya existe o no se pudo crear');
      }
    } catch (error) {
      // Si hay error, solo loguear pero no fallar
      console.log('ℹ️  Verificando columnas de reset_token:', error.message);
    }

    // Tabla de logs de actividad
    const activityLogsQuery = `
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        username VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        description TEXT,
        ip_address VARCHAR(45),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_timestamp (timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await pool.execute(activityLogsQuery);
    console.log('✅ Tabla de activity_logs creada/verificada correctamente');

    // Tabla de logs de emails
    const emailLogsQuery = `
      CREATE TABLE IF NOT EXISTS email_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        patient_name TEXT,
        appointment_date TEXT,
        subject TEXT,
        status VARCHAR(100) NOT NULL,
        error_message TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_timestamp (timestamp),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await pool.execute(emailLogsQuery);
    console.log('✅ Tabla de email_logs creada/verificada correctamente');

    // Tabla de emails programados
    const scheduledEmailsQuery = `
      CREATE TABLE IF NOT EXISTS scheduled_emails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        patient_name TEXT,
        appointment_date TEXT,
        subject TEXT,
        html_content LONGTEXT,
        scheduled_datetime DATETIME NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        sent_datetime DATETIME NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_scheduled_datetime (scheduled_datetime)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await pool.execute(scheduledEmailsQuery);
    console.log('✅ Tabla de scheduled_emails creada/verificada correctamente');

    // Tabla de plantillas personalizadas
    const emailTemplatesQuery = `
      CREATE TABLE IF NOT EXISTS email_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        html_content LONGTEXT NOT NULL,
        variables TEXT COMMENT 'JSON con las variables disponibles para la plantilla',
        categoria VARCHAR(100) DEFAULT 'personalizada',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_categoria (categoria),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await pool.execute(emailTemplatesQuery);
    console.log('✅ Tabla de email_templates creada/verificada correctamente');

    // Tabla de envíos masivos con plantillas personalizadas
    const customTemplateEmailsQuery = `
      CREATE TABLE IF NOT EXISTS custom_template_emails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        template_id INT NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        subject VARCHAR(500),
        status VARCHAR(50) NOT NULL COMMENT 'ENVIADO, FALLIDO, PROGRAMADO, PREVIEW_GENERADO',
        variables_data TEXT COMMENT 'JSON con los valores de las variables usadas',
        html_content LONGTEXT COMMENT 'HTML generado con las variables reemplazadas',
        from_email VARCHAR(255) COMMENT 'Correo remitente usado',
        error_message TEXT COMMENT 'Motivo del fallo del correo',
        intentos_envio INT DEFAULT 1 COMMENT 'Cantidad de intentos de envío',
        scheduled_datetime DATETIME NULL COMMENT 'Fecha y hora programada si aplica',
        sent_datetime DATETIME NULL COMMENT 'Fecha y hora en que se envió',
        last_attempt_at TIMESTAMP NULL COMMENT 'Fecha y hora del último intento de envío',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE,
        FOREIGN KEY (template_id) REFERENCES email_templates (id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_template_id (template_id),
        INDEX idx_status (status),
        INDEX idx_recipient_email (recipient_email),
        INDEX idx_created_at (created_at),
        INDEX idx_scheduled_datetime (scheduled_datetime),
        INDEX idx_from_email (from_email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await pool.execute(customTemplateEmailsQuery);
    console.log('✅ Tabla de custom_template_emails creada/verificada correctamente');
    
    // Agregar campos si no existen (para bases de datos existentes)
    try {
      // Verificar y agregar intentos_envio
      const [columns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'custom_template_emails' 
        AND COLUMN_NAME = 'intentos_envio'
      `);
      if (columns.length === 0) {
        await pool.execute(`
          ALTER TABLE custom_template_emails 
          ADD COLUMN intentos_envio INT DEFAULT 1 COMMENT 'Cantidad de intentos de envío'
        `);
        console.log('✅ Campo intentos_envio agregado a custom_template_emails');
      }
    } catch (error) {
      console.log('⚠️ Campo intentos_envio ya existe o error al agregarlo:', error.message);
    }
    
    try {
      // Verificar y agregar last_attempt_at
      const [columns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'custom_template_emails' 
        AND COLUMN_NAME = 'last_attempt_at'
      `);
      if (columns.length === 0) {
        await pool.execute(`
          ALTER TABLE custom_template_emails 
          ADD COLUMN last_attempt_at TIMESTAMP NULL COMMENT 'Fecha y hora del último intento de envío'
        `);
        console.log('✅ Campo last_attempt_at agregado a custom_template_emails');
      }
    } catch (error) {
      console.log('⚠️ Campo last_attempt_at ya existe o error al agregarlo:', error.message);
    }

    // Tabla de correos fallidos - Sistema de Citas
    const correosFallidosCitasQuery = `
      CREATE TABLE IF NOT EXISTS correosfallidosdesistemascitas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        patient_name TEXT,
        appointment_date TEXT,
        appointment_time TEXT,
        tipo_cita VARCHAR(100) COMMENT 'Recordatorio, Reprogramación, Cancelación, Autorización vigente',
        subject TEXT,
        html_content LONGTEXT,
        error_message TEXT NOT NULL,
        intentos_envio INT DEFAULT 1,
        from_email VARCHAR(255) DEFAULT 'micita@umit.com.co',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_attempt_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_recipient_email (recipient_email),
        INDEX idx_created_at (created_at),
        INDEX idx_tipo_cita (tipo_cita)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.execute(correosFallidosCitasQuery);
    console.log('✅ Tabla de correosfallidosdesistemascitas creada/verificada correctamente');

    // Tabla de correos fallidos - Dengue Calidad
    const correosFallidosDengueQuery = `
      CREATE TABLE IF NOT EXISTS correosfallidosdengue_calidad (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        tipo_plantilla VARCHAR(100) COMMENT 'Dengue, Preparto, Posparto, Planificación',
        subject TEXT,
        html_content LONGTEXT,
        error_message TEXT NOT NULL,
        intentos_envio INT DEFAULT 1,
        from_email VARCHAR(255) COMMENT 'Correo de calidad',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_attempt_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_recipient_email (recipient_email),
        INDEX idx_created_at (created_at),
        INDEX idx_tipo_plantilla (tipo_plantilla)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.execute(correosFallidosDengueQuery);
    console.log('✅ Tabla de correosfallidosdengue_calidad creada/verificada correctamente');

    // Tabla de correos fallidos - Cursos Obligatorios
    const correosFallidosCursosQuery = `
      CREATE TABLE IF NOT EXISTS correosfallidosdecursosobligatorios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        nombre_empleado TEXT,
        nombre_curso TEXT,
        fecha_vencimiento TEXT,
        subject TEXT,
        html_content LONGTEXT,
        error_message TEXT NOT NULL,
        intentos_envio INT DEFAULT 1,
        from_email VARCHAR(255) COMMENT 'Correo de talentohumano',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_attempt_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_recipient_email (recipient_email),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.execute(correosFallidosCursosQuery);
    console.log('✅ Tabla de correosfallidosdecursosobligatorios creada/verificada correctamente');
  } catch (error) {
    console.error('❌ Error creando tablas:', error.message);
    throw error;
  }
};

export default pool;

