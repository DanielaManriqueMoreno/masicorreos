const EditorPlantilla = ({ formData, setFormData, modoEditor, setModoEditor, mostrarPreview, setMostrarPreview, vista }) =>  {

<div className={`editor-preview-container ${mostrarPreview ? 'with-preview' : ''}`} >
    {/* Lado Izquierdo: Editor */}
    <div className="editor-section" >
        <div className="editor-toolbar" >
            <label htmlFor={modoEditor === 'visual' ? 'contenidoVisual' : 'htmlContent'}>
                ✏️ Editor de Plantilla
            </label>
            <div className="flex-gap-10">
                {modoEditor === 'visual' && (
                    <button onClick={convertirTextoEnVariable} title="Selecciona texto y conviértelo en variable">
                        🔄 Convertir en Variable
                    </button>
                )}
                {modoEditor === 'codigo' && (
                    <button className="btn-copiar-codigo" onClick={() => {navigator.clipboard.writeText(formData.htmlContent); alert('Código copiado al portapapeles');}} title="Copiar código">
                        📋 Copiar
                    </button>
                )}
            </div>
        </div>
                  
        {modoEditor === 'visual' ? (
            <>
                <div className="editor-instructions">
                    <span>✏️ Escribe el contenido de tu plantilla (usa las herramientas de formato arriba)</span>
                    <span className="editor-tip">
                        💡 Selecciona texto y haz clic en "🔄 Convertir en Variable" para crear campos dinámicos
                    </span>
                </div>
                <div id="contenidoVisual" contentEditable onInput={handleVisualChange} onKeyDown={handleKeyDownVisual} data-placeholder="Escribe aquí el contenido de tu plantilla..."/>
                    <div className="editor-help">
                        <strong>💡 Consejos:</strong>
                        <ul className="preview-variables">
                          <li>Escribe tu plantilla normalmente, como si fuera un correo o documento</li>
                          <li>Selecciona cualquier texto y haz clic en "🔄 Convertir en Variable" para convertirlo en campo dinámico</li>
                          <li>Los campos dinámicos aparecerán como <code className="code-white">{'{{NombreCampo}}'}</code> y se llenarán desde Excel</li>
                          <li>Puedes colocar los campos donde quieras, mezclados con texto normal</li>
                        </ul>
                    </div>
                    </>
                  ) : (
                    <>
                    <textarea id="htmlContent" key={`htmlContent-${vista}-${formData.htmlContent.length}`} name="htmlContent" value={formData.htmlContent || ''} onChange={handleHtmlChange} placeholder="Ingresa el código HTML de tu plantilla..." required className="html-editor"/>
                    <small className="html-help">
                        💡 Modo avanzado: Edita el HTML directamente. Usa el modo "✏️ Editor Simple" para editar sin HTML.
                    </small>
            </>
        )}
    </div>

    {/* Lado Derecho: Vista Previa en Tiempo Real */}
    {mostrarPreview && (
        <div className="preview-section" >
            <div className="preview-header" >
                <label className="label-block">
                    👁️ Vista Previa en Tiempo Real
                </label>
                <button className="btn-refresh-preview" onClick={() => {
                // Forzar actualización del iframe
                const iframe = document.querySelector('.preview-iframe');
                if (iframe) {
                    iframe.src = iframe.src;
                }
                }}
                title="Actualizar preview"
                >
                    🔄 Actualizar
                </button>
            </div>
        <div className="preview-content" >
            {(formData.htmlContent || contenidoVisual) ? (
                <iframe
                    key={(formData.htmlContent || contenidoVisual).substring(0, 100)} // Forzar re-render cuando cambia el contenido
                    title="Preview"
                    srcDoc={(() => {
                    let htmlParaPreview = formData.htmlContent || convertirTextoAHTML(contenidoVisual);
                    // Eliminar variables vacías de la vista previa
                    formData.variables.forEach(variable => {
                        const campo = formData.camposDinamicos?.find(c => c.nombre === variable);
                        let ejemplo = campo?.valor || '';
                              
                        // Si no hay valor, usar ejemplos según el tipo
                        if (!ejemplo) {
                            if (variable.toLowerCase().includes('nombre')) {
                                ejemplo = 'Juan Pérez';
                            } else if (variable.toLowerCase().includes('fecha')) {
                                ejemplo = '15/12/2024';
                            } else if (variable.toLowerCase().includes('hora')) {
                                ejemplo = '09:00';
                            } else if (variable.toLowerCase().includes('documento')) {
                                ejemplo = '1234567890';
                            } else if (variable.toLowerCase().includes('motivo')) {
                                ejemplo = 'Consulta médica';
                            } else {
                            // Solo mostrar el nombre de la variable sin "Ejemplo"
                                ejemplo = variable;
                            }
                        }
                        htmlParaPreview = htmlParaPreview.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), ejemplo);
                    });
                    // Eliminar cualquier variable que no esté en la lista
                    htmlParaPreview = htmlParaPreview.replace(/\{\{[^}]+\}\}/g, '');
                    // Limpiar párrafos vacíos
                    htmlParaPreview = htmlParaPreview.replace(/<p>\s*<\/p>/g, '');
                    htmlParaPreview = htmlParaPreview.replace(/<p><br><\/p>/g, '');
                    return htmlParaPreview;
                    })()}
                    className="preview-iframe"
                    sandbox="allow-same-origin"
                    />
            ) : (
            <div className="preview-placeholder">
                Escribe HTML en el editor para ver la vista previa
            </div>
            )}
        </div>
    </div>
        )}
</div>

};

export default EditorPlantilla;