// VerRegistros.jsx
import React, { useState, useEffect } from 'react';
import './VerRegistros.css';

const VerRegistros = ({ onVolver, usuario }) => {
  const [tipoFiltro, setTipoFiltro] = useState('todos'); // 'todos', 'actividad', 'correos', 'plantillas'
  const [filtroUsuario, setFiltroUsuario] = useState(usuario?.id || 'todos');
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [usuarios, setUsuarios] = useState([]);

  // Cargar lista de usuarios
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Cargar registros cuando cambia el filtro
  useEffect(() => {
    if (tipoFiltro !== 'todos') {
      cargarRegistros();
    }
  }, [tipoFiltro, filtroUsuario]);

  const cargarUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsuarios(data.usuarios || []);
        }
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const cargarRegistros = async () => {
    setCargando(true);
    try {
      let url = '';
      
      switch(tipoFiltro) {
        case 'actividad':
          url = `http://localhost:3001/api/registros/actividad${filtroUsuario !== 'todos' ? `?userId=${filtroUsuario}` : ''}`;
          break;
        case 'correos':
          url = `http://localhost:3001/api/registros/correos${filtroUsuario !== 'todos' ? `?userId=${filtroUsuario}` : ''}`;
          break;
        case 'correos-plantillas':
          url = `http://localhost:3001/api/registros/correos-plantillas${filtroUsuario !== 'todos' ? `?userId=${filtroUsuario}` : ''}`;
          break;
        case 'correos-programados':
          url = `http://localhost:3001/api/registros/correos-programados${filtroUsuario !== 'todos' ? `?userId=${filtroUsuario}` : ''}`;
          break;
        case 'plantillas':
          url = `http://localhost:3001/api/registros/plantillas${filtroUsuario !== 'todos' ? `?userId=${filtroUsuario}` : ''}`;
          break;
        case 'correos-fallidos':
          url = `http://localhost:3001/api/registros/correos-fallidos${filtroUsuario !== 'todos' ? `?userId=${filtroUsuario}` : ''}`;
          break;
        case 'usuarios':
          url = `http://localhost:3001/api/registros/usuarios${filtroUsuario !== 'todos' ? `?userId=${filtroUsuario}` : ''}`;
          break;
        default:
          return;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRegistros(data.registros || []);
        } else {
          setRegistros([]);
        }
      } else {
        setRegistros([]);
      }
    } catch (error) {
      console.error('Error cargando registros:', error);
      setRegistros([]);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRegistros = () => {
    if (cargando) {
      return <div className="loading">Cargando registros...</div>;
    }

    if (registros.length === 0) {
      return <div className="empty-state">No hay registros para mostrar</div>;
    }

    switch(tipoFiltro) {
      case 'actividad':
        return (
          <div className="registros-table">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Descripción</th>
                  <th>IP</th>
                  <th>Fecha/Hora</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.username}</td>
                    <td><span className="badge badge-action">{reg.action}</span></td>
                    <td>{reg.description || 'N/A'}</td>
                    <td>{reg.ip_address || 'N/A'}</td>
                    <td>{formatearFecha(reg.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'correos':
        return (
          <div className="registros-table">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Destinatario</th>
                  <th>Asunto</th>
                  <th>Estado</th>
                  <th>Fecha/Hora</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.username || 'N/A'}</td>
                    <td>{reg.recipient_email}</td>
                    <td>{reg.subject || 'N/A'}</td>
                    <td><span className={`badge badge-${reg.status?.toLowerCase()}`}>{reg.status}</span></td>
                    <td>{formatearFecha(reg.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'correos-plantillas':
        return (
          <div className="registros-table">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Plantilla</th>
                  <th>Destinatario</th>
                  <th>Estado</th>
                  <th>Fecha Envío</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.username || 'N/A'}</td>
                    <td>{reg.template_name || 'N/A'}</td>
                    <td>{reg.recipient_email}</td>
                    <td><span className={`badge badge-${reg.status?.toLowerCase()}`}>{reg.status}</span></td>
                    <td>{formatearFecha(reg.sent_datetime || reg.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'plantillas':
        return (
          <div className="registros-table">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Variables</th>
                  <th>Fecha Creación</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.username || 'N/A'}</td>
                    <td>{reg.nombre}</td>
                    <td><span className="badge badge-categoria">{reg.categoria}</span></td>
                    <td>{reg.variables ? JSON.parse(reg.variables).length : 0} variables</td>
                    <td>{formatearFecha(reg.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'correos-fallidos':
        return (
          <div className="registros-table">
            <table>
              <thead>
                <tr>
                  <th>Sistema</th>
                  <th>Usuario</th>
                  <th>Destinatario</th>
                  <th>Error</th>
                  <th>Intentos</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(reg => (
                  <tr key={reg.id}>
                    <td><span className="badge badge-sistema">{reg.sistema}</span></td>
                    <td>{reg.username || 'N/A'}</td>
                    <td>{reg.recipient_email}</td>
                    <td className="error-message">{reg.error_message}</td>
                    <td>{reg.intentos_envio || 1}</td>
                    <td>{formatearFecha(reg.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'correos-programados':
        return (
          <div className="registros-table">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Destinatario</th>
                  <th>Asunto</th>
                  <th>Fecha Programada</th>
                  <th>Estado</th>
                  <th>Fecha Envío</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.username || 'N/A'}</td>
                    <td>{reg.recipient_email}</td>
                    <td>{reg.subject || 'N/A'}</td>
                    <td>{formatearFecha(reg.scheduled_datetime)}</td>
                    <td><span className={`badge badge-${reg.status?.toLowerCase()}`}>{reg.status}</span></td>
                    <td>{reg.sent_datetime ? formatearFecha(reg.sent_datetime) : 'Pendiente'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'usuarios':
        return (
          <div className="registros-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.id}</td>
                    <td>{reg.nombre || 'N/A'}</td>
                    <td>{reg.usuario}</td>
                    <td><span className={`badge badge-${reg.is_active ? 'enviado' : 'fallido'}`}>
                      {reg.is_active ? 'Activo' : 'Inactivo'}
                    </span></td>
                    <td>{formatearFecha(reg.fecha_registro)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ver-registros-container">
      {onVolver && (
        <div className="btn-volver-container">
          <button className="btn-volver" onClick={onVolver}>
            ← Volver
          </button>
        </div>
      )}

      <div className="registros-header">
        <h1>📊 Ver Registros</h1>
        <p>Consulta y filtra los registros del sistema</p>
      </div>

      <div className="filtros-container">
        <div className="filtro-grupo">
          <label>Tipo de Registro:</label>
          <select 
            value={tipoFiltro} 
            onChange={(e) => {
              setTipoFiltro(e.target.value);
              setRegistros([]);
            }}
            className="select-filtro"
          >
            <option value="todos">Seleccione un tipo...</option>
            <option value="usuarios">👥 Usuarios Registrados</option>
            <option value="actividad">📝 Registros de Actividad</option>
            <option value="correos">📧 Correos Básicos</option>
            <option value="correos-plantillas">📨 Correos con Plantillas</option>
            <option value="correos-programados">⏰ Correos Programados</option>
            <option value="plantillas">🎨 Plantillas Creadas</option>
            <option value="correos-fallidos">❌ Correos Fallidos</option>
          </select>
        </div>

        {tipoFiltro !== 'usuarios' && (
          <div className="filtro-grupo">
            <label>Filtrar por Usuario:</label>
            <select 
              value={filtroUsuario} 
              onChange={(e) => {
                setFiltroUsuario(e.target.value);
                setRegistros([]);
              }}
              className="select-filtro"
            >
              <option value="todos">Todos los usuarios</option>
              {usuarios.map(user => (
                <option key={user.id} value={user.id}>
                  {user.nombre || user.usuario}
                </option>
              ))}
            </select>
          </div>
        )}

        {tipoFiltro !== 'todos' && (
          <button className="btn-cargar" onClick={cargarRegistros}>
            🔄 Actualizar
          </button>
        )}
      </div>

      <div className="registros-content">
        {tipoFiltro === 'todos' ? (
          <div className="empty-state">
            <p>Seleccione un tipo de registro para comenzar</p>
          </div>
        ) : (
          renderRegistros()
        )}
      </div>

      {registros.length > 0 && (
        <div className="registros-stats">
          <p>Total de registros: <strong>{registros.length}</strong></p>
        </div>
      )}
    </div>
  );
};

export default VerRegistros;

