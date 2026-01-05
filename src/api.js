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

//Funcion para obtener usuarios
export const obtenerUsuarios = async () => {
  const response = await api.get('/admin/usuarios');
  return response.data;
};

// Función para registrar usuario
export const crearUsuarioAdmin = async ({ data, usuarioLogueado }) => {
  try {
    const response = await api.post('/admin/crear-usuario', { ...data, usuarioLogueado });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error creando usuario');
    } else if (error.request) {
      throw new Error('No se pudo conectar al servidor');
    } else {
      throw new Error(error.message);
    }
  }
};

// Función para iniciar sesión
export const iniciarSesion = async (correo, password) => {
  try {
    const response = await api.post('/login', {
      correo,
      password
    });
    return response.data;
  } catch (error) {
    // Manejo mejorado de errores
    if (error.response) {
      // El servidor respondió con un error
      const errorData = error.response.data;
      throw new Error(errorData.message || 'Error al iniciar sesión');
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      throw new Error(
        'No se pudo conectar al servidor backend.\n\n' +
        'Para solucionarlo:\n' +
        '1. Abre una nueva terminal\n' +
        '2. Navega a la carpeta server: cd server\n' +
        '3. Ejecuta: npm start\n' +
        '4. Verifica que veas: "🚀 Servidor corriendo en http://localhost:3001"\n\n' +
        'O ejecuta el archivo: server\\iniciar.bat'
      );
    } else {
      // Error al configurar la petición
      throw new Error('Error al realizar la petición: ' + error.message);
    }
  }
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

// Función auxiliar para reintentar peticiones
const retryRequest = async (requestFn, maxRetries = 3, delay = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      if (error.request && !error.response) {
        // Solo reintentar si es error de conexión
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

// Enviar correos de Citas
export const sendCitasEmails = async (file, userId, username, doSend) => {
  try {
    // Verificar conexión al servidor primero
    const serverAvailable = await checkServerHealth();
    if (!serverAvailable) {
      throw new Error('El servidor backend no está disponible. Por favor, inicia el servidor:\n\n1. Abre una terminal\n2. Navega a la carpeta server: cd server\n3. Ejecuta: npm start\n\nO ejecuta: server\\iniciar.bat');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('username', username);
    formData.append('doSend', doSend ? 'true' : 'false');

    const response = await retryRequest(async () => {
      return await api.post('/send-citas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 300000 // 5 minutos
      });
    });
    
    if (response.status >= 400) {
      throw new Error(response.data?.message || 'Error enviando correos');
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error enviando correos');
    } else if (error.request || error.message.includes('servidor backend no está disponible')) {
      throw error; // Ya tiene un mensaje claro
    } else {
      throw new Error('Error enviando correos: ' + error.message);
    }
  }
};

// Enviar correos de Reprogramación
export const sendReprogramacionEmails = async (file, userId, username, doSend) => {
  try {
    // Verificar conexión al servidor primero
    const serverAvailable = await checkServerHealth();
    if (!serverAvailable) {
      throw new Error('El servidor backend no está disponible. Por favor, inicia el servidor:\n\n1. Abre una terminal\n2. Navega a la carpeta server: cd server\n3. Ejecuta: npm start\n\nO ejecuta: server\\iniciar.bat');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('username', username);
    formData.append('doSend', doSend ? 'true' : 'false');

    const response = await retryRequest(async () => {
      return await api.post('/send-reprogramacion', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 300000 // 5 minutos
      });
    });
    
    if (response.status >= 400) {
      throw new Error(response.data?.message || 'Error enviando correos');
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error enviando correos');
    } else if (error.request || error.message.includes('servidor backend no está disponible')) {
      throw error; // Ya tiene un mensaje claro
    } else {
      throw new Error('Error enviando correos: ' + error.message);
    }
  }
};

// Enviar correos de Dengue
export const sendDengueEmails = async (file, userId, username, doSend) => {
  try {
    // Verificar conexión al servidor primero
    const serverAvailable = await checkServerHealth();
    if (!serverAvailable) {
      throw new Error('El servidor backend no está disponible. Por favor, inicia el servidor:\n\n1. Abre una terminal\n2. Navega a la carpeta server: cd server\n3. Ejecuta: npm start\n\nO ejecuta: server\\iniciar.bat');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('username', username);
    formData.append('doSend', doSend ? 'true' : 'false');

    const response = await retryRequest(async () => {
      return await api.post('/send-dengue', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 300000 // 5 minutos
      });
    });
    
    if (response.status >= 400) {
      throw new Error(response.data?.message || 'Error enviando correos');
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error enviando correos');
    } else if (error.request || error.message.includes('servidor backend no está disponible')) {
      throw error; // Ya tiene un mensaje claro
    } else {
      throw new Error('Error enviando correos: ' + error.message);
    }
  }
};

// Enviar correos de Cursos
export const sendCursosEmails = async (file, userId, username, doSend) => {
  try {
    // Verificar conexión al servidor primero
    const serverAvailable = await checkServerHealth();
    if (!serverAvailable) {
      throw new Error('El servidor backend no está disponible. Por favor, inicia el servidor:\n\n1. Abre una terminal\n2. Navega a la carpeta server: cd server\n3. Ejecuta: npm start\n\nO ejecuta: server\\iniciar.bat');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('username', username);
    formData.append('doSend', doSend ? 'true' : 'false');

    const response = await retryRequest(async () => {
      return await api.post('/send-cursos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 300000 // 5 minutos
      });
    });
    
    if (response.status >= 400) {
      throw new Error(response.data?.message || 'Error enviando correos');
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error enviando correos');
    } else if (error.request || error.message.includes('servidor backend no está disponible')) {
      throw error; // Ya tiene un mensaje claro
    } else {
      throw new Error('Error enviando correos: ' + error.message);
    }
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

