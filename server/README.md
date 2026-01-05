# Backend - Sistema de Login con MySQL

## Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copia el archivo `.env.example` a `.env` y configura tus credenciales de MySQL:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=masicorreos_db
DB_PORT=3306
PORT=3001
```

### 3. Crear la base de datos
Ejecuta el script SQL en MySQL:
```bash
mysql -u root -p < database.sql
```

O ejecuta el contenido de `database.sql` en tu cliente MySQL (phpMyAdmin, MySQL Workbench, etc.)

### 4. Iniciar el servidor
```bash
npm start
```

Para desarrollo con auto-reload:
```bash
npm run dev
```

## Endpoints de la API

### POST /api/registro
Registra un nuevo usuario.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "usuario": "juan123",
  "password": "miPassword123"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "userId": 1
}
```

### POST /api/login
Inicia sesión con un usuario.

**Body:**
```json
{
  "usuario": "juan123",
  "password": "miPassword123"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "usuario": "juan123"
  }
}
```

### GET /api/health
Verifica el estado del servidor.

## Notas de Seguridad

- Las contraseñas se almacenan con hash usando bcrypt
- Se valida que las contraseñas tengan al menos 8 caracteres
- Los usuarios deben ser únicos en la base de datos

