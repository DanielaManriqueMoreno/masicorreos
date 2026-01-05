// Script de prueba de conexiones
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 Verificando conexiones...\n');

// 1. Verificar MySQL
console.log('1️⃣ Verificando MySQL...');
try {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
  });
  console.log('✅ MySQL: Conexión exitosa');
  await connection.end();
} catch (error) {
  console.error('❌ MySQL: Error de conexión');
  console.error('   Mensaje:', error.message);
  console.error('   Código:', error.code);
}

// 2. Verificar Gmail
console.log('\n2️⃣ Verificando Gmail...');
try {
  const user = (process.env.GMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_PASS || '').trim();
  
  if (!user || !pass) {
    console.error('❌ Gmail: Credenciales no configuradas');
    console.error(`   GMAIL_USER: "${user}"`);
    console.error(`   GMAIL_PASS: "${pass ? 'CONFIGURADA' : 'VACÍA'}"`);
  } else {
    console.log('✅ Gmail: Credenciales configuradas');
    console.log(`   Usuario: ${user}`);
    console.log(`   Contraseña: ${pass.length} caracteres`);
    
    // Intentar verificar conexión
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: user,
        pass: pass
      }
    });
    
    await transporter.verify();
    console.log('✅ Gmail: Conexión verificada correctamente');
  }
} catch (error) {
  console.error('❌ Gmail: Error de conexión');
  console.error('   Mensaje:', error.message);
}

console.log('\n✅ Verificación completada');

