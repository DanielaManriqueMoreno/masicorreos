import useEnvios from './useEnvios';
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

  return (
    <div className="envios-container">
      <h2>Envío de Correos</h2>

      <label>Tipo de envío</label>
      <select
        value={modoEnvio}
        onChange={(e) => setModoEnvio(e.target.value)}
      >
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
        onChange={handleArchivo}
      />

      {archivo && (
        <p className="file-name">📄 {fileName}</p>
      )}

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
