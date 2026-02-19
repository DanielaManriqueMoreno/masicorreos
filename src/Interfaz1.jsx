// src/Interfaz1.jsx
import "./Interfaz1.css";
import { useState,useEffect } from "react";
import VistaArea from "./components/Areas/VistaAreas";
import CrearPlantilla from "./components/Plantillas/CrearPlantilla";
import VerRegistros from "./components/Administrador/RegistrosActividad";
import Usuarios from "./components/Administrador/Usuarios";
import Envios from "./components/Envios/Envios";
import Areas from "./components/Administrador/Areas";
import Perfil from "./components/Perfil/Perfil";
import RecuperarPassword from "./components/RecuperarPassword/RecuperarPassword";
import Sidebar from "./components/Layout/Sidebar";

function Interfaz1({ onSelect, onLogout, usuario }) {
  const [vistaActual, setVistaActual] = useState("perfil");
  const [areaActiva, setAreaActiva] = useState(null);
  const [areasAdmin, setAreasAdmin] = useState([]);
  const [mostrarRecuperarPassword, setMostrarRecuperarPassword] =
    useState(false);
  const [areas, setAreas] = useState([]);
  const cargarAreas = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/areas");
      const data = await res.json();
      setAreas(data);
    } catch (error) {
      console.error("Error cargando áreas:", error);
    }
  };
  useEffect(() => {
    cargarAreas();
  }, []);

  useEffect(() => {
    console.log("Áreas actualizadas en Interfaz1:", areas);
  }, [areas]);
  const cargarAreasAdmin = async () => {
  const res = await fetch("http://localhost:3001/api/admin/areas");
  const data = await res.json();
  setAreasAdmin(data);
};


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
      
      case "areas":
        return <Areas
          usuario={usuario}
          areas={areas}
          setAreas={setAreas}
          cargarAreas={cargarAreas}/>;

      case "RegistrosActividad":
        return <VerRegistros usuario={usuario} />;

      case "envios":
        return <Envios 
          user={usuario}
          onSelect={onSelect} />;

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
          areas={areas}
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
