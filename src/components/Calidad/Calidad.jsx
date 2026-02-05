import { useEffect, useState } from "react";
import axios from "axios";
import "./Calidad.css";
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

const extraerVariables = (html) => {
  const regex = /{{(.*?)}}/g;
  const matches = [...html.matchAll(regex)];

  return matches.map(m => ({
    nombre: m[1],
    valor: ""
  }));
};

function Calidad({ onVolver }) {
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [plantillaEditando, setPlantillaEditando] = useState(null);
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(true);

  const AREA_ID_CALIDAD = 6; 

  useEffect(() => {
    const cargarPlantillas = async () => {
      try {
        const res = await axios.get("/api/templates", {
          params: { area_id: AREA_ID_CALIDAD }
        });

        console.log("Plantillas Calidad:", res.data);
        setPlantillas(res.data);
      } catch (error) {
        console.error("Error cargando plantillas de calidad", error);
      } finally {
        setLoading(false);
      }
    };

    cargarPlantillas();
  }, []);
console.log("Plantilla seleccionada:", plantillaSeleccionada);
console.log("Contenido render:",plantillaSeleccionada?.contenido);

  return (
    <div className="calidad-container">
      <h1 className="main-title">Calidad</h1>
      <p className="main-subtitle">Plantillas disponibles</p>

      {loading ? (
        <p className="loading-state">Cargando plantillas...</p>
      ) : plantillas.length === 0 ? (
        <p className="empty-state">No hay plantillas registradas</p>
      ) : (
        <div className="plantillas-list">
          {plantillas.map((p) => (
            <div className="plantilla-card"
              key={p.id}
              onClick={() => setPlantillaSeleccionada({
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

              <div className="plantilla-action">
                ➜
              </div>
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
                  alert("No se pudo identificar el usuario");
                  return;
                }

                const payload = {
                  userId,
                  descripcion: plantillaActualizada.descripcion,
                  htmlContent: plantillaActualizada.contenido
                };

                await axios.put(
                  `/api/templates/${plantillaActualizada.id}`,
                  payload
                );

                // 🔄 actualizar lista en memoria
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

                // cerrar modal
                setPlantillaEditando(null);

              } catch (error) {
                console.error("Error guardando plantilla:", error);
                alert("No se pudo guardar la plantilla");
              }
            }}
          />
        )}
    </div>
  );
}

export default Calidad;
