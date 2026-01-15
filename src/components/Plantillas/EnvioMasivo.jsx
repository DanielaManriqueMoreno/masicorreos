const EnvioMasivo = ({
  plantillaSeleccionada,
  descargarPlantillaExcel,
  correoRemitenteEnvio,
  setCorreoRemitenteEnvio,
  dragActive,
  handleDrag,
  handleDrop,
  handleFileSelect,
  file,
  fileName,
  setFile,
  setFileName,
  isProcessing,
  progress,
  enviarCorreos,
  results
}) => {
  return (
    <div className="enviar-container">
        <div className="enviar-header">
            <h2>Enviar Correos Masivamente</h2>
            <div className="plantilla-info">
              <span className="plantilla-nombre-activa">📧 {plantillaSeleccionada.nombre}</span>
            </div>
          </div>

        <div className="instrucciones-panel">
            <h3>📋 Instrucciones:</h3>
            <ol>
                <li><strong>Descarga la plantilla Excel</strong> con las columnas necesarias.</li>
                <li>Complete el archivo con los datos de los destinatarios.</li>
                <li>Adjunte el archivo completo a continuación.</li>
                <li>Haga clic en <strong>"Enviar Correos"</strong> para iniciar el proceso.</li>
            </ol>
        </div>

        <button className="download-btn" onClick={descargarPlantillaExcel}>
            ⬇ Descargar Plantilla Excel
        </button>

              {/* Selector de Correo Remitente */}
        <div className="test-email-container">
            <label htmlFor="correoRemitenteEnvio" className="label-test-email">
                📧 Correo Remitente (Desde):
            </label> 
            <select id="correoRemitenteEnvio" value={correoRemitenteEnvio} onChange={(e) => setCorreoRemitenteEnvio(e.target.value)} className="input-test-email">
                <option value="micita@umit.com.co">micita@umit.com.co (Citas)</option>
                <option value="calidad@umit.com.co">calidad@umit.com.co (Calidad)</option>
                <option value="talento@umit.com.co">talento@umit.com.co (Talento Humano)</option>
                <option value="consulta@umit.com.co">consulta@umit.com.co (Consulta)</option>
            </select>
            <small className="help-text">
             Este será el correo desde el cual se enviarán todos los mensajes
            </small>
        </div>

        <div className={`drop-zone ${dragActive ? 'drag-active' : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} >
            <input type="file" id="file-input" accept=".csv,.xlsx" onChange={handleFileSelect} className="input-file-test"/>
                {file ? (
                <div className="file-selected">
                    <span className="file-icon">📄</span>
                    <div className="file-info">
                      <p className="file-name">{fileName}</p>
                        <button className="btn-remove-file" onClick={() => { setFile(null); setFileName(''); }}>
                           ✖️ Quitar archivo
                        </button>
                    </div>
                </div>
                ) : (
                <div className="drop-content">
                    <span className="drop-icon">📎</span>
                    <p>Arrastre y suelte el archivo aquí</p>
                    <p className="drop-subtitle">o</p>
                    <label htmlFor="file-input" className="btn-select-file">
                      Seleccionar archivo
                    </label>
                    <p className="file-hint">Formatos soportados: .csv, .xlsx (máx. 10MB)</p>
                </div>
                )}
        </div>

        {isProcessing && (
            <div className="progress-container">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ '--progress-width': `${progress}%` }}></div>
                </div>
                <p className="progress-text">Procesando... {progress}%</p>
            </div>
        )}

        {file && !isProcessing && (
            <div className="send-actions">
                <button className="btn-preview-send" onClick={() => enviarCorreos(false)} disabled={!file}>
                    👁️ Generar Previews
                </button>
                <button className="btn-send" onClick={() => {
                    if (confirm('¿Está seguro de enviar los correos masivamente? Esta acción no se puede deshacer.')) {
                        enviarCorreos(true);
                      }
                    }}
                    disabled={!file}
                >
                📧 Enviar Correos
                </button>
            </div>
        )}

        {results && (
            <div className="results-panel">
                <h3>📊 Resultados del Proceso</h3>
                <div className="results-grid">
                    <div className="result-item total">
                      <span className="label">Total procesados:</span>
                      <span className="value">{results.total}</span>
                    </div>
                    <div className="result-item success">
                        <span className="label">Exitosos:</span>
                        <span className="value">{results.sent}</span>
                    </div>
                    <div className="result-item scheduled">
                        <span className="label">Programados:</span>
                        <span className="value">{results.scheduled}</span>
                    </div>
                    <div className="result-item failed">
                        <span className="label">Fallidos:</span>
                        <span className="value">{results.failed}</span>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default EnvioMasivo;
