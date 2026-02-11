import { useEffect, useState } from "react";
import "./Areas.css";

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [nuevaArea, setNuevaArea] = useState("");
  const [editando, setEditando] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [estadoEditado, setEstadoEditado] = useState("ACTIVO");

  // 🔹 Cargar áreas
  const cargarAreas = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/areas");
      const data = await res.json();
      setAreas(data);
    } catch (error) {
      console.error("Error cargando áreas:", error);
    }
  };

  useEffect(() => {
    cargarAreas();
  }, []);

  // 🔹 Crear área
  const crearArea = async () => {
    if (!nuevaArea.trim()) return;

    await fetch("http://localhost:3001/api/admin/areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nuevaArea }),
    });

    setNuevaArea("");
    cargarAreas();
  };

  // 🔹 Guardar edición
  const guardarEdicion = async (id) => {
    await fetch(`http://localhost:3001/api/admin/areas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombreEditado,
        estado: estadoEditado,
      }),
    });

    setEditando(null);
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

      {/* Listado */}
      <div className="areas-list">
        {areas.map((area) => (
          <div key={area.id} className="area-card">
            {editando === area.id ? (
              <>
                <input
                  value={nombreEditado}
                  onChange={(e) => setNombreEditado(e.target.value)}
                />

                <select
                  value={estadoEditado}
                  onChange={(e) => setEstadoEditado(e.target.value)}
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>

                <button onClick={() => guardarEdicion(area.id)}>
                  Guardar
                </button>
              </>
            ) : (
              <>
                <div>
                  <strong>{area.nombre}</strong>
                  <p>Estado: {area.estado}</p>
                </div>

                <button
                  onClick={() => {
                    setEditando(area.id);
                    setNombreEditado(area.nombre);
                    setEstadoEditado(area.estado);
                  }}
                >
                  Editar
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
