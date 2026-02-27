import { useState, useEffect } from "react";
import { crearUsuarioAdmin, obtenerAreas } from "../../api";
import { notifySuccess, notifyError, notifyWarning } from "../../utils/notificaciones";
import "./UsuarioModal.css";

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

  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Cargar áreas activas
  useEffect(() => {
    const cargarAreas = async () => {
      try {
        const data = await obtenerAreas();
        setAreasDisponibles(data);
      } catch (error) {
        notifyError("Error al cargar áreas");
      }
    };

    cargarAreas();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleArea = areaId => {
    setForm(prev => ({
      ...prev,
      areas: prev.areas.includes(areaId)
        ? prev.areas.filter(a => a !== areaId)
        : [...prev.areas, areaId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      notifyWarning("Las contraseñas no coinciden ⚠️");
      setLoading(false);
      return;
    }

    if (!usuarioActual?.documento) {
      notifyError("No se pudo identificar el usuario creador");
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...data } = form;

      const res = await crearUsuarioAdmin({
        ...data,
        usuarioCreadorDocumento: usuarioActual.documento
      });

      if (res.success) {
        notifySuccess("Usuario creado correctamente ✅");

        setForm({
          documento: "",
          nombre: "",
          correo: "",
          password: "",
          confirmPassword: "",
          rol: "",
          estado: "",
          areas: []
        });

        onCreado();
        onClose();
      } else {
        notifyError(res.message || "Error al crear usuario");
      }

    } catch (err) {
      notifyError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Crear usuario</h3>

        <form onSubmit={handleSubmit}>

  <div className="modal-row">

    {/* COLUMNA IZQUIERDA */}
    <div className="modal-column">
      <input name="documento" value={form.documento} onChange={handleChange} placeholder="Documento" required />
      <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre completo" required />
      <input name="correo" value={form.correo} onChange={handleChange} placeholder="Correo electrónico" required />
      <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Contraseña" required />
      <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirmar contraseña" required />
    </div>

    {/* COLUMNA DERECHA */}
    <div className="modal-column">
      <select name="rol" value={form.rol} onChange={handleChange} required>
        <option value="">Seleccione rol</option>
        <option value="ESTANDAR">Estandar</option>
        <option value="ADMINISTRADOR">Administrador</option>
      </select>

      <select name="estado" value={form.estado} onChange={handleChange} required>
        <option value="">Seleccione estado</option>
        <option value="ACTIVO">Activo</option>
        <option value="INACTIVO">Inactivo</option>
      </select>

      <div className="areas-section">
        <div className="areas-title">Áreas de acceso</div>

        <div className="areas-grid">
          {areasDisponibles.map(area => (
            <label key={area.id} className="area-option">
              <input
                type="checkbox"
                checked={form.areas.includes(area.id)}
                onChange={() => toggleArea(area.id)}
              />
              {area.nombre}
            </label>
          ))}
        </div>
      </div>
    </div>

  </div>

  <div className="modal-actions">
    <button type="submit">Crear</button>
    <button type="button" onClick={onClose}>Cancelar</button>
  </div>

</form>
      </div>
    </div>
  );
}