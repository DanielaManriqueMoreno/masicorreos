import { useState } from "react";
import { notifyWarning } from "../../utils/notificaciones";
import "./ModalEditarPlantilla.css";

export default function ModalEditarPlantilla({
  plantilla,
  onClose,
  onSave
}) {
  const [descripcion, setDescripcion] = useState(plantilla.descripcion || "");
  const [contenido, setContenido] = useState(plantilla.contenido || "");

  const extraerVariables = (html) => {
    const regex = /{{(.*?)}}/g;
    return [...html.matchAll(regex)].map(m => m[1]);
  };

  const handleGuardar = () => {

    if (!descripcion.trim()) {
      notifyWarning("La descripción es obligatoria ⚠️");
      return;
    }

    if (!contenido.trim()) {
      notifyWarning("El contenido de la plantilla no puede estar vacío ⚠️");
      return;
    }

    onSave({
      ...plantilla,
      descripcion,
      contenido
    });
  };

  return (
    <div className="editar-overlay">
      <div className="editar-modal">
        <header className="editar-header">
          <h2>Editar plantilla</h2>
        </header>

        <div className="editar-body">
          <label>Descripción</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={4}/>
          <label>Contenido de la plantilla</label>
          <textarea value={contenido}  onChange={e => setContenido(e.target.value)} rows={8} />
        </div>
        

        <footer className="editar-actions">
          <button className="editar-button" onClick={handleGuardar}>
            💾 Guardar
          </button>

          <button className="editar-button" onClick={onClose}>
            ❌ Cancelar
          </button>
        </footer>
      </div>
    </div>
  );
}
