import React from 'react';
import { useEffect } from 'react';
import './CrearPlantilla.css';

import PlantillaForm from './PlantillaForm';
import EditorPlantilla from './EditorPlantilla';
import useEditorPlantilla from "./hooks/useEditorPlantilla";

import { usePlantillasCRUD } from "./hooks/usePlantillasCRUD";
import { useVariablesPlantillas } from './hooks/useVariablesPlantillas';
import { extraerVariablesDesdeTexto } from './utils/editorhtmlutils';

const CrearPlantilla = ({ onVolver, usuario, areaId }) => {

  /* ================= CRUD PLANTILLAS ================= */
  const {
    formData,
    setFormData,
    guardarPlantilla,
    cargando
  } = usePlantillasCRUD();
  
  /* ================= EDITOR ================= */
  const editor = useEditorPlantilla();
  
  /* ================= INPUTS ================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= GUARDAR ================= */
  const handleGuardarPlantilla = () => {
    guardarPlantilla({
      ...formData,
      htmlContent: editor.contenidoVisual,
      area_id: areaId
    });
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