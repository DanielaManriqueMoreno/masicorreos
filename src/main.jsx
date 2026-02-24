//Este archivo es el motor de arranque de la aplicacion React, importando el componente principal App y renderizandolo en el DOM
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { UserProvider } from './context/UserContext.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <App />
      <>
        <ToastContainer position="top-right" autoClose={3000} />
      </>
    </UserProvider>
  </StrictMode>,
)
