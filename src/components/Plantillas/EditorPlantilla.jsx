import React, { useEffect, useRef } from 'react';
import './EditorPlantilla.css';

const EditorPlantilla = ({
  contenidoVisual,
  handleVisualChange,
  formData
}) => {
  const editorRef = useRef(null);

  // Mantener sincronizado el HTML con el editor
  useEffect(() => {
    if (editorRef.current && contenidoVisual === '') {
      editorRef.current.innerHTML = '';
    }
  }, [contenidoVisual]);
  
  const generarPreview = () => {
    let html = contenidoVisual || '';

    formData.variables.forEach(variable => {
      html = html.replace(
        new RegExp(`\\{\\{${variable}\\}\\}`, 'g'),
        `<span class="preview-variable"><<${variable}>></span>`
      );
    });

    return html;
  };

  return (
    <div className="editor-preview-container with-preview">
      <div className="editor-layout">

        {/* EDITOR */}
        <div className="editor-section">
          <h2>✉️ Mensaje</h2>

          <div contentEditable ref={editorRef} className="editor-textarea" onInput={handleVisualChange} suppressContentEditableWarning />
          <small className="editor-tip">
            Usa campos como <code>{'{{nombre}}'}</code>, <code>{'{{fecha}}'}</code>.
            El sistema los detecta automáticamente.
          </small>
        </div>

        {/* PREVIEW */}
        <div className="preview-section">
          <h3>👁️ Vista previa</h3>
          <div
            className="preview-box"
            dangerouslySetInnerHTML={{
              __html: generarPreview() || 'Aquí verás el preview'
            }}
          />
        </div>

      </div>
    </div>
  );
};

export default EditorPlantilla;