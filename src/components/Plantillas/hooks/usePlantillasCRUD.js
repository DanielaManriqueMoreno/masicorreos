import { useState, useEffect, useCallback } from 'react';
import { convertirTextoAHTML } from '../utils/editorHtmlUtils';

export const usePlantillasCRUD = (usuario) => {

  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [plantillaEditando, setPlantillaEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [vista, setVista] = useState('lista');

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    htmlContent: '',
    categoria: 'personalizada',
    variables: [],
    correoRemitente: 'micita@umit.com.co',
    camposDinamicos: []
  });

  // ---------------- CARGA INICIAL ----------------
  const cargarPlantillas = useCallback(async () => {
    if (!usuario?.id) return;

    try {
      setCargando(true);
      const res = await fetch(`http://localhost:3001/api/templates?userId=${usuario.id}`);
      const data = await res.json();
      if (data.success) setPlantillas(data.templates || []);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  }, [usuario]);

  // ---------------- NAVEGACIÓN ----------------
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
  };

  const nuevaPlantilla = () => {
    resetForm();
    setVista('crear');
  };

  const seleccionarPlantilla = (plantilla) => {
    setPlantillaSeleccionada(plantilla);
    setVista('enviar');
  };

  const editarPlantilla = async (id) => {
    try {
      setCargando(true);
      const res = await fetch(`http://localhost:3001/api/templates/${id}?userId=${usuario.id}`);
      const data = await res.json();

      if (data.success) {
        const tpl = data.template;
        const variables = tpl.variables ? JSON.parse(tpl.variables) : [];

        setFormData({
          nombre: tpl.nombre,
          descripcion: tpl.descripcion || '',
          htmlContent: tpl.html_content,
          categoria: tpl.categoria || 'personalizada',
          variables,
          correoRemitente: tpl.correo_remitente || 'micita@umit.com.co',
          camposDinamicos: variables.map(v => ({ nombre: v, valor: '' }))
        });

        setPlantillaEditando(tpl);
        setVista('crear');
      }
    } finally {
      setCargando(false);
    }
  };

  const guardarPlantilla = async () => {
    if (!formData.nombre.trim()) return alert('Nombre obligatorio');

    let html = formData.htmlContent.trim()
      ? formData.htmlContent
      : convertirTextoAHTML('');

    const url = plantillaEditando
      ? `http://localhost:3001/api/templates/${plantillaEditando.id}`
      : `http://localhost:3001/api/templates`;

    const method = plantillaEditando ? 'PUT' : 'POST';

    try {
      setCargando(true);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: usuario.id,
          ...formData,
          htmlContent: html
        })
      });

      const data = await res.json();
      if (data.success) {
        resetForm();
        cargarPlantillas();
        setVista('lista');
      }
    } finally {
      setCargando(false);
    }
  };

  const eliminarPlantilla = async (id) => {
    if (!confirm('¿Eliminar plantilla?')) return;

    await fetch(`http://localhost:3001/api/templates/${id}?userId=${usuario.id}`, {
      method: 'DELETE'
    });

    cargarPlantillas();
  };

  return {plantillas, plantillaSeleccionada, plantillaEditando, vista, cargando, formData, setFormData, setVista, setPlantillaSeleccionada, cargarPlantillas,nuevaPlantilla, seleccionarPlantilla, editarPlantilla, guardarPlantilla, eliminarPlantilla, resetForm,
  };
};
