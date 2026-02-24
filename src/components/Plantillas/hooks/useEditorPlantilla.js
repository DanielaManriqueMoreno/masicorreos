// useEditorPlantilla.js
import { useState } from 'react';

export default function useEditorPlantilla() {
  const [contenidoVisual, setContenidoVisual] = useState('');

  const handleVisualChange = (e) => {
    setContenidoVisual(e.currentTarget.innerHTML);
  };

  const resetEditor = () => {
    setContenidoVisual('');
  };

  return {
    contenidoVisual,
    handleVisualChange,
    setContenidoVisual,
    resetEditor
  };
}