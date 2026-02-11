// src/Interfaz1.jsx
import "./Interfaz1.css";
import { useState } from "react";
import VistaArea from "./components/Areas/VistaAreas";
import CrearPlantilla from "./components/Plantillas/CrearPlantilla";
import VerRegistros from "./components/Registros/VerRegistros";
import Usuarios from "./components/Administrador/Usuarios";
import Envios from "./components/Envios/Envios";
import Perfil from "./components/Perfil/Perfil";
import RecuperarPassword from "./components/RecuperarPassword/RecuperarPassword";
import Sidebar from "./components/Layout/Sidebar";

function Interfaz1({ onSelect, onLogout, usuario }) {
  const [vistaActual, setVistaActual] = useState("perfil");
  const [areaActiva, setAreaActiva] = useState(null);
  const [mostrarRecuperarPassword, setMostrarRecuperarPassword] =
    useState(false);

  const renderVista = () => {

    if (areaActiva) {
      return (
        <VistaArea
          areaId={areaActiva.id}
          nombreArea={areaActiva.nombre}
        />
      );
    }

    switch (vistaActual) {
      case "crear-plantilla":
        return <CrearPlantilla usuario={usuario} />;

      case "ver-registros":
        return <VerRegistros usuario={usuario} />;

      case "envios":
        return <Envios onSelect={onSelect} />;

      case "crear-usuario":
        return <Usuarios />;

      case "perfil":
      default:
        return <Perfil usuario={usuario} />;
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
