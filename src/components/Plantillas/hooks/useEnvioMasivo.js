// Estados para envío masivo
const [file, setFile] = useState(null);
const [fileName, setFileName] = useState('');
const [progress, setProgress] = useState(0);
const [isProcessing, setIsProcessing] = useState(false);
const [results, setResults] = useState(null);
const [dragActive, setDragActive] = useState(false);
const [correoRemitenteEnvio, setCorreoRemitenteEnvio] = useState('micita@umit.com.co');

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
      alert('Formato no soportado. Use un archivo .csv o .xlsx válido.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB.');
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

return{
    file, fileName, dragActive,isProcessing, progress, results, correoRemitenteEnvio, setCorreoRemitenteEnvio, handleDrag, handleDrop, handleFileSelect, enviarCorreos, descargarPlantillaExcel,
};

export default useEnvioMasivo;