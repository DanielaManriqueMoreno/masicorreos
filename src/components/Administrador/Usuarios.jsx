import { useEffect, useState } from "react";
import { obtenerUsuarios } from "../../api";
import { notifyError } from "../../utils/notificaciones";
import CrearUsuarioModal from "./CrearUsuarioModal";
import EditarUsuarioModal from "./EditarUsuarioModal";
import "./Usuarios.css";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editarDocumento, setEditarDocumento] = useState(null);
  const [loading, setLoading] = useState(true);


  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const res = await obtenerUsuarios();

      if (res.success) {
        setUsuarios(res.usuarios);
      } else {
        notifyError(res.message || "Error al cargar usuarios");
      }

    } catch (err) {
      notifyError("Error de conexión con el servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  if (loading) return <div>Cargando usuarios...</div>;

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h2>Usuarios</h2>
        <button onClick={() => setMostrarModal(true)}>
          + Crear usuario
        </button>
      </div>

      <table className="usuarios-table">
        <thead>
          <tr>
            <th>Documento</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length > 0 ? (
            usuarios.map(u => (
              <tr key={u.documento}>
                <td>{u.documento}</td>
                <td>{u.nombre}</td>
                <td>{u.correo}</td>
                <td>{u.rol}</td>
                <td>{u.estado}</td>
                <td>
                  <button onClick={() => setEditarDocumento(u.documento)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No hay usuarios registrados</td>
            </tr>
          )}
        </tbody>
      </table>

      {mostrarModal && (
        <CrearUsuarioModal
          onClose={() => setMostrarModal(false)}
          onCreado={cargarUsuarios}
        />
      )}

      {editarDocumento && (
        <EditarUsuarioModal
          documento={editarDocumento}
          onClose={() => setEditarDocumento(null)}
          onActualizado={cargarUsuarios}
        />
      )}
    </div>
  );
}
