// Script para verificar que la base de datos existe y tiene las tablas necesarias
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function verificarBaseDatos() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🔍 VERIFICANDO BASE DE DATOS');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'masicorreos_db',
      port: process.env.DB_PORT || 3306,
    });

    console.log('✅ Conexión a MySQL establecida');
    console.log(`✅ Base de datos: ${process.env.DB_NAME || 'masicorreos_db'}`);
    console.log('');

    // Verificar tablas
    const [tables] = await connection.execute('SHOW TABLES');
    
    console.log(`📊 Tablas encontradas: ${tables.length}`);
    
    const tablasEsperadas = ['usuarios', 'activity_logs', 'email_logs', 'scheduled_emails'];
    const tablasExistentes = tables.map(row => Object.values(row)[0]);
    
    tablasEsperadas.forEach(tabla => {
      if (tablasExistentes.includes(tabla)) {
        console.log(`   ✅ ${tabla}`);
      } else {
        console.log(`   ❌ ${tabla} - FALTA`);
      }
    });

    console.log('');
    
    // Contar usuarios
    const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
    console.log(`👥 Usuarios registrados: ${usuarios[0].total}`);

    await connection.end();

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅ VERIFICACIÓN COMPLETADA');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    // Verificar si faltan tablas
    const faltanTablas = tablasEsperadas.filter(t => !tablasExistentes.includes(t));
    if (faltanTablas.length > 0) {
      console.log('⚠️  FALTAN ALGUNAS TABLAS');
      console.log('   Ejecuta: npm run setup-db');
      console.log('   O ejecuta el script SQL manualmente');
      console.log('');
      process.exit(1);
    } else {
      console.log('🎉 ¡Todo está configurado correctamente!');
      console.log('   Puedes iniciar el servidor con: npm start');
      console.log('');
      process.exit(0);
    }

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════');
    console.error('  ❌ ERROR');
    console.error('═══════════════════════════════════════════════════════');
    console.error('');
    console.error(`Error: ${error.message}`);
    console.error('');

    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 La base de datos NO existe');
      console.error('   Ejecuta: npm run setup-db');
      console.error('   O ejecuta el script SQL manualmente');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 MySQL no está corriendo');
      console.error('   Inicia el servicio de MySQL primero');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Error de autenticación');
      console.error('   Verifica las credenciales en el archivo .env');
    }

    console.error('');
    process.exit(1);
  }
}

verificarBaseDatos();

