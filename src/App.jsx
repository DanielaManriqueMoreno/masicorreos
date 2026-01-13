// App.js
//Este archivo maneja la validacio del loguin y el cambio entre pantallas de login, registro e interfaz principal, o sea trabaja con en frontend de la app
import { useState, useEffect } from "react";
import "./App.css";
import umitLogo from "./assets/umit-logo.png";
import Interfaz1 from "./Interfaz1";
import RecuperarPassword from "./components/RecuperarPassword/RecuperarPassword";
import { iniciarSesion, verificarSesion } from "./api";

const AREAS_ID_A_SLUG = {
  5: "citas",
  6: "calidad",
  7: "talento",
  8: "contabilidad",
  9: "radicacion",
  10: "sistemas",
  11: "plantillas",
  12: "registros"
};


function App() {
  const [pantalla, setPantalla] = useState("login"); // "login" | "interfaz1"
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mostrarRecuperarPassword, setMostrarRecuperarPassword] = useState(false);

  // Restaurar sesión al cargar la aplicación
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuarioLogueado");
    const pantallaGuardada = localStorage.getItem("pantallaActual");

    if (!usuarioGuardado || pantallaGuardada !== "interfaz1") return;

    const usuario = JSON.parse(usuarioGuardado);

    verificarSesion(usuario.documento)
      .then(res => {
        if (!res.success || !res.user) {
          console.warn("No se pudo verificar sesion");
          setUsuarioLogueado(usuario);
          setPantalla("interfaz1");
          return;
        }

        if (res.user.estado === "INACTIVO"){
          handleLogout();
          return;
        }

        //actualizar datos 
        const usuarioActualizado = {
          ...res.user,
          areas: res.user.areas
            .map(id => AREAS_ID_A_SLUG[id])
            .filter(Boolean)
        };

        setUsuarioLogueado(usuarioActualizado);
        localStorage.setItem(
          "usuarioLogueado",
          JSON.stringify(usuarioActualizado)
        );
        setPantalla("interfaz1");
      })
      .catch(err => {
        console.warn("Error verificando sesión:", err);
        // NO cerrar sesión
        setUsuarioLogueado(usuario);
        setPantalla("interfaz1");
      });

  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!correo.trim() || !password.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    setCargando(true);

    try {
      const resultado = await iniciarSesion(correo.trim(), password);

      // LOGIN FALLIDO
      if (!resultado.success) {
        const msg =
          resultado.message === "Usuario inactivo"
            ? "Tu usuario está inactivo. Contacta al administrador."
            : resultado.message || "No se pudo iniciar sesión";

        setError(msg);
        return;
      }

      // Seguridad extra
      if (!resultado.user) {
        setError("Datos inválidos");
        return;
      }

      const usuarioNormalizado = {
        ...resultado.user,
        areas: Array.isArray(resultado.user.areas)
          ? resultado.user.areas
              .map(id => AREAS_ID_A_SLUG[id])
              .filter(Boolean)
          : []
      };

      setUsuarioLogueado(usuarioNormalizado);
      setPantalla("interfaz1");

      localStorage.setItem(
        "usuarioLogueado",
        JSON.stringify(usuarioNormalizado)
      );
      localStorage.setItem("pantallaActual", "interfaz1");

      setCorreo("");
      setPassword("");

    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };


  const handleLogout = () => {
    setUsuarioLogueado(null);
    setPantalla("login");
    setError("");

    localStorage.removeItem("usuarioLogueado");
    localStorage.removeItem("pantallaActual");
  };

  if (mostrarRecuperarPassword) {
    return (
      <RecuperarPassword
        onCerrar={() => {
          setMostrarRecuperarPassword(false);
          setError("");
        }}
      />
    );
  }

  if (pantalla === "interfaz1") {
    return (
      <Interfaz1
        usuario={usuarioLogueado}
        onLogout={handleLogout}
      />
    );
  }

  // Pantalla de login
  return (
    <div className="app-wrapper">
      <div className="login-card">
        <div className="logo-box">
          <img src={umitLogo} alt="Logo UMIT" className="logo-img" />
        </div>
        <h2 className="login-title">Sistema de Login</h2>

        {error && (
          <div 
            className="error-message" 
            style={{ 
              color: "#ef4444", 
              marginBottom: "15px", 
              padding: "10px", 
              background: "#fee2e2", 
              borderRadius: "6px",
              fontSize: "14px",
              whiteSpace: "pre-line",
              lineHeight: "1.6"
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="text"
              className="input-field"
              placeholder="Correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              className="input-field"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={cargando}>
            {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="login-links">
          <button
            className="link-button"
            onClick={() => {
              setMostrarRecuperarPassword(true);
              setError("");
            }}
          >
            Recuperar Contraseña
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;