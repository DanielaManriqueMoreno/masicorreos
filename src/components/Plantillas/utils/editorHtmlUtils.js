/**
 * Utils para conversión Texto <-> HTML
 * No depende de React ni del DOM
 */

// ----------------- HELPERS ------------------

const limpiarTextoPlano = (texto) =>
  texto
    .replace(/<[^>]*>/g, '')
    .replace(/\{\{[^}]+\}\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const esHTMLCompleto = (texto) =>
  /<!DOCTYPE|<html|<body/i.test(texto);

const esHTMLParcial = (texto) =>
  texto.includes('<') && texto.includes('>') && texto.includes('</');

const generarFooter = (tieneContenido) =>
  tieneContenido
    ? 'Atentamente,<br/>El equipo de <b>Unidad materno infantil</b>'
    : '';

// ----------------- TEXTO → HTML ------------------

export const convertirTextoAHTML = (texto, plantillaBase) => {
  if (!plantillaBase) {
    throw new Error('convertirTextoAHTML requiere plantillaBase');
  }

  if (!texto || !texto.trim()) {
    return plantillaBase
      .replace('<!-- CONTENIDO_AQUI -->', '<p></p>')
      .replace('<!-- FOOTER_AQUI -->', '');
  }

  if (esHTMLCompleto(texto) || esHTMLParcial(texto)) {
    return texto;
  }

  const lineas = texto.split('\n');
  let contenidoHTML = '';
  let primeraLinea = true;

  lineas.forEach((linea) => {
    const l = linea.trim();

    if (!l) {
      contenidoHTML += '<p><br></p>\n';
      return;
    }

    if (primeraLinea && l.length < 80) {
      contenidoHTML += `<h2>${l}</h2>\n`;
      primeraLinea = false;
      return;
    }

    primeraLinea = false;

    const campoMatch = l.match(/^(.+?):\s*(.+)$/);
    if (campoMatch && !l.includes('{{')) {
      contenidoHTML += `<p><b>${campoMatch[1]}:</b> ${campoMatch[2]}</p>\n`;
      return;
    }

    let lineaHTML = l
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1">$1</a>'
      );

    contenidoHTML += `<p>${lineaHTML}</p>\n`;
  });

  const bloques = contenidoHTML.split('\n').filter(Boolean);
  const tituloMatch = contenidoHTML.match(/<h2>(.*?)<\/h2>/);
  const titulo = tituloMatch?.[1] || '';

  const campos = [];
  const textoNormal = [];

  bloques.forEach((b) => {
    if (b.includes('<b>') && b.includes(':')) {
      campos.push(b);
    } else if (!b.includes('<h2>')) {
      textoNormal.push(b);
    }
  });

  let contenidoFinal = '';

  if (titulo) contenidoFinal += `<h2>${titulo}</h2>\n`;

  textoNormal.slice(0, 2).forEach((p) => {
    if (limpiarTextoPlano(p)) contenidoFinal += p + '\n';
  });

  const camposValidos = campos.filter((c) => limpiarTextoPlano(c));
  if (camposValidos.length) {
    contenidoFinal += '<div class="highlighted">\n';
    camposValidos.forEach((c) => (contenidoFinal += c + '\n'));
    contenidoFinal += '</div>\n';
  }

  textoNormal.slice(2).forEach((p) => {
    if (limpiarTextoPlano(p)) contenidoFinal += p + '\n';
  });

  if (!contenidoFinal.trim()) contenidoFinal = '<p></p>';

  const tieneContenido = limpiarTextoPlano(contenidoFinal).length > 0;

  return plantillaBase
    .replace('<!-- CONTENIDO_AQUI -->', contenidoFinal)
    .replace('<!-- FOOTER_AQUI -->', generarFooter(tieneContenido));
};

// ----------------- HTML → TEXTO ------------------

export const extraerTextoDeHTML = (html) => {
  if (!html) return '';

  let contenido = html;

  if (esHTMLCompleto(html)) {
    const match = html.match(/<div class="content">([\s\S]*?)<\/div>/i);
    if (match) contenido = match[1];
  }

  // Extraer variables
  const variables = [...contenido.matchAll(/\{\{[^}]+\}\}/g)].map(m => m[0]);

  // Eliminar tags HTML
  let texto = contenido.replace(/<[^>]*>/g, ' ');
  texto = texto.replace(/\s+/g, ' ').trim();

  // Reinsertar variables
  variables.forEach((v) => {
    const nombre = v.replace(/\{\{|\}\}/g, '');
    if (!texto.includes(nombre)) {
      texto += ` ${v}`;
    }
  });

  return texto.trim();
};
