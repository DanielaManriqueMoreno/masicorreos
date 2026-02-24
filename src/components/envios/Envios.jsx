import useEnvios from './useEnvios';
import { toast } from 'react-toastify';
import { useRef } from "react";
import './Envios.css';

export default function Envios({ user }) {

  const {
    archivo,
    fileName,
    modoEnvio,
    fechaProgramada,
    isProcessing,

    setModoEnvio,
    setFechaProgramada,

    remitentes,
    remitente_id,
    setRemitente_id,

    plantillas,
    plantilla_id,
    setPlantilla_id,

    handleArchivo,
    enviarCorreos
  } = useEnvios(user);
  const fileInputRef = useRef(null);
  const handleSubmit = async () => {

    if (!remitente_id || !plantilla_id || !archivo) {
      toast.warning("Todos los campos son obligatorios ⚠️");
      return;
    }

    if (modoEnvio === "programado" && !fechaProgramada) {
      toast.warning("Debe seleccionar fecha para envío programado ⏳");
      return;
    }

    try {
      const response = await enviarCorreos({ preview: false });

      if (response?.success) {
        toast.success(
          modoEnvio === "programado"
            ? "Envío programado correctamente 📅"
            : "Correos enviados correctamente ✅"
        );
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        toast.error(response?.message || "Error al procesar el envío ❌");
      }

    } catch (error) {
      toast.error("Error inesperado del servidor ❌");
    }
  };


  return (
    <div className="envios-container">
      <h2>Envío de Correos</h2>

      <label>Tipo de envío</label>
      <select value={modoEnvio} onChange={(e) => setModoEnvio(e.target.value)}>
        <option value="inmediato">Enviar ahora</option>
        <option value="programado">Programado</option>
      </select>

      <label>Remitente</label>
      <select
        value={remitente_id}
        onChange={(e) => setRemitente_id(e.target.value)}
      >
        <option value="">Seleccione remitente</option>
        {remitentes.map(rem => (
          <option key={rem.id} value={rem.id}>
            {rem.nombre} - {rem.correo}
          </option>
        ))}
      </select>

      {modoEnvio === 'programado' && (
        <>
          <label>Fecha y hora</label>
          <input
            type="datetime-local"
            value={fechaProgramada}
            onChange={(e) => setFechaProgramada(e.target.value)}
          />
        </>
      )}

      <label>Plantilla</label>
      <select
        value={plantilla_id}
        onChange={(e) => setPlantilla_id(e.target.value)}
      >
        <option value="">Seleccione una plantilla</option>
        {plantillas.map(p => (
          <option key={p.id} value={p.id}>
            {p.nom_plantilla}
          </option>
        ))}
      </select>

      <label>Archivo Excel</label>
      <input
        type="file"
        accept=".xlsx"
        ref={fileInputRef}
        onChange={handleArchivo}
      />

      {archivo && (
        <p className="file-name">📄 {fileName}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isProcessing}
      >
        {isProcessing
          ? "Procesando..."
          : modoEnvio === 'programado'
            ? 'Programar envío'
            : 'Enviar correos'}
      </button>
    </div>
  );
}