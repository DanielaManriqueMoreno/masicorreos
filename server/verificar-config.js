// verificar-config.js - Script para verificar la configuración de MySQL
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { existsSync } from 'fs';

dotenv.config();

console.log('🔍 Verificando configuración...\n');

// Verificar archivo .env
const envPath = '.env';
if (!existsSync(envPath)) {
  console.error('❌ El archivo .env NO existe en la carpeta server/');
  console.error('   Crea el archivo .env con la siguiente configuración:\n');
  console.error('   DB_HOST=localhost');
  console.error('   DB_USER=root');
  console.error('   DB_PASSWORD=tu_contraseña_mysql');
  console.error('   DB_NAME=masicorreos_db');
  console.error('   DB_PORT=3306');
  console.error('   PORT=3001\n');
  process.exit(1);
}

console.log('✅ Archivo .env encontrado');

// Leer configuración
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'masicorreos_db',
  port: parseInt(process.env.DB_PORT || '3306'),
};

console.log('📋 Configuración:');
console.log(`   Host: ${config.host}`);
console.log(`   Usuario: ${config.user}`);
console.log(`   Base de datos: ${config.database}`);
console.log(`   Puerto: ${config.port}`);
console.log(`   Contraseña: ${config.password ? '***' : '(vacía)'}\n`);

// Probar conexión
console.log('🔌 Intentando conectar a MySQL...');

try {
  // Primero conectar sin especificar base de datos
  const tempConnection = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
  });

  console.log('✅ Conexión a MySQL exitosa');

  // Crear base de datos si no existe
  await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`✅ Base de datos '${config.database}' verificada/creada`);

  await tempConnection.end();

  // Ahora conectar a la base de datos específica
  const dbConnection = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port,
  });

  console.log(`✅ Conexión a la base de datos '${config.database}' exitosa`);

  // Crear tabla si no existe
  await dbConnection.execute(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255),
      usuario VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_usuario (usuario)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log('✅ Tabla de usuarios verificada/creada');

  // Verificar si hay usuarios
  const [users] = await dbConnection.execute('SELECT COUNT(*) as total FROM usuarios');
  console.log(`✅ Usuarios en la base de datos: ${users[0].total}`);

  await dbConnection.end();

  console.log('\n✅ ============================================');
  console.log('✅ TODO ESTÁ CONFIGURADO CORRECTAMENTE');
  console.log('✅ ============================================');
  console.log('\n✅ Puedes iniciar el servidor con: npm start\n');

} catch (error) {
  console.error('\n❌ ============================================');
  console.error('❌ ERROR DE CONFIGURACIÓN');
  console.error('❌ ============================================\n');
  
  if (error.code === 'ECONNREFUSED') {
    console.error('❌ MySQL no está corriendo');
    console.error('   Solución: Inicia el servicio de MySQL\n');
  } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('❌ Error de autenticación');
    console.error('   Solución: Verifica el usuario y contraseña en .env\n');
  } else if (error.code === 'ER_BAD_DB_ERROR') {
    console.error('❌ La base de datos no existe');
    console.error('   Solución: Se intentará crear automáticamente\n');
  } else {
    console.error('❌ Error:', error.message);
    console.error('   Código:', error.code);
  }
  
  console.error('Detalles completos:');
  console.error(error);
  process.exit(1);
}

