import useEnvios from './useEnvios';
import './Envios.css';

export default function Envios() {
  const {
    archivo,
    fileName,
    modoEnvio,
    fechaProgramada,
    isProcessing,

    setModoEnvio,
    setFechaProgramada,

    remitentes,
    remitenteId,
    setRemitenteId,

    handleArchivo,
    enviarCorreos
  } = useEnvios();

  return (
    <div className="envios-container">
      <h2>Envío de Correos</h2>

      {/* TIPO DE ENVÍO */}
      <label>Tipo de envío</label>
      <select
        value={modoEnvio}
        onChange={(e) => setModoEnvio(e.target.value)}
      >
        <option value="inmediato">Enviar ahora</option>
        <option value="programado">Programado</option>
      </select>

      {/* REMITENTE */}
      <label>Remitente</label>
      <select value={remitenteId}
        onChange={(e) => setRemitenteId(e.target.value)}>
        {remitentes.map(rem => (
          <option key={rem.id} value={rem.id}>
            {rem.nombre} - {rem.correo}
          </option>
        ))}
      </select>

      {/* FECHA PROGRAMADA */}
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

      {/* ARCHIVO */}
      <label>Archivo Excel</label>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleArchivo}
      />

      {archivo && (
        <p className="file-name">📄 {fileName}</p>
      )}

      {/* BOTÓN */}
      <button
        onClick={() => enviarCorreos({ preview: false })}
        disabled={isProcessing}
      >
        {modoEnvio === 'programado'
          ? 'Programar envío'
          : 'Enviar correos'}
      </button>
    </div>
  );
}