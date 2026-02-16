import { useState, useEffect } from 'react';

export default function useEnvios() {

  // ---------------- ESTADOS ----------------
  const [archivo, setArchivo] = useState(null);
  const [fileName, setFileName] = useState('');

  const [modoEnvio, setModoEnvio] = useState('inmediato');
  const [fechaProgramada, setFechaProgramada] = useState('');

  const [remitentes, setRemitentes] = useState([]);
  const [remitenteId, setRemitenteId] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  // ---------------- CARGAR REMITENTES ----------------
  useEffect(() => {
    const cargarRemitentes = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/remitentes');
        const data = await res.json();

        setRemitentes(data);

        if (data.length > 0) {
          setRemitenteId(data[0].id); // selecciona el primero
        }

      } catch (error) {
        console.error("Error cargando remitentes:", error);
      }
    };

    cargarRemitentes();
  }, []);

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

    if (!remitenteId) {
      alert('Debe seleccionar un remitente');
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
    formData.append('remitenteId', remitenteId); // 🔥 CAMBIO CLAVE
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
    archivo,
    fileName,
    modoEnvio,
    fechaProgramada,

    remitentes,
    remitenteId,

    isProcessing,
    progress,
    results,

    setModoEnvio,
    setFechaProgramada,
    setRemitenteId,

    handleArchivo,
    enviarCorreos
  };
}
