// Calidad.jsx
import { useEffect, useState } from "react";
import "./Calidad.css";

function Calidad({ onVolver }) {
  const AREA_ID = 2; // Calidad
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);

  useEffect(() => {
    fetch(`/api/templates?area_id=${AREA_ID}`)
      .then(res => res.json())
      .then(data => setPlantillas(data));
  }, []);

  return (
    <div className="calidad-container">
      <div className="btn-volver-container-full">
        <button className="btn-volver" onClick={onVolver}>
          ← Volver al Menú
        </button>
      </div>

      <h1 className="main-title">Calidad</h1>
      <p className="main-subtitle">
        Plantillas disponibles para el área de calidad
      </p>

      <div className="cards-wrapper">
        {plantillas.length === 0 ? (
          <p>No hay plantillas creadas aún</p>
        ) : (
          plantillas.map(p => (
            <div
              key={p.id}
              className="card card-purple"
              onClick={() => setPlantillaSeleccionada(p)}
            >
              <div className="card-icon">📧</div>
              <h3>{p.nombre}</h3>
              <p>{p.descripcion}</p>
            </div>
          ))
        )}
      </div>

      {plantillaSeleccionada && (
        <ModalPlantilla
          plantilla={plantillaSeleccionada}
          onClose={() => setPlantillaSeleccionada(null)}
        />
      )}
    </div>
  );
}

export default Calidad;
