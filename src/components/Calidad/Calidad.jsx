// Calidad.jsx
import "./Calidad.css";

function Calidad({ onSelect, onVolver }) {
  const opcionesCalidad = [
    { id: "dengue", nombre: "Dengue", icono: "🦟", descripcion: "Información sobre prevención y cuidados del dengue", accion: () => onSelect("dengue") },
    { id: "preparto", nombre: "Preparto", icono: "🤰", descripcion: "Cuidados y recomendaciones durante el embarazo", accion: () => onSelect("preparto") },
    { id: "posparto", nombre: "Posparto", icono: "👶", descripcion: "Cuidados y recomendaciones después del parto", accion: () => onSelect("posparto") },
    { id: "planificacion", nombre: "Planificación", icono: "📋", descripcion: "Información sobre métodos de planificación familiar", accion: () => onSelect("planificacion") }
  ];

  return (
    <div className="calidad-container">
      <div className="btn-volver-container-full">
        <button 
          className="btn-volver"
          onClick={onVolver}
        >
          ← Volver al Menú
        </button> 
      </div>

      <h1 className="main-title">Sistema de Calidad</h1>
      <p className="main-subtitle">Selecciona el tipo de comunicación para calidad</p>

      <div className="cards-wrapper">
        <div className="card card-red" onClick={() => onSelect("dengue")}>
          <div className="card-icon">🦟</div>
          <h3>Dengue</h3>
          <p>Información sobre prevención y cuidados del dengue</p>
        </div>

        <div className="card card-pink" onClick={() => onSelect("preparto")}>
          <div className="card-icon">🤰</div>
          <h3>Preparto</h3>
          <p>Cuidados y recomendaciones durante el embarazo</p>
        </div>

        <div className="card card-purple" onClick={() => onSelect("posparto")}>
          <div className="card-icon">👶</div>
          <h3>Posparto</h3>
          <p>Cuidados y recomendaciones después del parto</p>
        </div>

        <div className="card card-orange" onClick={() => onSelect("planificacion")}>
          <div className="card-icon">📋</div>
          <h3>Planificación</h3>
          <p>Información sobre métodos de planificación familiar</p>
        </div>
      </div>
    </div>
  );
}

export default Calidad;

