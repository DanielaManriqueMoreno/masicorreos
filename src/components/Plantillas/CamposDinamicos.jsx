const CamposDinamicos = ({ formData, agregarVariable, eliminarVariable, insertarVariable }) => {
    return (
    <div className="form-group" >
        <div className="variables-header" >
            <label >
            📋 Campos Dinámicos (Columnas en Excel)
            </label>
            <button type="button" className="btn-agregar-variable" onClick={agregarVariable}>
                ➕ Agregar Campo
            </button>
        </div>
        {formData.variables.length > 0 ? (
            <div className="variables-list" >
                {formData.variables.map((variable, index) => (
                    <div key={index} className="variable-item" >
                        <span className="variable-name" >
                        {'{{'}{variable}{'}}'}
                        </span>
                        <div className="variable-actions">
                            <button type="button" className="btn-insertar" onClick={() => insertarVariable(variable)} title="Insertar en el editor">
                                📎
                            </button>
                            <button type="button" className="btn-eliminar-variable" onClick={() => eliminarVariable(index)} >
                            ✖️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
        <p className="variables-empty">
            ⚠️ No hay campos dinámicos definidos. Agrega campos para que aparezcan como columnas en el Excel.
        </p>
        )}
        <div className="help-block">
            <strong className="help-title">💡 Cómo crear campos dinámicos:</strong>
                <ol className="help-list">
                    <li className="help-list-item">
                        <strong>Método 1 (Recomendado):</strong> Escribe tu plantilla normalmente, selecciona el texto que quieres convertir en campo dinámico y haz clic en "🔄 Convertir en Variable"
                    </li>
                    <li className="help-list-item">
                        <strong>Método 2:</strong> Haz clic en "➕ Agregar Campo" y luego usa "📎" para insertarlo donde quieras en el editor
                    </li>
                    <li>
                        Los campos aparecerán como <code className="code-example">{{'NombreCampo'}}</code> y se convertirán en columnas en el Excel
                    </li>
                </ol>
                <div className="help-tip">
                    <strong>📧 Nota:</strong> El campo "Email" se agregará automáticamente como primera columna en el Excel (no necesitas crearlo manualmente). Esta columna contiene los correos destinatarios.
                </div>
        </div>
    </div>
    );
};

export default CamposDinamicos;