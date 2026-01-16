import { useEditorVisual } from "./useEditorVisual";
import { useCamposDinamicos } from "./useCamposDinamicos";
import { generarPreviewHTML } from "../utils/previewUtils";

export const useEditorPlantilla = ({
  formData,
  setFormData,
}) => {
  const editorVisual = useEditorVisual({ formData, setFormData });
  const campos = useCamposDinamicos({ formData, setFormData });

  const previewHTML = () => {
    const html = generarPreviewHTML(
      formData,
      editorVisual.contenidoVisual
    );
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  return {
    ...editorVisual,
    ...campos,
    previewHTML,
  };
};
