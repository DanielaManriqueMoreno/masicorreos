import { useState } from 'react';

export default function useEnvios() {
  // ---------------- ESTADOS ----------------
  const [archivo, setArchivo] = useState(null);
  const [fileName, setFileName] = useState('');

  const [modoEnvio, setModoEnvio] = useState('inmediato'); // inmediato | programado
  const [fechaProgramada, setFechaProgramada] = useState('');

  const [correoRemitenteEnvio, setCorreoRemitenteEnvio] =
    useState('micita@umit.com.co');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  // ---------------- ARCHIVO ----------------
  const handleArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      alert('Solo se permiten archivos Excel (.xlsx)');
      return;
    }

    setArchivo(file);
    setFileName(file.name);
  };

  // ---------------- ENVÍO ----------------
  const enviarCorreos = async ({ preview = false }) => {
    if (!archivo) {
      alert('Debe cargar un archivo');
      return;
    }

    if (modoEnvio === 'programado' && !fechaProgramada) {
      alert('Debe seleccionar una fecha');
      return;
    }

    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('modoEnvio', modoEnvio);
    formData.append('programadoPara', fechaProgramada || '');
    formData.append('fromEmail', correoRemitenteEnvio);
    formData.append('preview', preview);

    try {
      setIsProcessing(true);
      setProgress(20);

      const res = await fetch('/api/envios', {
        method: 'POST',
        body: formData
      });

      setProgress(70);

      const data = await res.json();

      if (!data.ok) {
        alert(data.message || 'Error en el envío');
        return;
      }

      setResults(data.results);
      setProgress(100);

    } catch (error) {
      console.error(error);
      alert('Error enviando correos');
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------- EXPORT ----------------
  return {
    // estados
    archivo,
    fileName,
    modoEnvio,
    fechaProgramada,
    correoRemitenteEnvio,
    isProcessing,
    progress,
    results,

    // setters
    setModoEnvio,
    setFechaProgramada,
    setCorreoRemitenteEnvio,

    // handlers
    handleArchivo,
    enviarCorreos
  };
}