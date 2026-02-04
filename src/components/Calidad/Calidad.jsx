import { useEffect, useState } from "react";
import axios from "axios";
import "./Calidad.css";
import ModalVistaPlantilla from "../modals/ModalVistaPlantilla";

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
  const [modoEdicion, setModoEdicion] = useState(false);
  const [variables, setVariables] = useState([]);
  const [descripcionEditada, setDescripcionEditada] = useState("");
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

      {/* MODAL PREVIEW */}
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
            setDescripcionEditada(plantillaSeleccionada.descripcion);
            setVariables(extraerVariables(plantillaSeleccionada.contenido));
            setModoEdicion(true);
          }}
        />
      )}

      {modoEdicion && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Editar plantilla</h2>

            <label>Descripción</label>
            <textarea
              value={descripcionEditada}
              onChange={(e) => setDescripcionEditada(e.target.value)}
            />

            <h3>Variables</h3>

            {variables.length === 0 ? (
              <p>No hay variables en esta plantilla</p>
            ) : (
              variables.map((v, i) => (
                <div key={i} className="variable-row">
                  <label>{v.nombre}</label>
                  <input
                    type="text"
                    value={v.valor}
                    onChange={(e) => {
                      const nuevas = [...variables];
                      nuevas[i].valor = e.target.value;
                      setVariables(nuevas);
                    }}
                  />
                </div>
              ))
            )}

            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={() => {
                  console.log("Descripción:", descripcionEditada);
                  console.log("Variables:", variables);
                  alert("Listo para guardar / generar Excel");
                  setModoEdicion(false);
                }}
              >
                Guardar
              </button>

              <button
                className="btn-cancel"
                onClick={() => setModoEdicion(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calidad;
