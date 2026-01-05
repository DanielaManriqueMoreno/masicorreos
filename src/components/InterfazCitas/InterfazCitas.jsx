// InterfazCitas.jsx
import { useState } from "react";
import "./InterfazCitas.css";

function InterfazCitas({ onSelect, setVistaActual, renderSidebar }) {
  const opcionesCitas = [
    { id: "recordatorio", nombre: "Recordatorio de citas", icono: "📅", descripcion: "Recordatorios de citas médicas personalizados para pacientes", accion: () => setVistaActual("sistema-citas") },
    { id: "reprogramacion", nombre: "Reprogramación", icono: "🔄", descripcion: "Comunicados para reprogramación de citas médicas", accion: () => onSelect("reprogramacion") },
    { id: "cancelacion", nombre: "Cancelación", icono: "❌", descripcion: "Notificaciones de cancelación de citas programadas", accion: () => onSelect("cancelacion") },
    { id: "autorizacion", nombre: "Autorización vigente", icono: "⭐", descripcion: "Comunicados sobre autorizaciones médicas vigentes", accion: () => onSelect("autorizacion") }
  ];

  return (
    <div className="interfaz-container">
      {renderSidebar()}

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        <h1 className="main-title">Sistema de Citas</h1>
        <p className="main-subtitle">Selecciona el tipo de comunicación para citas</p>

        <div className="cards-wrapper">
          {opcionesCitas.map(opcion => (
            <div 
              key={opcion.id}
              className="card card-green" 
              onClick={opcion.accion}
            >
              <div className="card-icon">{opcion.icono}</div>
              <h3>{opcion.nombre}</h3>
              <p>{opcion.descripcion}</p>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}

export default InterfazCitas;

