// Script de prueba para enviar un correo de prueba
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendHtmlEmail } from './emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('📧 Prueba de envío de correo...\n');

// Correo de prueba
const testEmail = process.argv[2] || 'test@example.com';
const testHtml = `
  <h1>Correo de Prueba</h1>
  <p>Este es un correo de prueba desde el sistema Masicorreos.</p>
  <p>Si recibes este correo, significa que la configuración está correcta.</p>
`;

try {
  console.log(`Enviando correo de prueba a: ${testEmail}`);
  const result = await sendHtmlEmail(
    testEmail,
    'Prueba de Correo - Masicorreos',
    testHtml
  );
  
  console.log('\n✅ Correo enviado exitosamente!');
  console.log('   Message ID:', result.messageId);
} catch (error) {
  console.error('\n❌ Error al enviar correo:');
  console.error('   Mensaje:', error.message);
  process.exit(1);
}






