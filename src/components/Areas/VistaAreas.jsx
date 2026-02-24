import { useEffect, useState } from "react";
import {notifySuccess, notifyError} from "../../utils/notificaciones";
import axios from "axios";
import "./VistaAreas.css"; 

import ModalVistaPlantilla from "../modals/ModalVistaPlantilla";
import ModalEditarPlantilla from "../modals/ModalEditarPlantilla";

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("usuarioLogueado"));
    return user?.documento || null;
  } catch {
    return null;
  }
};

function VistaArea({ areaId, nombreArea }) {
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [plantillaEditando, setPlantillaEditando] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarPlantillas = async () => {
      try {
        const res = await axios.get("/api/templates", {
          params: { area_id: areaId }
        });

        setPlantillas(res.data);
      } catch (error) {
        console.error("Error cargando plantillas", error);
      } finally {
        setLoading(false);
      }
    };

    if (areaId) {
      setLoading(true);
      cargarPlantillas();
    }
  }, [areaId]);

  return (
    <div className="calidad-container">
      <h1 className="main-title">{nombreArea}</h1>
      <p className="main-subtitle">Plantillas disponibles</p>

      {loading ? (
        <p className="loading-state">Cargando plantillas...</p>
      ) : plantillas.length === 0 ? (
        <p className="empty-state">No hay plantillas registradas</p>
      ) : (
        <div className="plantillas-list">
          {plantillas.map((p) => (
            <div className="plantilla-card" key={p.id}
              onClick={() =>
                setPlantillaSeleccionada({
                  id: p.id,
                  nombre: p.nom_plantilla,
                  descripcion: p.descripcion,
                  contenido: p.html_content
                })
              }
            >
              <div className="plantilla-info">
                <h3 className="plantilla-nombre">
                  {p.nom_plantilla || "Sin nombre"}
                </h3>
                <p className="plantilla-descripcion">
                  {p.descripcion}
                </p>
              </div>

              <div className="plantilla-action">➜</div>
            </div>
          ))}
        </div>
      )}

      {plantillaSeleccionada && (
        <ModalVistaPlantilla
          plantilla={{
            id: plantillaSeleccionada.id,
            nom_plantilla: plantillaSeleccionada.nombre,
            descripcion: plantillaSeleccionada.descripcion,
            html_content: plantillaSeleccionada.contenido
          }}
          onClose={() => setPlantillaSeleccionada(null)}
          onEditar={() => {
            setPlantillaEditando(plantillaSeleccionada);
            setPlantillaSeleccionada(null);
          }}
        />
      )}

      {plantillaEditando && (
        <ModalEditarPlantilla
          plantilla={plantillaEditando}
          onClose={() => setPlantillaEditando(null)}
          onSave={async (plantillaActualizada) => {
            try {
              const userId = getUserId();

              if (!userId) {
                notifyError("No se pudo identificar el usuario ❌");
                return;
              }

              const res = await axios.put(
                `/api/templates/${plantillaActualizada.id}`,
                {
                  userId,
                  descripcion: plantillaActualizada.descripcion,
                  htmlContent: plantillaActualizada.contenido
                }
              );

              if (res.status === 200) {

                setPlantillas(prev =>
                  prev.map(p =>
                    p.id === plantillaActualizada.id
                      ? {
                          ...p,
                          descripcion: plantillaActualizada.descripcion,
                          html_content: plantillaActualizada.contenido
                        }
                      : p
                  )
                );

                notifySuccess("Plantilla actualizada correctamente 📄✅");

                setPlantillaEditando(null);

              } else {
                notifyError("Error al actualizar plantilla");
              }

            } catch (error) {
              console.error("Error guardando plantilla:", error);
              notifyError("No se pudo guardar la plantilla ❌");
            }
          }}
        />
      )}
    </div>
  );
}

export default VistaArea;
