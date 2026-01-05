// Script de diagnóstico detallado para Gmail
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 Diagnóstico detallado de Gmail\n');

const user = (process.env.GMAIL_USER || '').trim();
const pass = (process.env.GMAIL_PASS || '').trim();

if (!user || !pass) {
  console.error('❌ ERROR: Credenciales no configuradas');
  console.error(`   GMAIL_USER: "${user}"`);
  console.error(`   GMAIL_PASS: "${pass ? 'CONFIGURADA' : 'VACÍA'}"`);
  process.exit(1);
}

console.log('📋 Credenciales:');
console.log(`   Usuario: ${user}`);
console.log(`   Contraseña: ${pass.length} caracteres\n`);

// Probar puerto 465 (SSL)
console.log('1️⃣ Probando puerto 465 (SSL)...');
try {
  const transporter465 = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: user,
      pass: pass
    },
    connectionTimeout: 30000,
    greetingTimeout: 10000,
    socketTimeout: 60000,
    tls: {
      rejectUnauthorized: false
    }
  });
  
  console.log('   Verificando conexión...');
  await transporter465.verify();
  console.log('   ✅ Conexión exitosa con puerto 465');
  
  console.log('   Probando envío de correo de prueba...');
  const testInfo = await transporter465.sendMail({
    from: user,
    to: user, // Enviar a sí mismo
    subject: 'Prueba de diagnóstico - Puerto 465',
    text: 'Este es un correo de prueba desde el puerto 465'
  });
  console.log('   ✅ Correo enviado exitosamente');
  console.log(`   Message ID: ${testInfo.messageId}`);
  
  transporter465.close();
} catch (error) {
  console.error('   ❌ Error con puerto 465:');
  console.error(`      Código: ${error.code}`);
  console.error(`      Mensaje: ${error.message}`);
  if (error.response) {
    console.error(`      Respuesta: ${error.response}`);
  }
  if (error.command) {
    console.error(`      Comando: ${error.command}`);
  }
}

console.log('\n2️⃣ Probando puerto 587 (STARTTLS)...');
try {
  const transporter587 = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: user,
      pass: pass
    },
    connectionTimeout: 30000,
    greetingTimeout: 10000,
    socketTimeout: 60000,
    requireTLS: true,
    tls: {
      rejectUnauthorized: false
    }
  });
  
  console.log('   Verificando conexión...');
  await transporter587.verify();
  console.log('   ✅ Conexión exitosa con puerto 587');
  
  console.log('   Probando envío de correo de prueba...');
  const testInfo = await transporter587.sendMail({
    from: user,
    to: user, // Enviar a sí mismo
    subject: 'Prueba de diagnóstico - Puerto 587',
    text: 'Este es un correo de prueba desde el puerto 587'
  });
  console.log('   ✅ Correo enviado exitosamente');
  console.log(`   Message ID: ${testInfo.messageId}`);
  
  transporter587.close();
} catch (error) {
  console.error('   ❌ Error con puerto 587:');
  console.error(`      Código: ${error.code}`);
  console.error(`      Mensaje: ${error.message}`);
  if (error.response) {
    console.error(`      Respuesta: ${error.response}`);
  }
  if (error.command) {
    console.error(`      Comando: ${error.command}`);
  }
}

console.log('\n✅ Diagnóstico completado');

