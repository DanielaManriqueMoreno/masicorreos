// Interfaz1.jsx
//Este archivo maneja la interfaz principal de la aplicacion despues del login, mostrando diferentes modulos y opciones segun el area seleccionada
import "./Interfaz1.css";
import { useState, useEffect, useRef } from "react";
import SistemaCitas from "./components/Citas/SistemaCitas";
import Calidad from "./components/Calidad/Calidad";
import TalentoHumano from "./components/TalentoHumano/TalentoHumano";
import Sistemas from "./components/Sistemas/Sistemas";
import Radicacion from "./components/Radicacion/Radicacion";
import Contabilidad from "./components/Contabilidad/Contabilidad";
import InterfazCitas from "./components/InterfazCitas/InterfazCitas";
import SistemaDengue from "./components/Calidad/SistemaDengue";
import SistemaCursos from "./components/TalentoHumano/SistemaCursos";
import CrearPlantilla from "./components/Plantillas/CrearPlantilla";
import SistemaPlantillas from "./components/Plantillas/SistemaPlantillas";
import VerRegistros from "./components/Registros/VerRegistros";
import RecuperarPassword from "./components/RecuperarPassword/RecuperarPassword";
import CrearUsuario from "./components/Administrador/CrearUsuarioModal";

const AREAS = {
  CITAS: "citas",
  CALIDAD: "calidad",
  TALENTO: "talento",
  CONTABILIDAD: "contabilidad",
  SISTEMAS: "sistemas",
  RADICACION: "radicacion"
};

function Interfaz1({ onSelect, onLogout, usuario }) {
  const [vistaActual, setVistaActual] = useState("menu"); // "menu" | "sistema-citas" | "calidad" | "talento" | "contabilidad" | "sistemas" | "radicacion" | "sistema-dengue" | "sistema-cursos" | "crear-plantilla" | "sistema-plantillas" | "ver-registros"
  const [areaActiva, setAreaActiva] = useState("citas"); // "citas" | "calidad" | "talento" | "contabilidad" | "sistemas" | "radicacion"
  const [mostrarDropdownCitas, setMostrarDropdownCitas] = useState(false);
  const [mostrarDropdownCalidad, setMostrarDropdownCalidad] = useState(false);
  const [mostrarDropdownTalento, setMostrarDropdownTalento] = useState(false);
  const [mostrarDropdownContabilidad, setMostrarDropdownContabilidad] = useState(false);
  const [mostrarDropdownSistemas, setMostrarDropdownSistemas] = useState(false);
  const [mostrarDropdownRadicacion, setMostrarDropdownRadicacion] = useState(false);
  const [mostrarRecuperarPassword, setMostrarRecuperarPassword] = useState(false);

  const esAdmin = usuario?.rol === "ADMINISTRADOR";

  const puedeVerArea = (area) => {
    if (esAdmin) return true;
    if (!usuario?.areas) return false;
    return usuario.areas.includes(area);
  };

  const nombreUsuario = usuario?.nombre || usuario?.usuario || "Usuario";
  const dropdownCitasRef = useRef(null);
  const dropdownCalidadRef = useRef(null);
  const dropdownTalentoRef = useRef(null);
  const dropdownContabilidadRef = useRef(null);
  const dropdownSistemasRef = useRef(null);
  const dropdownRadicacionRef = useRef(null);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownCitasRef.current && !dropdownCitasRef.current.contains(event.target)) {
        setMostrarDropdownCitas(false);
      }
      if (dropdownCalidadRef.current && !dropdownCalidadRef.current.contains(event.target)) {
        setMostrarDropdownCalidad(false);
      }
      if (dropdownTalentoRef.current && !dropdownTalentoRef.current.contains(event.target)) {
        setMostrarDropdownTalento(false);
      }
      if (dropdownContabilidadRef.current && !dropdownContabilidadRef.current.contains(event.target)) {
        setMostrarDropdownContabilidad(false);
      }
      if (dropdownSistemasRef.current && !dropdownSistemasRef.current.contains(event.target)) {
        setMostrarDropdownSistemas(false);
      }
      if (dropdownRadicacionRef.current && !dropdownRadicacionRef.current.contains(event.target)) {
        setMostrarDropdownRadicacion(false);
      }
    };

    if (mostrarDropdownCitas || mostrarDropdownCalidad || mostrarDropdownTalento || 
        mostrarDropdownContabilidad || mostrarDropdownSistemas || mostrarDropdownRadicacion) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarDropdownCitas, mostrarDropdownCalidad, mostrarDropdownTalento, 
      mostrarDropdownContabilidad, mostrarDropdownSistemas, mostrarDropdownRadicacion]);

  const opcionesCitas = [
    { id: "recordatorio", nombre: "Recordatorio de citas", icono: "📅", descripcion: "Recordatorios de citas médicas personalizados para pacientes", accion: () => { setVistaActual("sistema-citas"); setMostrarDropdownCitas(false); } },
    { id: "reprogramacion", nombre: "Reprogramación", icono: "🔄", descripcion: "Comunicados para reprogramación de citas médicas", accion: () => { onSelect("reprogramacion"); setMostrarDropdownCitas(false); } },
    { id: "cancelacion", nombre: "Cancelación", icono: "❌", descripcion: "Notificaciones de cancelación de citas programadas", accion: () => { onSelect("cancelacion"); setMostrarDropdownCitas(false); } },
    { id: "autorizacion", nombre: "Autorización vigente", icono: "⭐", descripcion: "Comunicados sobre autorizaciones médicas vigentes", accion: () => { onSelect("autorizacion"); setMostrarDropdownCitas(false); } }
  ];

  const opcionesCalidad = [
    { id: "dengue", nombre: "Dengue", icono: "🦟", descripcion: "Información sobre prevención y cuidados del dengue", accion: () => { setVistaActual("sistema-dengue"); setMostrarDropdownCalidad(false); } },
    { id: "preparto", nombre: "Preparto", icono: "🤰", descripcion: "Cuidados y recomendaciones durante el embarazo", accion: () => { onSelect("preparto"); setMostrarDropdownCalidad(false); } },
    { id: "posparto", nombre: "Posparto", icono: "👶", descripcion: "Cuidados y recomendaciones después del parto", accion: () => { onSelect("posparto"); setMostrarDropdownCalidad(false); } },
    { id: "planificacion", nombre: "Planificación", icono: "📋", descripcion: "Información sobre métodos de planificación familiar", accion: () => { onSelect("planificacion"); setMostrarDropdownCalidad(false); } }
  ];

  const opcionesTalento = [
    { id: "cursos", nombre: "Cursos Obligatorios", icono: "📚", descripcion: "Recordatorios de cursos obligatorios según Resolución 3100", accion: () => { setVistaActual("sistema-cursos"); setMostrarDropdownTalento(false); } }
  ];

  const opcionesContabilidad = [
    // En desarrollo - sin opciones aún
  ];

  const opcionesSistemas = [
    { id: "actualizacion_sistema", nombre: "Actualización sistema", icono: "🔄", descripcion: "Actualizaciones y mantenimiento del sistema informático", accion: () => { onSelect("actualizacion_sistema"); setMostrarDropdownSistemas(false); } },
    { id: "ventanas_mantenimiento", nombre: "Ventanas mantenimiento", icono: "🛠️", descripcion: "Gestión de ventanas de mantenimiento programado", accion: () => { onSelect("ventanas_mantenimiento"); setMostrarDropdownSistemas(false); } }
  ];

  const opcionesRadicacion = [
    { id: "reenvio_facturas", nombre: "Reenvío de facturas", icono: "📧", descripcion: "Reenvío y gestión de facturas electrónicas", accion: () => { onSelect("reenvio_facturas"); setMostrarDropdownRadicacion(false); } }
  ];

  // Manejar selección desde Calidad
  const handleCalidadSelect = (tipo) => {
    if (tipo === "dengue") {
      setVistaActual("sistema-dengue");
      setAreaActiva("calidad");
    } else {
      // Para otros tipos (preparto, posparto, planificacion) mostrar mensaje
      alert(`La plantilla "${tipo}" está en desarrollo`);
    }
  };

  // Manejar selección desde Talento Humano
  const handleTalentoSelect = (tipo) => {
    if (tipo === "cursos") {
      setVistaActual("sistema-cursos");
      setAreaActiva("talento");
    } else {
      alert(`La plantilla "${tipo}" está en desarrollo`);
    }
  };

  // Función para cerrar todos los dropdowns excepto uno
  const cerrarOtrosDropdowns = (excepcion) => {
    if (excepcion !== "citas") setMostrarDropdownCitas(false);
    if (excepcion !== "calidad") setMostrarDropdownCalidad(false);
    if (excepcion !== "talento") setMostrarDropdownTalento(false);
    if (excepcion !== "contabilidad") setMostrarDropdownContabilidad(false);
    if (excepcion !== "sistemas") setMostrarDropdownSistemas(false);
    if (excepcion !== "radicacion") setMostrarDropdownRadicacion(false);
  };

  // Función helper para renderizar el sidebar
  const renderSidebar = () => (
    <aside className="sidebar">
      <h2 className="sidebar-title">AREAS</h2>
      <nav className="sidebar-menu">


        {puedeVerArea(AREAS.CITAS) && (
        <div className="menu-item-dropdown" ref={dropdownCitasRef}>
          <button 
            className={`menu-item ${areaActiva === "citas" ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              cerrarOtrosDropdowns("citas");
              setMostrarDropdownCitas(!mostrarDropdownCitas);
              if (!mostrarDropdownCitas) {
                setVistaActual("menu");
              }
              setAreaActiva("citas");
            }}
          >
            <span>📅 Citas</span>
            <span className="dropdown-arrow">{mostrarDropdownCitas ? '▲' : '▼'}</span>
          </button>
          
          {mostrarDropdownCitas && (
            <div className="dropdown-menu-sidebar">
              {opcionesCitas.map(opcion => (
                <div 
                  key={opcion.id}
                  className="dropdown-item-sidebar"
                  onClick={() => {
                    opcion.accion();
                  }}
                >
                  <span className="dropdown-icon">{opcion.icono}</span>
                  <div className="dropdown-content">
                    <h4>{opcion.nombre}</h4>
                    <p>{opcion.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {puedeVerArea(AREAS.CALIDAD) && (
        <div className="menu-item-dropdown" ref={dropdownCalidadRef}>
          <button 
            className={`menu-item ${areaActiva === "calidad" ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              cerrarOtrosDropdowns("calidad");
              setMostrarDropdownCalidad(!mostrarDropdownCalidad);
              if (!mostrarDropdownCalidad) {
                setVistaActual("calidad");
              }
              setAreaActiva("calidad");
            }}
          >
            <span>📊 Calidad</span>
            <span className="dropdown-arrow">{mostrarDropdownCalidad ? '▲' : '▼'}</span>
          </button>
          
          {mostrarDropdownCalidad && opcionesCalidad.length > 0 && (
            <div className="dropdown-menu-sidebar">
              {opcionesCalidad.map(opcion => (
                <div 
                  key={opcion.id}
                  className="dropdown-item-sidebar"
                  onClick={() => {
                    opcion.accion();
                  }}
                >
                  <span className="dropdown-icon">{opcion.icono}</span>
                  <div className="dropdown-content">
                    <h4>{opcion.nombre}</h4>
                    <p>{opcion.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {puedeVerArea(AREAS.TALENTO) && (
        <div className="menu-item-dropdown" ref={dropdownTalentoRef}>
          <button 
            className={`menu-item ${areaActiva === "talento" ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              cerrarOtrosDropdowns("talento");
              setMostrarDropdownTalento(!mostrarDropdownTalento);
              if (!mostrarDropdownTalento) {
                setVistaActual("talento");
              }
              setAreaActiva("talento");
            }}
          >
            <span>👥 Talento Humano</span>
            <span className="dropdown-arrow">{mostrarDropdownTalento ? '▲' : '▼'}</span>
          </button>
          
          {mostrarDropdownTalento && opcionesTalento.length > 0 && (
            <div className="dropdown-menu-sidebar">
              {opcionesTalento.map(opcion => (
                <div 
                  key={opcion.id}
                  className="dropdown-item-sidebar"
                  onClick={() => {
                    opcion.accion();
                  }}
                >
                  <span className="dropdown-icon">{opcion.icono}</span>
                  <div className="dropdown-content">
                    <h4>{opcion.nombre}</h4>
                    <p>{opcion.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {puedeVerArea(AREAS.CONTABILIDAD) && (
        <div className="menu-item-dropdown" ref={dropdownContabilidadRef}>
          <button 
            className={`menu-item ${areaActiva === "contabilidad" ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              cerrarOtrosDropdowns("contabilidad");
              if (opcionesContabilidad.length > 0) {
                setMostrarDropdownContabilidad(!mostrarDropdownContabilidad);
              } else {
                setVistaActual("contabilidad");
              }
              setAreaActiva("contabilidad");
            }}
          >
            <span>📘 Contabilidad</span>
            {opcionesContabilidad.length > 0 && (
              <span className="dropdown-arrow">{mostrarDropdownContabilidad ? '▲' : '▼'}</span>
            )}
          </button>
          
          {mostrarDropdownContabilidad && opcionesContabilidad.length > 0 && (
            <div className="dropdown-menu-sidebar">
              {opcionesContabilidad.map(opcion => (
                <div 
                  key={opcion.id}
                  className="dropdown-item-sidebar"
                  onClick={() => {
                    opcion.accion();
                  }}
                >
                  <span className="dropdown-icon">{opcion.icono}</span>
                  <div className="dropdown-content">
                    <h4>{opcion.nombre}</h4>
                    <p>{opcion.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {puedeVerArea(AREAS.SISTEMAS) && (
        <div className="menu-item-dropdown" ref={dropdownSistemasRef}>
          <button 
            className={`menu-item ${areaActiva === "sistemas" ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              cerrarOtrosDropdowns("sistemas");
              setMostrarDropdownSistemas(!mostrarDropdownSistemas);
              if (!mostrarDropdownSistemas) {
                setVistaActual("sistemas");
              }
              setAreaActiva("sistemas");
            }}
          >
            <span>💻 Sistemas</span>
            <span className="dropdown-arrow">{mostrarDropdownSistemas ? '▲' : '▼'}</span>
          </button>
          
          {mostrarDropdownSistemas && opcionesSistemas.length > 0 && (
            <div className="dropdown-menu-sidebar">
              {opcionesSistemas.map(opcion => (
                <div 
                  key={opcion.id}
                  className="dropdown-item-sidebar"
                  onClick={() => {
                    opcion.accion();
                  }}
                >
                  <span className="dropdown-icon">{opcion.icono}</span>
                  <div className="dropdown-content">
                    <h4>{opcion.nombre}</h4>
                    <p>{opcion.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {puedeVerArea(AREAS.RADICACION) && (
        <div className="menu-item-dropdown" ref={dropdownRadicacionRef}>
          <button 
            className={`menu-item ${areaActiva === "radicacion" ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              cerrarOtrosDropdowns("radicacion");
              setMostrarDropdownRadicacion(!mostrarDropdownRadicacion);
              if (!mostrarDropdownRadicacion) {
                setVistaActual("radicacion");
              }
              setAreaActiva("radicacion");
            }}
          >
            <span>📝 Radicación</span>
            <span className="dropdown-arrow">{mostrarDropdownRadicacion ? '▲' : '▼'}</span>
          </button>
          
          {mostrarDropdownRadicacion && opcionesRadicacion.length > 0 && (
            <div className="dropdown-menu-sidebar">
              {opcionesRadicacion.map(opcion => (
                <div 
                  key={opcion.id}
                  className="dropdown-item-sidebar"
                  onClick={() => {
                    opcion.accion();
                  }}
                >
                  <span className="dropdown-icon">{opcion.icono}</span>
                  <div className="dropdown-content">
                    <h4>{opcion.nombre}</h4>
                    <p>{opcion.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </nav>
      {esAdmin && (
        <button
          className="menu-item"
          onClick={() => setVistaActual("crear-areas")}
        >
          🏢 Crear Áreas
        </button>
      )}
      <div className="sidebar-divider"></div>
      <nav className="sidebar-menu">
        <button 
          className={`menu-item ${vistaActual === "crear-plantilla" ? "active" : ""}`}
          onClick={() => {
            setVistaActual("crear-plantilla");
          }}
        >
          📧 Crear Plantilla
        </button>
        <button 
          className={`menu-item ${vistaActual === "sistema-plantillas" ? "active" : ""}`}
          onClick={() => {
            setVistaActual("sistema-plantillas");
          }}
        >
          📨 Enviar con Plantilla
        </button>
        {usuario?.rol === "ADMINISTRADOR" && (
          <button 
            className="menu-item"
            onClick={() => setVistaActual("crear-usuario")}
          >
            👤 Usuarios
          </button>
        )}
        <button 
          className="menu-item menu-item-recuperar"
          onClick={() => {
            setMostrarRecuperarPassword(true);
          }}
        >
          🔐 Recuperar Contraseña
        </button>
      </nav>
      <div className="sidebar-footer">
        <p className="user-info">Usuario: {nombreUsuario}</p>
        <button 
          className="btn-secondary" 
          onClick={() => setVistaActual("ver-registros")}
        >
          Ver Registros
        </button>
        <button className="btn-logout" onClick={onLogout}>Cerrar sesión</button>
      </div>
      
    </aside>
  );

  // Si estamos en la vista del sistema de citas, mostrarlo
  if (vistaActual === "sistema-citas") {
    return (
      <>
        <div className="interfaz-container">
          {renderSidebar()}

          {/* CONTENIDO PRINCIPAL - SISTEMA DE CITAS */}
              <main className="main-content">
                <SistemaCitas onVolver={() => setVistaActual("menu")} usuario={usuario} />
              </main>
        </div>
        
        {/* Panel de Recuperar Contraseña */}
        {mostrarRecuperarPassword && (
          <>
            <div 
              className="recuperar-password-overlay"
              onClick={() => setMostrarRecuperarPassword(false)}
            ></div>
            <RecuperarPassword 
              onCerrar={() => setMostrarRecuperarPassword(false)}
            />
          </>
        )}
      </>
    );
  }

  // Si estamos en la vista de Sistema Dengue
  if (vistaActual === "sistema-dengue") {
    return (
      <>
        <div className="interfaz-container">
          {renderSidebar()}
          <main className="main-content">
            <SistemaDengue 
              onVolver={() => setVistaActual("calidad")} 
              usuario={usuario}
            />
          </main>
        </div>
        
        {/* Panel de Recuperar Contraseña */}
        {mostrarRecuperarPassword && (
          <>
            <div 
              className="recuperar-password-overlay"
              onClick={() => setMostrarRecuperarPassword(false)}
            ></div>
            <RecuperarPassword 
              onCerrar={() => setMostrarRecuperarPassword(false)}
            />
          </>
        )}
      </>
    );
  }

  // Si estamos en la vista de Calidad, mostrar las plantillas
  if (vistaActual === "calidad") {
    return (
      <>
        <div className="interfaz-container">
          {renderSidebar()}
          <main className="main-content">
            <Calidad 
              onSelect={handleCalidadSelect} 
              onVolver={() => setVistaActual("menu")} 
            />
          </main>
        </div>
        
        {/* Panel de Recuperar Contraseña */}
        {mostrarRecuperarPassword && (
          <>
            <div 
              className="recuperar-password-overlay"
              onClick={() => setMostrarRecuperarPassword(false)}
            ></div>
            <RecuperarPassword 
              onCerrar={() => setMostrarRecuperarPassword(false)}
            />
          </>
        )}
      </>
    );
  }

  // Si estamos en la vista de Sistema Cursos
  if (vistaActual === "sistema-cursos") {
    return (
      <>
        <div className="interfaz-container">
          {renderSidebar()}
          <main className="main-content">
            <SistemaCursos 
              onVolver={() => setVistaActual("talento")} 
              usuario={usuario}
            />
          </main>
        </div>
        
        {/* Panel de Recuperar Contraseña */}
        {mostrarRecuperarPassword && (
          <>
            <div 
              className="recuperar-password-overlay"
              onClick={() => setMostrarRecuperarPassword(false)}
            ></div>
            <RecuperarPassword 
              onCerrar={() => setMostrarRecuperarPassword(false)}
            />
          </>
        )}
      </>
    );
  }

  // Vista de Talento Humano
  if (vistaActual === "talento") {
    return (
      <>
        <div className="interfaz-container">
          {renderSidebar()}
          <main className="main-content">
            <TalentoHumano 
              onSelect={handleTalentoSelect} 
              onVolver={() => setVistaActual("menu")} 
            />
          </main>
        </div>
        
        {/* Panel de Recuperar Contraseña */}
        {mostrarRecuperarPassword && (
          <>
            <div 
              className="recuperar-password-overlay"
              onClick={() => setMostrarRecuperarPassword(false)}
            ></div>
            <RecuperarPassword 
              onCerrar={() => setMostrarRecuperarPassword(false)}
            />
          </>
        )}
      </>
    );
  }

  // Vista de Sistemas
  if (vistaActual === "sistemas") {
    return (
      <>
        <div className="interfaz-container">
          {renderSidebar()}
          <main className="main-content">
            <Sistemas 
              onSelect={onSelect} 
              onVolver={() => setVistaActual("menu")} 
            />
          </main>
        </div>
        
        {/* Panel de Recuperar Contraseña */}
        {mostrarRecuperarPassword && (
          <>
            <div 
              className="recuperar-password-overlay"
              onClick={() => setMostrarRecuperarPassword(false)}
            ></div>
            <RecuperarPassword 
              onCerrar={() => setMostrarRecuperarPassword(false)}
            />
          </>
        )}
      </>
    );
  }

  // Vista de Radicación
  if (vistaActual === "radicacion") {
    return (
      <>
        <div className="interfaz-container">
          {renderSidebar()}
          <main className="main-content">
            <Radicacion 
              onSelect={onSelect} 
              onVolver={() => setVistaActual("menu")} 
            />
          </main>
        </div>
        
        {/* Panel de Recuperar Contraseña */}
        {mostrarRecuperarPassword && (
          <>
            <div 
              className="recuperar-password-overlay"
              onClick={() => setMostrarRecuperarPassword(false)}
            ></div>
            <RecuperarPassword 
              onCerrar={() => setMostrarRecuperarPassword(false)}
            />
          </>
        )}
      </>
    );
  }

  // Vista de Contabilidad
  if (vistaActual === "contabilidad") {
    return (
      <>
        <div className="interfaz-container">
          {renderSidebar()}
          <main className="main-content">
            <Contabilidad 
              onSelect={onSelect} 
              onVolver={() => setVistaActual("menu")} 
            />
          </main>
        </div>
        
        {/* Panel de Recuperar Contraseña */}
        {mostrarRecuperarPassword && (
          <>
            <div 
              className="recuperar-password-overlay"
              onClick={() => setMostrarRecuperarPassword(false)}
            ></div>
            <RecuperarPassword 
              onCerrar={() => setMostrarRecuperarPassword(false)}
            />
          </>
        )}
      </>
    );
  }

  // Vista de Crear Plantilla
  if (vistaActual === "crear-plantilla") {
    return (
      <>
        <div className="interfaz-container">
          {renderSidebar()}
          <main className="main-content">
            <CrearPlantilla 
              onVolver={() => setVistaActual("menu")} 
              usuario={usuario}
            />
          </main>
        </div>
        
        {/* Panel de Recuperar Contraseña */}
        {mostrarRecuperarPassword && (
          <>
            <div 
              className="recuperar-password-overlay"
              onClick={() => setMostrarRecuperarPassword(false)}
            ></div>
            <RecuperarPassword 
              onCerrar={() => setMostrarRecuperarPassword(false)}
            />
          </>
        )}
      </>
    );
  }

  // Vista de Sistema Plantillas (Envío masivo)
  if (vistaActual === "sistema-plantillas") {
    return (
      <>
        <div className="interfaz-container">
          {renderSidebar()}
          <main className="main-content">
            <SistemaPlantillas 
              onVolver={() => setVistaActual("menu")} 
              usuario={usuario}
            />
          </main>
        </div>
        
        {/* Panel de Recuperar Contraseña */}
        {mostrarRecuperarPassword && (
          <>
            <div 
              className="recuperar-password-overlay"
              onClick={() => setMostrarRecuperarPassword(false)}
            ></div>
            <RecuperarPassword 
              onCerrar={() => setMostrarRecuperarPassword(false)}
            />
          </>
        )}
      </>
    );
  }

  // Vista de Ver Registros
  if (vistaActual === "ver-registros") {
    return (
      <>
        <div className="interfaz-container">
          {renderSidebar()}
          <main className="main-content">
            <VerRegistros 
              onVolver={() => setVistaActual("menu")} 
              usuario={usuario}
            />
          </main>
        </div>
        
        {/* Panel de Recuperar Contraseña */}
        {mostrarRecuperarPassword && (
          <>
            <div 
              className="recuperar-password-overlay"
              onClick={() => setMostrarRecuperarPassword(false)}
            ></div>
            <RecuperarPassword 
              onCerrar={() => setMostrarRecuperarPassword(false)}
            />
          </>
        )}
      </>
    );
  }

  // Vista crear usuario desde administrador
  if(vistaActual === "crear-usuario"){
    return(
      <div className="interfaz-container">
        {renderSidebar()}
        <main className ="main-content">
            <CrearUsuario />
          </main>
        </div>
      );
    }

  // Vista original del menú (Citas)
  return (
    <>
      <InterfazCitas 
        onSelect={onSelect}
        setVistaActual={setVistaActual}
        renderSidebar={renderSidebar}
      />
      
      {/* Panel de Recuperar Contraseña */}
      {mostrarRecuperarPassword && (
        <>
          <div 
            className="recuperar-password-overlay"
            onClick={() => setMostrarRecuperarPassword(false)}
          ></div>
          <RecuperarPassword 
            onCerrar={() => setMostrarRecuperarPassword(false)}
          />
        </>
      )}
    </>
  );
}

export default Interfaz1;