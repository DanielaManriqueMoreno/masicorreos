import { useEffect, useState } from "react";
import { notifySuccess, notifyError, notifyWarning } from "../../utils/notificaciones";
import "./Areas.css";

export default function Areas({ usuario }) {

  const [areas, setAreas] = useState([]);
  const [nuevaArea, setNuevaArea] = useState("");
  const [editando, setEditando] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [estadoEditado, setEstadoEditado] = useState("ACTIVO");

  //  Cargar áreas
  const cargarAreasAdmin = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/admin/areas");
      const data = await res.json();
      setAreas(data);
    } catch (error) {
      notifyError("Error cargando áreas");
    }
  };

  useEffect(() => {
    cargarAreasAdmin();
  }, []);

  // Crear área
  const crearArea = async () => {

    if (!nuevaArea.trim()) {
      notifyWarning("El nombre del área es obligatorio ⚠️");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/admin/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevaArea,
          estado: "ACTIVO",
          documento: usuario.documento
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return notifyError(data.message || "Error creando área");
      }

      notifySuccess("Área creada correctamente ✅");
      setNuevaArea("");
      cargarAreasAdmin();

    } catch (error) {
      notifyError("Error del servidor al crear área");
    }
  };

  //  Guardar edición
  const guardarEdicion = async (id) => {

    if (!nombreEditado.trim()) {
      notifyWarning("El nombre no puede estar vacío ⚠️");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3001/api/admin/areas/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: nombreEditado,
            estado: estadoEditado,
            documento: usuario.documento
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return notifyError(data.message || "Error actualizando área");
      }

      notifySuccess("Área actualizada correctamente ✏️");
      setEditando(null);
      cargarAreasAdmin();

    } catch (error) {
      notifyError("Error del servidor al actualizar");
    }
  };

  // Eliminar área
  const eliminarArea = async (id) => {

    try {
      const res = await fetch(
  `http://localhost:3001/api/admin/areas/${id}?documento=${usuario.documento}`,
  { method: "DELETE" }
);

      if (!res.ok) {
        return notifyError("No se pudo eliminar el área");
      }

      notifySuccess("Área eliminada correctamente 🗑️");
      cargarAreasAdmin();

    } catch (error) {
      notifyError("Error del servidor al eliminar");
    }
  };

  return (
    <div className="areas-container">
      <h2>Gestión de Áreas</h2>

      <div className="crear-area">
        <input type="text" placeholder="Nombre nueva área" value={nuevaArea} onChange={(e) => setNuevaArea(e.target.value)} />
        <button onClick={crearArea}>Crear</button>
      </div>

      <div className="tabla-container">
        <table className="tabla-areas">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {areas.map((area) => (
              <tr key={area.id}>
                {editando === area.id ? (
                  <>
                    <td>
                      <input value={nombreEditado} onChange={(e) => setNombreEditado(e.target.value) }/>
                    </td>

                    <td>
                      <select value={estadoEditado} onChange={(e) => setEstadoEditado(e.target.value)}>
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="INACTIVO">INACTIVO</option>
                      </select>
                    </td>

                    <td>
                      <button className="btn-primary" onClick={() => guardarEdicion(area.id)}>
                        Guardar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{area.nombre}</td>
                    <td>{area.estado}</td>
                    <td>
                      <button onClick={() => {setEditando(area.id);setNombreEditado(area.nombre);setEstadoEditado(area.estado);}}>
                        Editar
                      </button>

                      <button className="btn-danger"onClick={() => eliminarArea(area.id)}>
                        Eliminar
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
