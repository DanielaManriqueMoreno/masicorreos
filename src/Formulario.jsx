// Formulario.jsx}
//Este archivo es el formulario de registro para nuevos usuario es decir el registro  desde el frontend y hace la importacion de la funcion registrarUsuario desde api.js
import { useState } from "react";
import "./Formulario.css";
import { registrarUsuario } from "./api";

function Formulario({ onVolver, onRegistroExitoso }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    // Validaciones
    if (!correo.trim()) {
      setError("El correo es obligatorio");
      return;
    }

    if(!correo.includes("@") || !correo.includes(".")) {
      setError("El correo no es válido");
      return;
    }

    if (!password.trim()) {
      setError("La contraseña es obligatoria");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);

    try {
      // Registrar usuario en la base de datos
      const resultado = await registrarUsuario(
        nombre.trim() || correo.trim(),
        correo.trim(),
        password
      );

      if (resultado.success) {
        setExito("¡Registro exitoso! Redirigiendo al login...");
        
        // Limpiar formulario
        setNombre("");
        setCorreo("");
        setPassword("");
        setConfirmPassword("");

        // Redirigir al login después de 1.5 segundos
        setTimeout(() => {
          if (onRegistroExitoso) {
            onRegistroExitoso();
          } else {
            onVolver();
          }
        }, 1500);
      }
    } catch (err) {
      console.error('Error en registro:', err);
      // Mostrar el mensaje de error específico
      const mensajeError = 
        err.response?.data?.message ||
        err.message ||
        "Error al registrar correo. Verifica que el servidor esté corriendo.";
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="register-card">
        <h2 className="register-title">Crear Nueva Cuenta</h2>

        {error && <div className="error-message" style={{ color: "#ef4444", marginBottom: "15px", padding: "10px", background: "#fee2e2", borderRadius: "6px", whiteSpace: "pre-line", lineHeight: "1.6", fontSize: "14px" }}>{error}</div>}
        {exito && <div className="success-message" style={{ color: "#10b981", marginBottom: "15px", padding: "10px", background: "#d1fae5", borderRadius: "6px" }}>{exito}</div>}

        <form onSubmit={handleRegistro}>
          <div className="form-group">
            <input
              type="text"
              className="input-field"
              placeholder="Nombre completo (opcional)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              className="input-field"
              placeholder="correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              className="input-field"
              placeholder="Contraseña (mín. 8 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              className="input-field"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="register-button" disabled={cargando}>
            {cargando ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <button className="back-link" onClick={onVolver}>
          ← Volver al login
        </button>
      </div>
    </div>
  );
}

export default Formulario;
