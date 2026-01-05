// emailService.js - Servicio de envío de correos
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  TEMPLATE_HTML_CITAS,
  TEMPLATE_HTML_REPROGRAMACION,
  TEMPLATE_HTML_DENGUE,
  TEMPLATE_HTML_CURSOS,
  TEMPLATE_HTML_RESET_PASSWORD
} from './emailTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde el archivo .env
const envPath = path.join(__dirname, '.env');

// Cargar .env explícitamente
const result = dotenv.config({ path: envPath });

// Debug: Verificar que el archivo .env existe y se cargó
if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env encontrado en:', envPath);
  if (result.error) {
    console.error('❌ Error cargando .env:', result.error);
  } else {
    console.log('✅ Archivo .env cargado correctamente');
  }
} else {
  console.error('❌ Archivo .env NO encontrado en:', envPath);
}

// Función para obtener credenciales - siempre lee de process.env
const getGmailCredentials = () => {
  const user = process.env.GMAIL_USER?.trim() || '';
  const pass = process.env.GMAIL_PASS?.trim() || '';
  
  // Debug
  console.log('🔍 Leyendo credenciales de process.env:');
  console.log(`   GMAIL_USER: "${user}" (length: ${user.length})`);
  console.log(`   GMAIL_PASS: "${pass ? '***' + pass.slice(-4) : 'VACÍA'}" (length: ${pass.length})`);
  
  return { user, pass };
};

// Obtener credenciales iniciales
const { user: GMAIL_USER, pass: GMAIL_PASS } = getGmailCredentials();

// Validar que las credenciales estén configuradas
if (!GMAIL_USER || !GMAIL_PASS) {
  console.error('❌ ERROR: GMAIL_USER o GMAIL_PASS no están configurados en el archivo .env');
  console.error('   Verifica que el archivo .env tenga:');
  console.error('   GMAIL_USER=micita@umit.com.co');
  console.error('   GMAIL_PASS=tu_contraseña_aplicacion');
} else {
  console.log('✅ Credenciales de correo cargadas correctamente');
}

// Crear transporter de nodemailer (configuración simple que funciona)
const createTransporter = (usePort465 = false, customUser = null, customPass = null) => {
  // Usar credenciales personalizadas si se proporcionan, sino usar las del .env
  const user = customUser ? customUser.trim() : (process.env.GMAIL_USER || '').trim();
  const pass = customPass ? customPass.trim() : (process.env.GMAIL_PASS || '').trim();
  
  if (!user || !pass) {
    throw new Error('Credenciales de Gmail no configuradas');
  }
  
  const port = usePort465 ? 465 : 587;
  const secure = usePort465;
  
  // Configuración EXACTA del script de diagnóstico que funcionó
  const config = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: port,
    secure: secure,
    auth: { user, pass },
    connectionTimeout: 30000, // Igual que diagnóstico
    greetingTimeout: 10000, // Igual que diagnóstico
    socketTimeout: 60000, // Igual que diagnóstico
    tls: { 
      rejectUnauthorized: false
    }
  };
  
  if (!secure) {
    config.requireTLS = true;
  }
  
  const transporter = nodemailer.createTransport(config);
  
  // Agregar manejador de errores para evitar "Unhandled 'error' event"
  transporter.on('error', (error) => {
    console.error('❌ Error en transporter de nodemailer:', error.message);
  });
  
  return transporter;
};

// Función para comprimir HTML (eliminar espacios innecesarios y optimizar)
const compressHTML = (html) => {
  // Eliminar comentarios HTML
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  // Eliminar espacios múltiples y saltos de línea innecesarios
  html = html.replace(/\s+/g, ' ');
  // Eliminar espacios alrededor de tags
  html = html.replace(/>\s+</g, '><');
  // Eliminar espacios al inicio y final de líneas
  html = html.replace(/\s+>/g, '>');
  html = html.replace(/<\s+/g, '<');
  // Eliminar saltos de línea y tabs
  html = html.replace(/[\r\n\t]/g, '');
  return html.trim();
};

// Función para limitar longitud de texto (evitar datos muy largos)
const limitTextLength = (text, maxLength = 200) => {
  try {
    if (text === null || text === undefined) return '';
    const str = String(text);
    // Si el texto es extremadamente largo, truncarlo agresivamente
    if (str.length > maxLength) {
      return str.substring(0, maxLength).trim() + '...';
    }
    return str.trim();
  } catch (error) {
    console.error(`⚠️  Error en limitTextLength:`, error.message);
    return '';
  }
};

// Función para limpiar y validar datos de una fila del Excel
const cleanRowData = (row, maxLengthPerField = 200) => {
  try {
    if (!row || typeof row !== 'object') {
      throw new Error('La fila no es un objeto válido');
    }
    
    const cleaned = {};
    let totalLength = 0;
    
    for (const [key, value] of Object.entries(row)) {
      try {
        // Validar que la clave no sea demasiado larga
        const safeKey = String(key || '').substring(0, 100);
        
        // Convertir valor a string de forma segura
        let originalValue = '';
        if (value !== null && value !== undefined) {
          originalValue = String(value);
        }
        
        // Limitar valor
        const limitedValue = limitTextLength(originalValue, maxLengthPerField);
        
        // Si se truncó, registrar advertencia
        if (originalValue.length > maxLengthPerField) {
          console.warn(`⚠️  Campo "${safeKey}" truncado: ${originalValue.length} → ${maxLengthPerField} caracteres`);
        }
        
        cleaned[safeKey] = limitedValue;
        totalLength += limitedValue.length;
        
        // Validación por campo individual
        if (limitedValue.length > maxLengthPerField * 2) {
          console.error(`❌ ERROR: Campo "${safeKey}" sigue siendo demasiado largo después de limpiar`);
          throw new Error(`El campo "${safeKey}" tiene datos excesivamente largos. Verifica el Excel.`);
        }
      } catch (fieldError) {
        console.error(`⚠️  Error procesando campo "${key}":`, fieldError.message);
        cleaned[String(key || '').substring(0, 100)] = '';
      }
    }
    
    // Validación EXTRA: Si la suma total de caracteres es muy grande, rechazar
    if (totalLength > 5000) {
      console.error(`❌ ERROR: Los datos de esta fila son demasiado grandes (${totalLength} caracteres totales)`);
      console.error(`   Esto causará un correo muy grande. Revisa el Excel.`);
      throw new Error(`Los datos de esta fila son demasiado grandes (${totalLength} caracteres). Por favor, reduce el contenido en el Excel.`);
    }
    
    return cleaned;
  } catch (error) {
    console.error(`❌ ERROR en cleanRowData:`, error.message);
    throw error;
  }
};

// Función para reemplazar placeholders en plantillas
const replacePlaceholders = (template, data) => {
  try {
    if (!template || typeof template !== 'string') {
      throw new Error('La plantilla no es válida');
    }
    
    if (!data || typeof data !== 'object') {
      throw new Error('Los datos no son válidos');
    }
    
    let html = String(template);
    const originalTemplate = String(template); // Guardar plantilla original para contar placeholders
    const originalSize = Buffer.byteLength(html, 'utf8');
    let lastSize = originalSize;
    
    // DEBUG: Verificar que la plantilla original es realmente original
    console.log(`🔍 DEBUG replacePlaceholders: Tamaño plantilla original = ${originalTemplate.length} caracteres`);
    
    for (const [key, value] of Object.entries(data)) {
      try {
        // Validación ULTRA ESTRICTA: Límites más pequeños para evitar HTML grande
        let maxLength = 200;
        if (key === 'Fecha de la Cita' || key.includes('Fecha')) {
          maxLength = 20;
        } else if (key === 'Nombre del Paciente' || key === 'Nombre del Médico/a' || key === 'NOMBRE') {
          maxLength = 50; // Nombres MUY cortos (reducido a 50 para evitar HTML grande)
        } else if (key === 'Hora' || key.includes('Hora')) {
          maxLength = 50;
        } else if (key === 'Lugar de la cita' || key === 'DIRIGIDO_A') {
          maxLength = 120; // Reducido de 150 a 120
        } else if (key === 'Tipo de cita' || key === 'Especialidad' || key.includes('CURSO')) {
          maxLength = 80; // Reducido de 100 a 80
        }
        
        // Asegurar que el valor ya está limitado (doble verificación)
        let safeValue = limitTextLength(String(value || ''), maxLength);
        
        // FORZAR límite adicional - nunca exceder
        if (safeValue.length > maxLength) {
          console.warn(`⚠️  Campo "${key}" truncado a ${maxLength} caracteres (tenía ${safeValue.length})`);
          safeValue = safeValue.substring(0, maxLength).trim();
        }
        
        // Validación FINAL: Asegurar que nunca exceda el límite (TRIPLE SEGURIDAD)
        safeValue = safeValue.substring(0, maxLength).trim();
        
        // VALIDACIÓN EXTRA: Si es "Nombre del Paciente", forzar a máximo 50 (CUADRUPLE SEGURIDAD)
        if (key === 'Nombre del Paciente') {
          if (safeValue.length > 50) {
            console.warn(`⚠️  "Nombre del Paciente" forzado a 50 caracteres (tenía ${safeValue.length})`);
            safeValue = safeValue.substring(0, 50).trim();
          }
          // Asegurar que nunca exceda 50 caracteres
          safeValue = safeValue.substring(0, 50).trim();
        }
        
        // Escapar caracteres especiales del regex de forma segura
        const safeKey = String(key || '').substring(0, 100);
        // Placeholders literales para reemplazo (sin escape)
        const placeholderLiteral = `[${safeKey}]`;
        const placeholder2Literal = `{{${safeKey}}}`;
        // Placeholders para regex (con escape de caracteres especiales)
        // IMPORTANTE: Escapar primero la clave, luego agregar los delimitadores escapados
        const escapedKey = safeKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Para el regex, necesitamos escapar los corchetes y llaves para que busque literalmente
        const placeholder = `\\[${escapedKey}\\]`; // Regex busca: \[Nombre del Paciente\]
        const placeholder2 = `\\{\\{${escapedKey}\\}\\}`; // Regex busca: \{\{Nombre del Paciente\}\}
        
        // PROTECCIÓN CRÍTICA PRIMERO: Verificar que el valor a reemplazar no contenga el placeholder
        // Esto previene bucles infinitos - DEBE ser lo primero que se verifica
        if (safeValue && (safeValue.includes(`[${safeKey}]`) || safeValue.includes(`{{${safeKey}}}`))) {
          console.error(`❌ ERROR CRÍTICO: El valor para "${safeKey}" contiene el placeholder, lo que causaría un bucle infinito`);
          console.error(`   Valor completo: ${safeValue}`);
          console.error(`   Valor (primeros 200 chars): ${safeValue.substring(0, 200)}...`);
          throw new Error(`El valor del campo "${safeKey}" contiene el placeholder "[${safeKey}]" o "{{${safeKey}}}", lo que causaría un bucle infinito. Verifica los datos del Excel - el campo no debe contener el texto del placeholder.`);
        }
        
        // Contar placeholders en la PLANTILLA ORIGINAL (solo para referencia, no para validar)
        // NOTA: Esta validación fue deshabilitada porque causaba falsos positivos.
        // Los correos se envían correctamente, así que confiamos en la validación del tamaño final del HTML.
        let count1 = 0;
        let count2 = 0;
        try {
          const regex1 = new RegExp(placeholder, 'g');
          const regex2 = new RegExp(placeholder2, 'g');
          const matches1 = originalTemplate.match(regex1);
          const matches2 = originalTemplate.match(regex2);
          count1 = matches1 ? matches1.length : 0;
          count2 = matches2 ? matches2.length : 0;
        } catch (regexError) {
          // Ignorar errores de regex, continuar con el procesamiento
        }
        
        // NO validar ni lanzar errores basados en el conteo de placeholders
        // La validación real se hace al final verificando el tamaño del HTML
        
        // PROTECCIÓN ADICIONAL: Verificar tamaño ANTES de reemplazar
        const sizeBeforeReplace = Buffer.byteLength(html, 'utf8');
        
        // Reemplazar TODOS los placeholders (no limitar, pero validar después)
        try {
          if (count1 > 0) {
            html = html.replace(new RegExp(placeholder, 'g'), safeValue || '');
          }
          
          if (count2 > 0) {
            html = html.replace(new RegExp(placeholder2, 'g'), safeValue || '');
          }
          
          // PROTECCIÓN: Verificar que el HTML no creció excesivamente después del reemplazo
          const sizeAfterReplace = Buffer.byteLength(html, 'utf8');
          const growth = sizeAfterReplace - sizeBeforeReplace;
          
          // PROTECCIÓN CRÍTICA: Verificar que después del reemplazo no queden más placeholders del mismo tipo
          // Esto detecta bucles infinitos inmediatamente
          let countAfter1 = 0;
          let countAfter2 = 0;
          try {
            const matchesAfter1 = html.match(new RegExp(placeholder, 'g'));
            const matchesAfter2 = html.match(new RegExp(placeholder2, 'g'));
            countAfter1 = matchesAfter1 ? matchesAfter1.length : 0;
            countAfter2 = matchesAfter2 ? matchesAfter2.length : 0;
          } catch (regexError) {
            // Ignorar errores de regex
          }
          
          // Si después del reemplazo hay MÁS placeholders que antes, hay un bucle infinito
          if ((countAfter1 > count1 || countAfter2 > count2) && (countAfter1 + countAfter2) > (count1 + count2)) {
            console.error(`❌ ERROR CRÍTICO: Bucle infinito detectado para "${safeKey}"`);
            console.error(`   Placeholders ANTES del reemplazo: ${count1 + count2}`);
            console.error(`   Placeholders DESPUÉS del reemplazo: ${countAfter1 + countAfter2}`);
            console.error(`   El valor reemplazado está creando más placeholders!`);
            console.error(`   Valor: ${safeValue.substring(0, 200)}...`);
            throw new Error(`Bucle infinito detectado: el valor del campo "${safeKey}" está creando más placeholders. Verifica que el valor no contenga "[${safeKey}]" o "{{${safeKey}}}".`);
          }
          
          // Si el crecimiento es más de 100KB por placeholder, hay un problema grave
          if (growth > 100 * 1024) {
            console.error(`❌ ERROR CRÍTICO: El HTML creció ${(growth / 1024).toFixed(2)} KB al reemplazar "${safeKey}"`);
            console.error(`   Esto indica un bucle infinito o datos corruptos.`);
            console.error(`   Placeholders encontrados: ${count1 + count2}`);
            console.error(`   Valor: ${safeValue.substring(0, 50)}... (${safeValue.length} caracteres)`);
            console.error(`   Tamaño antes: ${(sizeBeforeReplace / 1024).toFixed(2)} KB`);
            console.error(`   Tamaño después: ${(sizeAfterReplace / 1024).toFixed(2)} KB`);
            throw new Error(`El HTML creció excesivamente (${(growth / 1024).toFixed(2)} KB) al procesar "${safeKey}". Esto indica un bucle infinito. Verifica la plantilla y los datos.`);
          }
          
          // PROTECCIÓN ADICIONAL: Si el HTML total es muy grande durante el procesamiento, detener
          if (sizeAfterReplace > 5 * 1024 * 1024) { // 5MB
            console.error(`❌ ERROR CRÍTICO: El HTML ha alcanzado ${(sizeAfterReplace / 1024 / 1024).toFixed(2)} MB durante el procesamiento`);
            console.error(`   Campo actual: "${safeKey}"`);
            console.error(`   Esto indica un problema grave. Deteniendo procesamiento.`);
            throw new Error(`El HTML ha crecido demasiado (${(sizeAfterReplace / 1024 / 1024).toFixed(2)} MB) durante el procesamiento. Esto indica un bucle infinito o datos corruptos.`);
          }
        } catch (replaceError) {
          console.error(`⚠️  Error reemplazando placeholder "${safeKey}":`, replaceError.message);
          // Re-lanzar errores críticos
          throw replaceError;
        }
        
        // NO validar tamaño después de cada reemplazo - esto causa falsos positivos
        // La validación se hará solo al final cuando todos los campos estén procesados
      } catch (fieldError) {
        // Si el error menciona "creció demasiado", es un error de código antiguo que ya no debería ocurrir
        // Lo ignoramos silenciosamente ya que la validación ahora se hace solo al final
        if (fieldError.message.includes('creció demasiado') || 
            fieldError.message.includes('demasiado grande al procesar')) {
          console.warn(`⚠️  Ignorando error de validación intermedia obsoleta para "${key}"`);
          continue; // Continuar con el siguiente campo
        }
        // Para otros errores, re-lanzarlos
        console.error(`⚠️  Error procesando campo "${key}":`, fieldError.message);
        throw fieldError;
      }
    }
    
    // Validación final del HTML (solo una vez, después de procesar todos los campos)
    const finalSize = Buffer.byteLength(html, 'utf8');
    const finalSizeMB = finalSize / (1024 * 1024);
    const originalSizeMB = originalSize / (1024 * 1024);
    
    // Límite más razonable: 2MB (Gmail permite hasta 25MB, pero queremos ser conservadores)
    if (finalSize > 2 * 1024 * 1024) {
      console.error(`❌ ERROR: El HTML final es demasiado grande (${finalSizeMB.toFixed(2)} MB)`);
      console.error(`   Tamaño original de plantilla: ${originalSizeMB.toFixed(3)} MB`);
      console.error(`   Incremento: ${(finalSizeMB - originalSizeMB).toFixed(2)} MB`);
      console.error(`   Esto puede deberse a datos muy largos en el Excel. Verifica que los campos no excedan los límites.`);
      throw new Error(`El HTML generado es demasiado grande (${finalSizeMB.toFixed(2)} MB). Verifica que los datos en el Excel no sean excesivamente largos.`);
    }
    
    // Advertencia si el HTML es grande pero aún aceptable
    if (finalSize > 0.5 * 1024 * 1024) {
      console.warn(`⚠️  ADVERTENCIA: El HTML es grande (${finalSizeMB.toFixed(2)} MB). Considera revisar los datos del Excel.`);
    }
    
    return html;
  } catch (error) {
    console.error(`❌ ERROR en replacePlaceholders:`, error.message);
    throw error;
  }
};

// Función para formatear fecha
const formatDate = (dateValue) => {
  try {
    if (!dateValue) return '';
    
    // VALIDACIÓN ULTRA ESTRICTA: Limitar a máximo 20 caracteres (una fecha nunca debería ser más larga)
    let dateStr = String(dateValue || '').trim();
    
    // Si la fecha es extremadamente larga, truncar inmediatamente
    if (dateStr.length > 20) {
      console.warn(`⚠️  Campo de fecha tiene ${dateStr.length} caracteres (truncando a 20)`);
      dateStr = dateStr.substring(0, 20).trim();
    }
    
    // Validar que no esté vacío después del trim
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const formatted = date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
        // Asegurar que la fecha formateada no sea muy larga
        return formatted.length > 20 ? formatted.substring(0, 20) : formatted;
      }
    } catch (dateError) {
      // Ignorar error de parsing de fecha
    }
    
    // Intentar parsear formato dd/mm/yyyy o dd-mm-yyyy
    const separators = ['/', '-', '.'];
    for (const sep of separators) {
      const parts = dateStr.split(sep);
      if (parts.length === 3) {
        // Validar que cada parte sea razonable
        const day = parts[0].trim();
        const month = parts[1].trim();
        const year = parts[2].trim();
        
        if (day.length <= 2 && month.length <= 2 && year.length <= 4) {
          // Formatear como dd/mm/yyyy
          return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        }
      }
    }
    
    // Si no se puede parsear, devolver solo los primeros 20 caracteres
    return dateStr.substring(0, 20);
  } catch (error) {
    console.error(`⚠️  Error en formatDate:`, error.message);
    // En caso de error, devolver string vacío o truncado
    const safeValue = String(dateValue || '').trim().substring(0, 20);
    return safeValue;
  }
};

// Función para enviar correo (exactamente como el script de diagnóstico que funcionó)
const sendEmailDirect = async (mailOptions, customUser = null, customPass = null) => {
  // Validar mailOptions
  if (!mailOptions || !mailOptions.to || !mailOptions.subject || !mailOptions.html) {
    throw new Error('Las opciones de correo no son válidas');
  }
  
  // Validar email destinatario
  if (!mailOptions.to.includes('@')) {
    throw new Error(`El correo destinatario no es válido: ${mailOptions.to}`);
  }
  
  // Intentar primero con puerto 465 (el que funcionó en diagnóstico)
  let transporter = null;
  try {
    transporter = createTransporter(true, customUser, customPass);
    
    // Agregar timeout para evitar bloqueos
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout enviando correo (30s)')), 30000)
    );
    
    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log('✅ Correo enviado exitosamente');
    
    if (transporter && transporter.close) {
      transporter.close();
    }
    return { success: true, messageId: info.messageId };
  } catch (error465) {
    if (transporter && transporter.close) {
      try {
        transporter.close();
      } catch (closeError) {
        // Ignorar error al cerrar
      }
    }
    console.log(`⚠️  Puerto 465 falló: ${error465.code || error465.message}`);
    
    // Si falla, intentar con puerto 587
    try {
      transporter = createTransporter(false, customUser, customPass);
      
      // Agregar timeout para evitar bloqueos
      const sendPromise = transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout enviando correo (30s)')), 30000)
      );
      
      const info = await Promise.race([sendPromise, timeoutPromise]);
      console.log('✅ Correo enviado exitosamente (puerto 587)');
      
      if (transporter && transporter.close) {
        transporter.close();
      }
      return { success: true, messageId: info.messageId };
    } catch (error587) {
      if (transporter && transporter.close) {
        try {
          transporter.close();
        } catch (closeError) {
          // Ignorar error al cerrar
        }
      }
      console.error(`❌ Ambos puertos fallaron`);
      console.error(`   Error 465: ${error465.code || error465.message}`);
      console.error(`   Error 587: ${error587.code || error587.message}`);
      throw error587;
    }
  }
};

// Enviar correo HTML
export const sendHtmlEmail = async (to, subject, html, attachments = [], fromEmailOverride = null, fromPasswordOverride = null) => {
  try {
    // Validaciones de entrada
    if (!to || typeof to !== 'string' || !to.includes('@')) {
      throw new Error(`El correo destinatario no es válido: ${to}`);
    }
    
    if (!subject || typeof subject !== 'string') {
      throw new Error('El asunto del correo no es válido');
    }
    
    if (!html || typeof html !== 'string') {
      throw new Error('El HTML del correo no es válido');
    }
    
    // Validar que el HTML no esté vacío
    if (html.trim().length === 0) {
      throw new Error('El HTML del correo está vacío');
    }
    
    console.log('📧 Preparando envío de correo a:', to);
    
    // Buscar el logo en múltiples ubicaciones posibles
    const possibleLogoPaths = [
      path.join(__dirname, '..', 'public', 'umit-logo.png'),
      path.join(__dirname, '..', 'src', 'assets', 'umit-logo.png'),
      path.join(__dirname, '..', 'umit-logo.png')
    ];
    
    let logoPath = null;
    for (const possiblePath of possibleLogoPaths) {
      if (fs.existsSync(possiblePath)) {
        logoPath = possiblePath;
        console.log('✅ Logo encontrado en:', logoPath);
        break;
      }
    }
    
    // Preparar attachments con el logo si existe
    let logoAttachments = [];
    let logoSize = 0;
    
    if (logoPath && fs.existsSync(logoPath)) {
      try {
        // Leer el logo como buffer para asegurar que se adjunte correctamente
        const logoBuffer = fs.readFileSync(logoPath);
        logoSize = logoBuffer.length / (1024 * 1024);
        
        // Adjuntar el logo como imagen inline usando cid:logo
        // IMPORTANTE: El cid debe estar sin los < > para que funcione correctamente
        logoAttachments = [{
          filename: 'umit-logo.png',
          content: logoBuffer,
          cid: 'logo', // Este es el Content-ID que se usa en el HTML con cid:logo
          contentType: 'image/png',
          contentDisposition: 'inline' // Importante: inline para que se muestre en el correo
        }];
        
        console.log(`📎 Logo adjuntado correctamente (${logoSize.toFixed(2)}MB) - se mostrará en el correo`);
        console.log(`   Ruta del logo: ${logoPath}`);
      } catch (logoError) {
        console.error('❌ Error leyendo el logo:', logoError.message);
        console.warn('⚠️  El logo no se adjuntará, pero el correo se enviará sin él.');
      }
    } else {
      console.warn('⚠️  Logo no encontrado en ninguna ubicación. El logo no se mostrará en el correo.');
      console.warn('   Rutas buscadas:', possibleLogoPaths);
      // Si no hay logo, mantener el HTML original (no reemplazar por texto)
    }

    // Obtener el usuario del correo - usar override si se proporciona, sino usar el del .env
    const fromEmail = fromEmailOverride 
      ? fromEmailOverride.trim() 
      : (process.env.GMAIL_USER || 'micita@umit.com.co').trim();
    
    // Validar que fromEmail sea válido
    if (!fromEmail || !fromEmail.includes('@')) {
      throw new Error(`El correo remitente no es válido: ${fromEmail}`);
    }
    
    // Comprimir HTML SIEMPRE para reducir tamaño y evitar exceder límites
    const originalSize = Buffer.byteLength(html, 'utf8') / (1024 * 1024);
    html = compressHTML(html);
    const compressedSize = Buffer.byteLength(html, 'utf8') / (1024 * 1024);
    
    if (originalSize > 0.1) { // Solo mostrar log si es significativo
      const reduction = originalSize > 0 ? ((1 - compressedSize/originalSize) * 100).toFixed(1) : 0;
      console.log(`📦 HTML comprimido: ${originalSize.toFixed(2)} MB → ${compressedSize.toFixed(2)} MB (reducción: ${reduction}%)`);
    }
    
    // Calcular tamaño REAL del mensaje (como lo hace Python/Gmail)
    // El tamaño real es la suma de todos los componentes sin multiplicadores artificiales
    const htmlSize = Buffer.byteLength(html, 'utf8') / (1024 * 1024);
    
    // Calcular tamaño de adjuntos
    let attachmentsSize = 0;
    for (const att of attachments) {
      if (att.path && fs.existsSync(att.path)) {
        attachmentsSize += fs.statSync(att.path).size / (1024 * 1024);
      } else if (att.content) {
        // Si el adjunto tiene contenido en memoria (buffer)
        if (Buffer.isBuffer(att.content)) {
          attachmentsSize += att.content.length / (1024 * 1024);
        } else {
          attachmentsSize += Buffer.byteLength(String(att.content), 'utf8') / (1024 * 1024);
        }
      }
    }
    
    // Logo ya se calculó arriba si existe
    
    // Tamaño total REAL (sin multiplicadores - Gmail cuenta el tamaño real del mensaje)
    // El encoding base64 se aplica automáticamente por nodemailer, pero Gmail cuenta el tamaño final
    const totalSize = htmlSize + attachmentsSize + logoSize;
    
    console.log(`📊 Tamaño del mensaje: HTML=${htmlSize.toFixed(2)}MB, Adjuntos=${attachmentsSize.toFixed(2)}MB, Logo=${logoSize.toFixed(2)}MB, Total=${totalSize.toFixed(2)}MB`);
    
    // RECHAZAR correos mayores a 20MB (margen de seguridad para Gmail que tiene límite de 25MB)
    if (totalSize > 20) {
      const errorMsg = `El correo es demasiado grande (${totalSize.toFixed(2)} MB). Gmail tiene un límite de 25MB. Por favor, reduce el tamaño del contenido.`;
      console.error(`❌ ${errorMsg}`);
      console.error(`   Detalles: HTML=${htmlSize.toFixed(2)}MB, Adjuntos=${attachmentsSize.toFixed(2)}MB, Logo=${logoSize.toFixed(2)}MB`);
      console.error(`   Si el HTML es muy grande, verifica que los datos del Excel no tengan texto excesivamente largo.`);
      throw new Error(errorMsg);
    }
    
    if (totalSize > 10) {
      console.warn(`⚠️  ADVERTENCIA: El mensaje es grande (${totalSize.toFixed(2)}MB). Considera reducir el tamaño del contenido.`);
    }
    
    // Diagnóstico: Si el HTML es muy grande, mostrar qué puede estar causándolo
    if (htmlSize > 5) {
      console.warn(`⚠️  ADVERTENCIA: El HTML es muy grande (${htmlSize.toFixed(2)}MB). Esto puede deberse a datos muy largos en el Excel.`);
      console.warn(`   Verifica que las columnas no tengan texto excesivamente largo (>200 caracteres).`);
    }
    
    // Validación EXTRA: Si el tamaño total es sospechosamente grande, investigar
    if (totalSize > 10) {
      console.warn(`⚠️  ADVERTENCIA CRÍTICA: El mensaje es muy grande (${totalSize.toFixed(2)}MB)`);
      console.warn(`   Desglose: HTML=${htmlSize.toFixed(2)}MB, Adjuntos=${attachmentsSize.toFixed(2)}MB`);
      
      // Si el HTML es muy grande, puede haber un problema con los datos
      if (htmlSize > 1) {
        console.error(`❌ PROBLEMA: El HTML es demasiado grande (${htmlSize.toFixed(2)}MB)`);
        console.error(`   Esto NO debería pasar. Los datos deberían estar limitados a 200 caracteres.`);
        console.error(`   Revisa el Excel - puede haber datos corruptos o muy largos.`);
      }
    }
    
    // Incluir logo en attachments si existe, junto con otros adjuntos
    const allAttachments = [...logoAttachments, ...attachments];
    
    // Debug: Verificar attachments
    if (logoAttachments.length > 0) {
      console.log('📎 Attachments del logo:', JSON.stringify(logoAttachments.map(a => ({ 
        filename: a.filename, 
        hasContent: !!a.content, 
        hasPath: !!a.path, 
        cid: a.cid 
      })), null, 2));
    }
    console.log(`📎 Total de attachments: ${allAttachments.length} (${logoAttachments.length} logo(s) + ${attachments.length} otros)`);
    
    const mailOptions = {
      from: fromEmail,
      to: to,
      subject: subject,
      html: html,
      attachments: allAttachments // Logo + otros adjuntos
    };
    
    console.log('📧 Enviando correo:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject.substring(0, 50) + '...',
      hasAttachments: mailOptions.attachments.length > 0,
      attachmentsCount: mailOptions.attachments.length
    });

    // Obtener credenciales personalizadas si se proporcionan
    const customUser = fromEmailOverride ? fromEmailOverride.trim() : null;
    const customPass = fromPasswordOverride ? fromPasswordOverride.trim() : null;
    
    // Enviar correo directamente con credenciales personalizadas si están disponibles
    return await sendEmailDirect(mailOptions, customUser, customPass);
  } catch (error) {
    console.error('❌ ERROR ENVIANDO CORREO (después de todos los reintentos):');
    console.error('   Tipo:', error.constructor.name);
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code);
    console.error('   Respuesta:', error.response);
    
    // Mensaje más claro para errores de tamaño
    if (error.message.includes('message size limits') || error.message.includes('exceeded')) {
      throw new Error('El correo excede el límite de tamaño de Gmail (25MB). Por favor, reduce el tamaño de las imágenes o adjuntos.');
    }
    
    throw new Error(`Error enviando correo: ${error.message}`);
  }
};

// Renderizar plantilla de Citas
export const renderCitasTemplate = (row) => {
  try {
    // VALIDACIÓN ULTRA TEMPRANA: Verificar cada campo individualmente ANTES de procesar
    const fieldSizes = {};
    let totalChars = 0;
    for (const [key, value] of Object.entries(row)) {
      const fieldSize = String(value || '').length;
      fieldSizes[key] = fieldSize;
      totalChars += fieldSize;
      
      // Si algún campo individual es mayor a 10000 caracteres, rechazar inmediatamente
      if (fieldSize > 10000) {
        console.error(`❌ ERROR CRÍTICO: Campo "${key}" tiene ${fieldSize} caracteres (demasiado grande)`);
        throw new Error(`El campo "${key}" en la fila 2 tiene ${fieldSize} caracteres, lo cual es excesivamente largo. Por favor, reduce este campo en el Excel a menos de 200 caracteres.`);
      }
    }
    
    const rowSize = JSON.stringify(row).length;
    console.log(`🔍 Procesando fila: tamaño original = ${rowSize} caracteres, total de caracteres = ${totalChars}`);
    
    if (rowSize > 10000 || totalChars > 10000) {
      console.error(`❌ ERROR: La fila es demasiado grande (${rowSize} caracteres en JSON, ${totalChars} caracteres totales)`);
      console.error(`   Campos problemáticos:`, Object.entries(fieldSizes).filter(([k, v]) => v > 500));
      throw new Error(`Los datos de esta fila son demasiado grandes (${totalChars} caracteres totales). Por favor, reduce el contenido en el Excel.`);
    }
    
    // Limpiar y limitar datos ANTES de procesarlos
    const cleanedRow = cleanRowData(row, 200);
    console.log(`🔍 Después de limpiar: ${JSON.stringify(cleanedRow).length} caracteres`);
    
    // VALIDAR Y LIMITAR CADA CAMPO INDIVIDUALMENTE antes de crear el objeto data
    // Esto previene que datos largos lleguen a la plantilla
    
    // VALIDACIÓN ULTRA AGRESIVA PARA FECHA: Verificar ANTES de limpiar y FORZAR límite
    let fechaCitaRawOriginal = String(row['Fecha de la Cita'] || '').trim();
    
    // Si la fecha es demasiado larga, truncar INMEDIATAMENTE sin excepción
    if (fechaCitaRawOriginal.length > 20) {
      console.error(`❌ ERROR CRÍTICO: Campo "Fecha de la Cita" tiene ${fechaCitaRawOriginal.length} caracteres (máximo permitido: 20)`);
      console.error(`   Primeros 200 caracteres: ${fechaCitaRawOriginal.substring(0, 200)}...`);
      console.error(`   TRUNCADO FORZOSAMENTE a 20 caracteres para evitar HTML grande.`);
      // FORZAR truncamiento - no lanzar error, solo truncar
      fechaCitaRawOriginal = fechaCitaRawOriginal.substring(0, 20).trim();
    }
    
    // VALIDACIÓN ULTRA AGRESIVA PARA "Nombre del Paciente": Verificar ANTES de limpiar
    let nombrePacienteRaw = String(row['Nombre del Paciente'] || '').trim();
    
    // Si el nombre es demasiado largo, truncar INMEDIATAMENTE sin excepción
    if (nombrePacienteRaw.length > 50) {
      console.error(`❌ ADVERTENCIA: Campo "Nombre del Paciente" tiene ${nombrePacienteRaw.length} caracteres (máximo permitido: 50)`);
      console.error(`   Primeros 50 caracteres: ${nombrePacienteRaw.substring(0, 50)}...`);
      console.error(`   TRUNCADO FORZOSAMENTE a 50 caracteres para evitar HTML grande.`);
      // FORZAR truncamiento - no lanzar error, solo truncar
      nombrePacienteRaw = nombrePacienteRaw.substring(0, 50).trim();
    }
    
    // LIMITAR "Nombre del Paciente" a máximo 50 caracteres (triple seguridad)
    let nombrePaciente = limitTextLength(nombrePacienteRaw, 50);
    // FORZAR límite adicional
    if (nombrePaciente.length > 50) {
      console.warn(`⚠️  "Nombre del Paciente" truncado a 50 caracteres (tenía ${nombrePaciente.length})`);
      nombrePaciente = nombrePaciente.substring(0, 50).trim();
    }
    // VALIDACIÓN FINAL: Asegurar que nunca exceda 50 caracteres
    nombrePaciente = nombrePaciente.substring(0, 50).trim();
    
    // TRUNCAR fecha a máximo 20 caracteres ANTES de formatear (triple seguridad)
    const fechaCitaRaw = fechaCitaRawOriginal.substring(0, 20).trim();
    let fechaCita = formatDate(fechaCitaRaw);
    
    // FORZAR límite de 20 caracteres después de formatear (sin excepciones)
    if (fechaCita.length > 20) {
      console.warn(`⚠️  Fecha formateada tiene ${fechaCita.length} caracteres (truncando a 20)`);
      fechaCita = fechaCita.substring(0, 20).trim();
    }
    
    // VALIDACIÓN FINAL: Asegurar que la fecha nunca exceda 20 caracteres
    fechaCita = limitTextLength(fechaCita, 20);
    
    const horaCita = limitTextLength(String(cleanedRow['Hora de la Cita'] || ''), 50);
    const nombreMedico = limitTextLength(String(cleanedRow['Nombre del Médico/a'] || ''), 100);
    const lugarCita = limitTextLength(String(cleanedRow['Lugar de la cita'] || ''), 150);
    const tipoCita = limitTextLength(String(cleanedRow['Tipo de cita'] || ''), 100);
    const especialidad = limitTextLength(String(cleanedRow['Especialidad'] || ''), 100);
    
    // Validar que ningún campo individual sea demasiado largo
    const campos = {
      'Nombre del Paciente': nombrePaciente,
      'Fecha de la Cita': fechaCita,
      'Hora de la Cita': horaCita,
      'Nombre del Médico/a': nombreMedico,
      'Lugar de la cita': lugarCita,
      'Tipo de cita': tipoCita,
      'Especialidad': especialidad
    };
    
    // Verificar que ningún campo procesado sea demasiado largo
    for (const [key, value] of Object.entries(campos)) {
      const length = String(value).length;
      // Validación especial por tipo de campo
      let maxLength = 200;
      if (key === 'Fecha de la Cita') {
        maxLength = 20;
      } else if (key === 'Nombre del Paciente') {
        maxLength = 50; // Reducido a 50 caracteres (MUY ESTRICTO)
      } else if (key === 'Hora de la Cita') {
        maxLength = 50;
      } else if (key === 'Nombre del Médico/a') {
        maxLength = 80;
      } else if (key === 'Lugar de la cita') {
        maxLength = 120;
      } else if (key === 'Tipo de cita' || key === 'Especialidad') {
        maxLength = 80;
      }
      
      if (length > maxLength) {
        console.warn(`⚠️  Campo "${key}" truncado a ${maxLength} caracteres (tenía ${length})`);
        // TRUNCAR automáticamente en lugar de lanzar error
        campos[key] = String(value).substring(0, maxLength).trim();
      }
    }
    
    // GARANTIZAR que "Nombre del Paciente" esté limitado a 50 caracteres ANTES de crear data
    if (campos['Nombre del Paciente'] && String(campos['Nombre del Paciente']).length > 50) {
      console.warn(`⚠️  "Nombre del Paciente" en campos tiene ${String(campos['Nombre del Paciente']).length} caracteres, forzando a 50`);
      campos['Nombre del Paciente'] = String(campos['Nombre del Paciente']).substring(0, 50).trim();
    }
    
    const data = campos;
    
    // Validar tamaño de los datos ANTES de generar HTML
    const dataSize = JSON.stringify(data).length;
    console.log(`🔍 Tamaño de datos procesados: ${dataSize} caracteres`);
    console.log(`🔍 Longitudes de campos:`, Object.entries(data).map(([k, v]) => `${k}: ${String(v).length}`));
    
    // VALIDACIÓN ESPECIAL: Verificar que "Nombre del Paciente" no exceda 50 caracteres
    if (data['Nombre del Paciente'] && String(data['Nombre del Paciente']).length > 50) {
      console.error(`❌ ERROR CRÍTICO: "Nombre del Paciente" tiene ${String(data['Nombre del Paciente']).length} caracteres en data`);
      data['Nombre del Paciente'] = String(data['Nombre del Paciente']).substring(0, 50).trim();
      console.warn(`⚠️  Forzado a 50 caracteres: "${data['Nombre del Paciente']}"`);
    }
    
    if (dataSize > 2000) {
      console.error(`❌ ERROR: Los datos procesados son demasiado grandes (${dataSize} caracteres)`);
      console.error(`   Datos:`, Object.entries(data).map(([k, v]) => `${k}: ${String(v).length} chars`));
      throw new Error(`Los datos procesados son demasiado grandes. Verifica el Excel.`);
    }
    
    // Verificar tamaño de la plantilla ANTES de reemplazar
    const templateSize = Buffer.byteLength(TEMPLATE_HTML_CITAS, 'utf8') / (1024 * 1024);
    console.log(`🔍 Tamaño de plantilla: ${templateSize.toFixed(3)} MB`);
    
    const html = replacePlaceholders(TEMPLATE_HTML_CITAS, data);
    
    // Validar tamaño ANTES de devolver - límite MUY estricto
    const htmlSize = Buffer.byteLength(html, 'utf8') / (1024 * 1024);
    console.log(`🔍 Tamaño de HTML generado: ${htmlSize.toFixed(3)} MB`);
    
    if (htmlSize > 0.5) {
      console.error(`❌ HTML demasiado grande: ${htmlSize.toFixed(2)} MB`);
      console.error(`   Tamaño de plantilla: ${templateSize.toFixed(3)} MB`);
      console.error(`   Tamaño de datos: ${dataSize} caracteres`);
      console.error(`   Incremento: ${((htmlSize - templateSize) * 1024 * 1024).toFixed(0)} bytes`);
      console.error(`   Datos problemáticos:`, Object.entries(data).filter(([k, v]) => String(v).length > 50));
      throw new Error(`El HTML generado es demasiado grande (${htmlSize.toFixed(2)} MB). Verifica que los datos en el Excel no sean excesivamente largos.`);
    }
    
    return html;
  } catch (error) {
    console.error(`❌ ERROR en renderCitasTemplate:`, error.message);
    throw error;
  }
};

// Renderizar plantilla de Reprogramación
export const renderReprogramacionTemplate = (row) => {
  try {
    if (!row || typeof row !== 'object') {
      throw new Error('La fila no es un objeto válido');
    }
    
    // VALIDACIÓN TEMPRANA: Verificar tamaño de la fila ANTES de procesar
    const rowSize = JSON.stringify(row).length;
    if (rowSize > 10000) {
      throw new Error(`Los datos de esta fila son demasiado grandes (${rowSize} caracteres). Por favor, reduce el contenido en el Excel.`);
    }
    
    const cleanedRow = cleanRowData(row, 200);
    
    // Validar fechas antes de procesarlas
    const fechaOriginalRaw = String(cleanedRow['Fecha de la Cita Original'] || '').trim();
    const fechaReprogramadaRaw = String(cleanedRow['Fecha de la Cita Reprogramada'] || '').trim();
    
    if (fechaOriginalRaw.length > 20) {
      console.warn(`⚠️  Fecha Original truncada: ${fechaOriginalRaw.length} → 20 caracteres`);
    }
    if (fechaReprogramadaRaw.length > 20) {
      console.warn(`⚠️  Fecha Reprogramada truncada: ${fechaReprogramadaRaw.length} → 20 caracteres`);
    }
    
    const data = {
      'Nombre del Paciente': limitTextLength(String(cleanedRow['Nombre del Paciente'] || ''), 100),
      'Fecha Original': formatDate(fechaOriginalRaw.substring(0, 20)),
      'Hora Original': limitTextLength(String(cleanedRow['Hora de la Cita Original'] || ''), 50),
      'Fecha Reprogramada': formatDate(fechaReprogramadaRaw.substring(0, 20)),
      'Hora Reprogramada': limitTextLength(String(cleanedRow['Hora de la Cita Reprogramada'] || ''), 50),
      'Nombre del Médico/a': limitTextLength(String(cleanedRow['Nombre del Médico/a'] || ''), 100),
      'Lugar de la cita': limitTextLength(String(cleanedRow['Lugar de la cita'] || ''), 150),
      'Tipo de cita': limitTextLength(String(cleanedRow['Tipo de cita'] || ''), 100),
      'Especialidad': limitTextLength(String(cleanedRow['Especialidad'] || ''), 100),
      'Motivo de reprogramación': limitTextLength(String(cleanedRow['Motivo de reprogramación'] || 'Ajuste de agenda'), 200)
    };
    
    // Validar que ningún campo sea demasiado largo
    for (const [key, value] of Object.entries(data)) {
      if (String(value).length > 200) {
        throw new Error(`El campo "${key}" tiene ${String(value).length} caracteres. Verifica el Excel.`);
      }
    }
    
    const dataSize = JSON.stringify(data).length;
    if (dataSize > 2000) {
      throw new Error(`Los datos procesados son demasiado grandes (${dataSize} caracteres). Verifica el Excel.`);
    }
    
    const html = replacePlaceholders(TEMPLATE_HTML_REPROGRAMACION, data);
    
    const htmlSize = Buffer.byteLength(html, 'utf8') / (1024 * 1024);
    if (htmlSize > 0.5) {
      console.error(`❌ HTML demasiado grande: ${htmlSize.toFixed(2)} MB`);
      throw new Error(`El HTML generado es demasiado grande (${htmlSize.toFixed(2)} MB). Verifica que los datos en el Excel no sean excesivamente largos.`);
    }
    
    return html;
  } catch (error) {
    console.error(`❌ ERROR en renderReprogramacionTemplate:`, error.message);
    throw error;
  }
};

// Renderizar plantilla de Dengue
export const renderDengueTemplate = () => {
  return TEMPLATE_HTML_DENGUE;
};

// Renderizar plantilla de Cursos
export const renderCursosTemplate = (row) => {
  try {
    if (!row || typeof row !== 'object') {
      throw new Error('La fila no es un objeto válido');
    }
    
    // VALIDACIÓN TEMPRANA: Verificar tamaño de la fila ANTES de procesar
    const rowSize = JSON.stringify(row).length;
    if (rowSize > 10000) {
      throw new Error(`Los datos de esta fila son demasiado grandes (${rowSize} caracteres). Por favor, reduce el contenido en el Excel.`);
    }
    
    const cleanedRow = cleanRowData(row, 200);
    
    // Validar fechas antes de procesarlas
    const fechaLimiteRaw = String(cleanedRow['FECHA_LIMITE'] || '').trim();
    const fecha1Raw = String(cleanedRow['FECHA_1'] || '').trim();
    const fecha2Raw = String(cleanedRow['FECHA_2'] || '').trim();
    const fecha3Raw = String(cleanedRow['FECHA_3'] || '').trim();
    const fecha4Raw = String(cleanedRow['FECHA_4'] || '').trim();
    
    const data = {
      'NOMBRE': limitTextLength(String(cleanedRow['NOMBRE'] || ''), 100),
      'FECHA_LIMITE': formatDate(fechaLimiteRaw.substring(0, 50)),
      'DIRIGIDO_A': limitTextLength(String(cleanedRow['DIRIGIDO_A'] || ''), 150),
      'CURSO_1': limitTextLength(String(cleanedRow['CURSO_1'] || ''), 150),
      'ESTADO_1': limitTextLength(String(cleanedRow['ESTADO_1'] || ''), 50),
      'FECHA_1': formatDate(fecha1Raw.substring(0, 50)),
      'CURSO_2': limitTextLength(String(cleanedRow['CURSO_2'] || ''), 150),
      'ESTADO_2': limitTextLength(String(cleanedRow['ESTADO_2'] || ''), 50),
      'FECHA_2': formatDate(fecha2Raw.substring(0, 50)),
      'CURSO_3': limitTextLength(String(cleanedRow['CURSO_3'] || ''), 150),
      'ESTADO_3': limitTextLength(String(cleanedRow['ESTADO_3'] || ''), 50),
      'FECHA_3': formatDate(fecha3Raw.substring(0, 50)),
      'CURSO_4': limitTextLength(String(cleanedRow['CURSO_4'] || ''), 150),
      'ESTADO_4': limitTextLength(String(cleanedRow['ESTADO_4'] || ''), 50),
      'FECHA_4': formatDate(fecha4Raw.substring(0, 50)),
      'ENLACE_SUBIDA_CERTIFICADOS': limitTextLength(String(cleanedRow['ENLACE_SUBIDA_CERTIFICADOS'] || ''), 500)
    };
    
    // Validar que ningún campo sea demasiado largo
    for (const [key, value] of Object.entries(data)) {
      const maxLength = key === 'ENLACE_SUBIDA_CERTIFICADOS' ? 500 : 200;
      if (String(value).length > maxLength) {
        throw new Error(`El campo "${key}" tiene ${String(value).length} caracteres. Verifica el Excel.`);
      }
    }
    
    const dataSize = JSON.stringify(data).length;
    if (dataSize > 2000) {
      throw new Error(`Los datos procesados son demasiado grandes (${dataSize} caracteres). Verifica el Excel.`);
    }
    
    const html = replacePlaceholders(TEMPLATE_HTML_CURSOS, data);
    
    const htmlSize = Buffer.byteLength(html, 'utf8') / (1024 * 1024);
    if (htmlSize > 0.5) {
      console.error(`❌ HTML demasiado grande: ${htmlSize.toFixed(2)} MB`);
      throw new Error(`El HTML generado es demasiado grande (${htmlSize.toFixed(2)} MB). Verifica que los datos en el Excel no sean excesivamente largos.`);
    }
    
    return html;
  } catch (error) {
    console.error(`❌ ERROR en renderCursosTemplate:`, error.message);
    throw error;
  }
};

// Enviar correo de recuperación de contraseña
export const sendPasswordResetEmail = async (email, codigoVerificacion, nombreUsuario) => {
  try {
    if (!email || !codigoVerificacion) {
      throw new Error('Email y código de verificación son obligatorios');
    }

    // Reemplazar placeholders en la plantilla
    let html = TEMPLATE_HTML_RESET_PASSWORD
      .replace(/\[NOMBRE\]/g, nombreUsuario || 'Usuario')
      .replace(/\[CODIGO\]/g, codigoVerificacion || 'No disponible');

    const subject = 'Recuperación de Contraseña - Sistema Masicorreos UMIT';

    // Verificar que el código se esté reemplazando correctamente
    console.log(`📧 Enviando correo de recuperación de contraseña a: ${email}`);
    console.log(`🔑 Código de verificación generado: ${codigoVerificacion}`);
    console.log(`✅ Plantilla actualizada - Código incluido: ${html.includes(codigoVerificacion)}`);

    // Enviar correo usando la función existente
    await sendHtmlEmail(email, subject, html);

    console.log(`✅ Correo de recuperación enviado exitosamente a: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ ERROR enviando correo de recuperación:', error.message);
    throw error;
  }
};

