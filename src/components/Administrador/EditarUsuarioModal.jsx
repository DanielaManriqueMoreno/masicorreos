import { useEffect, useState } from "react";
import { obtenerUsuarioAdmin, editarUsuarioAdmin, obtenerAreas } from "../../api";
import { notifySuccess, notifyError, notifyWarning } from "../../utils/notificaciones";
import "./UsuarioModal.css";

export default function EditarUsuarioModal({ documento, onClose, onActualizado }) {

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    estado: "ACTIVO",
    password: "",
    confirmPassword: "",
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
      } catch {
        notifyError("Error al cargar áreas");
      }
    };

    cargarAreas();
  }, []);

  // 🔥 Cargar usuario
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const res = await obtenerUsuarioAdmin(documento);

        if (res.success) {

          const areasActivasIds = areasDisponibles.map(a => a.id);

          const areasFiltradas = (res.user.areas || [])
            .filter(id => areasActivasIds.includes(id));

          setForm({
            nombre: res.user.nombre,
            correo: res.user.correo,
            estado: res.user.estado,
            password: "",
            confirmPassword: "",
            areas: areasFiltradas
          });
        }

      } catch {
        notifyError("Error al cargar usuario");
      }
    };

    if (areasDisponibles.length > 0) {
      cargarUsuario();
    }

  }, [documento, areasDisponibles]);

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

    if (form.password && form.password !== form.confirmPassword) {
      notifyWarning("Las contraseñas no coinciden ⚠️");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nombre: form.nombre,
        correo: form.correo,
        estado: form.estado,
        areas: form.areas
      };

      if (form.password) {
        payload.password = form.password;
      }

      const res = await editarUsuarioAdmin(documento, payload);

      if (res.success) {
        notifySuccess("Usuario actualizado correctamente ✅");
        onActualizado();
        onClose();
      } else {
        notifyError(res.message);
      }

    } catch {
      notifyError("Error del servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Editar usuario</h3>

        <form onSubmit={handleSubmit}>

  <div className="modal-row">

    {/* COLUMNA IZQUIERDA */}
    <div className="modal-column">
      <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre completo" required />
      <input name="correo" value={form.correo} onChange={handleChange} placeholder="Correo electrónico" required />
      <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Nueva contraseña (opcional)" />
      <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirmar contraseña" />
    </div>

    {/* COLUMNA DERECHA */}
    <div className="modal-column">
      <select name="estado" value={form.estado} onChange={handleChange}>
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
    <button type="submit">Guardar</button>
    <button type="button" onClick={onClose}>Cancelar</button>
  </div>

</form>
      </div>
    </div>
  );
}