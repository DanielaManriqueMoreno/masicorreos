// RecuperarPassword.jsx
import React, { useState } from 'react';
import './RecuperarPassword.css';
import { solicitarRecuperacion, restablecerPassword } from '../../api';

const RecuperarPassword = ({ onCerrar }) => {
  const [paso, setPaso] = useState('solicitar'); // 'solicitar' | 'restablecer'
  const [usuario, setUsuario] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Solicitar recuperación de contraseña
  const handleSolicitarRecuperacion = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!usuario.trim()) {
      setError('Por favor ingresa tu nombre de usuario');
      return;
    }

    setCargando(true);

    try {
      const resultado = await solicitarRecuperacion(usuario.trim());
      
      if (resultado.success) {
        setMensaje(resultado.message || 'Si el usuario existe, recibirás un correo con las instrucciones para recuperar tu contraseña.');
        setUsuario('');
        // Opcional: cambiar al paso de restablecer después de 2 segundos
        setTimeout(() => {
          setPaso('restablecer');
        }, 2000);
      } else {
        setError(resultado.message || 'Error al solicitar recuperación');
      }
    } catch (err) {
      setError(err.message || 'Error al solicitar recuperación de contraseña');
    } finally {
      setCargando(false);
    }
  };

  // Restablecer contraseña con código
  const handleRestablecerPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!codigo.trim()) {
      setError('Por favor ingresa el código de verificación que recibiste por correo');
      return;
    }

    // Validar que sea un código numérico de 6 dígitos
    if (!/^\d{6}$/.test(codigo.trim())) {
      setError('El código debe ser un número de 6 dígitos');
      return;
    }

    if (!nuevaPassword.trim()) {
      setError('Por favor ingresa una nueva contraseña');
      return;
    }

    if (nuevaPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);

    try {
      const resultado = await restablecerPassword(codigo.trim(), nuevaPassword);
      
      if (resultado.success) {
        setMensaje(resultado.message || 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.');
        setCodigo('');
        setNuevaPassword('');
        setConfirmarPassword('');
        
        // Cerrar el panel después de 3 segundos
        setTimeout(() => {
          onCerrar();
        }, 3000);
      } else {
        setError(resultado.message || 'Error al restablecer contraseña');
      }
    } catch (err) {
      setError(err.message || 'Error al restablecer contraseña');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="recuperar-password-panel">
      <div className="recuperar-password-header">
        <h2>🔐 Recuperar Contraseña</h2>
        <button className="btn-cerrar" onClick={onCerrar}>✕</button>
      </div>

      <div className="recuperar-password-content">
        {paso === 'solicitar' ? (
          <div className="paso-solicitar">
            <h3>Paso 1: Solicitar Recuperación</h3>
            <p className="instrucciones">
              Ingresa tu nombre de usuario. Te enviaremos un correo con un código de verificación de 6 dígitos para restablecer tu contraseña.
            </p>

            <form onSubmit={handleSolicitarRecuperacion}>
              <div className="form-group">
                <label htmlFor="usuario">Nombre de Usuario:</label>
                <input
                  id="usuario"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  disabled={cargando}
                  required
                />
              </div>

              {error && (
                <div className="mensaje-error">{error}</div>
              )}

              {mensaje && (
                <div className="mensaje-exito">{mensaje}</div>
              )}

              <button type="submit" className="btn-enviar" disabled={cargando}>
                {cargando ? 'Enviando...' : '📧 Enviar Correo de Recuperación'}
              </button>
            </form>

            <div className="divider">
              <span>O</span>
            </div>

            <button 
              className="btn-cambiar-paso"
              onClick={() => setPaso('restablecer')}
            >
              Ya tengo el código, restablecer contraseña →
            </button>
          </div>
        ) : (
          <div className="paso-restablecer">
            <h3>Paso 2: Restablecer Contraseña</h3>
            <p className="instrucciones">
              Ingresa el código de verificación de 6 dígitos que recibiste por correo y tu nueva contraseña.
            </p>

            <form onSubmit={handleRestablecerPassword}>
              <div className="form-group">
                <label htmlFor="codigo">Código de Verificación (6 dígitos):</label>
                <input
                  id="codigo"
                  type="text"
                  value={codigo}
                  onChange={(e) => {
                    // Solo permitir números y máximo 6 dígitos
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCodigo(value);
                  }}
                  placeholder="000000"
                  disabled={cargando}
                  required
                  maxLength={6}
                  style={{ 
                    textAlign: 'center', 
                    fontSize: '24px', 
                    letterSpacing: '8px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                  }}
                />
                <small>Ingresa el código de 6 dígitos que recibiste en tu correo electrónico</small>
              </div>

              <div className="form-group">
                <label htmlFor="nuevaPassword">Nueva Contraseña:</label>
                <input
                  id="nuevaPassword"
                  type="password"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  disabled={cargando}
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmarPassword">Confirmar Contraseña:</label>
                <input
                  id="confirmarPassword"
                  type="password"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  disabled={cargando}
                  required
                  minLength={8}
                />
              </div>

              {error && (
                <div className="mensaje-error">{error}</div>
              )}

              {mensaje && (
                <div className="mensaje-exito">{mensaje}</div>
              )}

              <button type="submit" className="btn-enviar" disabled={cargando}>
                {cargando ? 'Restableciendo...' : '✅ Restablecer Contraseña'}
              </button>
            </form>

            <div className="divider">
              <span>O</span>
            </div>

            <button 
              className="btn-cambiar-paso"
              onClick={() => {
                setPaso('solicitar');
                setError('');
                setMensaje('');
              }}
            >
              ← Solicitar nuevo correo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecuperarPassword;

