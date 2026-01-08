import { useState } from "react";
import { actualizarPerfil } from "../../api";
import "./Perfil.css";

export default function Perfil({ usuario, onActualizarUsuario }) {
  const usuarioActual = JSON.parse(
    localStorage.getItem("usuarioLogueado")
  );

  const [form, setForm] = useState({
    documento: usuario.documento,
    nombre: usuario.nombre,
    correo: usuario.correo,
    password: "",
    confirmPassword: ""
  });

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setMensaje(null);

  if (form.password || form.confirmPassword) {
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
  }

  setLoading(true);

  try {
    const payload = {
      documento: form.documento,
      nombre: form.nombre,
      correo: form.correo
    };

    if (form.password) {
      payload.password = form.password;
    }

    const res = await actualizarPerfil(payload);

    if (res.success) {
      setMensaje("Perfil actualizado correctamente");

      // usuario actualizado
      const usuarioActualizado = {
        ...usuarioActual,
        nombre: form.nombre,
        correo: form.correo
      };

      // guardar BIEN en localStorage
      localStorage.setItem(
        "usuarioLogueado",
        JSON.stringify(usuarioActualizado)
      );

      setForm(prev => ({
        ...prev,
        password: "",
        confirmPassword: ""
      }));
    } else {
      setError(res.message || "Error al actualizar perfil");
    }
  } catch (err) {
    setError("Error de conexión con el servidor");
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="perfil-card">
      <h2>👤 Mi Perfil</h2>

      {error && <div className="alert error">{error}</div>}
      {mensaje && <div className="alert success">{mensaje}</div>}

      <form onSubmit={handleSubmit}>
        <div className="perfil-grid">
          <div>
            <label>Documento</label>
            <input value={form.documento} disabled />
          </div>

          <div>
            <label>Nombre</label>
            <input name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Correo</label>
            <input
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Nueva contraseña</label>
            <input
              name="password"
              type={mostrarPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Opcional"
            />
          </div>

          <div>
            <label>Confirmar contraseña</label>
            <input
              name="confirmPassword"
              type={mostrarPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="perfil-opciones">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={mostrarPassword}
              onChange={() => setMostrarPassword(!mostrarPassword)}
            />
            Mostrar contraseñas
          </label>
        </div>

        <div className="perfil-areas">
          <h4>Áreas con acceso</h4>
          <div className="areas-list">
            {usuario.areas?.length > 0 ? (
              usuario.areas.map(area => (
                <span key={area} className="area-chip">
                  {area}
                </span>
              ))
            ) : (
              <span className="sin-areas">Tiene acceso a todas las areas</span>
            )}
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
