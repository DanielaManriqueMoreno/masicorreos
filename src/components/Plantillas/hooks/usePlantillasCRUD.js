const [plantillas, setPlantillas] = useState([]);
const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
const [cargando, setCargando] = useState(false);
const [vista, setVista] = useState('lista'); 
const [plantillaEditando, setPlantillaEditando] = useState(null);

const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    htmlContent: '',
    categoria: 'personalizada',
    variables: [],
    correoRemitente: 'micita@umit.com.co', // Correo remitente por defecto
    camposDinamicos: [] // Nuevo: campos dinámicos editables
});

//----------------CARGA INICIAL------------------//
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

//------------------NAVEGACION - VISTA------------------//
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

//------------------GUARDAR PLANTILLA------------------//
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

//------------------ELIMINAR PLANTILLA------------------//
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

return {
    plantillas, plantillaSeleccionada, plantillaEditando, vista, cargando, formData, setFormData, setVista, setPlantillaSeleccionada, cargarPlantillas, nuevaPlantilla, seleccionarPlantilla, editarPlantilla, guardarPlantilla, eliminarPlantilla, resetForm,
};

