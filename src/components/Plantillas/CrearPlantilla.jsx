// CrearPlantilla.jsx
import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './CrearPlantilla.css';

// Plantilla HTML base (estructura sin contenido)
const PLANTILLA_BASE = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Recordatorio de Cita Médica</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; color: #000; }
        .container { max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }
        .header { background-color: #3b5998; color: white; padding: 25px 0; text-align: center; font-weight: 700; font-size: 24px; }
        .header-circle { width: 120px; height: 120px; margin: 0 auto 3px; background-color: white; border-radius: 50%; border: 1px solid #ddd; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }
        .header-circle img { max-width: 90%; max-height: 300%; object-fit: contain; margin-left: 8px; border-radius: 200px; }
        .content { padding: 25px 30px; }
        .content h2 { font-weight: 700; font-size: 20px; margin: 0 0 20px; }
        .content p { font-size: 14px; line-height: 1.5; margin: 10px 0; }
        .highlighted { background-color: #f3f6fb; padding: 15px 20px; margin: 20px 0; border-radius: 6px; font-size: 14px; }
        .highlighted b { color: #2b2b2b; }
        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 13px; padding: 20px 30px; text-align: center; }
        .footer b { color: #fff; }
        a, a:visited { color: #3b5998; text-decoration: none; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-circle">
                <img src="cid:logo" alt="UMIT Logo" />
            </div>
        </div>
        <div class="content">
            <!-- CONTENIDO_AQUI -->
        </div>
        <div class="footer">
            <!-- FOOTER_AQUI -->
        </div>
    </div>
</body>
</html>`;

// Plantillas Predefinidas (si se necesitan en el futuro)
const PLANTILLAS_PREDEFINIDAS = {
  umit_elegante: {
    nombre: 'Plantilla UMIT Elegante',
    html: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Comunicado UMIT</title>
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0; 
            padding: 40px 20px; 
            color: #2c3e50; 
            line-height: 1.7;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .email-container {
            max-width: 650px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 30px 30px;
            animation: movePattern 20s linear infinite;
            opacity: 0.3;
        }
        @keyframes movePattern {
            0% { transform: translate(0, 0); }
            100% { transform: translate(30px, 30px); }
        }
        .logo-wrapper {
            position: relative;
            z-index: 2;
            margin-bottom: 30px;
        }
        .logo-box {
            width: 150px;
            height: 150px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 50%;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
        }
        .logo-box:hover {
            transform: scale(1.05);
        }
        .logo-box img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        .header-title {
            color: #ffffff;
            font-size: 36px;
            font-weight: 700;
            margin: 25px 0 15px;
            text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
            position: relative;
            z-index: 2;
            letter-spacing: -0.5px;
        }
        .header-subtitle {
            color: rgba(255, 255, 255, 0.95);
            font-size: 18px;
            font-weight: 400;
            position: relative;
            z-index: 2;
            letter-spacing: 0.5px;
        }
        .content {
            padding: 55px 50px;
            background: #ffffff;
        }
        .greeting {
            font-size: 19px;
            color: #2c3e50;
            margin-bottom: 30px;
            line-height: 1.9;
            font-weight: 500;
        }
        .greeting strong {
            color: #667eea;
            font-weight: 700;
            font-size: 20px;
        }
        .message {
            font-size: 17px;
            color: #495057;
            line-height: 2;
            margin-bottom: 35px;
            text-align: justify;
        }
        .info-card {
            background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
            border-left: 6px solid #667eea;
            border-radius: 12px;
            padding: 30px;
            margin: 35px 0;
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.15);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .info-card:hover {
            transform: translateX(5px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
        }
        .info-row {
            display: flex;
            margin-bottom: 20px;
            align-items: flex-start;
            padding: 12px 0;
            border-bottom: 1px solid rgba(102, 126, 234, 0.1);
        }
        .info-row:last-child {
            margin-bottom: 0;
            border-bottom: none;
        }
        .info-label {
            font-weight: 700;
            color: #667eea;
            min-width: 140px;
            font-size: 16px;
            display: flex;
            align-items: center;
        }
        .info-value {
            color: #2c3e50;
            font-size: 17px;
            flex: 1;
            font-weight: 500;
        }
        .divider {
            height: 3px;
            background: linear-gradient(90deg, transparent, #667eea, #764ba2, transparent);
            margin: 40px 0;
            border-radius: 2px;
        }
        .additional-info {
            background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
            border: 2px solid #e8ecff;
            border-radius: 12px;
            padding: 30px;
            margin-top: 35px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .additional-info h3 {
            color: #667eea;
            font-size: 22px;
            margin-bottom: 18px;
            padding-bottom: 12px;
            border-bottom: 2px solid #e8ecff;
            font-weight: 700;
        }
        .additional-info p {
            color: #495057;
            font-size: 17px;
            line-height: 1.9;
        }
        .footer {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: #ffffff;
            padding: 45px 50px;
            text-align: center;
            position: relative;
        }
        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }
        .footer-text {
            font-size: 16px;
            line-height: 1.9;
            margin-bottom: 18px;
            color: rgba(255, 255, 255, 0.95);
        }
        .footer-org {
            font-size: 20px;
            font-weight: 700;
            color: #ffffff;
            margin: 18px 0;
            letter-spacing: 0.5px;
        }
        .footer-signature {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            font-style: italic;
            color: rgba(255, 255, 255, 0.85);
            font-size: 15px;
        }
        @media (max-width: 600px) {
            body { padding: 20px 10px; }
            .header { padding: 40px 25px; }
            .content { padding: 40px 25px; }
            .footer { padding: 35px 25px; }
            .header-title { font-size: 28px; }
            .logo-box { width: 120px; height: 120px; }
            .info-row { flex-direction: column; }
            .info-label { margin-bottom: 8px; min-width: auto; }
            .info-value { font-size: 16px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo-wrapper">
                <div class="logo-box">
                    <img src="cid:logo" alt="Logo UMIT" />
                </div>
            </div>
            <h1 class="header-title">{{Titulo}}</h1>
            <p class="header-subtitle">Unidad Materno Infantil del Tolima</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Estimad@ <strong>{{Nombre}}</strong>,
            </div>
            
            <div class="message">
                {{MensajeInicial}}
            </div>
            
            <div class="info-card">
                <div class="info-row">
                    <span class="info-label">📄 Documento:</span>
                    <span class="info-value">{{Documento}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">📅 Fecha:</span>
                    <span class="info-value">{{Fecha}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">📋 Motivo:</span>
                    <span class="info-value">{{Motivo}}</span>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="additional-info">
                <h3>ℹ️ Información Adicional</h3>
                <p>{{InformacionAdicional}}</p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                <p>Atentamente,</p>
                <p class="footer-org">Unidad Materno Infantil del Tolima</p>
                <div class="footer-signature">
                    <p>{{Firma}}</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
  }
};

const CrearPlantilla = ({ onVolver, usuario }) => {
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [vista, setVista] = useState('lista'); // 'lista', 'crear', 'enviar'
  const [plantillaEditando, setPlantillaEditando] = useState(null);
  const [modoEditor, setModoEditor] = useState('visual'); // 'visual' o 'codigo'
  const [mostrarPreview, setMostrarPreview] = useState(true);
  const [contenidoVisual, setContenidoVisual] = useState(''); // Contenido en modo visual (sin HTML)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    htmlContent: '',
    categoria: 'personalizada',
    variables: [],
    correoRemitente: 'micita@umit.com.co', // Correo remitente por defecto
    camposDinamicos: [] // Nuevo: campos dinámicos editables
  });
  
  const [editandoCampo, setEditandoCampo] = useState(null);
  const [nuevoCampoNombre, setNuevoCampoNombre] = useState('');
  const [nuevoCampoValor, setNuevoCampoValor] = useState('');
  
  // Estados para envío masivo
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [correoRemitenteEnvio, setCorreoRemitenteEnvio] = useState('micita@umit.com.co');

  // Cargar plantillas al montar el componente
  useEffect(() => {
    cargarPlantillas();
  }, []);

  // Debug: Log cuando cambia la vista o el formData
  useEffect(() => {
    console.log('🔄 Vista actual:', vista);
    console.log('📝 FormData actual:', {
      nombre: formData.nombre,
      htmlLength: formData.htmlContent ? formData.htmlContent.length : 0,
      variables: formData.variables.length
    });
  }, [vista, formData.htmlContent]);

  // Extraer texto del HTML (sin etiquetas) para modo visual, preservando variables
  const extraerTextoDeHTML = (html) => {
    if (!html) return '';
    
    // Si el HTML es muy complejo (tiene estructura completa), extraer solo el contenido del body
    let htmlParaExtraer = html;
    if (html.includes('<!DOCTYPE') || html.includes('<html') || html.includes('<body')) {
      // Extraer solo el contenido del div.content (sin el footer)
      const contentMatch = html.match(/<div class="content">([\s\S]*?)<\/div>/i);
      if (contentMatch) {
        htmlParaExtraer = contentMatch[1];
      } else {
        // Si no encuentra el div.content, intentar extraer del body pero excluir el footer
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          // Remover el footer si existe
          htmlParaExtraer = bodyMatch[1].replace(/<div class="footer">[\s\S]*?<\/div>/i, '');
        }
      }
    }
    
    // Primero, extraer todas las variables {{Variable}} y guardarlas
    const regex = /\{\{([^}]+)\}\}/g;
    const variables = [];
    let match;
    while ((match = regex.exec(htmlParaExtraer)) !== null) {
      variables.push(match[0]);
    }
    
    // Crear un elemento temporal para extraer texto sin etiquetas
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlParaExtraer;
    let texto = tempDiv.textContent || tempDiv.innerText || '';
    
    // Limpiar espacios múltiples y saltos de línea excesivos
    texto = texto.replace(/\s+/g, ' ').trim();
    texto = texto.replace(/\n\s*\n/g, '\n');
    
    // Restaurar las variables en el texto
    variables.forEach((variable) => {
      const varName = variable.replace(/\{\{|\}\}/g, '').trim();
      // Reemplazar la primera ocurrencia del nombre por la variable completa
      if (texto.includes(varName)) {
        texto = texto.replace(varName, variable);
      } else {
        // Si no está en el texto, agregarlo al final
        texto += ' ' + variable;
      }
    });
    
    return texto.trim();
  };

  // Convertir texto visual a HTML usando la estructura de la plantilla base
  const convertirTextoAHTML = (texto) => {
    if (!texto || !texto.trim()) {
      // Si no hay texto, devolver plantilla base con contenido vacío SIN footer
      return PLANTILLA_BASE
        .replace('<!-- CONTENIDO_AQUI -->', '<p></p>')
        .replace('<!-- FOOTER_AQUI -->', ''); // Footer vacío para que no aparezca en el editor
    }
    
    // Si el texto ya tiene HTML completo, mantenerlo
    if (texto.includes('<!DOCTYPE') || texto.includes('<html') || texto.includes('<body')) {
      return texto;
    }
    
    // Si el texto tiene etiquetas HTML pero no es un documento completo, mantenerlo
    if (texto.includes('<') && texto.includes('>') && texto.includes('</')) {
      return texto;
    }
    
    // Convertir texto simple a HTML usando la estructura de la plantilla base
    // Dividir por líneas
    const lineas = texto.split('\n');
    let contenidoHTML = '';
    let primeraLinea = true;
    
    lineas.forEach((linea, index) => {
      const lineaTrim = linea.trim();
      
      // Si la línea está vacía, agregar un párrafo vacío
      if (!lineaTrim) {
        contenidoHTML += '<p><br></p>\n';
        return;
      }
      
      // Primera línea no vacía podría ser un título
      if (primeraLinea && lineaTrim.length < 80) {
        contenidoHTML += `<h2>${lineaTrim}</h2>\n`;
        primeraLinea = false;
        return;
      }
      
      primeraLinea = false;
      
      // Verificar si la línea tiene formato de campo destacado (Campo: Valor)
      const campoMatch = lineaTrim.match(/^(.+?):\s*(.+)$/);
      if (campoMatch && !lineaTrim.includes('{{')) {
        // Es un campo destacado, ponerlo en la sección highlighted
        contenidoHTML += `<p><b>${campoMatch[1]}:</b> ${campoMatch[2]}</p>\n`;
      } else {
        // Es un párrafo normal - procesar variables y texto en negrita
        let lineaHTML = lineaTrim;
        // Convertir texto entre ** a negrita
        lineaHTML = lineaHTML.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
        // Detectar enlaces simples
        lineaHTML = lineaHTML.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');
        contenidoHTML += `<p>${lineaHTML}</p>\n`;
      }
    });
    
    // Usar la estructura de la plantilla base y reemplazar el contenido
    let htmlFinal = PLANTILLA_BASE;
    
    // Extraer el título si existe
    const h2Match = contenidoHTML.match(/<h2>(.*?)<\/h2>/);
    const titulo = h2Match ? h2Match[1] : '';
    
    // Separar contenido en párrafos normales y campos destacados
    const parrafos = contenidoHTML.split('\n').filter(l => l.trim());
    const camposDestacados = [];
    const parrafosNormales = [];
    
    parrafos.forEach(p => {
      if (p.includes('<b>') && p.includes(':')) {
        camposDestacados.push(p);
      } else if (!p.includes('<h2>')) {
        parrafosNormales.push(p);
      }
    });
    
    // Construir el contenido HTML - solo incluir elementos que tengan contenido real
    let nuevoContent = '';
    if (titulo && titulo.trim()) {
      nuevoContent += `<h2>${titulo}</h2>\n`;
    }
    
    // Agregar párrafos iniciales (hasta 2) - solo si tienen contenido
    const parrafosIniciales = parrafosNormales.slice(0, 2).filter(p => {
      // Remover etiquetas HTML y verificar si hay texto real
      const textoLimpio = p.replace(/<[^>]*>/g, '').replace(/\{\{[^}]+\}\}/g, '').trim();
      return textoLimpio.length > 0;
    });
    parrafosIniciales.forEach(p => {
      nuevoContent += p + '\n';
    });
    
    // Si hay campos destacados, ponerlos en highlighted - solo si tienen contenido
    const camposConContenido = camposDestacados.filter(campo => {
      const textoLimpio = campo.replace(/<[^>]*>/g, '').replace(/\{\{[^}]+\}\}/g, '').trim();
      return textoLimpio.length > 0;
    });
    
    if (camposConContenido.length > 0) {
      nuevoContent += '<div class="highlighted">\n';
      camposConContenido.forEach(campo => {
        nuevoContent += campo + '\n';
      });
      nuevoContent += '</div>\n';
    }
    
    // Agregar resto de párrafos - solo si tienen contenido
    const parrafosRestantes = parrafosNormales.slice(2).filter(p => {
      const textoLimpio = p.replace(/<[^>]*>/g, '').replace(/\{\{[^}]+\}\}/g, '').trim();
      return textoLimpio.length > 0;
    });
    parrafosRestantes.forEach(p => {
      nuevoContent += p + '\n';
    });
    
    // Si no hay contenido, poner un párrafo vacío
    if (!nuevoContent.trim()) {
      nuevoContent = '<p></p>\n';
    }
    
    // Footer por defecto - solo si hay contenido real (no vacío, no solo espacios)
    const textoLimpio = nuevoContent.replace(/<[^>]*>/g, '').replace(/\{\{[^}]+\}\}/g, '').trim();
    const tieneContenidoReal = textoLimpio.length > 0;
    const footerContent = tieneContenidoReal 
      ? 'Atentamente,<br/>El equipo de <b>Unidad materno infantil</b>'
      : ''; // Sin footer si no hay contenido
    
    // SIEMPRE usar la plantilla base completa
    htmlFinal = PLANTILLA_BASE.replace(
      '<!-- CONTENIDO_AQUI -->',
      nuevoContent
    );
    htmlFinal = htmlFinal.replace(
      '<!-- FOOTER_AQUI -->',
      footerContent
    );
    
    return htmlFinal;
  };

  // Manejar cambio en editor visual (contentEditable con formato)
  const handleVisualChange = (e) => {
    const editor = e.target;
    const nuevoHTML = editor.innerHTML || '';
    const nuevoTexto = editor.innerText || '';
    
    // Guardar el texto plano para referencia
    setContenidoVisual(nuevoTexto);
    
    // Extraer solo el contenido del editor (sin estructura completa)
    let contenidoHTML = nuevoHTML;
    
    // Si el contenido tiene formato HTML, extraerlo y envolverlo en la plantilla base
    if (contenidoHTML.trim() && contenidoHTML !== nuevoTexto) {
      // Limpiar cualquier estructura completa que pueda haber
      if (contenidoHTML.includes('<!DOCTYPE') || contenidoHTML.includes('<html')) {
        const contentMatch = contenidoHTML.match(/<div class="content">([\s\S]*?)<\/div>/i);
        if (contentMatch) {
          contenidoHTML = contentMatch[1].trim();
        }
      }
      
      // Determinar si hay contenido real
      const textoLimpio = nuevoTexto.trim();
      const tieneContenidoReal = textoLimpio.length > 0;
      
      // Envolver el contenido en la plantilla base
      let htmlFinal = PLANTILLA_BASE.replace('<!-- CONTENIDO_AQUI -->', contenidoHTML);
      // Solo agregar footer si hay contenido real
      const footerContent = tieneContenidoReal 
        ? 'Atentamente,<br/>El equipo de <b>Unidad materno infantil</b>'
        : '';
      htmlFinal = htmlFinal.replace('<!-- FOOTER_AQUI -->', footerContent);
      
      setFormData(prev => ({
        ...prev,
        htmlContent: htmlFinal
      }));
    } else {
      // Solo texto plano, convertir a HTML manteniendo la estructura de la plantilla
      const htmlConvertido = convertirTextoAHTML(nuevoTexto);
      setFormData(prev => ({
        ...prev,
        htmlContent: htmlConvertido
      }));
    }
  };


  // Extraer variables automáticamente cuando cambia el HTML
  useEffect(() => {
    if (formData.htmlContent) {
      const variableRegex = /\{\{([^}]+)\}\}/g;
      const variablesEncontradas = [];
      let match;
      while ((match = variableRegex.exec(formData.htmlContent)) !== null) {
        const varName = match[1].trim();
        if (varName && !variablesEncontradas.includes(varName)) {
          variablesEncontradas.push(varName);
        }
      }
      
      // Actualizar variables si hay nuevas
      if (variablesEncontradas.length > 0) {
        const variablesActuales = formData.variables || [];
        const nuevasVariables = variablesEncontradas.filter(v => !variablesActuales.includes(v));
        if (nuevasVariables.length > 0) {
          setFormData(prev => ({
            ...prev,
            variables: [...variablesActuales, ...nuevasVariables]
          }));
        }
      }
    }
  }, [formData.htmlContent]);

  // Sincronizar contenido visual cuando cambia el HTML (al cargar plantilla)
  useEffect(() => {
    if (modoEditor === 'visual' && formData.htmlContent) {
      const editor = document.getElementById('contenidoVisual');
      if (editor) {
        // Extraer solo el contenido del div.content (con formato HTML)
        let contenidoHTML = '';
        if (formData.htmlContent.includes('<!DOCTYPE') || formData.htmlContent.includes('<html')) {
          const contentMatch = formData.htmlContent.match(/<div class="content">([\s\S]*?)<\/div>/i);
          if (contentMatch) {
            contenidoHTML = contentMatch[1].trim();
          }
        } else {
          contenidoHTML = formData.htmlContent;
        }
        
        // Solo actualizar si el contenido es diferente
        if (editor.innerHTML !== contenidoHTML) {
          editor.innerHTML = contenidoHTML;
          const textoExtraido = extraerTextoDeHTML(formData.htmlContent);
          setContenidoVisual(textoExtraido);
        }
      }
    }
  }, [formData.htmlContent, modoEditor]);

  // Forzar actualización del textarea cuando cambie el htmlContent y estemos en vista crear
  useEffect(() => {
    if (vista === 'crear' && formData.htmlContent && modoEditor === 'codigo') {
      const timeoutId = setTimeout(() => {
        const textarea = document.getElementById('htmlContent');
        if (textarea) {
          if (textarea.value !== formData.htmlContent) {
            textarea.value = formData.htmlContent;
            // Disparar evento para React
            const event = new Event('input', { bubbles: true });
            textarea.dispatchEvent(event);
          }
        }
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [vista, formData.htmlContent, modoEditor]);

  const cargarPlantillas = async () => {
    if (!usuario?.id) {
      console.warn('No hay usuario identificado');
      return;
    }

    try {
      setCargando(true);
      const response = await fetch(`http://localhost:3001/api/templates?userId=${usuario.id}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPlantillas(data.templates || []);
      } else {
        console.error('Error en respuesta:', data.message);
        if (!data.message?.includes('Table') && !data.message?.includes('tabla')) {
          alert(`Error: ${data.message || 'No se pudieron cargar las plantillas'}`);
        }
      }
    } catch (error) {
      console.error('Error cargando plantillas:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHtmlChange = (e) => {
    setFormData(prev => ({
      ...prev,
      htmlContent: e.target.value
    }));
  };

  const agregarVariable = () => {
    const nombreVar = prompt(
      'Ingrese el nombre del campo dinámico:\n\nEjemplos:\n- NombrePaciente\n- FechaCita\n- Documento\n- Motivo\n\n(El nombre no debe tener espacios):',
      'NombreCampo'
    );
    if (nombreVar && nombreVar.trim()) {
      const nombreLimpio = nombreVar.trim().replace(/\s+/g, '');
      
      // Verificar si ya existe
      if (formData.variables.includes(nombreLimpio)) {
        alert(`El campo "${nombreLimpio}" ya existe. Usa un nombre diferente.`);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, nombreLimpio]
      }));
      
      // Opcional: insertar automáticamente en el editor si está vacío
      if (modoEditor === 'visual' && !contenidoVisual.trim()) {
        setContenidoVisual(`{{${nombreLimpio}}}`);
        const nuevoHTML = convertirTextoAHTML(`{{${nombreLimpio}}}`);
        setFormData(prev => ({
          ...prev,
          htmlContent: nuevoHTML
        }));
      }
    }
  };

  const eliminarVariable = (index) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const insertarVariable = (variable) => {
    const textareaId = modoEditor === 'visual' ? 'contenidoVisual' : 'htmlContent';
    const textarea = document.getElementById(textareaId);
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (modoEditor === 'visual') {
        const text = contenidoVisual;
        const newText = text.substring(0, start) + `{{${variable}}}` + text.substring(end);
        setContenidoVisual(newText);
        
        // Convertir a HTML y actualizar
        const nuevoHTML = convertirTextoAHTML(newText);
        setFormData(prev => ({
          ...prev,
          htmlContent: nuevoHTML
        }));
      } else {
        const text = textarea.value;
        const newText = text.substring(0, start) + `{{${variable}}}` + text.substring(end);
        setFormData(prev => ({
          ...prev,
          htmlContent: newText
        }));
      }
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  // Convertir texto seleccionado en variable - Versión mejorada
  const convertirTextoEnVariable = () => {
    if (modoEditor === 'visual') {
      // Modo visual: usar contentEditable y Selection API
      const editor = document.getElementById('contenidoVisual');
      if (!editor) {
        alert('Por favor, selecciona el editor primero');
        return;
      }
      
      editor.focus();
      const selection = window.getSelection();
      
      if (selection.rangeCount === 0) {
        // Si no hay selección, permitir insertar un campo vacío
        const nombreVariable = prompt('Ingresa el nombre del campo dinámico (ej: NombrePaciente, FechaCita):', '');
        
        if (!nombreVariable || !nombreVariable.trim()) {
          return;
        }
        
        const nombreVar = nombreVariable.trim().replace(/\s+/g, '');
        
        // Verificar si la variable ya existe
        if (formData.variables.includes(nombreVar)) {
          if (!confirm(`El campo "${nombreVar}" ya existe. ¿Deseas usarlo de todas formas?`)) {
            return;
          }
        } else {
          // Agregar la variable a la lista
          setFormData(prev => ({
            ...prev,
            variables: [...prev.variables, nombreVar]
          }));
        }
        
        // Insertar el campo en la posición del cursor
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        const textNode = document.createTextNode(`{{${nombreVar}}}`);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Disparar evento de cambio
        const event = new Event('input', { bubbles: true });
        editor.dispatchEvent(event);
        
        return;
      }
      
      // Si hay texto seleccionado, convertirlo en variable
      const textoSeleccionado = selection.toString();
      
      if (!textoSeleccionado.trim()) {
        alert('Por favor, selecciona el texto que deseas convertir en variable');
        return;
      }
      
      // Sugerir nombre basado en el texto seleccionado
      const sugerencia = textoSeleccionado
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim()
        .split(/\s+/)
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
        .join('');
      
      const nombreVariable = prompt(
        `Convierte "${textoSeleccionado}" en campo dinámico.\n\nIngresa el nombre del campo (sin espacios):`,
        sugerencia || 'CampoDinamico'
      );
      
      if (!nombreVariable || !nombreVariable.trim()) {
        return;
      }
      
      const nombreVar = nombreVariable.trim().replace(/\s+/g, '');
      
      // Verificar si la variable ya existe
      if (formData.variables.includes(nombreVar)) {
        if (!confirm(`El campo "${nombreVar}" ya existe. ¿Deseas usarlo de todas formas?`)) {
          return;
        }
      } else {
        // Agregar la variable a la lista
        setFormData(prev => ({
          ...prev,
          variables: [...prev.variables, nombreVar]
        }));
      }
      
      // Reemplazar el texto seleccionado con la variable
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(`{{${nombreVar}}}`);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Disparar evento de cambio
      const event = new Event('input', { bubbles: true });
      editor.dispatchEvent(event);
      
      return;
    } else {
      // Modo código: usar textarea normal
      const textarea = document.getElementById('htmlContent');
      if (!textarea) {
        alert('Por favor, selecciona el editor primero');
        return;
      }
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (start === end) {
        // Si no hay texto seleccionado, permitir insertar un campo vacío
        const nombreVariable = prompt('Ingresa el nombre del campo dinámico (ej: NombrePaciente, FechaCita):', '');
        
        if (!nombreVariable || !nombreVariable.trim()) {
          return;
        }
        
        const nombreVar = nombreVariable.trim().replace(/\s+/g, '');
        
        // Verificar si la variable ya existe
        if (formData.variables.includes(nombreVar)) {
          if (!confirm(`El campo "${nombreVar}" ya existe. ¿Deseas usarlo de todas formas?`)) {
            return;
          }
        } else {
          // Agregar la variable a la lista
          setFormData(prev => ({
            ...prev,
            variables: [...prev.variables, nombreVar]
          }));
        }
        
        // Insertar el campo en la posición del cursor
        const text = textarea.value;
        const newText = text.substring(0, start) + `{{${nombreVar}}}` + text.substring(end);
        setFormData(prev => ({
          ...prev,
          htmlContent: newText
        }));
        
        setTimeout(() => {
          textarea.focus();
          const nuevaPosicion = start + nombreVar.length + 4;
          textarea.setSelectionRange(nuevaPosicion, nuevaPosicion);
        }, 0);
        
        return;
      }
      
      // Si hay texto seleccionado, convertirlo en variable
      const textoSeleccionado = textarea.value.substring(start, end);
      
      // Sugerir nombre basado en el texto seleccionado
      const sugerencia = textoSeleccionado
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim()
        .split(/\s+/)
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
        .join('');
      
      const nombreVariable = prompt(
        `Convierte "${textoSeleccionado}" en campo dinámico.\n\nIngresa el nombre del campo (sin espacios):`,
        sugerencia || 'CampoDinamico'
      );
      
      if (!nombreVariable || !nombreVariable.trim()) {
        return;
      }
      
      const nombreVar = nombreVariable.trim().replace(/\s+/g, '');
      
      // Verificar si la variable ya existe
      if (formData.variables.includes(nombreVar)) {
        if (!confirm(`El campo "${nombreVar}" ya existe. ¿Deseas usarlo de todas formas?`)) {
          return;
        }
      } else {
        // Agregar la variable a la lista
        setFormData(prev => ({
          ...prev,
          variables: [...prev.variables, nombreVar]
        }));
      }
      
      // Reemplazar en el editor HTML
      const text = textarea.value;
      const newText = text.substring(0, start) + `{{${nombreVar}}}` + text.substring(end);
      
      setFormData(prev => ({
        ...prev,
        htmlContent: newText
      }));
      
      setTimeout(() => {
        textarea.focus();
        const nuevaPosicion = start + nombreVar.length + 4;
        textarea.setSelectionRange(nuevaPosicion, nuevaPosicion);
      }, 0);
    }
  };

  const guardarPlantilla = async () => {
    // Validar que haya nombre y contenido (ya sea HTML o texto visual)
    const tieneContenido = formData.htmlContent.trim() || contenidoVisual.trim();
    
    if (!formData.nombre.trim() || !tieneContenido) {
      alert('El nombre y el contenido de la plantilla son obligatorios');
      return;
    }

    if (!usuario?.id) {
      alert('Error: No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    try {
      setCargando(true);
      
      // Si estamos en modo visual y hay contenido visual pero no HTML, convertir
      let htmlParaGuardar = formData.htmlContent;
      if (modoEditor === 'visual' && contenidoVisual.trim() && !htmlParaGuardar.trim()) {
        htmlParaGuardar = convertirTextoAHTML(contenidoVisual);
      }
      
      // Si aún no hay HTML, generar desde el texto visual
      if (!htmlParaGuardar.trim() && contenidoVisual.trim()) {
        htmlParaGuardar = convertirTextoAHTML(contenidoVisual);
      }
      
      const url = plantillaEditando 
        ? `http://localhost:3001/api/templates/${plantillaEditando.id}`
        : 'http://localhost:3001/api/templates';
      
      const method = plantillaEditando ? 'PUT' : 'POST';
      
      console.log('💾 Guardando plantilla:', {
        nombre: formData.nombre,
        htmlLength: htmlParaGuardar.length,
        variables: formData.variables,
        variablesCount: formData.variables.length
      });
      
      // Asegurar que las variables sean un array
      const variablesParaGuardar = Array.isArray(formData.variables) 
        ? formData.variables 
        : [];
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: usuario.id,
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          htmlContent: htmlParaGuardar,
          variables: variablesParaGuardar,
          categoria: formData.categoria,
          correoRemitente: formData.correoRemitente,
          camposDinamicos: formData.camposDinamicos || []
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(plantillaEditando ? '✅ Plantilla actualizada exitosamente' : '✅ Plantilla creada exitosamente');
        resetForm();
        cargarPlantillas();
        setVista('lista');
        setPlantillaSeleccionada(null);
      } else {
        alert(`❌ Error: ${data.message || 'No se pudo guardar la plantilla'}`);
      }
    } catch (error) {
      console.error('Error guardando plantilla:', error);
      alert(`❌ Error de conexión: ${error.message}. Verifica que el servidor esté corriendo en http://localhost:3001`);
    } finally {
      setCargando(false);
    }
  };

  const editarPlantilla = async (id) => {
    try {
      setCargando(true);
      const response = await fetch(`http://localhost:3001/api/templates/${id}?userId=${usuario?.id}`);
      const data = await response.json();
      
      if (data.success) {
        const template = data.template;
        const variables = template.variables ? JSON.parse(template.variables) : [];
        // Si hay variables, crear campos dinámicos
        const camposDinamicos = variables.map(v => ({ 
          nombre: v, 
          valor: '', 
          tipo: 'texto' 
        }));
        
        setFormData({
          nombre: template.nombre,
          descripcion: template.descripcion || '',
          htmlContent: template.html_content,
          categoria: template.categoria || 'personalizada',
          variables: variables,
          correoRemitente: template.correo_remitente || 'micita@umit.com.co',
          camposDinamicos: camposDinamicos
        });
        setPlantillaEditando(template);
        setVista('crear');
      } else {
        alert('Error al cargar la plantilla');
      }
    } catch (error) {
      console.error('Error cargando plantilla:', error);
      alert('Error al cargar la plantilla');
    } finally {
      setCargando(false);
    }
  };

  const eliminarPlantilla = async (id, nombre) => {
    if (!confirm(`¿Está seguro de eliminar la plantilla "${nombre}"?`)) {
      return;
    }

    try {
      setCargando(true);
      const response = await fetch(`http://localhost:3001/api/templates/${id}?userId=${usuario?.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Plantilla eliminada exitosamente');
        cargarPlantillas();
        if (plantillaSeleccionada?.id === id) {
          setPlantillaSeleccionada(null);
          setVista('lista');
        }
      } else {
        alert(data.message || 'Error al eliminar la plantilla');
      }
    } catch (error) {
      console.error('Error eliminando plantilla:', error);
      alert('Error al eliminar la plantilla');
    } finally {
      setCargando(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      htmlContent: '',
      categoria: 'personalizada',
      variables: [],
      correoRemitente: 'micita@umit.com.co',
      camposDinamicos: []
    });
    setPlantillaEditando(null);
    setEditandoCampo(null);
    setNuevoCampoNombre('');
    setNuevoCampoValor('');
    setContenidoVisual(''); // Limpiar también el contenido visual
  };

  const nuevaPlantilla = () => {
    resetForm();
    setVista('crear');
    setModoEditor('visual'); // Modo visual (texto simple) por defecto
    setMostrarPreview(true);
    
    // Empezar con editor vacío, sin plantilla por defecto
    setTimeout(() => {
      setFormData({
        nombre: '',
        descripcion: '',
        htmlContent: '', // Sin HTML por defecto
        categoria: 'personalizada',
        variables: [], // Sin variables predefinidas
        correoRemitente: 'micita@umit.com.co',
        camposDinamicos: [] // Sin campos dinámicos predefinidos
      });
      setContenidoVisual(''); // Editor de texto vacío
    }, 100);
  };

  const usarPlantillaPredefinida = (tipo) => {
    try {
    const plantilla = PLANTILLAS_PREDEFINIDAS[tipo];
      if (!plantilla || !plantilla.html) {
        alert('Error: Plantilla no encontrada');
        return;
      }
      
      // Extraer variables
      const variableRegex = /\{\{([^}]+)\}\}/g;
      const variables = [];
      let match;
      const htmlCopy = plantilla.html;
      while ((match = variableRegex.exec(htmlCopy)) !== null) {
        const varName = match[1].trim();
        if (varName && !variables.includes(varName)) {
            variables.push(varName);
        }
      }

      // Crear formData completo
      const nuevoFormData = {
        nombre: plantilla.nombre,
        descripcion: `Plantilla ${plantilla.nombre.toLowerCase()} predefinida`,
        htmlContent: plantilla.html,
        categoria: 'personalizada',
        variables: variables,
        correoRemitente: 'micita@umit.com.co',
        camposDinamicos: variables.map(v => ({ nombre: v, valor: '', tipo: 'texto' }))
      };
      
      // ACTUALIZAR ESTADO - PRIMERO la vista, luego los datos
      setVista('crear');
      setPlantillaEditando(null);
      setModoEditor('visual');
      setMostrarPreview(true);
      
      // Actualizar formData después de un pequeño delay para asegurar renderizado
      setTimeout(() => {
        setFormData(nuevoFormData);
        
        // Forzar actualización del textarea después de que se renderice
        setTimeout(() => {
          const textarea = document.getElementById('htmlContent');
          if (textarea) {
            textarea.value = nuevoFormData.htmlContent;
            // Disparar evento para React
            const event = new Event('input', { bubbles: true });
            textarea.dispatchEvent(event);
          }
        }, 100);
      }, 50);
      
    } catch (error) {
      console.error('Error al usar plantilla:', error);
      alert('Error al cargar la plantilla: ' + error.message);
    }
  };
  
  // Funciones para gestionar campos dinámicos
  const agregarCampoDinamico = () => {
    if (!nuevoCampoNombre.trim()) {
      alert('Por favor, ingrese un nombre para el campo');
      return;
    }
    
    const nombreVariable = nuevoCampoNombre.trim().replace(/\s+/g, '');
    const variableFormato = `{{${nombreVariable}}}`;
    
    // Verificar si ya existe
    if (formData.variables.includes(nombreVariable)) {
      alert('Este campo ya existe');
      return;
    }
    
    // Agregar variable a la lista
    const nuevasVariables = [...formData.variables, nombreVariable];
    
    // Agregar campo dinámico
    const nuevoCampo = {
      nombre: nombreVariable,
      valor: nuevoCampoValor,
      tipo: 'texto'
    };
    const nuevosCampos = [...formData.camposDinamicos, nuevoCampo];
    
    // Insertar en el HTML si hay contenido
    let nuevoHTML = formData.htmlContent;
    if (nuevoCampoValor.trim()) {
      // Buscar un lugar apropiado para insertar (después de la última sección)
      const ultimaSeccion = nuevoHTML.lastIndexOf('</div>');
      if (ultimaSeccion > 0) {
        const campoHTML = `
            <div class="field-group">
                <span class="field-label">${nuevoCampoNombre}:</span>
                <div class="field-value">${variableFormato}</div>
            </div>`;
        nuevoHTML = nuevoHTML.substring(0, ultimaSeccion) + campoHTML + nuevoHTML.substring(ultimaSeccion);
      } else {
        // Si no encuentra sección, agregar al final del contenido
        const antesFooter = nuevoHTML.indexOf('<div class="document-footer">');
        if (antesFooter > 0) {
          const campoHTML = `
            <div class="content-section">
                <div class="field-group">
                    <span class="field-label">${nuevoCampoNombre}:</span>
                    <div class="field-value">${variableFormato}</div>
                </div>
            </div>`;
          nuevoHTML = nuevoHTML.substring(0, antesFooter) + campoHTML + nuevoHTML.substring(antesFooter);
        }
      }
    }
    
    setFormData({
      ...formData,
      variables: nuevasVariables,
      camposDinamicos: nuevosCampos,
      htmlContent: nuevoHTML
    });
    
    setNuevoCampoNombre('');
    setNuevoCampoValor('');
  };
  
  const editarCampoDinamico = (index) => {
    setEditandoCampo(index);
    const campo = formData.camposDinamicos[index];
    setNuevoCampoNombre(campo.nombre);
    setNuevoCampoValor(campo.valor);
  };
  
  const guardarEdicionCampo = () => {
    if (!nuevoCampoNombre.trim()) {
      alert('El nombre del campo no puede estar vacío');
      return;
    }
    
    const camposActualizados = [...formData.camposDinamicos];
    const campoOriginal = camposActualizados[editandoCampo];
    const nuevoNombre = nuevoCampoNombre.trim().replace(/\s+/g, '');
    
    // Si cambió el nombre, actualizar en variables y HTML
    if (campoOriginal.nombre !== nuevoNombre) {
      // Actualizar variables
      const nuevasVariables = formData.variables.map(v => 
        v === campoOriginal.nombre ? nuevoNombre : v
      );
      
      // Actualizar HTML - reemplazar {{VariableAntigua}} por {{VariableNueva}}
      const regexAntigua = new RegExp(`\\{\\{${campoOriginal.nombre}\\}\\}`, 'g');
      const nuevoHTML = formData.htmlContent.replace(regexAntigua, `{{${nuevoNombre}}}`);
      
      // Actualizar nombre del campo
      camposActualizados[editandoCampo] = {
        ...campoOriginal,
        nombre: nuevoNombre
      };
      
      setFormData({
        ...formData,
        variables: nuevasVariables,
        camposDinamicos: camposActualizados,
        htmlContent: nuevoHTML
      });
    } else {
      camposActualizados[editandoCampo] = {
        ...campoOriginal,
        valor: nuevoCampoValor
      };
      setFormData({
        ...formData,
        camposDinamicos: camposActualizados
      });
    }
    
    setEditandoCampo(null);
    setNuevoCampoNombre('');
    setNuevoCampoValor('');
  };
  
  const eliminarCampoDinamico = (index) => {
    if (!confirm('¿Está seguro de eliminar este campo?')) {
      return;
    }
    
    const campo = formData.camposDinamicos[index];
    const nuevosCampos = formData.camposDinamicos.filter((_, i) => i !== index);
    const nuevasVariables = formData.variables.filter(v => v !== campo.nombre);
    
    // Eliminar del HTML - buscar y eliminar el field-group que contiene esta variable
    let nuevoHTML = formData.htmlContent;
    const regexVariable = new RegExp(`<div class="field-group">[\\s\\S]*?<div class="field-value">\\{\\{${campo.nombre}\\}\\}</div>[\\s\\S]*?</div>`, 'g');
    nuevoHTML = nuevoHTML.replace(regexVariable, '');
    
    // Limpiar líneas vacías múltiples
    nuevoHTML = nuevoHTML.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    setFormData({
      ...formData,
      variables: nuevasVariables,
      camposDinamicos: nuevosCampos,
      htmlContent: nuevoHTML
    });
  };
  
  const cancelarEdicion = () => {
    setEditandoCampo(null);
    setNuevoCampoNombre('');
    setNuevoCampoValor('');
  };

  // Aplicar formato visual en modo visual (contentEditable)
  const aplicarFormatoVisual = (comando, valor = null) => {
    if (modoEditor !== 'visual') return;
    
    const editor = document.getElementById('contenidoVisual');
    if (!editor) return;
    
    editor.focus();
    
    // Usar document.execCommand para aplicar formato visual
    if (valor) {
      document.execCommand(comando, false, valor);
    } else {
      document.execCommand(comando, false, null);
    }
    
    // Disparar evento de cambio para actualizar el estado
    const event = new Event('input', { bubbles: true });
    editor.dispatchEvent(event);
  };

  // Manejar Enter en el editor visual para insertar salto de línea correcto
  const handleKeyDownVisual = (e) => {
    if (modoEditor !== 'visual') return;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      
      const editor = document.getElementById('contenidoVisual');
      if (!editor) return;
      
      const selection = window.getSelection();
      if (selection.rangeCount === 0) {
        // Si no hay selección, crear una al final
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection.addRange(range);
      }
      
      const range = selection.getRangeAt(0);
      
      // Siempre insertar un <br> para salto de línea simple
      // Esto funciona mejor que crear párrafos nuevos
      const br = document.createElement('br');
      
      // Si hay contenido seleccionado, eliminarlo primero
      if (!range.collapsed) {
        range.deleteContents();
      }
      
      // Insertar el <br>
      range.insertNode(br);
      
      // Crear un nodo de texto vacío después del <br> para que el cursor pueda posicionarse ahí
      const textNode = document.createTextNode('\u00A0'); // Espacio no rompible
      range.setStartAfter(br);
      range.insertNode(textNode);
      
      // Mover el cursor después del espacio
      range.setStartAfter(textNode);
      range.collapse(true);
      
      // Actualizar la selección
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Disparar evento de cambio
      const event = new Event('input', { bubbles: true });
      editor.dispatchEvent(event);
      
      // Asegurar que el editor mantenga el foco
      editor.focus();
    }
  };

  const insertarElemento = (tipo) => {
    if (modoEditor === 'visual') {
      // Modo visual: insertar texto simple y aplicar formato visual
      // El HTML existe internamente pero el usuario solo ve el formato visual
      const editor = document.getElementById('contenidoVisual');
      if (!editor) return;
      
      editor.focus();
      const selection = window.getSelection();
      let range = null;
      
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      } else {
        range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
      }
      
      let textoPlaceholder = '';
      let estilos = {};
      
      switch(tipo) {
        case 'titulo':
          textoPlaceholder = 'Escribe el título aquí';
          estilos = {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#333',
            margin: '20px 0',
            display: 'block'
          };
          break;
        case 'parrafo':
          textoPlaceholder = 'Escribe el párrafo aquí';
          estilos = {
            color: '#555',
            lineHeight: '1.8',
            margin: '15px 0'
          };
          break;
        case 'boton':
          textoPlaceholder = 'Texto del botón';
          estilos = {
            display: 'inline-block',
            backgroundColor: '#667eea',
            color: 'white',
            padding: '15px 30px',
            borderRadius: '5px',
            margin: '20px 0',
            cursor: 'pointer'
          };
          break;
        case 'divider':
          // Insertar línea visual simple
          const br = document.createElement('br');
          const div = document.createElement('div');
          div.style.borderTop = '2px solid #e0e0e0';
          div.style.margin = '30px 0';
          div.style.height = '2px';
          div.appendChild(document.createTextNode('\u00A0')); // Espacio no rompible
          range.deleteContents();
          range.insertNode(div);
          range.setStartAfter(div);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          const event = new Event('input', { bubbles: true });
          editor.dispatchEvent(event);
          return;
        case 'caja':
          textoPlaceholder = 'Escribe el contenido aquí';
          estilos = {
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            margin: '20px 0',
            borderLeft: '4px solid #667eea',
            display: 'block'
          };
          break;
        default:
          return;
      }
      
      // Insertar texto simple
      const textNode = document.createTextNode(textoPlaceholder);
      range.deleteContents();
      range.insertNode(textNode);
      
      // Seleccionar el texto insertado
      const newRange = document.createRange();
      newRange.setStartBefore(textNode);
      newRange.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      // Aplicar estilos visuales usando span (el usuario solo verá el formato, no las etiquetas)
      const span = document.createElement('span');
      Object.keys(estilos).forEach(prop => {
        span.style[prop] = estilos[prop];
      });
      
      try {
        newRange.surroundContents(span);
      } catch (e) {
        // Si falla, usar método alternativo
        const contenido = newRange.extractContents();
        span.appendChild(contenido);
        newRange.insertNode(span);
      }
      
      // Seleccionar el texto dentro del span para que el usuario pueda editarlo
      const finalRange = document.createRange();
      finalRange.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(finalRange);
      
      // Disparar evento de cambio
      const event = new Event('input', { bubbles: true });
      editor.dispatchEvent(event);
      
    } else {
      // Modo código: insertar HTML directamente
      const textarea = document.getElementById('htmlContent');
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      
      let elemento = '';
      switch(tipo) {
        case 'titulo':
          elemento = '<h1 style="color: #333; font-size: 28px; margin: 20px 0;">{{Titulo}}</h1>';
          break;
        case 'parrafo':
          elemento = '<p style="color: #555; line-height: 1.8; margin: 15px 0;">{{Texto}}</p>';
          break;
        case 'boton':
          elemento = '<a href="{{Enlace}}" style="display: inline-block; background-color: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">{{TextoBoton}}</a>';
          break;
        case 'divider':
          elemento = '<hr style="border: none; border-top: 2px solid #e0e0e0; margin: 30px 0;">';
          break;
        case 'caja':
          elemento = '<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">{{Contenido}}</div>';
          break;
        default:
          return;
      }

      const newText = text.substring(0, start) + elemento + text.substring(end);
      setFormData(prev => ({
        ...prev,
        htmlContent: newText
      }));
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + elemento.length, start + elemento.length);
      }, 0);
    }
  };

  const aplicarEstilo = (propiedad, valor) => {
    if (modoEditor === 'visual') {
      // Modo visual: usar document.execCommand para aplicar formato visual
      const editor = document.getElementById('contenidoVisual');
      if (!editor) return;
      
      editor.focus();
      const selection = window.getSelection();
      
      if (selection.rangeCount === 0 || selection.toString().trim() === '') {
        alert('Por favor, selecciona el texto al que deseas aplicar el estilo');
        return;
      }
      
      // Aplicar formato usando execCommand o manipulación directa del DOM
      switch(propiedad) {
        case 'bold':
          document.execCommand('bold', false, null);
          break;
        case 'italic':
          document.execCommand('italic', false, null);
          break;
        case 'color':
          document.execCommand('foreColor', false, valor);
          break;
        case 'background':
          document.execCommand('backColor', false, valor);
          break;
        default:
          return;
      }
      
      // Disparar evento de cambio para actualizar el estado
      const event = new Event('input', { bubbles: true });
      editor.dispatchEvent(event);
      
    } else {
      // Modo código: insertar HTML directamente
      const textarea = document.getElementById('htmlContent');
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      
      if (!selectedText) {
        alert('Por favor, selecciona el texto al que deseas aplicar el estilo');
        return;
      }

      let styledText = '';
      switch(propiedad) {
        case 'color':
          styledText = `<span style="color: ${valor};">${selectedText}</span>`;
          break;
        case 'bold':
          styledText = `<strong>${selectedText}</strong>`;
          break;
        case 'italic':
          styledText = `<em>${selectedText}</em>`;
          break;
        case 'background':
          styledText = `<span style="background-color: ${valor}; padding: 2px 5px;">${selectedText}</span>`;
          break;
        default:
          return;
      }

      const text = textarea.value;
      const newText = text.substring(0, start) + styledText + text.substring(end);
      setFormData(prev => ({
        ...prev,
        htmlContent: newText
      }));
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + styledText.length, start + styledText.length);
      }, 0);
    }
  };

  const seleccionarPlantilla = (plantilla) => {
    // Asegurar que las variables se parseen correctamente si vienen como string JSON
    let plantillaConVariables = { ...plantilla };
    if (plantilla.variables) {
      try {
        if (typeof plantilla.variables === 'string') {
          plantillaConVariables.variables = JSON.parse(plantilla.variables);
        } else if (Array.isArray(plantilla.variables)) {
          plantillaConVariables.variables = plantilla.variables;
        }
        console.log('📋 Variables parseadas de la plantilla:', plantillaConVariables.variables);
      } catch (error) {
        console.error('Error parseando variables:', error);
        plantillaConVariables.variables = [];
      }
    } else {
      plantillaConVariables.variables = [];
    }
    
    setPlantillaSeleccionada(plantillaConVariables);
    setVista('enviar');
  };

  // Descargar plantilla Excel - Con Email y todas las variables creadas
  const descargarPlantillaExcel = () => {
    // Obtener variables de la plantilla seleccionada o del formData actual
    let variables = [];
    let nombrePlantilla = 'Plantilla';
    
    if (plantillaSeleccionada) {
      // Intentar obtener variables de la plantilla guardada
      try {
        if (plantillaSeleccionada.variables) {
          // Si es string, parsearlo; si es array, usarlo directamente
          variables = typeof plantillaSeleccionada.variables === 'string' 
            ? JSON.parse(plantillaSeleccionada.variables) 
            : plantillaSeleccionada.variables;
        }
        
        // Si no hay variables guardadas, extraerlas del HTML
        if (!variables || variables.length === 0) {
          console.log('⚠️ No hay variables guardadas, extrayendo del HTML...');
          const htmlContent = plantillaSeleccionada.html_content || '';
          const variableRegex = /\{\{([^}]+)\}\}/g;
          const variablesEncontradas = [];
          let match;
          while ((match = variableRegex.exec(htmlContent)) !== null) {
            const varName = match[1].trim();
            if (varName && !variablesEncontradas.includes(varName)) {
              variablesEncontradas.push(varName);
            }
          }
          variables = variablesEncontradas;
        }
        
        nombrePlantilla = plantillaSeleccionada.nombre;
        console.log('📊 Variables encontradas en plantilla guardada:', variables);
      } catch (error) {
        console.error('Error parseando variables:', error);
        variables = [];
      }
    } else if (vista === 'crear' && formData.variables.length > 0) {
      // Si estamos en modo creación, usar las variables del formData
      variables = formData.variables;
      nombrePlantilla = formData.nombre || 'Nueva_Plantilla';
      console.log('📊 Variables del formData actual:', variables);
    } else {
      alert('Por favor, crea campos dinámicos primero usando "🔄 Convertir en Variable" o "➕ Agregar Variable"');
      return;
    }
    
    // Validar que hay variables
    if (!variables || variables.length === 0) {
      alert('No se encontraron campos dinámicos en la plantilla. Por favor, crea campos dinámicos primero.');
      return;
    }

    try {
      // Filtrar "Email", "email", "Gmail", "gmail" de las variables si existen
      // Email siempre va primero y es obligatorio (según especificación del usuario)
      const variablesSinEmail = variables.filter(v => {
        const vLower = v.toLowerCase();
        return vLower !== 'email' && vLower !== 'gmail';
      });
      
      // Crear Excel con Email (siempre primero y obligatorio) + todas las variables creadas
      const columns = ['Email', ...variablesSinEmail];
      
      console.log('📊 Creando Excel con Email y variables:', columns);

      // Crear datos de ejemplo
      const data = [];
      
      // Primera fila: Email + todas las variables con ejemplos
      const fila1 = {
        'Email': 'ejemplo1@umit.com.co'
      };
      // Agregar ejemplos para cada variable
      variablesSinEmail.forEach(variable => {
        // Generar ejemplo según el tipo de variable
        let ejemplo = '';
        if (variable.toLowerCase().includes('nombre')) {
          ejemplo = 'Juan Pérez';
        } else if (variable.toLowerCase().includes('fecha')) {
          ejemplo = '15/12/2024';
        } else if (variable.toLowerCase().includes('documento')) {
          ejemplo = '1234567890';
        } else if (variable.toLowerCase().includes('motivo')) {
          ejemplo = 'Consulta médica';
        } else if (variable.toLowerCase().includes('titulo')) {
          ejemplo = 'Documento UMIT';
        } else if (variable.toLowerCase().includes('mensaje')) {
          ejemplo = 'Mensaje de ejemplo';
        } else {
          // Solo usar el nombre de la variable sin "Ejemplo"
          ejemplo = variable;
        }
        fila1[variable] = ejemplo;
      });
      data.push(fila1);

      // Segunda fila: Otro ejemplo
      const fila2 = {
        'Email': 'ejemplo2@umit.com.co'
      };
      variablesSinEmail.forEach(variable => {
        let ejemplo = '';
        if (variable.toLowerCase().includes('nombre')) {
          ejemplo = 'María García';
        } else if (variable.toLowerCase().includes('fecha')) {
          ejemplo = '20/12/2024';
        } else if (variable.toLowerCase().includes('documento')) {
          ejemplo = '0987654321';
        } else if (variable.toLowerCase().includes('motivo')) {
          ejemplo = 'Control médico';
        } else if (variable.toLowerCase().includes('titulo')) {
          ejemplo = 'Documento UMIT';
        } else if (variable.toLowerCase().includes('mensaje')) {
          ejemplo = 'Mensaje de ejemplo 2';
        } else {
          // Solo usar el nombre de la variable sin "Ejemplo"
          ejemplo = variable;
        }
        fila2[variable] = ejemplo;
      });
      data.push(fila2);

      // Crear el archivo Excel
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Datos");
      
      // Crear segunda hoja con instrucciones mejoradas
      const instrucciones = [
        { 'Instrucciones': '📋 INSTRUCCIONES PARA COMPLETAR EL EXCEL' },
        { 'Instrucciones': '' },
        { 'Instrucciones': '⚠️ IMPORTANTE: La columna "Email" es OBLIGATORIA' },
        { 'Instrucciones': '   - Debe contener los correos electrónicos de los destinatarios' },
        { 'Instrucciones': '   - Cada fila representa un correo que se enviará' },
        { 'Instrucciones': '   - Ejemplo: correo@umit.com.co' },
        { 'Instrucciones': '' },
        { 'Instrucciones': '📝 CAMPOS DINÁMICOS (Columnas creadas automáticamente):' },
        { 'Instrucciones': '   Completa estas columnas con los datos correspondientes:' },
        { 'Instrucciones': '' },
        ...variablesSinEmail.map(v => ({ 'Instrucciones': `   • ${v}` })),
        { 'Instrucciones': '' },
        { 'Instrucciones': '⚙️ COLUMNAS OPCIONALES (Puedes agregarlas si las necesitas):' },
        { 'Instrucciones': '   • Fecha Programada: formato YYYY-MM-DD (ej: 2024-12-25)' },
        { 'Instrucciones': '     Si está vacía, el correo se envía inmediatamente' },
        { 'Instrucciones': '   • Hora Programada: formato HH:MM (ej: 10:00)' },
        { 'Instrucciones': '     Si está vacía, el correo se envía inmediatamente' },
        { 'Instrucciones': '   • Asunto: asunto personalizado para cada correo' },
        { 'Instrucciones': '     Si está vacío, se usará el nombre de la plantilla' },
        { 'Instrucciones': '' },
        { 'Instrucciones': '📊 ESTRUCTURA DEL EXCEL:' },
        { 'Instrucciones': `Email | ${variablesSinEmail.length > 0 ? variablesSinEmail.join(' | ') : '(sin campos dinámicos)'}` },
        { 'Instrucciones': 'correo1@umit.com.co | valor1 | valor2 | ...' },
        { 'Instrucciones': 'correo2@umit.com.co | valor1 | valor2 | ...' },
        { 'Instrucciones': '' },
        { 'Instrucciones': '💡 TIP: Puedes copiar y pegar datos desde otros archivos Excel' }
      ];
      
      const wsInstrucciones = XLSX.utils.json_to_sheet(instrucciones);
      XLSX.utils.book_append_sheet(wb, wsInstrucciones, "Instrucciones");
      
      // Ajustar ancho de columnas (Email + todas las variables)
      const columnWidths = columns.map(() => ({ wch: 25 }));
      ws['!cols'] = columnWidths;
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const nombreArchivo = `Plantilla_${nombrePlantilla.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
      saveAs(blob, nombreArchivo);
      
      let mensaje = `✅ Plantilla Excel descargada exitosamente!\n\n`;
      mensaje += `📋 El Excel contiene:\n`;
      mensaje += `   ✅ Columna "Email" (OBLIGATORIA - para destinatarios)\n`;
      
      if (variablesSinEmail.length > 0) {
        mensaje += `   ✅ Columnas de campos dinámicos (${variablesSinEmail.length} campos):\n`;
        mensaje += variablesSinEmail.map(v => `      • ${v}`).join('\n');
        mensaje += `\n\n💡 Las columnas ya están listas. Solo completa los datos y sube el archivo para enviar correos masivamente.\n\n`;
        mensaje += `📝 Columnas opcionales que puedes agregar:\n`;
        mensaje += `   • Fecha Programada (para programar envíos)\n`;
        mensaje += `   • Hora Programada (para programar envíos)\n`;
        mensaje += `   • Asunto (personalizar asunto por correo)\n\n`;
        mensaje += `ℹ️ Revisa la hoja "Instrucciones" en el Excel para más detalles.`;
      } else {
        mensaje += `\n💡 Crea campos dinámicos usando "🔄 Convertir en Variable" o "➕ Agregar Variable" para que aparezcan como columnas en el Excel.`;
      }
      
      alert(mensaje);
    } catch (error) {
      console.error('Error descargando plantilla:', error);
      alert('❌ Error al descargar la plantilla: ' + error.message);
    }
  };

  // Manejar drag & drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const fileExt = file.name.toLowerCase().split('.').pop();
    
    if (!['csv', 'xlsx'].includes(fileExt)) {
      alert('❌ Formato no soportado. Use un archivo .csv o .xlsx válido.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('❌ El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    setFile(file);
    setFileName(file.name);
  };

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

  // Enviar correos masivamente
  const enviarCorreos = async (doSend = false) => {
    if (!plantillaSeleccionada) {
      alert('Por favor, selecciona una plantilla primero');
      return;
    }

    if (!file) {
      alert('❌ Adjunte un archivo .csv o .xlsx antes de continuar.');
      return;
    }

    if (!usuario?.id) {
      alert('❌ Usuario no autenticado. Por favor, inicia sesión nuevamente.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', usuario.id);
      formData.append('username', usuario.usuario || usuario.nombre);
      formData.append('templateId', plantillaSeleccionada.id);
      formData.append('doSend', doSend ? 'true' : 'false');
      // Agregar correo remitente seleccionado por el usuario
      formData.append('fromEmail', correoRemitenteEnvio);

      const response = await fetch('http://localhost:3001/api/send-custom-template', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Error al procesar el envío');
      }

      setResults(data.results);
      setProgress(100);

      let message = `Procesados: ${data.results.total}\nExitosos: ${data.results.sent}\nProgramados: ${data.results.scheduled}\nFallidos: ${data.results.failed}`;
      
      if (data.results.scheduled > 0) {
        message += `\n\n${data.results.scheduled} correos fueron programados para envío futuro.`;
      }

      if (data.results.failed > 0) {
        const failedDetails = data.results.failedDetails || [];
        const errorExample = failedDetails.length > 0 ? failedDetails[0].error : 'Error desconocido';
        alert(`⚠️ Finalizado con errores\n\n${message}\n\nEjemplo de error: ${errorExample}`);
      } else {
        alert(`✅ Completado\n\n${message}\n${doSend ? '(Envío real)' : '(Previews guardados)'}`);
      }

    } catch (error) {
      console.error('Error en el proceso:', error);
      alert(`❌ Error en el proceso:\n${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const previewHTML = () => {
    let html = formData.htmlContent || convertirTextoAHTML(contenidoVisual);
    
    // Reemplazar variables con ejemplos o eliminar si están vacías
    formData.variables.forEach(variable => {
      // Buscar valor en campos dinámicos primero
      const campo = formData.camposDinamicos?.find(c => c.nombre === variable);
      let ejemplo = campo?.valor || '';
      
      // Si no hay valor en campos dinámicos, usar valores por defecto
      if (!ejemplo) {
        ejemplo = variable.includes('Email') ? 'ejemplo@umit.com.co' :
                      variable.includes('Nombre') ? 'Juan Pérez' :
                  variable.includes('Titulo') ? 'Documento UMIT' :
                      variable.includes('Fecha') ? '15/12/2024' :
                      variable.includes('Hora') ? '09:00' :
                  variable.includes('Documento') ? '1234567890' :
                  variable.includes('Motivo') ? 'Consulta médica' :
                  variable.includes('MensajeInicial') ? 'Le informamos sobre su caso.' :
                  variable.includes('InformacionAdicional') ? 'Información adicional relevante.' :
                  variable.includes('Firma') ? 'Equipo UMIT' :
                  variable; // Solo mostrar el nombre de la variable sin "Ejemplo"
      }
      html = html.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), ejemplo);
    });
    
    // Eliminar variables que no están en la lista de variables (variables vacías)
    html = html.replace(/\{\{[^}]+\}\}/g, '');
    
    // Limpiar párrafos vacíos
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p><br><\/p>/g, '');
    
    const ventana = window.open('', '_blank');
    ventana.document.write(html);
    ventana.document.close();
  };

  return (
    <div className="crear-plantilla-container">
      {/* Botón Volver */}
      {onVolver && (
        <div className="btn-volver-container">
          <button className="btn-volver-plantilla" onClick={onVolver}>
            ← Volver al Menú
          </button>
        </div>
      )}

      {/* Header */}
      <div className="card-header">
        <div className="logo-circle">📧</div>
        <h1>Gestión de Plantillas de Correo</h1>
        <p className="description">
          Crea plantillas personalizadas y envía correos masivamente
        </p>
      </div>

      <div className="plantillas-layout">
        {/* Panel Lateral Izquierdo - Lista de Plantillas */}
        <aside className="plantillas-sidebar">
          <div className="sidebar-header">
            <h2>Mis Plantillas</h2>
            <button className="btn-nueva-plantilla-small" onClick={nuevaPlantilla} title="Crear nueva plantilla">
              ➕
            </button>
          </div>

          {cargando ? (
            <div className="loading">Cargando...</div>
          ) : plantillas.length === 0 ? (
            <div className="empty-state-sidebar">
              <p>No hay plantillas</p>
              <button className="btn-nueva-plantilla-small" onClick={nuevaPlantilla}>
                Crear primera
              </button>
            </div>
          ) : (
            <div className="plantillas-list">
              {plantillas.map(plantilla => (
                <div 
                  key={plantilla.id} 
                  className={`plantilla-item ${plantillaSeleccionada?.id === plantilla.id ? 'selected' : ''}`}
                  onClick={() => seleccionarPlantilla(plantilla)}
                >
                  <div className="plantilla-item-header">
                    <h3>{plantilla.nombre}</h3>
                    <span className="categoria-badge-small">{plantilla.categoria}</span>
                  </div>
                  {plantilla.descripcion && (
                    <p className="plantilla-item-desc">{plantilla.descripcion}</p>
                  )}
                  <div className="plantilla-item-actions">
                    <button 
                      className="btn-editar-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        editarPlantilla(plantilla.id);
                      }}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-eliminar-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarPlantilla(plantilla.id, plantilla.nombre);
                      }}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Contenido Principal */}
        <main className="plantillas-main">
          {vista === 'lista' && (
            <div className="welcome-screen">
              <h2>Bienvenido</h2>
              <p>Selecciona una plantilla del panel izquierdo para comenzar a enviar correos, o crea una nueva plantilla.</p>
            </div>
          )}

          {vista === 'crear' && (
            <div className="editor-container">
              <div className="editor-header">
                <h2>{plantillaEditando ? 'Editar Plantilla' : 'Nueva Plantilla'}</h2>
                <div className="editor-actions">
                  {formData.variables.length > 0 && (
                    <button 
                      className="download-btn" 
                      onClick={descargarPlantillaExcel}
                      title="Descargar plantilla Excel con Email y campos dinámicos"
                      style={{ 
                        padding: '8px 16px', 
                        fontSize: '13px',
                        marginRight: '10px',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      ⬇ Descargar Excel
                    </button>
                  )}
                  <button 
                    className={`btn-toggle-mode ${modoEditor === 'visual' ? 'active' : ''}`}
                    onClick={() => {
                      setModoEditor('visual');
                      // Sincronizar contenido visual al cambiar a modo visual
                      if (formData.htmlContent) {
                        const textoExtraido = extraerTextoDeHTML(formData.htmlContent);
                        setContenidoVisual(textoExtraido);
                      }
                    }}
                  >
                    ✏️ Editor de Plantilla
                  </button>
                  <button 
                    className={`btn-toggle-mode ${modoEditor === 'codigo' ? 'active' : ''}`}
                    onClick={() => setModoEditor('codigo')}
                    title="Modo avanzado para programadores (HTML)"
                  >
                    💻 HTML (Avanzado)
                  </button>
                  <button 
                    className="btn-toggle-preview" 
                    onClick={() => setMostrarPreview(!mostrarPreview)}
                  >
                    {mostrarPreview ? '👁️ Ocultar Preview' : '👁️ Mostrar Preview'}
                  </button>
                  <button className="btn-preview" onClick={previewHTML} disabled={!formData.htmlContent}>
                    🔍 Vista Completa
                  </button>
                  <button className="btn-cancelar" onClick={() => { resetForm(); setVista('lista'); }}>
                    Cancelar
                  </button>
                  <button 
                    className="btn-guardar" 
                    onClick={guardarPlantilla}
                    disabled={cargando || !formData.nombre.trim() || (!formData.htmlContent.trim() && !contenidoVisual.trim())}
                    style={{
                      background: (cargando || !formData.nombre.trim() || (!formData.htmlContent.trim() && !contenidoVisual.trim())) ? '#6c757d' : '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      cursor: (cargando || !formData.nombre.trim() || (!formData.htmlContent.trim() && !contenidoVisual.trim())) ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginLeft: '10px',
                      opacity: (cargando || !formData.nombre.trim() || (!formData.htmlContent.trim() && !contenidoVisual.trim())) ? 0.6 : 1,
                      display: 'inline-block',
                      visibility: 'visible',
                      minWidth: '150px'
                    }}
                    title={(!formData.nombre.trim() ? 'Ingresa un nombre para la plantilla' : (!formData.htmlContent.trim() && !contenidoVisual.trim()) ? 'Escribe contenido en el editor' : 'Guardar plantilla')}
                  >
                    {cargando ? 'Guardando...' : '💾 Guardar Plantilla'}
                  </button>
                </div>
              </div>


              {/* Editor de Campos Dinámicos - Solo para plantilla profesional */}
              {formData.camposDinamicos.length > 0 && (
                <div className="campos-dinamicos-container">
                  <h3>📝 Gestión de Campos Dinámicos</h3>
                  <p className="campos-descripcion">
                    Agrega, edita o elimina campos personalizados. Estos campos se pueden usar desde Excel.
                  </p>
                  
                  <div className="campos-lista">
                    {formData.camposDinamicos.map((campo, index) => (
                      <div key={index} className="campo-item">
                        {editandoCampo === index ? (
                          <div className="campo-editar">
                            <input
                              type="text"
                              value={nuevoCampoNombre}
                              onChange={(e) => setNuevoCampoNombre(e.target.value)}
                              placeholder="Nombre del campo"
                              className="campo-input"
                            />
                            <input
                              type="text"
                              value={nuevoCampoValor}
                              onChange={(e) => setNuevoCampoValor(e.target.value)}
                              placeholder="Valor por defecto (opcional)"
                              className="campo-input"
                            />
                            <div className="campo-acciones">
                              <button 
                                className="btn-guardar-campo"
                                onClick={guardarEdicionCampo}
                              >
                                ✓ Guardar
                              </button>
                              <button 
                                className="btn-cancelar-campo"
                                onClick={cancelarEdicion}
                              >
                                ✖ Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="campo-mostrar">
                            <div className="campo-info">
                              <span className="campo-nombre">{`{{${campo.nombre}}}`}</span>
                              {campo.valor && (
                                <span className="campo-valor">Valor: {campo.valor}</span>
                              )}
                            </div>
                            <div className="campo-botones">
                              <button 
                                className="btn-editar-campo"
                                onClick={() => editarCampoDinamico(index)}
                                title="Editar campo"
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn-eliminar-campo"
                                onClick={() => eliminarCampoDinamico(index)}
                                title="Eliminar campo"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {editandoCampo === null && (
                    <div className="agregar-campo-form">
                      <h4>➕ Agregar Nuevo Campo</h4>
                      <div className="agregar-campo-inputs">
                        <input
                          type="text"
                          value={nuevoCampoNombre}
                          onChange={(e) => setNuevoCampoNombre(e.target.value)}
                          placeholder="Nombre del campo (ej: Telefono, Direccion)"
                          className="campo-input-grande"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              agregarCampoDinamico();
                            }
                          }}
                        />
                        <input
                          type="text"
                          value={nuevoCampoValor}
                          onChange={(e) => setNuevoCampoValor(e.target.value)}
                          placeholder="Valor por defecto (opcional)"
                          className="campo-input-grande"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              agregarCampoDinamico();
                            }
                          }}
                        />
                        <button 
                          className="btn-agregar-campo"
                          onClick={agregarCampoDinamico}
                        >
                          ➕ Agregar Campo
                        </button>
                      </div>
                      <small className="campo-ayuda">
                        💡 El campo se agregará automáticamente a la plantilla. Usa el formato {'{{'}NombreCampo{'}}'} en Excel.
                      </small>
                    </div>
                  )}
                </div>
              )}

              <div className="form-row">
                <div className="form-group form-group-half">
                  <label htmlFor="nombre">Nombre de la Plantilla *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Recordatorio de Cita Personalizado"
                    required
                  />
                </div>

                <div className="form-group form-group-half">
                  <label htmlFor="categoria">Categoría</label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                  >
                    <option value="personalizada">Personalizada</option>
                    <option value="citas">Citas</option>
                    <option value="calidad">Calidad</option>
                    <option value="talento">Talento Humano</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="form-group form-group-half">
                  <label htmlFor="correoRemitente">Correo Remitente (Desde) *</label>
                  <select
                    id="correoRemitente"
                    name="correoRemitente"
                    value={formData.correoRemitente}
                    onChange={handleInputChange}
                  >
                    <option value="micita@umit.com.co">micita@umit.com.co (Citas)</option>
                    <option value="calidad@umit.com.co">calidad@umit.com.co (Calidad)</option>
                    <option value="talento@umit.com.co">talento@umit.com.co (Talento Humano)</option>
                    <option value="consulta@umit.com.co">consulta@umit.com.co (Consulta)</option>
                  </select>
                  <small>Este será el correo desde el cual se enviarán los mensajes</small>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Describe para qué se usa esta plantilla..."
                  rows="2"
                />
              </div>

              {/* Herramientas de Formato - Solo en modo visual */}
              {modoEditor === 'visual' && (
                <div className="herramientas-diseno">
                  <h3>🎨 Herramientas de Formato</h3>
                  <div className="herramientas-grid">
                    <div className="herramienta-grupo">
                      <label>Formato de Texto</label>
                      <div className="herramienta-botones">
                        <button 
                          className="btn-herramienta" 
                          onClick={() => aplicarFormatoVisual('bold')} 
                          title="Negrita"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <strong>B</strong>
                        </button>
                        <button 
                          className="btn-herramienta" 
                          onClick={() => aplicarFormatoVisual('italic')} 
                          title="Cursiva"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <em>I</em>
                        </button>
                        <button 
                          className="btn-herramienta" 
                          onClick={() => aplicarFormatoVisual('underline')} 
                          title="Subrayado"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <u>U</u>
                        </button>
                        <input 
                          type="color" 
                          className="color-picker" 
                          defaultValue="#333333"
                          onChange={(e) => aplicarFormatoVisual('foreColor', e.target.value)}
                          title="Color de texto"
                          onMouseDown={(e) => e.preventDefault()}
                        />
                        <input 
                          type="color" 
                          className="color-picker" 
                          defaultValue="#ffffff"
                          onChange={(e) => aplicarFormatoVisual('backColor', e.target.value)}
                          title="Color de fondo"
                          onMouseDown={(e) => e.preventDefault()}
                        />
                      </div>
                    </div>
                    <div className="herramienta-grupo">
                      <label>Tamaño de Texto</label>
                      <div className="herramienta-botones">
                        <button 
                          className="btn-herramienta" 
                          onClick={() => aplicarFormatoVisual('fontSize', '1')} 
                          title="Texto Pequeño"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          A<small>a</small>
                        </button>
                        <button 
                          className="btn-herramienta" 
                          onClick={() => aplicarFormatoVisual('fontSize', '3')} 
                          title="Texto Normal"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          A
                        </button>
                        <button 
                          className="btn-herramienta" 
                          onClick={() => aplicarFormatoVisual('fontSize', '5')} 
                          title="Texto Grande"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <strong>A</strong>
                        </button>
                        <button 
                          className="btn-herramienta" 
                          onClick={() => aplicarFormatoVisual('fontSize', '7')} 
                          title="Texto Muy Grande"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <strong style={{fontSize: '18px'}}>A</strong>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Herramientas de Diseño - Solo en modo código */}
              {modoEditor === 'codigo' && (
                <div className="herramientas-diseno">
                  <h3>🛠️ Herramientas de Diseño</h3>
                  <div className="herramientas-grid">
                    <div className="herramienta-grupo">
                      <label>Insertar Elementos</label>
                      <div className="herramienta-botones">
                        <button className="btn-herramienta" onClick={() => insertarElemento('titulo')} title="Insertar Título">
                          📝 Título
                        </button>
                        <button className="btn-herramienta" onClick={() => insertarElemento('parrafo')} title="Insertar Párrafo">
                          📄 Párrafo
                        </button>
                        <button className="btn-herramienta" onClick={() => insertarElemento('boton')} title="Insertar Botón">
                          🔘 Botón
                        </button>
                        <button className="btn-herramienta" onClick={() => insertarElemento('caja')} title="Insertar Caja">
                          📦 Caja
                        </button>
                        <button className="btn-herramienta" onClick={() => insertarElemento('divider')} title="Insertar Divisor">
                          ➖ Divisor
                        </button>
                      </div>
                    </div>
                    <div className="herramienta-grupo">
                      <label>Estilos de Texto</label>
                      <div className="herramienta-botones">
                        <button className="btn-herramienta" onClick={() => aplicarEstilo('bold')} title="Negrita">
                          <strong>B</strong>
                        </button>
                        <button className="btn-herramienta" onClick={() => aplicarEstilo('italic')} title="Cursiva">
                          <em>I</em>
                        </button>
                        <input 
                          type="color" 
                          className="color-picker" 
                          defaultValue="#333333"
                          onChange={(e) => aplicarEstilo('color', e.target.value)}
                          title="Color de texto"
                        />
                        <input 
                          type="color" 
                          className="color-picker" 
                          defaultValue="#f8f9fa"
                          onChange={(e) => aplicarEstilo('background', e.target.value)}
                          title="Color de fondo"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Campos Dinámicos */}
              <div className="form-group" style={{
                background: '#f8f9ff',
                padding: '20px',
                borderRadius: '10px',
                border: '2px solid #e8ecff',
                marginTop: '20px'
              }}>
                <div className="variables-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <label style={{ fontSize: '16px', fontWeight: '700', color: '#667eea' }}>
                    📋 Campos Dinámicos (Columnas en Excel)
                  </label>
                  <button 
                    type="button" 
                    className="btn-agregar-variable" 
                    onClick={agregarVariable}
                    style={{
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    ➕ Agregar Campo
                  </button>
                </div>
                {formData.variables.length > 0 ? (
                  <div className="variables-list" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '12px',
                    marginBottom: '15px'
                  }}>
                    {formData.variables.map((variable, index) => (
                      <div key={index} className="variable-item" style={{
                        background: 'white',
                        padding: '12px 15px',
                        borderRadius: '8px',
                        border: '2px solid #e8ecff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        justifyContent: 'space-between'
                      }}>
                        <span className="variable-name" style={{
                          fontWeight: '600',
                          color: '#2c3e50',
                          fontSize: '14px'
                        }}>
                          {'{{'}{variable}{'}}'}
                        </span>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            type="button"
                            className="btn-insertar"
                            onClick={() => insertarVariable(variable)}
                            title="Insertar en el editor"
                            style={{
                              background: '#17a2b8',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            📎
                          </button>
                          <button
                            type="button"
                            className="btn-eliminar-variable"
                            onClick={() => eliminarVariable(index)}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ✖️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="variables-empty" style={{
                    padding: '15px',
                    background: '#fff3cd',
                    borderRadius: '6px',
                    color: '#856404',
                    textAlign: 'center',
                    marginBottom: '15px'
                  }}>
                    ⚠️ No hay campos dinámicos definidos. Agrega campos para que aparezcan como columnas en el Excel.
                  </p>
                )}
                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#495057',
                  lineHeight: '1.7'
                }}>
                  <strong style={{ color: '#667eea' }}>💡 Cómo crear campos dinámicos:</strong>
                  <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
                    <li style={{ marginBottom: '8px' }}>
                      <strong>Método 1 (Recomendado):</strong> Escribe tu plantilla normalmente, selecciona el texto que quieres convertir en campo dinámico y haz clic en "🔄 Convertir en Variable"
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      <strong>Método 2:</strong> Haz clic en "➕ Agregar Campo" y luego usa "📎" para insertarlo donde quieras en el editor
                    </li>
                    <li>
                      Los campos aparecerán como <code style={{ background: '#f8f9fa', padding: '2px 6px', borderRadius: '3px' }}>{'{{NombreCampo}}'}</code> y se convertirán en columnas en el Excel
                    </li>
                  </ol>
                  <div style={{ marginTop: '12px', padding: '10px', background: '#e8f4f8', borderRadius: '4px' }}>
                    <strong>📧 Nota:</strong> El campo "Email" se agregará automáticamente como primera columna en el Excel (no necesitas crearlo manualmente). Esta columna contiene los correos destinatarios.
                  </div>
                </div>
              </div>

              {/* Editor y Preview - Dividido lado a lado */}
              <div className={`editor-preview-container ${mostrarPreview ? 'with-preview' : ''}`} style={{
                display: 'flex',
                gap: '20px',
                marginTop: '20px',
                height: '600px'
              }}>
                {/* Lado Izquierdo: Editor */}
                <div className="editor-section" style={{
                  flex: mostrarPreview ? '1' : '1',
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: '0'
                }}>
                  <div className="editor-toolbar" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                    padding: '10px',
                    background: '#f8f9fa',
                    borderRadius: '8px 8px 0 0',
                    border: '2px solid #e9ecef',
                    borderBottom: 'none'
                  }}>
                    <label htmlFor={modoEditor === 'visual' ? 'contenidoVisual' : 'htmlContent'} style={{
                      fontWeight: '600',
                      color: '#2c3e50',
                      fontSize: '16px'
                    }}>
                      ✏️ Editor de Plantilla
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {modoEditor === 'visual' && (
                        <button 
                          onClick={convertirTextoEnVariable}
                          title="Selecciona texto y conviértelo en variable"
                          style={{
                            background: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          🔄 Convertir en Variable
                        </button>
                      )}
                      {modoEditor === 'codigo' && (
                        <button 
                          className="btn-copiar-codigo"
                          onClick={() => {
                            navigator.clipboard.writeText(formData.htmlContent);
                            alert('Código copiado al portapapeles');
                          }}
                          title="Copiar código"
                        >
                          📋 Copiar
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {modoEditor === 'visual' ? (
                    <>
                      <div style={{
                        background: '#f8f9fa',
                        padding: '12px 15px',
                        borderRadius: '8px 8px 0 0',
                        border: '2px solid #e9ecef',
                        borderBottom: 'none',
                        fontSize: '13px',
                        color: '#495057',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <span>✏️ Escribe el contenido de tu plantilla (usa las herramientas de formato arriba)</span>
                        <span style={{ marginLeft: 'auto', color: '#667eea', fontWeight: '600' }}>
                          💡 Selecciona texto y haz clic en "🔄 Convertir en Variable" para crear campos dinámicos
                        </span>
                      </div>
                      <div
                        id="contenidoVisual"
                        contentEditable
                        onInput={handleVisualChange}
                        onKeyDown={handleKeyDownVisual}
                        data-placeholder="Escribe aquí el contenido de tu plantilla..."
                        style={{
                          flex: '1',
                          width: '100%',
                          minHeight: mostrarPreview ? '500px' : '600px',
                          padding: '20px',
                          border: '2px solid #e9ecef',
                          borderTop: 'none',
                          borderRadius: '0 0 8px 8px',
                          fontSize: '16px',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          lineHeight: '1.8',
                          outline: 'none',
                          backgroundColor: 'white',
                          color: '#2c3e50',
                          overflowY: 'auto'
                        }}
                      />
                      <div style={{
                        marginTop: '10px',
                        padding: '12px',
                        background: '#e8f4f8',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#495057'
                      }}>
                        <strong>💡 Consejos:</strong>
                        <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                          <li>Escribe tu plantilla normalmente, como si fuera un correo o documento</li>
                          <li>Selecciona cualquier texto y haz clic en "🔄 Convertir en Variable" para convertirlo en campo dinámico</li>
                          <li>Los campos dinámicos aparecerán como <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '3px' }}>{'{{NombreCampo}}'}</code> y se llenarán desde Excel</li>
                          <li>Puedes colocar los campos donde quieras, mezclados con texto normal</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <textarea
                        id="htmlContent"
                        key={`htmlContent-${vista}-${formData.htmlContent.length}`}
                        name="htmlContent"
                        value={formData.htmlContent || ''}
                        onChange={handleHtmlChange}
                        placeholder="Ingresa el código HTML de tu plantilla..."
                        required
                        className="html-editor"
                        style={{
                          flex: '1',
                          width: '100%',
                          padding: '15px',
                          border: '2px solid #e9ecef',
                          borderTop: 'none',
                          borderRadius: '0 0 8px 8px',
                          fontSize: '14px',
                          fontFamily: 'monospace',
                          resize: 'none',
                          backgroundColor: '#ffffff',
                          color: '#2c3e50',
                          lineHeight: '1.6'
                        }}
                      />
                      <small className="html-help" style={{
                        padding: '10px',
                        background: '#e8f4f8',
                        borderRadius: '0 0 8px 8px',
                        display: 'block',
                        fontSize: '12px',
                        color: '#495057'
                      }}>
                        💡 Modo avanzado: Edita el HTML directamente. Usa el modo "✏️ Editor Simple" para editar sin HTML.
                      </small>
                    </>
                  )}
                </div>

                {/* Lado Derecho: Vista Previa en Tiempo Real */}
                {mostrarPreview && (
                  <div className="preview-section" style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '0',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#ffffff'
                  }}>
                    <div className="preview-header" style={{
                      padding: '10px 15px',
                      background: '#f8f9fa',
                      borderBottom: '2px solid #e9ecef',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <label style={{
                        fontWeight: '600',
                        color: '#2c3e50',
                        fontSize: '16px',
                        margin: 0
                      }}>
                        👁️ Vista Previa en Tiempo Real
                      </label>
                      <button 
                        className="btn-refresh-preview"
                        onClick={() => {
                          // Forzar actualización del iframe
                          const iframe = document.querySelector('.preview-iframe');
                          if (iframe) {
                            iframe.src = iframe.src;
                          }
                        }}
                        title="Actualizar preview"
                        style={{
                          background: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🔄 Actualizar
                      </button>
                    </div>
                    <div className="preview-content" style={{
                      flex: '1',
                      overflow: 'auto',
                      background: '#f5f5f5',
                      padding: '20px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'flex-start'
                    }}>
                      {(formData.htmlContent || contenidoVisual) ? (
                        <iframe
                          key={(formData.htmlContent || contenidoVisual).substring(0, 100)} // Forzar re-render cuando cambia el contenido
                          title="Preview"
                          srcDoc={(() => {
                            let htmlParaPreview = formData.htmlContent || convertirTextoAHTML(contenidoVisual);
                            // Eliminar variables vacías de la vista previa
                            formData.variables.forEach(variable => {
                              const campo = formData.camposDinamicos?.find(c => c.nombre === variable);
                              let ejemplo = campo?.valor || '';
                              
                              // Si no hay valor, usar ejemplos según el tipo
                              if (!ejemplo) {
                                if (variable.toLowerCase().includes('nombre')) {
                                  ejemplo = 'Juan Pérez';
                                } else if (variable.toLowerCase().includes('fecha')) {
                                  ejemplo = '15/12/2024';
                                } else if (variable.toLowerCase().includes('hora')) {
                                  ejemplo = '09:00';
                                } else if (variable.toLowerCase().includes('documento')) {
                                  ejemplo = '1234567890';
                                } else if (variable.toLowerCase().includes('motivo')) {
                                  ejemplo = 'Consulta médica';
                                } else {
                                  // Solo mostrar el nombre de la variable sin "Ejemplo"
                                  ejemplo = variable;
                                }
                              }
                              htmlParaPreview = htmlParaPreview.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), ejemplo);
                            });
                            // Eliminar cualquier variable que no esté en la lista
                            htmlParaPreview = htmlParaPreview.replace(/\{\{[^}]+\}\}/g, '');
                            // Limpiar párrafos vacíos
                            htmlParaPreview = htmlParaPreview.replace(/<p>\s*<\/p>/g, '');
                            htmlParaPreview = htmlParaPreview.replace(/<p><br><\/p>/g, '');
                            return htmlParaPreview;
                          })()}
                          className="preview-iframe"
                          sandbox="allow-same-origin"
                          style={{
                            width: '100%',
                            height: '100%',
                            minHeight: '500px',
                            border: 'none',
                            background: 'white',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          color: '#999',
                          fontSize: '14px'
                        }}>
                          Escribe HTML en el editor para ver la vista previa
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {vista === 'enviar' && plantillaSeleccionada && (
            <div className="enviar-container">
              <div className="enviar-header">
                <h2>Enviar Correos Masivamente</h2>
                <div className="plantilla-info">
                  <span className="plantilla-nombre-activa">📧 {plantillaSeleccionada.nombre}</span>
                </div>
              </div>

              <div className="instrucciones-panel">
                <h3>📋 Instrucciones:</h3>
                <ol>
                  <li><strong>Descarga la plantilla Excel</strong> con las columnas necesarias.</li>
                  <li>Complete el archivo con los datos de los destinatarios.</li>
                  <li>Adjunte el archivo completo a continuación.</li>
                  <li>Haga clic en <strong>"Enviar Correos"</strong> para iniciar el proceso.</li>
                </ol>
              </div>

              <button className="download-btn" onClick={descargarPlantillaExcel}>
                ⬇ Descargar Plantilla Excel
              </button>

              {/* Selector de Correo Remitente */}
              <div style={{
                margin: '20px 0',
                padding: '20px',
                background: '#f8f9ff',
                borderRadius: '10px',
                border: '2px solid #e8ecff'
              }}>
                <label htmlFor="correoRemitenteEnvio" style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '600',
                  color: '#667eea',
                  fontSize: '15px'
                }}>
                  📧 Correo Remitente (Desde):
                </label>
                <select
                  id="correoRemitenteEnvio"
                  value={correoRemitenteEnvio}
                  onChange={(e) => setCorreoRemitenteEnvio(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '15px',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="micita@umit.com.co">micita@umit.com.co (Citas)</option>
                  <option value="calidad@umit.com.co">calidad@umit.com.co (Calidad)</option>
                  <option value="talento@umit.com.co">talento@umit.com.co (Talento Humano)</option>
                  <option value="consulta@umit.com.co">consulta@umit.com.co (Consulta)</option>
                </select>
                <small style={{ display: 'block', marginTop: '8px', color: '#666', fontSize: '13px' }}>
                  Este será el correo desde el cual se enviarán todos los mensajes
                </small>
              </div>

              <div 
                className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-input"
                  accept=".csv,.xlsx"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                {file ? (
                  <div className="file-selected">
                    <span className="file-icon">📄</span>
                    <div className="file-info">
                      <p className="file-name">{fileName}</p>
                      <button className="btn-remove-file" onClick={() => { setFile(null); setFileName(''); }}>
                        ✖️ Quitar archivo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="drop-content">
                    <span className="drop-icon">📎</span>
                    <p>Arrastre y suelte el archivo aquí</p>
                    <p className="drop-subtitle">o</p>
                    <label htmlFor="file-input" className="btn-select-file">
                      Seleccionar archivo
                    </label>
                    <p className="file-hint">Formatos soportados: .csv, .xlsx (máx. 10MB)</p>
                  </div>
                )}
              </div>

              {isProcessing && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="progress-text">Procesando... {progress}%</p>
                </div>
              )}

              {file && !isProcessing && (
                <div className="send-actions">
                  <button 
                    className="btn-preview-send"
                    onClick={() => enviarCorreos(false)}
                    disabled={!file}
                  >
                    👁️ Generar Previews
                  </button>
                  <button 
                    className="btn-send"
                    onClick={() => {
                      if (confirm('¿Está seguro de enviar los correos masivamente? Esta acción no se puede deshacer.')) {
                        enviarCorreos(true);
                      }
                    }}
                    disabled={!file}
                  >
                    📧 Enviar Correos
                  </button>
                </div>
              )}

              {results && (
                <div className="results-panel">
                  <h3>📊 Resultados del Proceso</h3>
                  <div className="results-grid">
                    <div className="result-item total">
                      <span className="label">Total procesados:</span>
                      <span className="value">{results.total}</span>
                    </div>
                    <div className="result-item success">
                      <span className="label">Exitosos:</span>
                      <span className="value">{results.sent}</span>
                    </div>
                    <div className="result-item scheduled">
                      <span className="label">Programados:</span>
                      <span className="value">{results.scheduled}</span>
                    </div>
                    <div className="result-item failed">
                      <span className="label">Fallidos:</span>
                      <span className="value">{results.failed}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CrearPlantilla;
