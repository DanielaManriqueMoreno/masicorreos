import React, { useEffect, useState } from 'react';
import './CrearPlantilla.css';

import PlantillaForm from './PlantillaForm';
import EditorPlantilla from './EditorPlantilla';
import useEditorPlantilla from "./hooks/useEditorPlantilla";
import { notifySuccess, notifyError, notifyWarning } from "../../utils/notificaciones";
import { usePlantillasCRUD } from "./hooks/usePlantillasCRUD";
import { useVariablesPlantillas } from './hooks/useVariablesPlantillas';
import { extraerVariablesDesdeTexto } from './utils/editorhtmlutils';

const CrearPlantilla = ({ onVolver, usuario }) => {
  const [areas, setAreas] = useState([]);

  /* ================= CRUD PLANTILLAS ================= */
  const {
    formData,
    setFormData,
    guardarPlantilla,
    cargando
  } = usePlantillasCRUD();
  
  /* ================= EDITOR ================= */
  const editor = useEditorPlantilla();
  
  /* ================= CARGAR ÁREAS ================= */
  useEffect(() => {
    const cargarAreas = async () => {
      try {
        const resp = await fetch('/api/areas');
        const data = await resp.json();

        console.log("Áreas desde backend:", data);

        if (Array.isArray(data)) {
          setAreas(data);
        } else {
          notifyError("La respuesta de áreas no es un array");
          setAreas([]);
        }
      } catch (error) {
        notifyError("Error cargando áreas: " + error.message);
        setAreas([]);
      }
    };

    cargarAreas();
  }, []);

  /* ================= INPUTS ================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= GUARDAR ================= */
  const handleGuardarPlantilla = async () => {

    if (!usuario?.documento) {
      notifyError("No se encontró usuario ❌");
      return;
    }

    if (!formData.nombre.trim()) {
      notifyWarning("Ingrese un nombre para la plantilla ⚠️");
      return;
    }

    if (!formData.area_id) {
      notifyWarning("Seleccione un área ⚠️");
      return;
    }

    if (!editor.contenidoVisual.trim()) {
      notifyWarning("El contenido de la plantilla está vacío ⚠️");
      return;
    }

    try {
      const result = await guardarPlantilla({
        userId: usuario.documento,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        htmlContent: editor.contenidoVisual,
        variables: formData.variables,
        area_id: formData.area_id
      });

      if (result?.success) {

        notifySuccess("Plantilla creada correctamente ✅");

        setFormData({
          nombre: '',
          descripcion: '',
          area_id: '',
          variables: []
        });

        editor.resetEditor();

      } else {
        notifyError(result?.message || "Error al guardar plantilla");
      }

    } catch (error) {
      notifyError("Error del servidor al guardar plantilla");
      console.error(error);
    }
  };


  /* ================= VARIABLES PLANTILLA ================= */
  const variables = useVariablesPlantillas({
    formData,
    setFormData,
    onInsertarEnEditor: editor.insertarTexto 
  });

  useEffect(() => {
    const variablesDetectadas = extraerVariablesDesdeTexto(editor.contenidoVisual)
      .map(v => v.replace('{{', '').replace('}}', ''));

    setFormData(prev => ({
      ...prev,
      variables: variablesDetectadas
    }));
  }, [editor.contenidoVisual]);

  return (
    <div className="crear-plantilla-container">

      <PlantillaForm
        formData={formData}
        handleInputChange={handleInputChange}
        areas={areas}   // <-- PASAMOS LAS ÁREAS
      />

      <EditorPlantilla
        contenidoVisual={editor.contenidoVisual}
        handleVisualChange={editor.handleVisualChange}
        formData={formData}
      />

      <button
        className="btn-primary"
        onClick={handleGuardarPlantilla}
        disabled={cargando}
      >
        💾 Guardar plantilla
      </button>

    </div>
  );
};

export default CrearPlantilla;