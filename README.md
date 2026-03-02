# Masicorreos UMIT - Sistema de Login con MySQL

Sistema de gestión con autenticación de usuarios usando React + Vite (frontend) y Node.js + Express + MySQL (backend).

## 🚀 Configuración del Proyecto

### Frontend (React + Vite)

1. **Instalar dependencias:**
```bash
npm install
```

2. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

### Backend (Node.js + Express + MySQL)

1. **Navegar a la carpeta del servidor:**
```bash
cd server
```
2. **Instalar dependencias:**
```bash
npm install
```
3. **Configurar variables de entorno:**
   - Crea un archivo `.env` en la carpeta `server/`
   - Copia la configuración de ejemplo y ajusta tus credenciales:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=masicorreos_db
DB_PORT=3306
PORT=3001
```

4. **Crear la base de datos MySQL:**
   - Abre MySQL (phpMyAdmin, MySQL Workbench, o línea de comandos)
   - Ejecuta el script `masicorreos_db.sql` 
5. **Iniciar el servidor backend:**
```bash
npm start
```

Para desarrollo con auto-reload:
```bash
npm run dev
```

## 📋 Estructura del Proyecto

```
├── src/                    # Frontend React
│   ├── App.jsx            # Componente principal con login
│   ├── Formulario.jsx    # Formulario de registro
│   ├── Interfaz1.jsx     # Interfaz principal después del login
│   └── api.js            # Configuración de llamadas a la API
│
└── server/                # Backend Node.js
    ├── server.js         # Servidor Express
    ├── database.js       # Configuración de MySQL
    ├── database.sql      # Script SQL para crear la base de datos
    └── package.json      # Dependencias del backend
```

## 🔐 Funcionalidades

- ✅ Registro de usuarios con validación
- ✅ Login con autenticación
- ✅ Almacenamiento seguro en MySQL
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Validación de usuarios únicos
- ✅ Manejo de errores y mensajes informativos

## 🌐 Endpoints de la API

- `POST /api/registro` - Registrar nuevo usuario
- `POST /api/login` - Iniciar sesión
- `GET /api/health` - Verificar estado del servidor

## ⚙️ Variables de Entorno

El frontend usa la variable `VITE_API_URL` para la URL del backend. Por defecto es `http://localhost:3001/api`.

Puedes crear un archivo `.env` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:3001/api
```

## Pasos para desplegar el archivo

### 🧩 Arquitectura

* **Frontend (React + Vite)** → Vercel
* **Backend (Node.js)** → Railway
* **Base de datos (MySQL)** → Railway
* Son **servicios separados** que se conectan por URL y variables de entorno.

---

## ✅ Flujo Correcto de Despliegue

1. **Subir el proyecto a GitHub**

   * El repositorio contiene **solo código y scripts**, nunca credenciales.
   * No debe existir ningún `.env` en GitHub.

2. **Crear la base de datos en Railway**

   * Crear proyecto → Provision MySQL
   * Copiar credenciales (`HOST, USER, PASSWORD, PORT, DB`)
   * Ejecutar los scripts `.sql` para crear las tablas (solo estructura).

3. **Desplegar el Backend (Railway)**

   * Conectar el repo de GitHub
   * Root directory: `server`
   * Start command: `npm start`
   * Configurar variables de entorno:

     * Base de datos (DB_*)
     * Gmail (App Password, no contraseña normal)
     * `FRONTEND_URL`
     * `PORT=3001`, `NODE_ENV=production`
   * Verificar que funcione en:
     `/api/health` → debe responder **OK**

4. **Desplegar el Frontend (Vercel)**

   * Conectar el mismo repo
   * Vercel detecta Vite automáticamente
   * Agregar variable:

     * `VITE_API_URL = https://backend.railway.app/api`
   * Deploy → obtener URL pública

5. **Conectar ambos**

   * Copiar la URL de Vercel
   * Actualizar `FRONTEND_URL` en Railway
   * Verificar CORS en el backend

---

## 🔄 Correos programados (Cron)

* Puede usarse:

  * `node-cron` si el servidor se mantiene activo
  * o un cron externo llamando a un endpoint del backend

---

## ❌ Archivos que **NUNCA** se suben (crítico)

* `.env`, `.env.*`
* `server/config.js` con datos reales
* Backups o dumps SQL con información real

## ⚠️ Archivos que **mejor no subir**

* `.bat`, `.ps1` (solo sirven en local / Windows)

## ✅ Archivos que **sí se suben**

* Todo el código (`src`, `server/*.js`)
* Scripts `.sql` (solo estructura)
* Configs (`package.json`, `vite.config.js`, `vercel.json`, `railway.json`)
* Documentación (`README.md`, demás `.md`)
* Archivos de ejemplo (`config.example.js`)

---

## 🧪 Verificación final

* Frontend abre en Vercel
* Backend responde en `/api/health`
* Login funciona
* Frontend y backend se comunican
* Correos envían correctamente

---

### 🧠 Idea clave para entenderlo

> **GitHub guarda código**,
> **Railway y Vercel guardan secretos**,
> **Frontend y Backend viven separados pero conectados por URLs**.

Si quieres, el siguiente paso puede ser:

* 🔍 explicarte **qué hace cada variable de entorno**
* 🧠 revisar **qué pasa internamente cuando alguien hace login**
* 📦 o analizar los `.bat` uno por uno sin enredos


## 📝 Notas

- Asegúrate de que MySQL esté corriendo antes de iniciar el backend
- El servidor backend debe estar corriendo en el puerto 3001 (o el que configures)
- Las contraseñas se almacenan de forma segura usando bcrypt
