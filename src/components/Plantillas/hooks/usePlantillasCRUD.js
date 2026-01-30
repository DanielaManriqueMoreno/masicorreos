import { useState } from 'react';

const API_URL = '/api/templates';

export function usePlantillasCRUD() {
  const [cargando, setCargando] = useState(false);
  const [plantillaEditando, setPlantillaEditando] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    htmlContent: '',
    categoria: '',
    variables: []
  });

  // =========================
  // CARGAR UNA PLANTILLA (EDITAR)
  // =========================
  const cargarPlantillaPorId = async (id) => {
    try {
      setCargando(true);

      const resp = await fetch(`${API_URL}/${id}`);
      if (!resp.ok) throw new Error('Error al cargar plantilla');

      const data = await resp.json();

      setFormData({
        nombre: data.nombre,
        descripcion: data.descripcion,
        htmlContent: data.html_content,
        categoria: data.categoria,
        variables: data.variables || []
      });

      setPlantillaEditando(id);
    } catch (error) {
      console.error('Error cargarPlantillaPorId:', error);
    } finally {
      setCargando(false);
    }
  };

  // =========================
  // GUARDAR (CREAR / EDITAR)
  // =========================
  const guardarPlantilla = async (payload) => {
    try {
      setCargando(true);

      const method = plantillaEditando ? 'PUT' : 'POST';
      const url = plantillaEditando
        ? `${API_URL}/${plantillaEditando}`
        : API_URL;

      // 🔥 ADAPTAMOS LOS NOMBRES A LO QUE EL BACKEND ESPERA
      const bodyEnviar = {
        userId: payload.userId,               // id del usuario
        nombre: payload.nombre,               // nombre de la plantilla
        descripcion: payload.descripcion || '', // descripción opcional
        htmlContent: payload.htmlContent,     // contenido HTML
        variables: payload.variables || [],    // variables detectadas
        area_id: payload.area_id              // área seleccionada
      };

      console.log("Enviando al backend:", bodyEnviar);

      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyEnviar)
      });

      if (!resp.ok) {
        // intentar leer el mensaje de error del backend
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al guardar plantilla');
      }

      setPlantillaEditando(null);
      alert("Plantilla guardada exitosamente ✅");

    } catch (error) {
      console.error('Error guardarPlantilla:', error);
      alert(error.message); // mostramos alerta rápida si falla
    } finally {
      setCargando(false);
    }
  };

  // =========================
  // ELIMINAR (OPCIONAL)
  // =========================
  const eliminarPlantilla = async (id) => {
    try {
      setCargando(true);

      const resp = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!resp.ok) throw new Error('Error al eliminar plantilla');
    } catch (error) {
      console.error('Error eliminarPlantilla:', error);
    } finally {
      setCargando(false);
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      htmlContent: '',
      categoria: '',
      variables: []
    });
    setPlantillaEditando(null);
  };

  return {
    formData,
    setFormData,
    cargando,
    guardarPlantilla,
    cargarPlantillaPorId,
    eliminarPlantilla,
    resetForm
  };
}