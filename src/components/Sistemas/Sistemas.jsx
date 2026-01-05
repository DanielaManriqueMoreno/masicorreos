// Sistemas.jsx
import "./Sistemas.css";

function Sistemas({ onSelect, onVolver }) {
  return (
    <div className="sistemas-container">
      <div style={{ textAlign: "left", marginBottom: "20px" }}>
        <button 
          className="btn-volver"
          onClick={onVolver}
        >
          ← Volver al Menú
        </button>
      </div>
      
      <h1 className="main-title">Sistema de Sistemas</h1>
      <p className="main-subtitle">Selecciona el tipo de operación del sistema</p>
      
      <div className="cards-wrapper">
        <div className="card card-blue" onClick={() => onSelect("actualizacion_sistema")}>
          <div className="card-icon">🔄</div>
          <h3>Actualización sistema</h3>
          <p>Actualizaciones y mantenimiento del sistema informático</p>
        </div>
        
        <div className="card card-red" onClick={() => onSelect("ventanas_mantenimiento")}>
          <div className="card-icon">🛠️</div>
          <h3>Ventanas mantenimiento</h3>
          <p>Gestión de ventanas de mantenimiento programado</p>
        </div>
      </div>
    </div>
  );
}

export default Sistemas;

