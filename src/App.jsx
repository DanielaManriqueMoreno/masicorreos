// App.js
//Este archivo maneja la validacio del loguin y el cambio entre pantallas de login, registro e interfaz principal, o sea trabaja con en frontend de la app
import { useState, useEffect } from "react";
import "./App.css";
import umitLogo from "./assets/umit-logo.png";
import Interfaz1 from "./Interfaz1";
import RecuperarPassword from "./components/RecuperarPassword/RecuperarPassword";
import { iniciarSesion } from "./api";

function App() {
  const [pantalla, setPantalla] = useState("login"); // "login" | "registro" | "interfaz1"
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mostrarRecuperarPassword, setMostrarRecuperarPassword] = useState(false);

  // Restaurar sesión al cargar la aplicación
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');
    const pantallaGuardada = localStorage.getItem('pantallaActual');
    
    if (usuarioGuardado && pantallaGuardada === 'interfaz1') {
      try {
        const usuarioData = JSON.parse(usuarioGuardado);
        setUsuarioLogueado(usuarioData);
        setPantalla('interfaz1');
      } catch (error) {
        console.error('Error al restaurar sesión:', error);
        localStorage.removeItem('usuarioLogueado');
        localStorage.removeItem('pantallaActual');
      }
    }
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
    const resultado = await iniciarSesion(correo.trim(), password); //Recibe lo que esta devoloviendo el backend

    console.log("Resultado de inicio de sesión:", resultado);

    if (resultado.success && resultado.user) { //Se encarga de verificar si el login fue correcto
      setUsuarioLogueado(resultado.user);
      setPantalla("interfaz1");

      localStorage.setItem( //Guarda el inicio de sesion en el localstorage
        "usuarioLogueado",
        JSON.stringify(resultado.user)
      );
      localStorage.setItem("pantallaActual", "interfaz1");

      console.log(
        "Usuario guardado en localStorage:",
        localStorage.getItem("usuarioLogueado")
      );

      setCorreo("");
      setPassword("");
      setError("");
    } else {
      setError("Error al iniciar sesión");
    }

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
    
    // Limpiar sesión de localStorage
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('pantallaActual');
  };

  // Si está en modo recuperar contraseña, mostramos el componente
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

  // Si está en modo interfaz1, mostramos la interfaz de ejemplo
  if (pantalla === "interfaz1") {
    return (
      <Interfaz1 
        onVolver={handleLogout}
        onLogout={handleLogout}
        usuario={usuarioLogueado}
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