import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/* =========================
   FUNCIONES AUXILIARES
========================= */

const leerExcelArchivo = async (file) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  return XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    trim: true
  });
};

const validarExcel = (rows) => {
  if (!rows.length) return "El archivo está vacío";

  if (!rows[0].email) {
    return 'La columna "email" es obligatoria';
  }

  const sinCorreo = rows.filter(r => !r.email);
  if (sinCorreo.length) {
    return `Hay ${sinCorreo.length} filas sin correo`;
  }

  return null;
};

/* =========================
   HOOK PRINCIPAL
========================= */

export const useEnvios = (plantillaSeleccionada, usuario) => {

  // ----------- ESTADOS -----------
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [rowsExcel, setRowsExcel] = useState([]);

  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const [correoRemitenteEnvio, setCorreoRemitenteEnvio] =
    useState('micita@umit.com.co');

  // ----------- DRAG & DROP -----------
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  };

  // ----------- PROCESAR ARCHIVO (PASO 1) -----------
  const processFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx'].includes(ext)) {
      alert('Formato no soportado (.csv o .xlsx)');
      return;
    }

    try {
      const rows = await leerExcelArchivo(file);
      const error = validarExcel(rows);

      if (error) {
        alert(error);
        setFile(null);
        setFileName('');
        setRowsExcel([]);
        return;
      }

      setFile(file);
      setFileName(file.name);
      setRowsExcel(rows);

      console.log('✅ Excel válido:', rows);
    } catch (err) {
      alert('Error leyendo el archivo');
    }
  };

  // ----------- DESCARGAR PLANTILLA EXCEL -----------
  const descargarPlantillaExcel = () => {
    if (!plantillaSeleccionada?.variables?.length) {
      alert('No hay campos dinámicos');
      return;
    }

    const variables = plantillaSeleccionada.variables.filter(
      v => v.toLowerCase() !== 'email'
    );

    const data = [
      { email: 'correo@ejemplo.com', ...Object.fromEntries(variables.map(v => [v, ''])) }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }),
      'Plantilla.xlsx'
    );
  };

  // ----------- EXPORT -----------
  return {
    // estados
    file,
    fileName,
    rowsExcel,
    dragActive,
    isProcessing,
    progress,
    results,
    correoRemitenteEnvio,

    // setters
    setFile,
    setFileName,
    setCorreoRemitenteEnvio,

    // handlers
    handleDrag,
    handleDrop,
    handleFileSelect,
    descargarPlantillaExcel
  };
};
