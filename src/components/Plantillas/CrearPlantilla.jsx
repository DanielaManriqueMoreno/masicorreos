// CrearPlantilla.jsx
import React, { useEffect } from 'react';
import './CrearPlantilla.css';

import PlantillaForm from './PlantillaForm';
import EditorPlantilla from './EditorPlantilla';
import CamposDinamicos from './CamposDinamicos';
import EnvioMasivo from './EnvioMasivo';

import { useEnvioMasivo } from "./hooks/useEnvioMasivo";
import { useEditorPlantilla } from "./hooks/useEditorPlantilla";
import { usePlantillasCRUD } from "./hooks/usePlantillasCRUD";

const CrearPlantilla = ({ onVolver, usuario }) => {
  /* ---------------- CRUD PLANTILLAS ---------------- */
  const {
    plantillas, plantillaSeleccionada, plantillaEditando, vista, cargando, formData, setFormData, setVista, cargarPlantillas, nuevaPlantilla, seleccionarPlantilla, editarPlantilla, guardarPlantilla, eliminarPlantilla, resetForm, 
  } = usePlantillasCRUD();

  /* ---------------- ENVÍO MASIVO ---------------- */
  const {
    file, fileName, dragActive, isProcessing, progress, results, correoRemitenteEnvio, setCorreoRemitenteEnvio, handleDrag, handleDrop, handleFileSelect, enviarCorreos, descargarPlantillaExcel,
  } = useEnvioMasivo(plantillaSeleccionada, usuario);

  /* ---------------- EDITOR ---------------- */
  const editor = useEditorPlantilla(formData, setFormData);

  /* ---------------- EFECTOS ---------------- */
  useEffect(() => {
    cargarPlantillas();
  }, []);

  /* ---------------- INPUTS SIMPLES ---------------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="crear-plantilla-container">
      {onVolver && (
        <div className="btn-volver-container">
          <button className="btn-volver-plantilla" onClick={onVolver}>
            ← Volver al Menú
          </button>
        </div>
      )}

      <div className="card-header">
        <div className="logo-circle">📧</div>
        <h1>Gestión de Plantillas de Correo</h1>
        <p className="description">
          Crea plantillas personalizadas y envía correos masivamente
        </p>
      </div>

      <div className="plantillas-layout">
        {/* ---------------- SIDEBAR ---------------- */}
        <aside className="plantillas-sidebar">
          <div className="sidebar-header">
            <h2>Mis Plantillas</h2>
            <button
              className="btn-nueva-plantilla-small"
              onClick={nuevaPlantilla}
              title="Crear nueva plantilla"
            >
              ➕
            </button>
          </div>

          {cargando ? (
            <div className="loading">Cargando...</div>
          ) : plantillas.length === 0 ? (
            <div className="empty-state-sidebar">
              <p>No hay plantillas</p>
              <button
                className="btn-nueva-plantilla-small"
                onClick={nuevaPlantilla}
              >
                Crear primera
              </button>
            </div>
          ) : (
            <div className="plantillas-list">
              {plantillas.map(p => (
                <div
                  key={p.id}
                  className={`plantilla-item ${
                    plantillaSeleccionada?.id === p.id ? 'selected' : ''
                  }`}
                  onClick={() => seleccionarPlantilla(p)}
                >
                  <h3>{p.nombre}</h3>
                  <div className="plantilla-item-actions">
                    <button onClick={(e) => {e.stopPropagation(); editarPlantilla(p.id);}}>
                      ✏️
                    </button>
                    <button onClick={(e) => {e.stopPropagation(); eliminarPlantilla(p.id, p.nombre); }}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* ---------------- MAIN ---------------- */}
        <main className="plantillas-main">
          {vista === 'lista' && (
            <div className="welcome-screen">
              <h2>Bienvenido al Gestor de Plantillas</h2>
              <button onClick={nuevaPlantilla}>
                ➕ Crear Nueva Plantilla
              </button>
            </div>
          )}

          {vista === 'crear' && (
            <div className="editor-container">
              <div className="editor-header">
                <h2>
                  {plantillaEditando ? 'Editar Plantilla' : 'Nueva Plantilla'}
                </h2>

                <div className="editor-actions">
                  {formData.variables.length > 0 && (
                    <button onClick={descargarPlantillaExcel}>
                      ⬇ Descargar Excel
                    </button>
                  )}

                  <button className={editor.modoEditor === 'visual' ? 'active' : ''} onClick={() => editor.setModoEditor('visual')}>
                    ✏️ Editor
                  </button>

                  <button className={editor.modoEditor === 'codigo' ? 'active' : ''} onClick={() => editor.setModoEditor('codigo')}>
                    💻 HTML
                  </button>

                  <button onClick={editor.previewHTML}>
                    🔍 Vista Completa
                  </button>

                  <button onClick={() => {resetForm(); setVista('lista');}}>
                    Cancelar
                  </button>

                  <button disabled={ !formData.nombre.trim() || !formData.htmlContent?.trim()} onClick={guardarPlantilla}>
                    💾 Guardar
                  </button>
                </div>
              </div>

              <PlantillaForm
                formData={formData}
                handleInputChange={handleInputChange}
              />

              <CamposDinamicos
                formData={formData}
                {...editor}
              />

              <EditorPlantilla
                formData={formData}
                {...editor}
              />
            </div>
          )}

          {vista === 'enviar' && plantillaSeleccionada && (
            <EnvioMasivo
              plantillaSeleccionada={plantillaSeleccionada}
              descargarPlantillaExcel={descargarPlantillaExcel}
              correoRemitenteEnvio={correoRemitenteEnvio}
              setCorreoRemitenteEnvio={setCorreoRemitenteEnvio}
              dragActive={dragActive}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              handleFileSelect={handleFileSelect}
              file={file}
              fileName={fileName}
              isProcessing={isProcessing}
              progress={progress}
              enviarCorreos={enviarCorreos}
              results={results}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default CrearPlantilla;
