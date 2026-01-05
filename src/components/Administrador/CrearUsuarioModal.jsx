import { useState } from "react";
import { crearUsuarioAdmin } from "../../api";
import "./usuarios.css";

export default function CrearUsuarioModal({ onClose, onCreado }) {
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    rol: "USUARIO",
    estado: "ACTIVO",
    areas: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    
    try {
      const res = await crearUsuarioAdmin(form);
      if (res.success) {
        onCreado();
        onClose();
      } else {
        setError(res.message || "Error al crear usuario");
      }
    } catch (err) {
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
          <input 
            name="nombre" 
            placeholder="Nombre completo" 
            value={form.nombre}
            onChange={handleChange} 
            required
          />
          <input 
            name="correo" 
            type="email" 
            placeholder="Correo electrónico" 
            value={form.correo}
            onChange={handleChange} 
            required
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Contraseña" 
            value={form.password}
            onChange={handleChange} 
            required
            minLength="6"
          />

          <div className="form-group">
            <label>Rol:</label>
            <select name="rol" value={form.rol} onChange={handleChange}>
              <option value="USUARIO">Usuario</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>

          <div className="form-group">
            <label>Estado:</label>
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>

          <div className="form-group">
            <label>Áreas de acceso:</label>
            <div className="checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={form.areas.includes("citas")}
                  onChange={() => toggleArea("citas")} 
                /> Citas
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={form.areas.includes("calidad")}
                  onChange={() => toggleArea("calidad")} 
                /> Calidad
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={form.areas.includes("talento")}
                  onChange={() => toggleArea("talento")} 
                /> Talento Humano
              </label>
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
