import { useState } from 'react';
import { convertirTextoAHTML } from './utils/editorHtmlUtils';
import { PLANTILLA_BASE } from '../../../constants/plantillaConstants';

export const useEditorVisual = ({ formData, setFormData }) => {
  const [contenidoVisual, setContenidoVisual] = useState('');

  const handleVisualChange = (e) => {
    const editor = e.target;
    const textoPlano = editor.innerText || '';

    setContenidoVisual(textoPlano);

    const htmlFinal = convertirTextoAHTML(textoPlano, PLANTILLA_BASE);

    setFormData(prev => ({
      ...prev,
      htmlContent: htmlFinal,
    }));
  };

  const convertirTextoEnVariable = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const textoSeleccionado = range.toString().trim();

    if (!textoSeleccionado) return;

    const nombreVariable = textoSeleccionado
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');

    const variable = `{{${nombreVariable}}}`;

    // Reemplazar texto seleccionado por la variable
    range.deleteContents();
    range.insertNode(document.createTextNode(variable));

    // Guardar variable si no existe
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.includes(nombreVariable)
        ? prev.variables
        : [...prev.variables, nombreVariable],
    }));

    // Forzar actualización del HTML
    const editor = document.getElementById('contenidoVisual');
    if (editor) {
      handleVisualChange({ target: editor });
    }

    selection.removeAllRanges();
  };

  return {
    contenidoVisual,
    handleVisualChange,
    convertirTextoEnVariable,
  };
};
