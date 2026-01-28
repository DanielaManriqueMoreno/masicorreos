import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const useEnvioMasivo = (plantillaSeleccionada, usuario) => {

  // ---------------- ESTADOS ----------------
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [correoRemitenteEnvio, setCorreoRemitenteEnvio] = useState('micita@umit.com.co');

  // ---------------- DRAG & DROP ----------------
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const processFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx'].includes(ext)) {
      alert('Formato no soportado (.csv o .xlsx)');
      return;
    }
    setFile(file);
    setFileName(file.name);
  };

  // ---------------- EXCEL ----------------
  const descargarPlantillaExcel = () => {
    if (!plantillaSeleccionada?.variables?.length) {
      alert('No hay campos dinámicos');
      return;
    }

    const variables = plantillaSeleccionada.variables.filter(
      v => v.toLowerCase() !== 'email'
    );

    const data = [
      { Email: 'correo@ejemplo.com', ...Object.fromEntries(variables.map(v => [v, ''])) }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      'Plantilla.xlsx'
    );
  };

  // ---------------- ENVÍO ----------------
  const enviarCorreos = async (doSend = false) => {
    if (!file || !plantillaSeleccionada || !usuario?.id) {
      alert('Faltan datos');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('userId', usuario.id);
      form.append('templateId', plantillaSeleccionada.id);
      form.append('fromEmail', correoRemitenteEnvio);
      form.append('doSend', doSend ? 'true' : 'false');

      const res = await fetch('http://localhost:3001/api/send-custom-template', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setResults(data.results);
      setProgress(100);
      alert('✅ Proceso completado');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------- EXPORT ----------------
  return {
    file,
    fileName,
    dragActive,
    isProcessing,
    progress,
    results,
    correoRemitenteEnvio,
    setCorreoRemitenteEnvio,
    handleDrag,
    handleDrop,
    handleFileSelect,
    enviarCorreos,
    descargarPlantillaExcel,
  };
};
