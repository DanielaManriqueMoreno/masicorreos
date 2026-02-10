import xlsx from 'xlsx';

export function leerCorreosExcel(rutaArchivo) {
  const workbook = xlsx.readFile(rutaArchivo);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const data = xlsx.utils.sheet_to_json(sheet);

  // Esperamos una columna llamada "correo"
  const correos = data
    .map(row => row.correo)
    .filter(correo => correo);

  return correos;
}
