import "./ModalVistaPlantilla.css";
import { notifyError, notifyWarning, notifySuccess } from "../../utils/notificaciones";
import { useUsuario } from "../../context/UserContext.jsx";

export default function ModalVistaPlantilla({
  plantilla,
  onClose,
  onEditar
}) {
  const { usuario } = useUsuario();
  
  console.log("Usuario desde contexto (RAW):", usuario);
  console.log("Keys usuario:", usuario ? Object.keys(usuario) : "null");

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <header className="modal-header">
          <h2>{plantilla.nom_plantilla}</h2>
        </header>

        <p className="modal-description">{plantilla.descripcion}</p>
        <div className="modal-preview" dangerouslySetInnerHTML={{ __html: plantilla.html_content }} />

        <footer className="modal-actions">
          <button className="btn-edit" onClick={onEditar}>
            ✏️ Editar
          </button>

          <button className="btn-download" onClick={() => {
              if (!usuario) {
                notifyError("No se pudo identificar el usuario ❌");
                return;
              }

              const API_URL = "http://localhost:3001";

              try {
                window.open(
                  `${API_URL}/api/templates/${plantilla.id}/download-excel`,
                  "_blank"
                );

                notifySuccess("Descargando archivo Excel 📥");

              } catch (error) {
                notifyError("Error al descargar el archivo");
              }
            }}
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