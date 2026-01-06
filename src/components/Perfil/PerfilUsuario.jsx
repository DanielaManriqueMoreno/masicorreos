import { React } from 'react';


function PerfilUsuario({ usuario }) {
  return (
    <div>
      <h1>Mi Perfil</h1>
      <p><strong>Nombre:</strong> {usuario.nombre}</p>
      <p><strong>Usuario:</strong> {usuario.usuario}</p>
      <p><strong>Rol:</strong> {usuario.rol}</p>
    </div>
  );
}

export default PerfilUsuario;
