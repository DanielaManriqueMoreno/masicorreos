/**
 * Hook utilitario para manejo DOM del editor visual / HTML
 * ⚠️ Usa document, window, Selection API
 * ⚠️ NO maneja estado React
 */

const normalizarNombreVariable = (texto) =>
  texto
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join('') || 'CampoDinamico';

export const useEditorDOM = ({
  modoEditor,
  onHtmlChange,
  onAgregarVariable,
}) => {
  // ---------------- HELPERS ----------------

  const dispararInput = (el) => {
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const insertarTextoEnCursor = (editor, texto) => {
    const selection = window.getSelection();

    let range;
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    } else {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    range.deleteContents();
    const textNode = document.createTextNode(texto);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
  };

  // ---------------- ENTER EN VISUAL ----------------

  const handleKeyDownVisual = (e) => {
    if (modoEditor !== 'visual' || e.key !== 'Enter') return;

    e.preventDefault();
    e.stopPropagation();

    const editor = document.getElementById('contenidoVisual');
    if (!editor) return;

    const selection = window.getSelection();
    let range;

    if (selection.rangeCount) {
      range = selection.getRangeAt(0);
    } else {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    if (!range.collapsed) range.deleteContents();

    const br = document.createElement('br');
    const spacer = document.createTextNode('\u00A0');

    range.insertNode(br);
    range.setStartAfter(br);
    range.insertNode(spacer);
    range.setStartAfter(spacer);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);

    dispararInput(editor);
    editor.focus();
  };

  // ---------------- TEXTO → VARIABLE ----------------

  const convertirTextoEnVariable = () => {
    const isVisual = modoEditor === 'visual';

    const editor = document.getElementById(
      isVisual ? 'contenidoVisual' : 'htmlContent'
    );
    if (!editor) return;

    editor.focus();

    let textoSeleccionado = '';

    if (isVisual) {
      textoSeleccionado = window.getSelection().toString();
    } else {
      textoSeleccionado = editor.value.substring(
        editor.selectionStart,
        editor.selectionEnd
      );
    }

    const sugerencia = normalizarNombreVariable(textoSeleccionado);
    const nombreVariable = prompt(
      'Nombre del campo dinámico:',
      sugerencia
    );

    if (!nombreVariable) return;

    const nombreFinal = normalizarNombreVariable(nombreVariable);
    onAgregarVariable(nombreFinal);

    const variable = `{{${nombreFinal}}}`;

    if (isVisual) {
      insertarTextoEnCursor(editor, variable);
      dispararInput(editor);
      return;
    }

    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    const nuevo =
      editor.value.substring(0, start) +
      variable +
      editor.value.substring(end);

    onHtmlChange(nuevo);

    setTimeout(() => {
      editor.focus();
      editor.setSelectionRange(
        start + variable.length,
        start + variable.length
      );
    }, 0);
  };

  // ---------------- FORMATO VISUAL ----------------

  const aplicarFormatoVisual = (comando, valor = null) => {
    if (modoEditor !== 'visual') return;

    const editor = document.getElementById('contenidoVisual');
    if (!editor) return;

    editor.focus();
    document.execCommand(comando, false, valor);
    dispararInput(editor);
  };

  // ---------------- INSERTAR ELEMENTO ----------------

  const insertarElemento = (htmlVisual, htmlCode) => {
    if (modoEditor === 'visual') {
      const editor = document.getElementById('contenidoVisual');
      if (!editor) return;

      editor.focus();
      document.execCommand('insertHTML', false, htmlVisual);
      dispararInput(editor);
      return;
    }

    const textarea = document.getElementById('htmlContent');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const nuevo =
      textarea.value.substring(0, start) +
      htmlCode +
      textarea.value.substring(end);

    onHtmlChange(nuevo);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + htmlCode.length,
        start + htmlCode.length
      );
    }, 0);
  };

  return {
    handleKeyDownVisual,
    convertirTextoEnVariable,
    aplicarFormatoVisual,
    insertarElemento,
  };
};
