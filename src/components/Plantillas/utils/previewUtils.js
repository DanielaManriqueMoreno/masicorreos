export const generarPreviewHTML = (formData, contenidoVisual, convertirTextoAHTML) => {
  let html = formData.htmlContent || convertirTextoAHTML(contenidoVisual);

  formData.variables.forEach(variable => {
    const campo = formData.camposDinamicos?.find(c => c.nombre === variable);
    let ejemplo = campo?.valor || variable;

    html = html.replace(
      new RegExp(`\\{\\{${variable}\\}\\}`, 'g'),
      ejemplo
    );
  });

  html = html.replace(/\{\{[^}]+\}\}/g, '');
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
};
