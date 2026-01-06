import "./Sidebar.css";
import { AREA_TO_VISTA } from "../../constants/areaToVista";

const AREAS = [
  { id: "citas", label: "📅 Citas" },
  { id: "calidad", label: "📊 Calidad" },
  { id: "talento", label: "👥 Talento Humano" },
  { id: "contabilidad", label: "📘 Contabilidad" },
  { id: "radicacion", label: "📝 Radicación" },
  { id: "sistemas", label: "💻 Sistemas" },
  { id: "plantillas", label: "📄 Plantillas" },
  { id: "usuarios", label: "👤 Usuarios", soloAdmin: true },
];

export default function Sidebar({
  usuario,
  areaActiva,
  setVistaActual,
  setAreaActiva,
  onLogout
}) {
  const esAdmin = usuario?.rol === "ADMINISTRADOR";

  const puedeVerArea = (area) => {
    if (esAdmin) return true;
    if (area.soloAdmin) return false;
    return usuario.areas?.includes(area.id);
  };


  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">ÁREAS</h2>

      <nav className="sidebar-menu">
        {AREAS.filter(puedeVerArea).map((area) => (
          <button
            key={area.id}
            className={`menu-item ${areaActiva === area.id ? "active" : ""}`}
            onClick={() => {
              setVistaActual(AREA_TO_VISTA[area.id]);
              setAreaActiva(area.id);
            }}
          >
            {area.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <nav className="sidebar-menu">
        <button
          className="menu-item"
          onClick={() => setVistaActual("perfil")}
        >
          👤 Mi Perfil
        </button>

        <button
          className="menu-item"
          onClick={() => setVistaActual("ver-registros")}
        >
          📄 Ver Registros
        </button>

        <button className="btn-logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </nav>
    </aside>
  );
}
