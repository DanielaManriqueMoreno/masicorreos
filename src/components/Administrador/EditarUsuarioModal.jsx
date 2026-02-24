import { useEffect, useState } from "react";
import { obtenerUsuarioAdmin, editarUsuarioAdmin } from "../../api";
import { notifySuccess, notifyError, notifyWarning } from "../../utils/notificaciones";
import "./EditarUsuarioModal.css";

// Mapa de áreas
const AREAS = [
  { id: 5, nombre: "Citas" },
  { id: 6, nombre: "Calidad" },
  { id: 7, nombre: "Talento Humano" },
  { id: 8, nombre: "Contabilidad" },
  { id: 9, nombre: "Radicación" },
  { id: 10, nombre: "Sistemas" },
  { id: 11, nombre: "Registros" }
];

export default function EditarUsuarioModal({ documento, onClose, onActualizado }) {
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    estado: "ACTIVO",
    password: "",
    confirmPassword: "",
    areas: []
  });

  const [loading, setLoading] = useState(false);

  //  Cargar usuario
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const res = await obtenerUsuarioAdmin(documento);
        if (res.success) {
          setForm({
            nombre: res.user.nombre,
            correo: res.user.correo,
            estado: res.user.estado,
            password: "",
            confirmPassword: "",
            areas: res.user.areas || []
          });
        }
      } catch (err) {
        setError("Error al cargar usuario");
      }
    };

    cargarUsuario();
  }, [documento]);

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

      // Actualizar sesión si es el mismo usuario
      const usuarioSesion = JSON.parse(
        localStorage.getItem("usuarioLogueado")
      );

      if (usuarioSesion?.documento === documento) {
        localStorage.setItem(
          "usuarioLogueado",
          JSON.stringify({
            ...usuarioSesion,
            ...payload
          })
        );
      }

      notifySuccess("Usuario actualizado correctamente ✅");

      onActualizado();
      onClose();

    } else {
      notifyError(res.message || "Error al editar usuario");
    }

  } catch (err) {
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
          <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required/>
          <input name="correo" value={form.correo} onChange={handleChange} placeholder="Correo" required />

          <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>

          <input type="password" name="password" placeholder="Nueva contraseña (opcional)" value={form.password} onChange={handleChange}/>
          <input type="password" name="confirmPassword" placeholder="Confirmar contraseña" value={form.confirmPassword} onChange={handleChange}/>
            <div className="checkbox-group">
                {AREAS.map(area => (
                    <label key={area.id}>
                    {area.nombre}
                    <input type="checkbox" checked={form.areas.includes(area.id)} onChange={() => toggleArea(area.id)} />
                    </label>
                ))}
            </div>

          <div className="modal-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
