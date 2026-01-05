// setup-database.js - Script para crear la base de datos automáticamente
// Uso: node setup-database.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env
dotenv.config({ path: path.join(__dirname, '.env') });

// Función para leer input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupDatabase() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🗄️  CONFIGURACIÓN AUTOMÁTICA DE BASE DE DATOS');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  // Obtener credenciales
  let config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'masicorreos_db'
  };

  // Si no hay contraseña en .env, pedirla
  if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === '') {
    console.log('⚠️  No se encontró contraseña de MySQL en el archivo .env');
    const password = await question('🔑 Ingresa la contraseña de MySQL (presiona Enter si no tiene contraseña): ');
    config.password = password || '';
    console.log('');
  }

  console.log('📋 Configuración:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Usuario: ${config.user}`);
  console.log(`   Puerto: ${config.port}`);
  console.log(`   Base de datos: ${config.database}`);
  console.log('');

  // Intentar conectar sin especificar base de datos
  let connection;
  try {
    console.log('🔌 Conectando a MySQL...');
    const tempConfig = {
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      multipleStatements: true
    };
    
    connection = await mysql.createConnection(tempConfig);
    console.log('✅ Conexión a MySQL establecida');
    console.log('');

    // Crear base de datos
    console.log(`📦 Creando base de datos '${config.database}'...`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Base de datos '${config.database}' creada/verificada`);
    console.log('');

    // Usar la base de datos
    await connection.execute(`USE \`${config.database}\``);

    // Crear tabla usuarios
    console.log('📋 Creando tabla usuarios...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) DEFAULT NULL,
        usuario VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        INDEX idx_usuario (usuario)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla usuarios creada/verificada');
    console.log('');

    // Crear tabla activity_logs
    console.log('📋 Creando tabla activity_logs...');
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla activity_logs creada/verificada');
    console.log('');

    // Crear tabla email_logs
    console.log('📋 Creando tabla email_logs...');
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla email_logs creada/verificada');
    console.log('');

    // Crear tabla scheduled_emails
    console.log('📋 Creando tabla scheduled_emails...');
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla scheduled_emails creada/verificada');
    console.log('');

    // Verificar tablas creadas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅ BASE DE DATOS CONFIGURADA CORRECTAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log(`📊 Tablas creadas: ${tables.length}`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${Object.values(table)[0]}`);
    });
    console.log('');
    console.log('🎉 ¡Todo listo! Ahora puedes iniciar el servidor con:');
    console.log('   npm start');
    console.log('');

    await connection.end();
    rl.close();
    
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════');
    console.error('  ❌ ERROR AL CONFIGURAR LA BASE DE DATOS');
    console.error('═══════════════════════════════════════════════════════');
    console.error('');
    console.error(`Error: ${error.message}`);
    console.error('');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Solución:');
      console.error('   1. Verifica que MySQL esté instalado y corriendo');
      console.error('   2. Inicia el servicio de MySQL');
      console.error('   3. Verifica que el puerto sea correcto (por defecto: 3306)');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Solución:');
      console.error('   1. Verifica que el usuario y contraseña sean correctos');
      console.error('   2. Asegúrate de que el usuario tenga permisos para crear bases de datos');
    } else if (error.code === 'ENOTFOUND') {
      console.error('💡 Solución:');
      console.error('   1. Verifica que el host sea correcto (localhost)');
    }
    
    console.error('');
    
    if (connection) {
      await connection.end();
    }
    rl.close();
    process.exit(1);
  }
}

// Ejecutar
setupDatabase();

