// api.js - Configuración de la API
import axios from 'axios';

// URL base de la API (ajusta según tu configuración)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 300000, // 5 minutos para archivos grandes
  validateStatus: function (status) {
    return status < 500; // Resolver para cualquier código de estado menor que 500
  }
});

//Funcion para verificar sesion
export const verificarSesion = async (documento) => {
  const res = await api.get("/auth/me", {
    params: { documento }
  });
  return res.data;
};


//Funcion para obtener usuarios
export const obtenerUsuarios = async () => {
  const res = await api.get('/admin/usuarios');
  return res.data;
};

// Función para registrar usuario
export const crearUsuarioAdmin = async ( data) => {
    const res = await api.post('/admin/crear-usuario',  data );
    return res.data;
};

// Función para iniciar sesión
export const iniciarSesion = async (correo, password) => {
  const response = await api.post('/login', {
    correo,
    password
  });
  return response.data;
};

// Función para editar informacion personal
export const actualizarPerfil = async (data) => {
  const res = await api.put("/perfil", data);
  return res.data;
};

// Obtener detalles de un usuario (ADMIN)
export const obtenerUsuarioAdmin = async (documento) => {
  const res = await api.get(`/admin/usuarios/${documento}`);
  return res.data;
};

// Editar usuario (ADMIN)
export const editarUsuarioAdmin = async (documento, data) => {
  const res = await api.put(`/admin/usuarios/${documento}`, data);
  return res.data;
};

// Obtener áreas activas
export const obtenerAreas = async () => {
  const res = await api.get('/areas');
  return res.data;
};

// Función para verificar si el servidor está disponible
const checkServerHealth = async () => {
  try {
    const baseURL = API_URL.replace('/api', '');
    const response = await axios.get(`${baseURL}/api/health`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// Función para solicitar recuperación de contraseña
export const solicitarRecuperacion = async (correo) => {
  try {
    const response = await api.post('/forgot-password', {
      correo
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      throw new Error(errorData.message || 'Error al solicitar recuperación');
    } else if (error.request) {
      throw new Error('No se pudo conectar al servidor backend. Verifica que el servidor esté corriendo.');
    } else {
      throw new Error('Error al realizar la petición: ' + error.message);
    }
  }
};

// Función para restablecer contraseña con token
export const restablecerPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/reset-password', {
      token,
      newPassword
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      throw new Error(errorData.message || 'Error al restablecer contraseña');
    } else if (error.request) {
      throw new Error('No se pudo conectar al servidor backend. Verifica que el servidor esté corriendo.');
    } else {
      throw new Error('Error al realizar la petición: ' + error.message);
    }
  }
};

export default api;

