import "./ModalVistaPlantilla.css";

export default function ModalVistaPlantilla({
  plantilla,
  onClose,
  onEditar
}) {
  console.log("Rendering ModalVistaPlantilla with plantilla:", plantilla);
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <header className="modal-header">
          <h2>{plantilla.nom_plantilla}</h2>
        </header>

        <p className="modal-description">
          {plantilla.descripcion}
        </p>

        <div
          className="modal-preview"
          dangerouslySetInnerHTML={{ __html: plantilla.html_content }}
        />

        <footer className="modal-actions">
          <button className="btn-edit" onClick={onEditar}>
            ✏️ Editar
          </button>

          <button
            className="btn-download"
            onClick={() =>
              window.open(`/api/templates/${plantilla.id}/excel`, "_blank")
            }
          >
            📥 Descargar Excel
          </button>

          <button className="btn-cancel" onClick={onClose}>
            ❌ Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}
