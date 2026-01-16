export const useCamposDinamicos = ({ formData, setFormData }) => {

  const agregarCampo = (nombre, valor = '') => {
    if (!nombre.trim()) return;

    const limpio = nombre.trim().replace(/\s+/g, '');
    if (formData.variables.includes(limpio)) {
      alert('Este campo ya existe');
      return;
    }

    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, limpio],
      camposDinamicos: [
        ...prev.camposDinamicos,
        { nombre: limpio, valor, tipo: 'texto' }
      ]
    }));
  };

  const editarCampo = (index, nuevoNombre, nuevoValor) => {
    setFormData(prev => {
      const campos = [...prev.camposDinamicos];
      const campoOriginal = campos[index];

      let htmlActualizado = prev.htmlContent;

      if (campoOriginal.nombre !== nuevoNombre) {
        const regex = new RegExp(`\\{\\{${campoOriginal.nombre}\\}\\}`, 'g');
        htmlActualizado = htmlActualizado.replace(
          regex,
          `{{${nuevoNombre}}}`
        );
      }

      campos[index] = {
        ...campoOriginal,
        nombre: nuevoNombre,
        valor: nuevoValor,
      };

      return {
        ...prev,
        htmlContent: htmlActualizado,
        camposDinamicos: campos,
        variables: prev.variables.map(v =>
          v === campoOriginal.nombre ? nuevoNombre : v
        )
      };
    });
  };

  const eliminarCampo = (index) => {
    if (!confirm('¿Eliminar campo?')) return;

    setFormData(prev => {
      const campo = prev.camposDinamicos[index];
      const regex = new RegExp(
        `<div class="field-group">[\\s\\S]*?\\{\\{${campo.nombre}\\}\\}[\\s\\S]*?</div>`,
        'g'
      );

      return {
        ...prev,
        variables: prev.variables.filter(v => v !== campo.nombre),
        camposDinamicos: prev.camposDinamicos.filter((_, i) => i !== index),
        htmlContent: prev.htmlContent.replace(regex, '')
      };
    });
  };

  return {
    agregarCampo,
    editarCampo,
    eliminarCampo,
  };
};

