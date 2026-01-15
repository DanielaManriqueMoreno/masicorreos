// CrearPlantilla.jsx
import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './CrearPlantilla.css';
import PlantillaForm from './PlantillaForm';
import { useEnvioMasivo } from '../../hooks/useEnvioMasivo';
import { useEditorPlantilla } from '../../hooks/useEditorPlantilla';
import { usePlantillasCRUD } from '../Plantillas/hooks/usePlantillasCRUD';

// Plantilla HTML base (estructura sin contenido)
const PLANTILLA_BASE = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Recordatorio de Cita Médica</title>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-circle">
                <img src="cid:logo" alt="UMIT Logo" />
            </div>
        </div>
        <div class="content">
            <!-- CONTENIDO_AQUI -->
        </div>
        <div class="footer">
            <!-- FOOTER_AQUI -->
        </div>
    </div>
</body>
</html>`;

// Plantillas Predefinidas (si se necesitan en el futuro)
const PLANTILLAS_PREDEFINIDAS = {
  umit_elegante: {
    nombre: 'Plantilla UMIT Elegante',
    html: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Comunicado UMIT</title>

</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo-wrapper">
                <div class="logo-box">
                    <img src="cid:logo" alt="Logo UMIT" />
                </div>
            </div>
            <h1 class="header-title">{{Titulo}}</h1>
            <p class="header-subtitle">Unidad Materno Infantil del Tolima</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Estimad@ <strong>{{Nombre}}</strong>,
            </div>
            
            <div class="message">
                {{MensajeInicial}}
            </div>
            
            <div class="info-card">
                <div class="info-row">
                    <span class="info-label">📄 Documento:</span>
                    <span class="info-value">{{Documento}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">📅 Fecha:</span>
                    <span class="info-value">{{Fecha}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">📋 Motivo:</span>
                    <span class="info-value">{{Motivo}}</span>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="additional-info">
                <h3>ℹ️ Información Adicional</h3>
                <p>{{InformacionAdicional}}</p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                <p>Atentamente,</p>
                <p class="footer-org">Unidad Materno Infantil del Tolima</p>
                <div class="footer-signature">
                    <p>{{Firma}}</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
  }
};

const CrearPlantilla = ({ onVolver, usuario }) => {

  const {
    file, fileName, dragActive, isProcessing, progress, results, correoRemitenteEnvio, setCorreoRemitenteEnvio, handleDrag, handleDrop, handleFileSelect, enviarCorreos, descargarPlantillaExcel,
  } = useEnvioMasivo(plantillaSeleccionada, usuario);

  const {
    modoEditor, setModoEditor, mostrarPreview, setMostrarPreview, contenidoVisual, setContenidoVisual, editandoCampo, nuevoCampoNombre, nuevoCampoValor, setNuevoCampoNombre,setNuevoCampoValor, handleVisualChange, handleKeyDownVisual, convertirTextoEnVariable,aplicarFormatoVisual, handleHtmlChange, aplicarEstilo, insertarElemento, agregarVariable,eliminarVariable, insertarVariable, agregarCampoDinamico, editarCampoDinamico, guardarEdicionCampo, cancelarEdicion, eliminarCampoDinamico, previewHTML,
  } = useEditorPlantilla(formData, setFormData);

  const {
    plantillas, plantillaSeleccionada, plantillaEditando, vista, cargando, formData, setFormData, setVista, cargarPlantillas, nuevaPlantilla, seleccionarPlantilla, editarPlantilla, guardarPlantilla, eliminarPlantilla, resetForm, 
  } = usePlantillasCRUD();

  // Cargar plantillas al montar el componente
  useEffect(() => {
    cargarPlantillas();
  }, []);

  // Debug: Log cuando cambia la vista o el formData
  useEffect(() => {
    console.log('🔄 Vista actual:', vista);
    console.log('📝 FormData actual:', {
      nombre: formData.nombre,
      htmlLength: formData.htmlContent ? formData.htmlContent.length : 0,
      variables: formData.variables.length
    });
  }, [vista, formData.htmlContent]);

    // Extraer variables automáticamente cuando cambia el HTML
  useEffect(() => {
    if (formData.htmlContent) {
      const variableRegex = /\{\{([^}]+)\}\}/g;
      const variablesEncontradas = [];
      let match;
      while ((match = variableRegex.exec(formData.htmlContent)) !== null) {
        const varName = match[1].trim();
        if (varName && !variablesEncontradas.includes(varName)) {
          variablesEncontradas.push(varName);
        }
      }
      
      // Actualizar variables si hay nuevas
      if (variablesEncontradas.length > 0) {
        const variablesActuales = formData.variables || [];
        const nuevasVariables = variablesEncontradas.filter(v => !variablesActuales.includes(v));
        if (nuevasVariables.length > 0) {
          setFormData(prev => ({
            ...prev,
            variables: [...variablesActuales, ...nuevasVariables]
          }));
        }
      }
    }
  }, [formData.htmlContent]);

  // Sincronizar contenido visual cuando cambia el HTML (al cargar plantilla)
  useEffect(() => {
    if (modoEditor === 'visual' && formData.htmlContent) {
      const editor = document.getElementById('contenidoVisual');
      if (editor) {
        // Extraer solo el contenido del div.content (con formato HTML)
        let contenidoHTML = '';
        if (formData.htmlContent.includes('<!DOCTYPE') || formData.htmlContent.includes('<html')) {
          const contentMatch = formData.htmlContent.match(/<div class="content">([\s\S]*?)<\/div>/i);
          if (contentMatch) {
            contenidoHTML = contentMatch[1].trim();
          }
        } else {
          contenidoHTML = formData.htmlContent;
        }
        
        // Solo actualizar si el contenido es diferente
        if (editor.innerHTML !== contenidoHTML) {
          editor.innerHTML = contenidoHTML;
          const textoExtraido = extraerTextoDeHTML(formData.htmlContent);
          setContenidoVisual(textoExtraido);
        }
      }
    }
  }, [formData.htmlContent, modoEditor]);

  // Forzar actualización del textarea cuando cambie el htmlContent y estemos en vista crear
  useEffect(() => {
    if (vista === 'crear' && formData.htmlContent && modoEditor === 'codigo') {
      const timeoutId = setTimeout(() => {
        const textarea = document.getElementById('htmlContent');
        if (textarea) {
          if (textarea.value !== formData.htmlContent) {
            textarea.value = formData.htmlContent;
            // Disparar evento para React
            const event = new Event('input', { bubbles: true });
            textarea.dispatchEvent(event);
          }
        }
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [vista, formData.htmlContent, modoEditor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const usarPlantillaPredefinida = (tipo) => {
    try {
    const plantilla = PLANTILLAS_PREDEFINIDAS[tipo];
      if (!plantilla || !plantilla.html) {
        alert('Error: Plantilla no encontrada');
        return;
      }
      
      // Extraer variables
      const variableRegex = /\{\{([^}]+)\}\}/g;
      const variables = [];
      let match;
      const htmlCopy = plantilla.html;
      while ((match = variableRegex.exec(htmlCopy)) !== null) {
        const varName = match[1].trim();
        if (varName && !variables.includes(varName)) {
            variables.push(varName);
        }
      }

      // Crear formData completo
      const nuevoFormData = {
        nombre: plantilla.nombre,
        descripcion: `Plantilla ${plantilla.nombre.toLowerCase()} predefinida`,
        htmlContent: plantilla.html,
        categoria: 'personalizada',
        variables: variables,
        correoRemitente: 'micita@umit.com.co',
        camposDinamicos: variables.map(v => ({ nombre: v, valor: '', tipo: 'texto' }))
      };
      
      // ACTUALIZAR ESTADO - PRIMERO la vista, luego los datos
      setVista('crear');
      setPlantillaEditando(null);
      setModoEditor('visual');
      setMostrarPreview(true);
      
      // Actualizar formData después de un pequeño delay para asegurar renderizado
      setTimeout(() => {
        setFormData(nuevoFormData);
        
        // Forzar actualización del textarea después de que se renderice
        setTimeout(() => {
          const textarea = document.getElementById('htmlContent');
          if (textarea) {
            textarea.value = nuevoFormData.htmlContent;
            // Disparar evento para React
            const event = new Event('input', { bubbles: true });
            textarea.dispatchEvent(event);
          }
        }, 100);
      }, 50);
      
    } catch (error) {
      console.error('Error al usar plantilla:', error);
      alert('Error al cargar la plantilla: ' + error.message);
    }
  };

  return (
    <div className="crear-plantilla-container">
      {/* Botón Volver */}
      {onVolver && (
        <div className="btn-volver-container">
          <button className="btn-volver-plantilla" onClick={onVolver}>
            ← Volver al Menú
          </button>
        </div>
      )}

      {/* Header */}
      <div className="card-header">
        <div className="logo-circle">📧</div>
        <h1>Gestión de Plantillas de Correo</h1>
        <p className="description">
          Crea plantillas personalizadas y envía correos masivamente
        </p>
      </div>

      <div className="plantillas-layout">
        {/* Panel Lateral Izquierdo - Lista de Plantillas */}
        <aside className="plantillas-sidebar">
          <div className="sidebar-header">
            <h2>Mis Plantillas</h2>
            <button className="btn-nueva-plantilla-small" onClick={nuevaPlantilla} title="Crear nueva plantilla">
              ➕
            </button>
          </div>

          {cargando ? (
            <div className="loading">Cargando...</div>
          ) : plantillas.length === 0 ? (
            <div className="empty-state-sidebar">
              <p>No hay plantillas</p>
              <button className="btn-nueva-plantilla-small" onClick={nuevaPlantilla}>
                Crear primera
              </button>
            </div>
          ) : (
            <div className="plantillas-list">
              {plantillas.map(plantilla => (
                <div key={plantilla.id} className={`plantilla-item ${plantillaSeleccionada?.id === plantilla.id ? 'selected' : ''}`} 
                  onClick={() => seleccionarPlantilla(plantilla)}
                >
                  <div className="plantilla-item-header">
                    <h3>{plantilla.nombre}</h3>
                    <span className="categoria-badge-small">{plantilla.categoria}</span>
                  </div>
                  {plantilla.descripcion && (
                    <p className="plantilla-item-desc">{plantilla.descripcion}</p>
                  )}
                  <div className="plantilla-item-actions">
                    <button className="btn-editar-small" onClick={(e) => {
                        e.stopPropagation();
                        editarPlantilla(plantilla.id);
                      }}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button className="btn-eliminar-small" onClick={(e) => {
                        e.stopPropagation();
                        eliminarPlantilla(plantilla.id, plantilla.nombre);
                      }}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Contenido Principal */}
        <main className="plantillas-main">
          {vista === 'lista' && (
            <div className="welcome-screen">
              <h2>Bienvenido al Gestor de Plantillas</h2>
              <p>Selecciona una plantilla del panel izquierdo para editarla, o crea una nueva plantilla para comenzar.</p>
              <div className="welcome-actions">
                <button className="btn-crear-plantilla-principal" onClick={nuevaPlantilla}>
                  ➕ Crear Nueva Plantilla
                </button>
              </div>
            </div>
          )}

          {vista === 'crear' && (
            <div className="editor-container"> 
              <div className="editor-header">
                <h2>{plantillaEditando ? 'Editar Plantilla' : 'Nueva Plantilla'}</h2>
                <div className="editor-actions">
                  {formData.variables.length > 0 && (
                    <button className="download-btn" onClick={descargarPlantillaExcel}title="Descargar plantilla Excel con Email y campos dinámicos">
                      ⬇ Descargar Excel
                    </button>
                  )}
                  <button className={`btn-toggle-mode ${modoEditor === 'visual' ? 'active' : ''}`} onClick={() => {setModoEditor('visual');
                      // Sincronizar contenido visual al cambiar a modo visual
                      if (formData.htmlContent) {
                        const textoExtraido = extraerTextoDeHTML(formData.htmlContent);
                        setContenidoVisual(textoExtraido);
                      }
                    }}
                  >
                    ✏️ Editor de Plantilla
                  </button>
                  <button className={`btn-toggle-mode ${modoEditor === 'codigo' ? 'active' : ''}`}onClick={() => setModoEditor('codigo')}title="Modo avanzado para programadores (HTML)">
                    💻 HTML (Avanzado)
                  </button>
                  <button className="btn-toggle-preview" onClick={() => setMostrarPreview(!mostrarPreview)}>
                    {mostrarPreview ? '👁️ Ocultar Preview' : '👁️ Mostrar Preview'}
                  </button>
                  <button className="btn-preview" onClick={previewHTML} disabled={!formData.htmlContent}>
                    🔍 Vista Completa
                  </button>
                  <button className="btn-cancelar" onClick={() => { resetForm(); setVista('lista'); }}>
                    Cancelar
                  </button>
                  <button className="btn-guardar" onClick={guardarPlantilla} disabled={cargando || !formData.nombre.trim() || (!formData.htmlContent.trim() && !contenidoVisual.trim())} title={(!formData.nombre.trim() ? 'Ingresa un nombre para la plantilla' : (!formData.htmlContent.trim() && contenidoVisual.trim()) ? 'Escribe contenido en el editor' : 'Guardar plantilla')}>
                    {cargando ? 'Guardando...' : '💾 Guardar Plantilla'}
                  </button>
                </div>
              </div>


              {/* Editor de Campos Dinámicos - Solo para plantilla profesional */}
              {formData.camposDinamicos.length > 0 && (
                <div className="campos-dinamicos-container">
                  <h3>📝 Gestión de Campos Dinámicos</h3>
                  <p className="campos-descripcion">
                    Agrega, edita o elimina campos personalizados. Estos campos se pueden usar desde Excel.
                  </p>
                  
                  <div className="campos-lista">
                    {formData.camposDinamicos.map((campo, index) => (
                      <div key={index} className="campo-item">
                        {editandoCampo === index ? (
                          <div className="campo-editar">
                            <input type="text" value={nuevoCampoNombre} onChange={(e) => setNuevoCampoNombre(e.target.value)} placeholder="Nombre del campo" className="campo-input" />
                            <input type="text" value={nuevoCampoValor} onChange={(e) => setNuevoCampoValor(e.target.value)} placeholder="Valor por defecto opcional)" className="campo-input" />
                            <div className="campo-acciones">
                              <button className="btn-guardar-campo" onClick={guardarEdicionCampo}>
                                ✓ Guardar
                              </button>
                              <button className="btn-cancelar-campo" onClick={cancelarEdicion}>
                                ✖ Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="campo-mostrar">
                            <div className="campo-info">
                              <span className="campo-nombre">{`{{${campo.nombre}}}`}</span>
                              {campo.valor && (
                                <span className="campo-valor">Valor: {campo.valor}</span>
                              )}
                            </div>
                            <div className="campo-botones">
                              <button className="btn-editar-campo" onClick={() => editarCampoDinamico(index)} title="Editar campo">
                                ✏️
                              </button>
                              <button className="btn-eliminar-campo" onClick={() => eliminarCampoDinamico(index)} title="Eliminar campo">
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {editandoCampo === null && (
                    <div className="agregar-campo-form">
                      <h4>➕ Agregar Nuevo Campo</h4>
                      <div className="agregar-campo-inputs">
                        <input type="text" value={nuevoCampoNombre} onChange={(e) => setNuevoCampoNombre(e.target.value)} placeholder="Nombre del campo (ej: Telefono, Direccion)" className="campo-input-grande" onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              agregarCampoDinamico();
                            }
                          }}
                        />
                        <input type="text" value={nuevoCampoValor} onChange={(e) => setNuevoCampoValor(e.target.value)} placeholder="Valor por defecto (opcional)" className="campo-input-grande" onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              agregarCampoDinamico();
                            }
                          }}
                        />
                        <button className="btn-agregar-campo" onClick={agregarCampoDinamico} >
                          ➕ Agregar Campo
                        </button>
                      </div>
                      <small className="campo-ayuda">
                        💡 El campo se agregará automáticamente a la plantilla. Usa el formato {'{{'}NombreCampo{'}}'} en Excel.
                      </small>
                    </div>
                  )}
                </div>
              )}
              <PlantillaForm formData={formData} handleInputChange={handleInputChange}/>

              {/* Herramientas de Formato - Solo en modo visual */}
              {modoEditor === 'visual' && (
                <div className="herramientas-diseno">
                  <h3>🎨 Herramientas de Formato</h3>
                  <div className="herramientas-grid">
                    <div className="herramienta-grupo">
                      <label>Formato de Texto</label>
                      <div className="herramienta-botones">
                        <button 
                          className="btn-herramienta" 
                          onClick={() => aplicarFormatoVisual('bold')} 
                          title="Negrita"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <strong>B</strong>
                        </button>
                        <button 
                          className="btn-herramienta" 
                          onClick={() => aplicarFormatoVisual('italic')} 
                          title="Cursiva"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <em>I</em>
                        </button>
                        <button className="btn-herramienta" onClick={() => aplicarFormatoVisual('underline')} title="Subrayado" onMouseDown={(e) => e.preventDefault()} >
                          <u>U</u>0
                        </button>
                        <input type="color" className="color-picker" defaultValue="#333333" onChange={(e) => aplicarFormatoVisual('foreColor', e.target.value)} title="Color de texto" onMouseDown={(e) => e.preventDefault()}/>
                        <input type="color" className="color-picker" defaultValue="#ffffff" onChange={(e) => aplicarFormatoVisual('backColor', e.target.value)} title="Color de fondo" onMouseDown={(e) => e.preventDefault()}/>
                      </div>
                    </div>
                    <div className="herramienta-grupo">
                      <label>Tamaño de Texto</label>
                      <div className="herramienta-botones">
                        <button className="btn-herramienta" onClick={() => aplicarFormatoVisual('fontSize', '1')} title="Texto Pequeño" onMouseDown={(e) => e.preventDefault()}>
                          A<small>a</small>
                        </button>
                        <button className="btn-herramienta" onClick={() => aplicarFormatoVisual('fontSize', '3')} title="Texto Normal" onMouseDown={(e) => e.preventDefault()}>
                          A
                        </button>
                        <button className="btn-herramienta" onClick={() => aplicarFormatoVisual('fontSize', '5')} title="Texto Grande" onMouseDown={(e) => e.preventDefault()}>
                          <strong>A</strong>
                        </button>
                        <button className="btn-herramienta" onClick={() => aplicarFormatoVisual('fontSize', '7')} title="Texto Muy Grande" onMouseDown={(e) => e.preventDefault()}>
                          <strong className="text-large">A</strong>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Herramientas de Diseño - Solo en modo código */}
              {modoEditor === 'codigo' && (
                <div className="herramientas-diseno">
                  <h3>🛠️ Herramientas de Diseño</h3>
                  <div className="herramientas-grid">
                    <div className="herramienta-grupo">
                      <label>Insertar Elementos</label>
                      <div className="herramienta-botones">
                        <button className="btn-herramienta" onClick={() => insertarElemento('titulo')} title="Insertar Título">
                          📝 Título
                        </button>
                        <button className="btn-herramienta" onClick={() => insertarElemento('parrafo')} title="Insertar Párrafo">
                          📄 Párrafo
                        </button>
                        <button className="btn-herramienta" onClick={() => insertarElemento('boton')} title="Insertar Botón">
                          🔘 Botón
                        </button>
                        <button className="btn-herramienta" onClick={() => insertarElemento('caja')} title="Insertar Caja">
                          📦 Caja
                        </button>
                        <button className="btn-herramienta" onClick={() => insertarElemento('divider')} title="Insertar Divisor">
                          ➖ Divisor
                        </button>
                      </div>
                    </div>
                    <div className="herramienta-grupo">
                      <label>Estilos de Texto</label>
                      <div className="herramienta-botones">
                        <button className="btn-herramienta" onClick={() => aplicarEstilo('bold')} title="Negrita">
                          <strong>B</strong>
                        </button>
                        <button className="btn-herramienta" onClick={() => aplicarEstilo('italic')} title="Cursiva">
                          <em>I</em>
                        </button>
                        <input type="color" className="color-picker" defaultValue="#333333" onChange={(e) => aplicarEstilo('color', e.target.value)}title="Color de texto"/>
                        <input type="color" className="color-picker" defaultValue="#f8f9fa" onChange={(e) => aplicarEstilo('background', e.target.value)} title="Color de fondo"/>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Campos Dinámicos */}
              <CamposDinamicos
                formData={formData}
                setFormData={setFormData}
                editandoCampo={editandoCampo}
                setEditandoCampo={setEditandoCampo}
                nuevoCampoNombre={nuevoCampoNombre}
                setNuevoCampoNombre={setNuevoCampoNombre}
                nuevoCampoValor={nuevoCampoValor}
                setNuevoCampoValor={setNuevoCampoValor}
                agregarCampoDinamico={agregarCampoDinamico}
                editarCampoDinamico={editarCampoDinamico}
                guardarEdicionCampo={guardarEdicionCampo}
                cancelarEdicion={cancelarEdicion}
                eliminarCampoDinamico={eliminarCampoDinamico}
                agregarVariable={agregarVariable}
                insertarVariable={insertarVariable}
                eliminarVariable={eliminarVariable}
              />


              {/* Editor y Preview - Dividido lado a lado */}
              <EditorPlantilla
                formData={formData}
                setFormData={setFormData}
                modoEditor={modoEditor}
                setModoEditor={setModoEditor}
                mostrarPreview={mostrarPreview}
                contenidoVisual={contenidoVisual}
                setContenidoVisual={setContenidoVisual}
                aplicarFormatoVisual={aplicarFormatoVisual}
                convertirTextoEnVariable={convertirTextoEnVariable}
                handleVisualChange={handleVisualChange}
                handleKeyDownVisual={handleKeyDownVisual}
                handleHtmlChange={handleHtmlChange}
                insertarElemento={insertarElemento}
                aplicarEstilo={aplicarEstilo}
                convertirTextoAHTML={convertirTextoAHTML}
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
              setFile={setFile}
              setFileName={setFileName}
              isProcessing={isProcessing}
              progress={progress}
              enviarCorreos={enviarCorreos}
              results={results}
          />)}
        </main>
      </div>
    </div>
  );
};

export default CrearPlantilla;
