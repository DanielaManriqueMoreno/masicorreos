// SistemaDengue.jsx

import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { sendDengueEmails } from '../../api';
import "./SistemaDengue.css";

const SistemaDengue = ({ onVolver, usuario }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Columnas requeridas para Dengue (solo Email)
  const REQUIRED_COLUMNS = ["Email"];

  const OPTIONAL_COLUMNS = ["Fecha Programada", "Hora Programada"];

  // Validación de email (igual que en Python)
  const isValidEmail = (email) => {
    if (!email || email === '') return false;
    
    const emailStr = String(email).trim().toLowerCase();
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!pattern.test(emailStr)) return false;
    
    const invalidDomains = ['example.com', 'test.com', 'invalid.com', 'email.com'];
    const domain = emailStr.split('@')[1];
    
    return !invalidDomains.includes(domain);
  };

  // Descargar plantilla
  const downloadTemplate = () => {
    try {
      const columns = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];
      
      // Datos de ejemplo
      const data = [
        {
          "Email": "destinatario@example.com",
          "Fecha Programada": "",
          "Hora Programada": ""
        },
        {
          "Email": "destinatario2@example.com",
          "Fecha Programada": new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          "Hora Programada": "15:30"
        }
      ];

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Plantilla Dengue");
      
      // Crear archivo Excel
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, 'Plantilla_Dengue.xlsx');
      
      console.log('Plantilla descargada');
      
      alert('✅ Plantilla descargada exitosamente!\n\nNota: Las columnas "Fecha Programada" y "Hora Programada" son opcionales. Déjelas vacías para envío inmediato.');
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

  // Procesar archivo
  const processFile = (file) => {
    const fileExt = file.name.toLowerCase().split('.').pop();
    
    if (!['csv', 'xlsx'].includes(fileExt)) {
      alert('❌ Formato no soportado. Use un archivo .csv o .xlsx válido.');
      return;
    }

    // Verificar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ Archivo demasiado grande. Límite: 10MB');
      return;
    }

    setFile(file);
    setFileName(file.name);
    console.log('Archivo cargado:', file.name);
  };

  // Leer archivo Excel/CSV
  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Validar datos
  const validateData = (data) => {
    const missingColumns = REQUIRED_COLUMNS.filter(col => !data[0] || !Object.keys(data[0]).includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`Faltan columnas:\n- ${missingColumns.join('\n- ')}`);
    }

    const invalidEmails = [];
    data.forEach((row, index) => {
      const email = row.Email;
      if (email && !isValidEmail(email)) {
        invalidEmails.push({ row: index + 2, email });
      }
    });

    return invalidEmails;
  };

  // Enviar emails usando la API real
  const sendEmails = async (file, isRealSend) => {
    try {
      if (!usuario || !usuario.id) {
        throw new Error('Usuario no autenticado');
      }

      setProgress(0);
      
      // Llamar a la API
      const result = await sendDengueEmails(
        file,
        usuario.id,
        usuario.usuario || usuario.nombre,
        isRealSend
      );

      // Actualizar progreso gradualmente
      let progressValue = 0;
      const interval = setInterval(() => {
        progressValue += 10;
        if (progressValue <= 90) {
          setProgress(progressValue);
        } else {
          clearInterval(interval);
          setProgress(100);
        }
      }, 100);

      // Esperar a que termine la petición
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(interval);
      setProgress(100);

      return result.results;
    } catch (error) {
      throw error;
    }
  };

  // Procesar envío
  const processSend = async (isRealSend) => {
    if (!file) {
      alert('❌ Adjunte un archivo .csv o .xlsx antes de continuar.');
      return;
    }

    if (!usuario || !usuario.id) {
      alert('❌ Usuario no autenticado. Por favor, inicia sesión nuevamente.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    try {
      // Leer archivo para validación previa
      const data = await readFile(file);
      
      if (data.length === 0) {
        throw new Error('El archivo está vacío');
      }

      // Validar datos
      const invalidEmails = validateData(data);

      if (invalidEmails.length > 0) {
        const msg = `Se encontraron ${invalidEmails.length} emails inválidos:\n\n${
          invalidEmails.slice(0, 10).map(({ row, email }) => `Fila ${row}: ${email}`).join('\n')
        }${invalidEmails.length > 10 ? `\n... y ${invalidEmails.length - 10} más` : ''}`;
        
        if (!confirm(msg + '\n\n¿Desea continuar de todos modos?')) {
          setIsProcessing(false);
          return;
        }
      }

      // Ejecutar envío usando la API real
      const results = await sendEmails(file, isRealSend);
      setResults(results);

      // Mostrar resultados
      let message = `Procesados: ${results.total}\nExitosos: ${results.sent}\nProgramados: ${results.scheduled}\nFallidos: ${results.failed}`;
      
      if (results.scheduled > 0) {
        message += `\n\n${results.scheduled} correos fueron programados para envío futuro.`;
      }

      if (results.failed > 0) {
        const failedDetails = results.failedDetails || [];
        const errorExample = failedDetails.length > 0 ? failedDetails[0].error : 'Error desconocido';
        alert(`⚠️ Finalizado con errores\n\n${message}\n\nEjemplo de error: ${errorExample}`);
      } else {
        alert(`✅ Completado\n\n${message}\n${isRealSend ? '(Envío real)' : '(Previews guardados)'}`);
      }

    } catch (error) {
      console.error('Error en el proceso:', error);
      alert(`❌ Error en el proceso:\n${error.message}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Renderizar resultados
  const renderResults = () => {
    if (!results) return null;

    return (
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
            <span className="value">{results.failed || 0}</span>
          </div>
        </div>
        
        {results.failed > 0 && results.failedDetails && (
          <div className="errors-list">
            <h4>Errores encontrados:</h4>
            {results.failedDetails.slice(0, 5).map((error, index) => (
              <div key={index} className="error-item">
                Fila {error.row}: {error.error}
              </div>
            ))}
            {results.failedDetails.length > 5 && (
              <div className="more-errors">... y {results.failedDetails.length - 5} más</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="sistema-dengue">
      {/* Botón Volver */}
      {onVolver && (
        <div className="btn-volver-container">
          <button 
            className="btn-volver-dengue"
            onClick={onVolver}
          >
            ← Volver al Menú
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className="card-header">
        <div className="logo-circle">🦟</div>
        <h1>Información sobre Dengue - Calidad</h1>
        <p className="description">
          Esta herramienta facilita el envío de información sobre prevención del dengue a los destinatarios desde el correo{' '}
          <a href="mailto:calidad@umit.com.co">calidad@umit.com.co</a>.
        </p>
      </div>

      {/* Instrucciones */}
      <div className="instructions-panel">
        <h3>📋 Instrucciones:</h3>
        <ol>
          <li><strong>Descargue la plantilla</strong> para asegurar el formato correcto.</li>
          <li>Complete el archivo y <strong>adjúntelo</strong> a continuación.</li>
          <li>Haga clic en <strong>"Enviar Información Dengue"</strong> para iniciar el proceso.</li>
        </ol>
      </div>

      {/* Botón descargar plantilla */}
      <button className="download-btn" onClick={downloadTemplate}>
        ⬇ Descargar Plantilla Dengue
      </button>

      {/* Área de drop */}
      <div 
        className={`drop-area ${dragActive ? 'drag-active' : ''} ${fileName ? 'file-selected' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input-dengue').click()}
      >
        <div className="drop-icon">📁</div>
        <div className="drop-title">
          <span className="accent">Subir un archivo</span> o arrastra y suelta
        </div>
        <div className="drop-subtitle">.xlsx, .csv (máx 10MB)</div>
        {fileName && (
          <div className="selected-file">📄 {fileName}</div>
        )}
      </div>

      <input
        id="file-input-dengue"
        type="file"
        accept=".csv,.xlsx"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Barra de progreso */}
      {isProcessing && (
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{progress}%</div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="action-buttons">
        <button 
          className="send-btn"
          onClick={() => processSend(true)}
          disabled={!file || isProcessing}
        >
          {isProcessing ? 'Procesando...' : 'Enviar Información Dengue'}
        </button>
        
        <button 
          className="preview-btn"
          onClick={() => processSend(false)}
          disabled={!file || isProcessing}
        >
          Generar Previews
        </button>
      </div>

      {/* Resultados */}
      {renderResults()}
    </div>
  );
};

export default SistemaDengue;

