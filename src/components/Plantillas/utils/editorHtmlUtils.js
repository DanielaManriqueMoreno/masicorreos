// utils/editorHtmlUtils.js

export const extraerTextoDeHTML = (html) => {
  if (!html) return '';

  let texto = html.replace(/<[^>]*>/g, ' ');
  texto = texto.replace(/\s+/g, ' ').trim();

  return texto;
};

export const extraerVariablesDesdeTexto = (texto) => {
  if (!texto) return [];
  return [...new Set(texto.match(/{{\s*[\w]+\s*}}/g) || [])];
};