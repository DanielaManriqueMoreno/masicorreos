import { useState } from "react";
import { crearUsuarioAdmin } from "../../api";
import "./CrearUsuariosModal.css";

export default function CrearUsuarioModal({ onClose, onCreado }) {
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioLogueado"));

  const [form, setForm] = useState({
    documento: "",
    nombre: "",
    correo: "",
    password: "",
    confirmPassword: "",
    rol: "",
    estado: "",
    areas: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

   const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleArea = area => {
    setForm(prev => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter(a => a !== area)
        : [...prev.areas, area]
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  if (form.password !== form.confirmPassword) {
    setError("Las contraseñas no coinciden");
    setLoading(false);
    return;
  }

  if (!usuarioActual || !usuarioActual.documento) {
    setError("No se pudo identificar el usuario creador. Cierra sesión y vuelve a entrar.");
    setLoading(false);
    return;
  }

  try {
    const { confirmPassword, ...data } = form;

    console.log("Datos a enviar:", {
      ...data,
      usuarioCreadorId: usuarioActual.documento
    });

    const res = await crearUsuarioAdmin({
      ...data,
      usuarioCreadorDocumento: usuarioActual.documento
    });

    if (res.success) {
      onCreado();
      onClose();
    } else {
      setError(res.message || "Error al crear usuario");
    }
  } catch (err) {
    console.log("Error en respuesta:", err);
    setError("Error de conexión con el servidor");
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Crear usuario</h3>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="column">
              <label className="label">Documento: </label>
              <input name="documento" placeholder="Número de documento" value={form.documento} onChange={handleChange} required/>

              <label className="label">Nombre completo: </label>
              <input name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={handleChange} required/>

              <label className="label">Correo electrónico: </label>
              <input name="correo" type="email" placeholder="Correo electrónico" value={form.correo} onChange={handleChange} required />

              <label className="label">Contraseña: </label>
              <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />

              <label className="label">Confirmar Contraseña</label>
              <input name="confirmPassword" type="password" placeholder="Confirmar contraseña" value={form.confirmPassword} onChange={handleChange} required/>
            </div>

            <div className="column">
              <div className="form-group">
                <label>Rol:</label>
                <select name="rol" value={form.rol} onChange={handleChange}>
                  <option value="">Seleccione rol</option>
                  <option value="ESTANDAR">Estandar</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                </select>
              </div>

              <div className="form-group">
                <label>Estado:</label>
                <select name="estado" value={form.estado} onChange={handleChange}>
                  <option value="">Seleccione estado</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>

              <div className="form-group">
                <label>Áreas de acceso:</label>
                <div className="checkbox-group">
                  <label>
                    <input type="checkbox"checked={form.areas.includes("5")} onChange={() => toggleArea("5")}/>
                    Citas
                  </label>

                  <label>
                    <input type="checkbox" checked={form.areas.includes("6")} onChange={() => toggleArea("6")} />
                    Calidad
                  </label>

                  <label>
                    <input type="checkbox" checked={form.areas.includes("7")} onChange={() => toggleArea("7")}/>
                    Talento Humano
                  </label>

                  <label>
                    <input type="checkbox" checked={form.areas.includes("8")} onChange={() => toggleArea("8")}/>
                    Contabilidad
                  </label>

                  <label>
                    <input type="checkbox" checked={form.areas.includes("9")} onChange={() => toggleArea("9")}/>
                    Radicación
                  </label>

                  <label>
                    <input type="checkbox" checked={form.areas.includes("10")} onChange={() => toggleArea("10")}/>
                    Sistemas
                  </label>

                  <label>
                    <input type="checkbox" checked={form.areas.includes("11")} onChange={() => toggleArea("11")}/>
                    Registros
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear"}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
