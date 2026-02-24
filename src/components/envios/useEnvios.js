import { useState, useEffect } from 'react';

export default function useEnvios(user) {

  const [archivo, setArchivo] = useState(null);
  const [fileName, setFileName] = useState('');

  const [modoEnvio, setModoEnvio] = useState('inmediato');
  const [fechaProgramada, setFechaProgramada] = useState('');

  const [remitentes, setRemitentes] = useState([]);
  const [remitente_id, setRemitente_id] = useState('');

  const [plantillas, setPlantillas] = useState([]);
  const [plantilla_id, setPlantilla_id] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user?.documento) return;

    const cargarDatos = async () => {
      try {
        const resPlantillas = await fetch(
          `http://localhost:3001/api/plantillas-disponibles?documento=${user.documento}`
        );
        setPlantillas(await resPlantillas.json());

        const resRemitentes = await fetch(
          `http://localhost:3001/api/remitentes?documento=${user.documento}`
        );
        setRemitentes(await resRemitentes.json());

      } catch (error) {
        console.error(error);
      }
    };

    cargarDatos();

  }, [user?.documento]);

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

  const enviarCorreos = async ({ preview = false }) => {

    if (!archivo) {
      return { success: false, message: 'Debe cargar un archivo' };
    }

    if (!remitente_id) {
      return { success: false, message: 'Debe seleccionar un remitente' };
    }

    if (!plantilla_id) {
      return { success: false, message: 'Debe seleccionar una plantilla' };
    }

    if (modoEnvio === 'programado' && !fechaProgramada) {
      return { success: false, message: 'Debe seleccionar una fecha' };
    }

    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('modoEnvio', modoEnvio);
    formData.append('programadoPara', fechaProgramada || '');
    formData.append('remitente_id', remitente_id);
    formData.append('plantilla_id', plantilla_id);
    formData.append('documento', user.documento);
    formData.append('preview', preview);

    try {
      setIsProcessing(true);

      const res = await fetch('http://localhost:3001/api/envios', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!data.ok) {
        return { success: false, message: data.message || 'Error en el envío' };
      }

      // RESET AUTOMÁTICO DEL FORMULARIO
      setArchivo(null);
      setFileName('');
      setRemitente_id('');
      setPlantilla_id('');
      setFechaProgramada('');
      setModoEnvio('inmediato');

      return { success: true };

    } catch (error) {
      console.error(error);
      return { success: false, message: 'Error enviando correos' };

    } finally {
      setIsProcessing(false);
    }
  };

  return {
    archivo,
    fileName,
    modoEnvio,
    fechaProgramada,
    remitentes,
    remitente_id,
    plantillas,
    plantilla_id,
    isProcessing,
    setModoEnvio,
    setFechaProgramada,
    setRemitente_id,
    setPlantilla_id,
    handleArchivo,
    enviarCorreos
  };
}