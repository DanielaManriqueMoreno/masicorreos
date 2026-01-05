// Radicacion.jsx
import "./Radicacion.css";

function Radicacion({ onSelect, onVolver }) {
  return (
    <div className="radicacion-container">
      <div style={{ textAlign: "left", marginBottom: "20px" }}>
        <button 
          className="btn-volver"
          onClick={onVolver}
        >
          ← Volver al Menú
        </button>
      </div>
      
      <h1 className="main-title">Sistema de Radicación</h1>
      <p className="main-subtitle">Selecciona el tipo de operación de radicación</p>
      
      <div className="cards-wrapper">
        <div className="card card-blue" onClick={() => onSelect("reenvio_facturas")}>
          <div className="card-icon">📧</div>
          <h3>Reenvío de facturas</h3>
          <p>Reenvío y gestión de facturas electrónicas</p>
        </div>
      </div>
    </div>
  );
}

export default Radicacion;

