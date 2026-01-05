// Contabilidad.jsx
import "./Contabilidad.css";

function Contabilidad({ onSelect, onVolver }) {
  return (
    <div className="contabilidad-container">
      <div style={{ textAlign: "left", marginBottom: "20px" }}>
        <button 
          className="btn-volver"
          onClick={onVolver}
        >
          ← Volver al Menú
        </button>
      </div>
      
      <h1 className="main-title">Sistema de Contabilidad</h1>
      <p className="main-subtitle">Área de contabilidad - En desarrollo</p>
      
      <div className="cards-wrapper">
        <div className="card-mensaje">
          <p>
            Las plantillas de contabilidad estarán disponibles próximamente.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contabilidad;

