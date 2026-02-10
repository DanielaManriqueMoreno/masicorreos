import { leerCorreosExcel } from '../utils/excelReader.js';

export const procesarEnvio = async (req, res) => {
  try {
    const { modo, fecha } = req.body;
    const archivo = req.file;

    if (!archivo) {
      return res.status(400).json({
        success: false,
        message: 'Archivo no recibido'
      });
    }

    const correos = leerCorreosExcel(archivo.path);

    if (!correos.length) {
      return res.status(400).json({
        success: false,
        message: 'No se encontraron correos en el archivo'
      });
    }

    if (modo === 'programado' && !fecha) {
      return res.status(400).json({
        success: false,
        message: 'Fecha requerida para envío programado'
      });
    }

    return res.json({
      success: true,
      modo,
      fecha: fecha || null,
      total: correos.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error en el envío'
    });
  }
};
