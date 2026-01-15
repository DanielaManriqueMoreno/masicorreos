const [modoEditor, setModoEditor] = useState('visual');
const [mostrarPreview, setMostrarPreview] = useState(false);
const [contenidoVisual, setContenidoVisual] = useState('');

const [editandoCampo, setEditandoCampo] = useState(null);
const [nuevoCampoNombre, setNuevoCampoNombre] = useState('');
const [nuevoCampoValor, setNuevoCampoValor] = useState('');

//-----------------EDITOR VISUAL CON FORMATO (CONTENTEDITABLE)------------------//

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

  //-----------------EDITOR HTML------------------//

const handleHtmlChange = (e) => {
    setFormData(prev => ({
      ...prev,
      htmlContent: e.target.value
    }));
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

//-----------------COVERSION DE TEXTO/HTML------------------//
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

//-----------------VARIABLES DINAMICAS (EXCEL)------------------//
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
}

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

//-----------------CAMPOS DINAMICOS------------------//
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

const cancelarEdicion = () => {
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

//-----------------PREVIEW------------------//
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

return{
    modoEditor, setModoEditor, mostrarPreview, setMostrarPreview, contenidoVisual, setContenidoVisual, editandoCampo, nuevoCampoNombre, nuevoCampoValor, setNuevoCampoNombre, setNuevoCampoValor, handleVisualChange, handleKeyDownVisual, convertirTextoEnVariable, aplicarFormatoVisual, handleHtmlChange, aplicarEstilo, insertarElemento, agregarVariable, eliminarVariable, insertarVariable, agregarCampoDinamico, editarCampoDinamico, guardarEdicionCampo, cancelarEdicion, eliminarCampoDinamico, previewHTML,
}