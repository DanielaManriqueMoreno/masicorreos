/**
 * Hook para gestión de variables dinámicas (Excel / Plantilla)
 * ❌ No maneja DOM
 * ❌ No convierte HTML
 * ✅ Solo estado y reglas
 */

export const useVariablesPlantilla = ({
  formData,
  setFormData,
  onInsertarEnEditor, // callback al editor (visual o html)
}) => {
  // ---------------- NORMALIZAR NOMBRE ----------------
  const normalizarNombre = (valor) =>
    valor
      .trim()
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9_]/g, '');

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

    if (formData.variables.includes(nombre)) {
      alert(`El campo "${nombre}" ya existe`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      variables: [...prev.variables, nombre],
    }));

    if (onInsertarEnEditor) {
      onInsertarEnEditor(`{{${nombre}}}`);
    }
  };

  // ---------------- ELIMINAR VARIABLE ----------------
  const eliminarVariable = (index) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
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
