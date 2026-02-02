import { useState } from "react";
import "./ModalPlantilla.css";

export default function ModalEditarPlantilla({
  plantilla,
  onClose,
  onSave
}) {
  const [descripcion, setDescripcion] = useState(plantilla.descripcion || "");

  const handleGuardar = () => {
    onSave({
      ...plantilla,
      descripcion
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <header className="modal-header">
          <h2>Editar plantilla</h2>
          <button className="modal-close" onClick={onClose}>✖</button>
        </header>

        <div className="modal-body">
          <label>Descripción</label>
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            rows={4}
          />
        </div>

        <footer className="modal-actions">
          <button className="btn-edit" onClick={handleGuardar}>
            💾 Guardar
          </button>

          <button className="btn-cancel" onClick={onClose}>
            ❌ Cancelar
          </button>
        </footer>
      </div>
    </div>
  );
}
