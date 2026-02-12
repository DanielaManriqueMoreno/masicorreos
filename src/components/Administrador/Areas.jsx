import { useEffect, useState } from "react";
import "./Areas.css";

export default function Areas({ areas, setAreas, cargarAreas }) {
  const [nuevaArea, setNuevaArea] = useState("");
  const [editando, setEditando] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [estadoEditado, setEstadoEditado] = useState("ACTIVO");

  // 🔥 Usamos la función que viene desde Interfaz1
  useEffect(() => {
    cargarAreas();
  }, []);

  // Crear área
  const crearArea = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/admin/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevaArea,
          estado: "ACTIVO",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setNuevaArea("");
        cargarAreas();
      }
    } catch (error) {
      console.error("Error creando área:", error);
    }
  };

  // Guardar edición
  const guardarEdicion = async (id) => {
    const res = await fetch(
      `http://localhost:3001/api/admin/areas/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreEditado,
          estado: estadoEditado,
        }),
      }
    );

    if (res.ok) {
      setEditando(null);
      cargarAreas();
    }
  };

  // Eliminar área
  const eliminarArea = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de eliminar esta área?"
    );
    if (!confirmar) return;

    await fetch(
      `http://localhost:3001/api/admin/areas/${id}`,
      {
        method: "DELETE",
      }
    );

    cargarAreas();
  };

  return (
    <div className="areas-container">
      <h2>Gestión de Áreas</h2>

      {/* Crear nueva área */}
      <div className="crear-area">
        <input
          type="text"
          placeholder="Nombre nueva área"
          value={nuevaArea}
          onChange={(e) => setNuevaArea(e.target.value)}
        />
        <button onClick={crearArea}>Crear</button>
      </div>

      {/* Tabla */}
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
                      <input
                        value={nombreEditado}
                        onChange={(e) =>
                          setNombreEditado(e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <select
                        value={estadoEditado}
                        onChange={(e) =>
                          setEstadoEditado(e.target.value)
                        }
                      >
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="INACTIVO">INACTIVO</option>
                      </select>
                    </td>

                    <td>
                      <button
                        className="btn-primary"
                        onClick={() =>
                          guardarEdicion(area.id)
                        }
                      >
                        Guardar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{area.nombre}</td>
                    <td>{area.estado}</td>
                    <td>
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setEditando(area.id);
                          setNombreEditado(area.nombre);
                          setEstadoEditado(
                            area.estado || "ACTIVO"
                          );
                        }}
                      >
                        Editar
                      </button>

                      <button
                        className="btn-danger"
                        onClick={() =>
                          eliminarArea(area.id)
                        }
                      >
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
