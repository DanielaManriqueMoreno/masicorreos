// TalentoHumano.jsx
import "./TalentoHumano.css";

function TalentoHumano({ onSelect, onVolver }) {
  const opcionesTalento = [
    { id: "cursos", nombre: "Cursos Obligatorios", icono: "📚", descripcion: "Recordatorios de cursos obligatorios según Resolución 3100", accion: () => onSelect("cursos") }
  ];

  return (
    <div className="talento-humano-container">
      <div className="btn-volver-container">
        <button 
          className="btn-volver"
          onClick={onVolver}
        >
          ← Volver al Menú
        </button>
      </div>
      
      <h1 className="main-title">Sistema de Talento Humano</h1>
      <p className="main-subtitle">Selecciona el tipo de comunicación para talento humano</p>
      
      <div className="cards-wrapper">
        <div className="card card-purple" onClick={() => onSelect("cursos")}>
          <div className="card-icon">📚</div>
          <h3>Cursos Obligatorios</h3>
          <p>Recordatorios de cursos obligatorios según Resolución 3100</p>
        </div>
      </div>
    </div>
  );
}

export default TalentoHumano;

