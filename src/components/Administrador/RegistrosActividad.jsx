import { useEffect, useState } from "react";
import axios from "axios";
import "./RegistrosActividad.css";

export default function RegistrosActividad() {

  const [registros, setRegistros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [filtros, setFiltros] = useState({
    userId: "todos",
    action: "todas",
    fechaInicio: "",
    fechaFin: ""
  });

  // Cargar usuarios para el select
  useEffect(() => {
    obtenerUsuarios();
    obtenerRegistros();
  }, []);

  const obtenerUsuarios = async () => {
    try {
        const res = await axios.get("/api/admin/usuarios");

        if (res.data.success) {
        setUsuarios(res.data.usuarios);
        }

    } catch (error) {
        console.error("Error cargando usuarios", error);
    }
  };


  const obtenerRegistros = async () => {
    try {
      const res = await axios.get("/api/registros/actividad", {
        params: {
          ...filtros,
          page: pagina,
          limit: 10
        }
      });

      if (res.data.success) {
        setRegistros(res.data.registros);
        setTotalPaginas(res.data.totalPages);
      }

    } catch (error) {
      console.error("Error cargando registros", error);
    }
  };

  const handleChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  const handleBuscar = () => {
    obtenerRegistros();
  };

  useEffect(() => {
    obtenerRegistros();
  }, [pagina]);

  return (
    <div className="registros-container">

      <h2>Registros de Actividad</h2>

      {/* FILTROS */}
      <div className="filtros">

        <select name="userId" value={filtros.userId} onChange={handleChange}>
          <option value="todos">Todos los usuarios</option>
          {usuarios.map((u) => (
            <option key={u.documento} value={u.documento}>
              {u.nombre}
            </option>
          ))}
        </select>

        <select name="action" value={filtros.action} onChange={handleChange}>
          <option value="todas">Todas las acciones</option>
          <option value="CREAR_PLANTILLA">Crear Plantilla</option>
          <option value="ACTUALIZAR_PLANTILLA">Actualizar Plantilla</option>
          <option value="ELIMINAR_PLANTILLA">Eliminar Plantilla</option>
          <option value="CREAR_USUARIO">Crear Usuario</option>
          <option value="ACTUALIZAR_USUARIO">Actualizar Usuario</option>
          <option value="CREAR_AREA">Crear Área</option>
          <option value="ACTUALIZAR_AREA">Actualizar Área</option>
        </select>

        <input type="date" name="fechaInicio" value={filtros.fechaInicio} onChange={handleChange}/>

        <input type="date" name="fechaFin" value={filtros.fechaFin} onChange={handleChange}/>

        <button onClick={handleBuscar}>
          Buscar
        </button>

      </div>

      {/* 📋 TABLA */}
      <div className="tabla-container">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {registros.length === 0 ? (
              <tr>
                <td colSpan="4">No hay registros</td>
              </tr>
            ) : (
              registros.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.timestamp).toLocaleString()}</td>
                  <td>{r.user_nombre}</td>
                  <td>{r.action}</td>
                  <td>{r.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* PAGINACIÓN */}
      <div className="paginacion">
        <button 
          disabled={pagina === 1}
          onClick={() => setPagina(pagina - 1)}
        >
          Anterior
        </button>

        <span>
          Página {pagina} de {totalPaginas}
        </span>

        <button 
          disabled={pagina === totalPaginas}
          onClick={() => setPagina(pagina + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
