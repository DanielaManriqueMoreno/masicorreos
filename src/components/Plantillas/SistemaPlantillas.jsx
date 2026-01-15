// SistemaPlantillas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './SistemaPlantillas.css';

const SistemaPlantillas = ({ onVolver, usuario, onNavigate }) => {
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [cargandoPlantillas, setCargandoPlantillas] = useState(false);
  const [correoRemitente, setCorreoRemitente] = useState('micita@umit.com.co');
  const [passwordRemitente, setPasswordRemitente] = useState('');

  // Cargar plantillas al montar
  useEffect(() => {
    // Verificar primero que el servidor esté disponible
    verificarServidor().then(() => {
      cargarPlantillas();
    });
  }, []);

  // Verificar que el servidor esté corriendo
  const verificarServidor = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (!response.ok) {
        throw new Error(`Servidor respondió con error: ${response.status}`);
      }
      const data = await response.json();
      if (data.status !== 'OK') {
        console.warn('Servidor reporta problemas:', data.message);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('⚠️ Error conectando al servidor. Verifica que esté corriendo en localhost:3001');
    }
  };

  const cargarPlantillas = async () => {
    if (!usuario?.id) return;

    try {
      setCargandoPlantillas(true);
      const response = await fetch(`http://localhost:3001/api/templates?userId=${usuario.id}`, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        if (response.status === 404 || response.status === 500) {
          setPlantillas([]);
          return;
        }
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setPlantillas(data.success ? data.templates || [] : []);
    } catch (error) {
      console.error('Error cargando plantillas:', error);
      alert('Error cargando plantillas: ' + error.message);
      setPlantillas([]);
    } finally {
      setCargandoPlantillas(false);
    }
  };

  // Validación de email
  const isValidEmail = (email) => {
    if (!email || email === '') return false;
    const emailStr = String(email).trim().toLowerCase();
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(emailStr)) return false;
    const invalidDomains = ['example.com', 'test.com', 'invalid.com', 'email.com'];
    const domain = emailStr.split('@')[1];
    return !invalidDomains.includes(domain);
  };

  // Descargar plantilla Excel
  const downloadTemplate = () => {
    if (!plantillaSeleccionada) {
      alert('Por favor, selecciona una plantilla primero');
      return;
    }

    try {
      const variables = plantillaSeleccionada.variables 
        ? JSON.parse(plantillaSeleccionada.variables) 
        : [];
      
      // Email siempre es requerido
      const columns = ['Email', ...variables];
      
      // Agregar columnas opcionales (solo programación, no Asunto)
      if (!columns.includes('Fecha Programada')) {
        columns.push('Fecha Programada');
      }
      if (!columns.includes('Hora Programada')) {
        columns.push('Hora Programada');
      }

      // Crear datos de ejemplo
      const data = [{}];
      columns.forEach(col => {
        if (col === 'Email') {
          data[0][col] = 'ejemplo@umit.com.co';
        } else if (col === 'Fecha Programada' || col === 'Hora Programada') {
          data[0][col] = '';
        } else {
          data[0][col] = `Ejemplo ${col}`;
        }
      });

      // Segunda fila de ejemplo
      const segundaFila = { ...data[0] };
      segundaFila['Email'] = 'ejemplo2@umit.com.co';
      if (segundaFila['Fecha Programada'] === '') {
        segundaFila['Fecha Programada'] = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        segundaFila['Hora Programada'] = '10:00';
      }
      data.push(segundaFila);

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, `Plantilla_${plantillaSeleccionada.nombre.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
      
      alert('✅ Plantilla Excel descargada exitosamente!\n\nNota: Las columnas "Fecha Programada" y "Hora Programada" son opcionales. Déjelas vacías para envío inmediato.\n\nEl asunto del correo será el nombre de la plantilla.');
    } catch (error) {
      console.error('Error descargando plantilla:', error);
      alert('❌ Error al descargar la plantilla: ' + error.message);
    }
  };

  // Manejar drag & drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const fileExt = file.name.toLowerCase().split('.').pop();
    
    if (!['csv', 'xlsx'].includes(fileExt)) {
      alert('❌ Formato no soportado. Use un archivo .csv o .xlsx válido.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('❌ El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    setFile(file);
    setFileName(file.name);
  };

  // Enviar correos masivamente
  const enviarCorreos = async (doSend = false) => {
    if (!plantillaSeleccionada) {
      alert('Por favor, selecciona una plantilla primero');
      return;
    }

    if (!file) {
      alert('❌ Adjunte un archivo .csv o .xlsx antes de continuar.');
      return;
    }

    if (!correoRemitente || !correoRemitente.includes('@')) {
      alert('❌ Por favor, ingrese un correo remitente válido.');
      return;
    }

    if (!passwordRemitente || passwordRemitente.trim() === '') {
      alert('❌ Por favor, ingrese la contraseña de aplicaciones del correo remitente.');
      return;
    }

    if (!usuario?.id) {
      alert('❌ Usuario no autenticado. Por favor, inicia sesión nuevamente.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', usuario.id);
      formData.append('username', usuario.usuario || usuario.nombre);
      formData.append('templateId', plantillaSeleccionada.id);
      formData.append('fromEmail', correoRemitente);
      formData.append('fromPassword', passwordRemitente);
      formData.append('doSend', doSend ? 'true' : 'false');

      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('http://localhost:3001/api/send-custom-template', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      // Verificar que la respuesta sea JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no es JSON:', text.substring(0, 200));
        throw new Error('El servidor devolvió HTML en lugar de JSON. Verifica que el servidor esté corriendo correctamente.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error HTTP: ${response.status}` }));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Error al procesar el envío');
      }

      setResults(data.results);

      let message = `Procesados: ${data.results.total}\nExitosos: ${data.results.sent}\nProgramados: ${data.results.scheduled}\nFallidos: ${data.results.failed}`;
      
      if (data.results.scheduled > 0) {
        message += `\n\n${data.results.scheduled} correos fueron programados para envío futuro.`;
      }

      if (data.results.failed > 0) {
        const failedDetails = data.results.failedDetails || [];
        const errorExample = failedDetails.length > 0 ? failedDetails[0].error : 'Error desconocido';
        alert(`⚠️ Finalizado con errores\n\n${message}\n\nEjemplo de error: ${errorExample}`);
      } else {
        alert(`✅ Completado\n\n${message}\n${doSend ? '(Envío real)' : '(Previews guardados)'}`);
      }

    } catch (error) {
      console.error('Error en el proceso:', error);
      alert(`❌ Error en el proceso:\n${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="sistema-plantillas">
      {/* Botón Volver */}
      {onVolver && (
        <div className="btn-volver-container">
          <button className="btn-volver-plantillas" onClick={onVolver}>
            ← Volver al Menú
          </button>
        </div>
      )}

      {/* Header */}
      <div className="card-header">
        <div className="logo-circle">📧</div>
        <h1>Enviar Correos con Plantillas Personalizadas</h1>
        <p className="description">
          Selecciona una plantilla, descarga el Excel, complétalo y envía correos masivamente
        </p>
      </div>

      {/* Selector de Plantilla */}
      <div className="plantilla-selector">
        <label htmlFor="plantilla-select">Seleccionar Plantilla:</label>
        {cargandoPlantillas ? (
          <p>Cargando plantillas...</p>
        ) : (
          <select
            id="plantilla-select"
            value={plantillaSeleccionada?.id || ''}
            onChange={(e) => {
              const selected = plantillas.find(p => p.id === parseInt(e.target.value));
              setPlantillaSeleccionada(selected || null);
              setFile(null);
              setFileName('');
              setResults(null);
            }}
            className="select-plantilla"
          >
            <option value="">-- Selecciona una plantilla --</option>
            {plantillas.map(plantilla => (
              <option key={plantilla.id} value={plantilla.id}>
                {plantilla.nombre} {plantilla.descripcion ? `- ${plantilla.descripcion}` : ''}
              </option>
            ))}
          </select>
        )}
        {plantillas.length === 0 && !cargandoPlantillas && (
          <div className="no-plantillas-container">
            <p className="no-plantillas">No tienes plantillas creadas.</p>
            {onNavigate && (
              <button className="btn-crear-primera-plantilla" onClick={() => onNavigate('crear-plantilla')}>
                ➕ Crear Primera Plantilla
              </button>
            )}
          </div>
        )}
      </div>

      {plantillaSeleccionada && (
        <>
          {/* Información de la plantilla */}
          <div className="plantilla-info-panel">
            <h3>📋 Plantilla Seleccionada: {plantillaSeleccionada.nombre}</h3>
            {plantillaSeleccionada.descripcion && (
              <p>{plantillaSeleccionada.descripcion}</p>
            )}
            <div className="variables-info">
              <strong>Variables disponibles:</strong>
              {plantillaSeleccionada.variables ? (
                <ul>
                  {JSON.parse(plantillaSeleccionada.variables).map((varName, idx) => (
                    <li key={idx}>{varName}</li>
                  ))}
                </ul>
              ) : (
                <p>No hay variables definidas</p>
              )}
            </div>
          </div>

          {/* Correo Remitente */}
          <div className="remitente-container">
            <label htmlFor="correo-remitente">Correo Remitente (Desde):</label>
            <input
              type="email"
              id="correo-remitente"
              value={correoRemitente}
              onChange={(e) => setCorreoRemitente(e.target.value)}
              placeholder="micita@umit.com.co"
              className="input-remitente"
            />
            <label htmlFor="password-remitente" className="label-password">
              Contraseña de Aplicaciones:
            </label>
            <input
              type="password"
              id="password-remitente"
              value={passwordRemitente}
              onChange={(e) => setPasswordRemitente(e.target.value)}
              placeholder="Ingrese la contraseña de aplicaciones"
              className="input-remitente"
            />
            <small>
              Este será el correo desde el cual se enviarán los mensajes. 
              La contraseña de aplicaciones se obtiene desde la configuración de seguridad de Gmail.
            </small>
          </div>

          {/* Instrucciones */}
          <div className="instructions-panel">
            <h3>📋 Instrucciones:</h3>
            <ol>
              <li><strong>Descargue la plantilla Excel</strong> con las columnas necesarias.</li>
              <li>Complete el archivo con los datos de los destinatarios.</li>
              <li>Adjunte el archivo completo a continuación.</li>
              <li>Haga clic en <strong>"Enviar Correos"</strong> para iniciar el proceso.</li>
            </ol>
          </div>

          {/* Botón descargar plantilla */}
          <button className="download-btn" onClick={downloadTemplate}>
            ⬇ Descargar Plantilla Excel
          </button>

          {/* Área de drop */}
          <div 
            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-input"
              accept=".csv,.xlsx"
              onChange={handleFileSelect}
              className="input-file-hidden"
            />
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

          {/* Barra de progreso */}
          {isProcessing && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ '--progress-width': `${progress}%` }}
                ></div>
              </div>
              <p className="progress-text">Procesando... {progress}%</p>
            </div>
          )}

          {/* Botones de acción */}
          {file && !isProcessing && (
            <div className="send-actions">
              <button 
                className="btn-preview-send"
                onClick={() => enviarCorreos(false)}
                disabled={!file}
              >
                👁️ Generar Previews
              </button>
              <button 
                className="btn-send"
                onClick={() => {
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

          {/* Resultados */}
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
        </>
      )}
    </div>
  );
};

export default SistemaPlantillas;

