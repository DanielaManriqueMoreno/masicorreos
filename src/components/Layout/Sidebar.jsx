import "./Sidebar.css";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Sidebar({
  usuario,
  areaActiva,
  setVistaActual,
  setAreaActiva,
  onLogout,
  areas
}) {
  const esAdmin = usuario?.rol === "ADMINISTRADOR";

  const puedeVerArea = (area) => {
    if (esAdmin) return true;
    return usuario?.areas?.includes(area.id);
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">ÁREAS</h2>

      <nav className="sidebar-menu">
        {areas
          .filter(area => area.estado === "ACTIVO")
          .map(area => (
            <li key={area.id}>{area.nombre}</li>
          ))}
        {areas.filter(puedeVerArea).map((area) => (
          <button
            key={area.id}
            className={`menu-item ${
              areaActiva?.id === area.id ? "active" : ""
            }`}
            onClick={() => {
              setAreaActiva(area);
              setVistaActual(null);
            }}
          >
            {area.icono} {area.nombre}
          </button>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <nav className="sidebar-menu">
        <button className="menu-item" onClick={() => {
            setAreaActiva(null);
            setVistaActual("crear-plantilla");
          }}>
           Crear Plantilla
        </button>

        <button className="menu-item" onClick={() => {
            setAreaActiva(null);
            setVistaActual("areas");
          }}>
           Áreas
        </button>

        <button className="menu-item" onClick={() => {
            setAreaActiva(null);
            setVistaActual("crear-usuario");
          }}>
          Crear Usuario
        </button>

          <button className="menu-item" onClick={() => {
            setAreaActiva(null);
            setVistaActual("envios");
          }}>
           Envíos
        </button>

        <button className="menu-item" onClick={() => {
            setAreaActiva(null);
            setVistaActual("ver-registros");
          }}>
           Ver Registros
        </button>

        <button className="menu-item" onClick={() => {
            setAreaActiva(null);
            setVistaActual("perfil");
          }}>
           Mi Perfil
        </button>

        <button className="btn-logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </nav>
    </aside>
  );
}
