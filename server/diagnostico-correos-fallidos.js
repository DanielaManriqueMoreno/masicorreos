// Script de diagnóstico para correos fallidos
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'masicorreos_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO DE CORREOS FALLIDOS\n');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar conexión
    console.log('\n1️⃣ Verificando conexión a la base de datos...');
    await pool.execute('SELECT 1');
    console.log('✅ Conexión exitosa\n');
    
    // 2. Verificar estructura de la tabla
    console.log('2️⃣ Verificando estructura de custom_template_emails...');
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'custom_template_emails'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log(`   Total de columnas: ${columns.length}`);
    const columnNames = columns.map(c => c.COLUMN_NAME);
    console.log(`   Columnas: ${columnNames.join(', ')}\n`);
    
    // Verificar campos críticos
    const camposNecesarios = ['id', 'user_id', 'template_id', 'recipient_email', 'subject', 'status', 
                              'error_message', 'intentos_envio', 'last_attempt_at', 'created_at'];
    const camposFaltantes = camposNecesarios.filter(campo => !columnNames.includes(campo));
    
    if (camposFaltantes.length > 0) {
      console.log('❌ CAMPOS FALTANTES:', camposFaltantes.join(', '));
      console.log('\n   Agregando campos faltantes...\n');
      
      // Agregar intentos_envio si no existe
      if (!columnNames.includes('intentos_envio')) {
        try {
          await pool.execute(`
            ALTER TABLE custom_template_emails 
            ADD COLUMN intentos_envio INT DEFAULT 1 COMMENT 'Cantidad de intentos de envío'
          `);
          console.log('✅ Campo intentos_envio agregado');
        } catch (error) {
          console.log('⚠️  Error agregando intentos_envio:', error.message);
        }
      }
      
      // Agregar last_attempt_at si no existe
      if (!columnNames.includes('last_attempt_at')) {
        try {
          await pool.execute(`
            ALTER TABLE custom_template_emails 
            ADD COLUMN last_attempt_at TIMESTAMP NULL COMMENT 'Fecha y hora del último intento de envío'
          `);
          console.log('✅ Campo last_attempt_at agregado');
        } catch (error) {
          console.log('⚠️  Error agregando last_attempt_at:', error.message);
        }
      }
    } else {
      console.log('✅ Todos los campos necesarios están presentes\n');
    }
    
    // 3. Verificar correos fallidos existentes
    console.log('3️⃣ Verificando correos fallidos existentes...');
    const [fallidos] = await pool.execute(`
      SELECT COUNT(*) as total, status
      FROM custom_template_emails
      WHERE status = 'FALLIDO'
      GROUP BY status
    `);
    
    if (fallidos.length > 0) {
      console.log(`   ✅ Encontrados ${fallidos[0].total} correos con status FALLIDO\n`);
    } else {
      console.log('   ⚠️  No se encontraron correos con status FALLIDO\n');
    }
    
    // 4. Probar inserción de prueba
    console.log('4️⃣ Probando inserción de registro de prueba...');
    try {
      // Obtener un usuario y template válidos
      const [usuarios] = await pool.execute('SELECT id FROM usuarios LIMIT 1');
      const [templates] = await pool.execute('SELECT id FROM email_templates LIMIT 1');
      
      if (usuarios.length === 0 || templates.length === 0) {
        console.log('   ⚠️  No hay usuarios o plantillas en la BD para probar\n');
      } else {
        const testUserId = usuarios[0].id;
        const testTemplateId = templates[0].id;
        
        const [result] = await pool.execute(
          `INSERT INTO custom_template_emails 
           (user_id, template_id, recipient_email, subject, status, variables_data, html_content, error_message, intentos_envio, from_email, last_attempt_at, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            testUserId,
            testTemplateId,
            'test@example.com',
            'Test - Correo Fallido',
            'FALLIDO',
            '{}',
            '<html><body>Test</body></html>',
            'Error de prueba - Este registro puede ser eliminado',
            1,
            null
          ]
        );
        
        console.log(`   ✅ Inserción exitosa! ID: ${result.insertId}`);
        
        // Eliminar el registro de prueba
        await pool.execute('DELETE FROM custom_template_emails WHERE id = ?', [result.insertId]);
        console.log('   ✅ Registro de prueba eliminado\n');
      }
    } catch (error) {
      console.log('   ❌ ERROR en inserción de prueba:');
      console.log(`      Mensaje: ${error.message}`);
      console.log(`      SQL State: ${error.sqlState}`);
      console.log(`      SQL Message: ${error.sqlMessage}\n`);
    }
    
    // 5. Verificar índices
    console.log('5️⃣ Verificando índices...');
    const [indexes] = await pool.execute(`
      SELECT INDEX_NAME, COLUMN_NAME
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'custom_template_emails'
    `);
    
    const indexNames = [...new Set(indexes.map(i => i.INDEX_NAME))];
    console.log(`   Índices encontrados: ${indexNames.join(', ')}\n`);
    
    console.log('='.repeat(50));
    console.log('✅ DIAGNÓSTICO COMPLETADO\n');
    
  } catch (error) {
    console.error('❌ ERROR EN DIAGNÓSTICO:', error);
    console.error('   Mensaje:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

diagnosticar();

