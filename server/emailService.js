// emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import generarPlantilla from './emailTemplates.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

export const sendPasswordResetEmail = async (email, codigo, nombre) => {
  if (!email || !codigo) {
    throw new Error('Email y código son obligatorios');
  }

  const mensaje = `
    <h2>Hola ${nombre || 'Usuario'}</h2>
    <p>Tu código de recuperación es:</p>
    <h1 style="letter-spacing:5px;text-align:center;">${codigo}</h1>
    <p>Este código es válido por 1 hora.</p>
  `;

  const html = generarPlantilla(mensaje);

  await transporter.sendMail({
    from: `"MasiCorreos" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Recuperación de Contraseña - Sistema Masicorreos UMIT',
    html
  });

  console.log(`✅ Código enviado a ${email}`);
};