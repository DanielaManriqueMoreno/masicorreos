import { useEffect } from "react";
import { extraerTextoDeHTML, extraerVariablesDesdeTexto  } from "../utils/editorhtmlutils";

/**
 * Hook para gestión de variables dinámicas (Excel / Plantilla)
 */
export const useVariablesPlantillas = ({
  formData,
  setFormData,
  onInsertarEnEditor,
}) => {

  // ---------------- NORMALIZAR NOMBRE ----------------
  const normalizarNombre = (valor) =>
    valor
      .trim()
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9_]/g, '');

  // ---------------- SINCRONIZAR DESDE EL HTML ----------------
  useEffect(() => {
    if (!formData?.htmlContent) return;

    const texto = extraerTextoDeHTML(formData.htmlContent);
    const variablesDetectadas = extraerVariablesDesdeTexto(texto)
      .map(v => v.replace('{{', '').replace('}}', ''));

    setFormData(prev => ({
      ...prev,
      variables: variablesDetectadas,
    }));
  }, [formData?.htmlContent]);

  // ---------------- AGREGAR VARIABLE ----------------
  const agregarVariable = (nombreForzado = null) => {
    const nombreIngresado =
      nombreForzado ||
      prompt(
        'Nombre del campo dinámico (sin espacios):',
        'NombreCampo'
      );

    if (!nombreIngresado) return;

    const nombre = normalizarNombre(nombreIngresado);
    if (!nombre) return;

    const variablesActuales = formData.variables || [];

    if (variablesActuales.includes(nombre)) {
      alert(`El campo "${nombre}" ya existe`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      variables: [...(prev.variables || []), nombre],
    }));

    if (onInsertarEnEditor) {
      onInsertarEnEditor(`{{${nombre}}}`);
    }
  };

  // ---------------- ELIMINAR VARIABLE ----------------
  const eliminarVariable = (index) => {
    setFormData(prev => ({
      ...prev,
      variables: (prev.variables || []).filter((_, i) => i !== index),
    }));
  };

  // ---------------- INSERTAR VARIABLE ----------------
  const insertarVariable = (variable) => {
    if (!variable || !onInsertarEnEditor) return;
    onInsertarEnEditor(`{{${variable}}}`);
  };

  return {
    agregarVariable,
    eliminarVariable,
    insertarVariable,
  };
};