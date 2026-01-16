import { useState } from 'react';
import { convertirTextoAHTML } from '../utils/editorHtmlUtils';
import { PLANTILLA_BASE } from '../../../constants/plantillaConstants';


export const useEditorVisual = ({ formData, setFormData }) => {
  const [contenidoVisual, setContenidoVisual] = useState('');

  const handleVisualChange = (e) => {
    const editor = e.target;

    const htmlCrudo = editor.innerHTML || '';
    const textoPlano = editor.innerText || '';

    setContenidoVisual(textoPlano);

    // Detectar si hay HTML real (no solo texto)
    const tieneHTML =
      /<\/?[a-z][\s\S]*>/i.test(htmlCrudo) &&
      htmlCrudo.replace(/<br\s*\/?>/gi, '').trim() !== textoPlano.trim();

    const htmlFinal = convertirTextoAHTML(
      tieneHTML ? htmlCrudo : textoPlano,
      PLANTILLA_BASE
    );

    setFormData((prev) => ({
      ...prev,
      htmlContent: htmlFinal,
    }));
  };

  return {
    contenidoVisual,
    setContenidoVisual,
    handleVisualChange,
  };
};
