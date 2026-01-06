// src/Interfaz1.jsx
import "./Interfaz1.css";
import { useState } from "react";
import { AREA_TO_VISTA } from "./constants/areaToVista";

import SistemaCitas from "./components/Citas/SistemaCitas";
import Calidad from "./components/Calidad/Calidad";
import SistemaDengue from "./components/Calidad/SistemaDengue";
import TalentoHumano from "./components/TalentoHumano/TalentoHumano";
import SistemaCursos from "./components/TalentoHumano/SistemaCursos";
import Sistemas from "./components/Sistemas/Sistemas";
import Radicacion from "./components/Radicacion/Radicacion";
import Contabilidad from "./components/Contabilidad/Contabilidad";
import CrearPlantilla from "./components/Plantillas/CrearPlantilla";
import SistemaPlantillas from "./components/Plantillas/SistemaPlantillas";
import VerRegistros from "./components/Registros/VerRegistros";
import Usuarios from "./components/Administrador/Usuarios";
import PerfilUsuario from "./components/Perfil/PerfilUsuario";
import RecuperarPassword from "./components/RecuperarPassword/RecuperarPassword";
import Sidebar from "./components/Layout/Sidebar";

function Interfaz1({ onSelect, onLogout, usuario }) {
  const [vistaActual, setVistaActual] = useState("perfil");
  const [areaActiva, setAreaActiva] = useState(null);
  const [mostrarRecuperarPassword, setMostrarRecuperarPassword] =
    useState(false);

  const esAdmin = usuario?.rol === "ADMINISTRADOR";

  const puedeAccederVista = (vista) => {
    if (esAdmin) return true;

    const area = Object.keys(AREA_TO_VISTA).find(
      (key) => AREA_TO_VISTA[key] === vista
    );

    if (!area) return true; // perfil, registros, etc.

    return usuario?.areas?.includes(area);
  };

  const renderVista = () => {
    if (!puedeAccederVista(vistaActual)) {
      return <PerfilUsuario usuario={usuario} />;
    }

    switch (vistaActual) {
      case "sistema-citas":
        return <SistemaCitas usuario={usuario} />;

      case "calidad":
        return <Calidad />;

      case "sistema-dengue":
        return <SistemaDengue usuario={usuario} />;

      case "talento":
        return <TalentoHumano />;

      case "sistema-cursos":
        return <SistemaCursos usuario={usuario} />;

      case "sistemas":
        return <Sistemas onSelect={onSelect} />;

      case "radicacion":
        return <Radicacion onSelect={onSelect} />;

      case "contabilidad":
        return <Contabilidad onSelect={onSelect} />;

      case "crear-plantilla":
        return <CrearPlantilla usuario={usuario} />;

      case "sistema-plantillas":
        return <SistemaPlantillas usuario={usuario} />;

      case "ver-registros":
        return <VerRegistros usuario={usuario} />;

      case "crear-usuario":
        return <Usuarios />;

      case "perfil":
      default:
        return <PerfilUsuario usuario={usuario} />;
    }
  };

  return (
    <>
      <div className="interfaz-container">
        <Sidebar
          usuario={usuario}
          areaActiva={areaActiva}
          setAreaActiva={setAreaActiva}
          setVistaActual={setVistaActual}
          onLogout={onLogout}
        />

        <main className="main-content">{renderVista()}</main>
      </div>

      {mostrarRecuperarPassword && (
        <>
          <div
            className="recuperar-password-overlay"
            onClick={() => setMostrarRecuperarPassword(false)}
          />
          <RecuperarPassword
            onCerrar={() => setMostrarRecuperarPassword(false)}
          />
        </>
      )}
    </>
  );
}

export default Interfaz1;
