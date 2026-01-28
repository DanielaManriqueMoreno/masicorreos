export const generarPreviewHTML = (formData) => {
  let html = formData.htmlContent || '';

  // Reemplazar variables por ejemplos amigables
  formData.variables.forEach(variable => {
    let ejemplo = variable;

    const v = variable.toLowerCase();

    if (v.includes('nombre')) ejemplo = 'Juan Pérez';
    else if (v.includes('fecha')) ejemplo = '15/12/2024';
    else if (v.includes('hora')) ejemplo = '09:00';
    else if (v.includes('doctor')) ejemplo = 'Dr. García';
    else if (v.includes('clinica')) ejemplo = 'Clínica Central';

    html = html.replace(
      new RegExp(`\\{\\{${variable}\\}\\}`, 'g'),
      ejemplo
    );
  });

  // Limpiar variables no reconocidas
  html = html.replace(/\{\{[^}]+\}\}/g, '');

  // Limpiar HTML vacío
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p><br><\/p>/g, '');

  return html;
};
