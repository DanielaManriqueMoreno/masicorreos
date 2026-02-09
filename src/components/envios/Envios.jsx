const Envios= ({
  plantillaSeleccionada,

  // excel
  descargarPlantillaExcel,
  file,
  fileName,
  setFile,
  setFileName,

  // envio
  correoRemitenteEnvio,
  setCorreoRemitenteEnvio,
  modoEnvio,
  setModoEnvio,
  fechaProgramada,
  setFechaProgramada,
  enviarCorreos,

  // drag & drop
  dragActive,
  handleDrag,
  handleDrop,
  handleFileSelect,

  // estados
  isProcessing,
  progress,
  results


}) => {
  return (
    <div className="enviar-container">

      {/* HEADER */}
      <div className="enviar-header">
        <h2>Enviar Correos</h2>
        <span className="plantilla-nombre-activa">
          📧 {plantillaSeleccionada.nombre}
        </span>
      </div>

      {/* INSTRUCCIONES */}
      <div className="instrucciones-panel">
        <h3>📋 Instrucciones</h3>
        <ol>
          <li>Descargue la plantilla Excel.</li>
          <li>Complete los datos de los destinatarios.</li>
          <li>Cargue el archivo.</li>
          <li>Seleccione el tipo de envío.</li>
        </ol>
      </div>

      {/* DESCARGA EXCEL */}
      <button className="download-btn" onClick={descargarPlantillaExcel}>
        ⬇ Descargar Plantilla Excel
      </button>

      {/* CORREO REMITENTE */}
      <div className="test-email-container">
        <label className="label-test-email">
          📧 Correo remitente
        </label>

        <select
          value={correoRemitenteEnvio}
          onChange={(e) => setCorreoRemitenteEnvio(e.target.value)}
          className="input-test-email"
        >
          <option value="micita@umit.com.co">micita@umit.com.co</option>
          <option value="calidad@umit.com.co">calidad@umit.com.co</option>
          <option value="talento@umit.com.co">talento@umit.com.co</option>
          <option value="consulta@umit.com.co">consulta@umit.com.co</option>
        </select>
      </div>

      {/* TIPO DE ENVÍO */}
      <div className="envio-modo-container">
        <label className="label-test-email">
          🚀 Tipo de envío
        </label>

        <select
          value={modoEnvio}
          onChange={(e) => setModoEnvio(e.target.value)}
          className="input-test-email"
        >
          <option value="inmediato">📤 Enviar ahora</option>
          <option value="programado">⏰ Programar envío</option>
        </select>
      </div>

      {/* FECHA PROGRAMADA */}
      {modoEnvio === 'programado' && (
        <div className="programacion-container">
          <label className="label-test-email">
            ⏰ Fecha y hora
          </label>

          <input
            type="datetime-local"
            value={fechaProgramada || ''}
            onChange={(e) => setFechaProgramada(e.target.value)}
            className="input-test-email"
          />
        </div>
      )}

      {/* DROP ZONE */}
      <div
        className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileSelect}
          className="input-file-test"
        />

        {file ? (
          <div className="file-selected">
            <p>{fileName}</p>
            <button
              className="btn-remove-file"
              onClick={() => {
                setFile(null);
                setFileName('');
              }}
            >
              ✖ Quitar archivo
            </button>
          </div>
        ) : (
          <p>Arrastre el archivo aquí o selecciónelo</p>
        )}
      </div>

      {/* PROGRESO */}
      {isProcessing && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>Procesando... {progress}%</p>
        </div>
      )}

      {/* ACCIONES */}
      {file && !isProcessing && (
        <div className="send-actions">
          <button
            className="btn-preview-send"
            onClick={() => enviarCorreos({ preview: true })}
          >
            👁️ Generar preview
          </button>

          <button
            className="btn-send"
            onClick={() => {
              const mensaje =
                modoEnvio === 'programado'
                  ? '¿Desea programar el envío?'
                  : '¿Desea enviar los correos ahora?';

              if (confirm(mensaje)) {
                enviarCorreos({ preview: false });
              }
            }}
          >
            {modoEnvio === 'programado'
              ? '⏰ Programar envío'
              : '📧 Enviar correos'}
          </button>
        </div>
      )}

      {/* RESULTADOS */}
      {results && (
        <div className="results-panel">
          <h3>📊 Resultados</h3>
          <p>Total: {results.total}</p>
          <p>Enviados: {results.sent}</p>
          <p>Programados: {results.scheduled}</p>
          <p>Fallidos: {results.failed}</p>
        </div>
      )}
    </div>
  );
};

export default Envios;
