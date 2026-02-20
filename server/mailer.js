import nodemailer from 'nodemailer';
import pool from './database.js';

export const enviarCorreo = async ({ remitente_id, to, subject, html }) => {

  const [rows] = await pool.execute(
    "SELECT * FROM remitentes WHERE id = ? AND estado = 'activo'",
    [remitente_id]
  );

  if (!rows.length) {
    throw new Error("Remitente no encontrado o inactivo");
  }

  const remitente = rows[0];

  const transporter = nodemailer.createTransport({
    host: remitente.smtp_host,
    port: remitente.smtp_port,
    secure: remitente.secure == 1,
    auth: {
      user: remitente.correo,
      pass: remitente.password_app
    }
  });

  await transporter.sendMail({
    from: `"${remitente.nombre}" <${remitente.correo}>`,
    to,
    subject,
    html
  });
};