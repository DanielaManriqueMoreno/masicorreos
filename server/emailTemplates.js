// emailTemplates.js - Plantillas HTML para correos

// Template HTML para Citas
export const TEMPLATE_HTML_CITAS = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Recordatorio de Cita Médica</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; color: #000; }
        .container { max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }
        .header { background-color: #3b5998; color: white; padding: 25px 0; text-align: center; font-weight: 700; font-size: 24px; }
        .header-circle { width: 120px; height: 120px; margin: 0 auto 3px; background-color: white; border-radius: 50%; border: 1px solid #ddd; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }
        .header-circle img { max-width: 90%; max-height: 300%; object-fit: contain; margin-left: 8px; border-radius: 200px; }
        .content { padding: 25px 30px; }
        .content h2 { font-weight: 700; font-size: 20px; margin: 0 0 20px; }
        .content p { font-size: 14px; line-height: 1.5; margin: 10px 0; }
        .highlighted { background-color: #f3f6fb; padding: 15px 20px; margin: 20px 0; border-radius: 6px; font-size: 14px; }
        .highlighted b { color: #2b2b2b; }
        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 13px; padding: 20px 30px; text-align: center; }
        .footer b { color: #fff; }
        a, a:visited { color: #3b5998; text-decoration: none; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-circle">
                <img src="cid:logo" alt="UMIT Logo" />
            </div>
        </div>
        <div class="content">
            <h2>Recordatorio de Cita Médica</h2>
            <p>Estimad@ <b>[Nombre del Paciente]</b>,</p>
            <p>Le escribimos desde <b>La Unidad Materno Infantil Del Tolima</b> para recordarle su próxima cita de <b>[Tipo de cita]</b>.</p>
            <div class="highlighted">
                <p><b>Fecha de la cita:</b> [Fecha de la Cita]</p>
                <p><b>Hora de la cita:</b> [Hora de la Cita]</p>
                <p><b>Profesional:</b> Dr./a. [Nombre del Médico/a]</p>
                <p><b>Lugar de la cita:</b> [Lugar de la cita]</p>
            </div>
            <p><b>Recomendaciones:</b></p>
            <p>Llegar 20 minutos antes de la cita.</p>
            <p>Traer la autorización de la EPS, esta debe estar vigente y estar dirigida a la Unidad Materno Infantil del tolima</p>
            <p>No presentar sintomas de gripa</p>
            <p>Para Reprogramar o cancelar la cita escribenos al <a href="https://wa.me/573124327635" target="_blank">3124327635</a> o respondiendo al correo Consulta@umit.com.co</p>
        </div>
        <div class="footer">
            Atentamente,<br/>
            El equipo de <b>Unidad materno infantil</b>
        </div>
    </div>
</body>
</html>
`;

// Template HTML para Reprogramación de Citas
export const TEMPLATE_HTML_REPROGRAMACION = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reprogramación de Cita Médica</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; color: #000; }
        .container { max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }
        .header { background-color: #f39c12; color: white; padding: 25px 0; text-align: center; font-weight: 700; font-size: 24px; }
        .header-circle { width: 120px; height: 120px; margin: 0 auto 3px; background-color: white; border-radius: 50%; border: 1px solid #ddd; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }
        .header-circle img { max-width: 90%; max-height: 300%; object-fit: contain; margin-left: 8px; border-radius: 200px; }
        .content { padding: 25px 30px; }
        .content h2 { font-weight: 700; font-size: 20px; margin: 0 0 20px; }
        .content p { font-size: 14px; line-height: 1.5; margin: 10px 0; }
        .highlighted { background-color: #fef9e7; padding: 15px 20px; margin: 20px 0; border-radius: 6px; font-size: 14px; border-left: 4px solid #f39c12; }
        .highlighted b { color: #2b2b2b; }
        .cita-section { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 6px; }
        .cita-title { font-weight: bold; color: #f39c12; margin-bottom: 10px; font-size: 16px; }
        .warning-box { background-color: #fff5f5; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0; border-radius: 6px; }
        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 13px; padding: 20px 30px; text-align: center; }
        .footer b { color: #fff; }
        a, a:visited { color: #f39c12; text-decoration: none; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-circle">
                <img src="cid:logo" alt="UMIT Logo" />
            </div>
        </div>
        <div class="content">
            <h2>Reprogramación de Cita Médica</h2>
            <p>Estimad@ <b>[Nombre del Paciente]</b>,</p>
            <p>Le informamos que su cita médica ha sido <b>reprogramada</b> por la siguiente razón:</p>
            
            <div class="highlighted">
                <p><b>Motivo de reprogramación:</b> [Motivo de reprogramación]</p>
            </div>

            <div class="cita-section">
                <div class="cita-title">📅 CITA ORIGINAL:</div>
                <p><b>Fecha:</b> [Fecha Original]</p>
                <p><b>Hora:</b> [Hora Original]</p>
            </div>

            <div class="cita-section">
                <div class="cita-title">🔄 CITA REPROGRAMADA:</div>
                <p><b>Fecha:</b> [Fecha Reprogramada]</p>
                <p><b>Hora:</b> [Hora Reprogramada]</p>
                <p><b>Profesional:</b> Dr./a. [Nombre del Médico/a]</p>
                <p><b>Lugar:</b> [Lugar de la cita]</p>
                <p><b>Tipo de cita:</b> [Tipo de cita]</p>
                <p><b>Especialidad:</b> [Especialidad]</p>
            </div>

            <div class="warning-box">
                <p><b>⚠️ IMPORTANTE:</b></p>
                <p>• Llegar 20 minutos antes de la cita reprogramada</p>
                <p>• Traer la autorización de la EPS vigente</p>
                <p>• Confirmar su asistencia con anticipación</p>
            </div>

            <p>Si la nueva fecha y hora no son convenientes para usted, por favor contáctenos para realizar los ajustes necesarios.</p>
            
            <p>Para confirmar, cancelar o solicitar otra reprogramación escribanos al <a href="https://wa.me/573124327635" target="_blank">3124327635</a> o respondiendo a este correo.</p>
            
            <p>Agradecemos su comprensión y quedamos atentos a cualquier inquietud.</p>
        </div>
        <div class="footer">
            Atentamente,<br/>
            El equipo de <b>Unidad materno infantil</b>
        </div>
    </div>
</body>
</html>
`;

// Template HTML para Dengue (Calidad)
export const TEMPLATE_HTML_DENGUE = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Prevención del Dengue - UMIT</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #fff;
            margin: 0;
            padding: 0;
            color: #000;
        }
        .container {
            width: 90%;
            max-width: 800px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 8px rgba(0,0,0,0.1);
            border: 1px solid #ddd;
        }
        .header {
            background-color: #3b5998;
            color: white;
            padding: 15px 0;
            text-align: center;
            font-weight: 700;
            font-size: 20px;
        }
        .header-circle {
            width: 80px;
            height: 80px;
            margin: 0 auto 5px;
            background-color: white;
            border-radius: 50%;
            border: 1px solid #ddd;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding-left: 20px;
            padding-top: 15px;
            font-size: 35px;
        }
        .content {
            padding: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .content h2 {
            font-weight: 700;
            font-size: 16px;
            margin: 0 0 10px;
            color: #3b5998;
            grid-column: 1 / -1;
            text-align: center;
        }
        .info-box {
            background-color: #f3f6fb;
            padding: 12px;
            border-radius: 6px;
            font-size: 12px;
            min-height: 120px;
        }
        .warning-box {
            background-color: #fff5f5;
            border-left: 4px solid #e74c3c;
            padding: 12px;
            border-radius: 6px;
            font-size: 12px;
            grid-column: 1 / -1;
            margin-top: 5px;
        }
        .footer {
            background-color: #2e3b55;
            color: #a0b5d9;
            font-size: 11px;
            padding: 15px;
            text-align: center;
        }
        b {
            color: #2b2b2b;
        }
        ul {
            padding-left: 15px;
            margin: 8px 0;
        }
        li {
            margin-bottom: 5px;
            font-size: 11px;
        }
        .intro {
            grid-column: 1 / -1;
            text-align: center;
            font-size: 12px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-circle">
                🦟
            </div>
            PREVENCIÓN DEL DENGUE
        </div>
        <div class="content">
            <h2>Información importante sobre el dengue</h2>
            <p class="intro">Enfermedad transmitida por el mosquito <b>Aedes aegypti</b> que se reproduce en agua limpia acumulada.</p>

            <div class="info-box">
                <p><b>🩺 En el hogar:</b></p>
                <ul>
                    <li>Elimine recipientes con agua</li>
                    <li>Lave tanques semanalmente</li>
                    <li>Mantenga entorno limpio</li>
                    <li>Use tapas en tanques</li>
                </ul>
            </div>

            <div class="info-box">
                <p><b>👨‍👩‍👧‍👦 Personales:</b></p>
                <ul>
                    <li>Use ropa que cubra</li>
                    <li>Aplique repelente</li>
                    <li>Coloque toldillos</li>
                    <li>Instale mallas</li>
                </ul>
            </div>

            <div class="warning-box">
                <p><b>🚨 Signos de alarma:</b></p>
                <p>Fiebre alta, dolor intenso, náuseas, sangrado. <b>No se automedique - Consulte inmediatamente</b></p>
            </div>

            <p style="grid-column: 1 / -1; text-align: center; font-size: 12px; margin: 5px 0;">
                <b>💧 Sin criaderos no hay mosquitos. Sin mosquitos, no hay dengue.</b>
            </p>
        </div>
        <div class="footer">
            Unidad Materno Infantil del Tolima S.A.<br/>
            <a href="https://www.umit.com.co/escuela-de-padres" target="_blank" style="color: #a0b5d9;">www.umit.com.co</a>
        </div>
    </div>
</body>
</html>
`;

// Template HTML para Cursos Obligatorios (Talento Humano)
export const TEMPLATE_HTML_CURSOS = `  
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Recordatorio de Cursos (UMIT)</title>
  <style>
    @media (max-width:600px){
      .container{padding:16px !important}
      .card{padding:18px !important}
      .h-title{font-size:20px !important}
      .meta td{display:block;width:100% !important}
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f3f6fb; font-family:Arial, Helvetica, sans-serif; color:#1f2a44;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6fb;">
    <tr>
      <td align="center" class="container" style="padding:28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 6px 20px rgba(10,32,80,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0B5ED7,#4fb3ff); padding:22px 26px; text-align:center;">
              <div style="font-size:13px; letter-spacing:.6px; color:#dff1ff; text-transform:uppercase;">Unidad Materno Infantil del Tolima</div>
              <h1 class="h-title" style="margin:6px 0 0; font-size:22px; color:#ffffff;">Recordatorio de Actualización de Cursos Obligatorios</h1>
              <div style="margin-top:6px; font-size:12px; color:#e9f7ff;">Según Resolución 3100</div>
            </td>
          </tr>
          <tr>
            <td class="card" style="padding:24px 26px 8px;">
              <p style="margin:0 0 12px;">Estimad@ <strong>{{NOMBRE}}</strong>,</p>
              <p style="margin:0 0 14px;">
                Le escribimos desde la <strong>Unidad de Talento Humano</strong> para recordarle la
                <strong>renovación de los cursos obligatorios</strong> según la normativa vigente de la
                <strong>Resolución 3100</strong>. Estos cursos deben estar actualizados para continuar con el
                ejercicio regular de sus funciones asistenciales.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" class="meta" style="width:100%; font-size:14px; border-collapse:separate; border-spacing:0 8px; margin-top:8px;">
                <tr>
                  <td style="background:#f7faff; border:1px solid #e7eefc; border-radius:10px; padding:10px 12px; width:42%;">
                    🗓️ <strong>Fecha límite:</strong> <span style="color:#0B5ED7;">{{FECHA_LIMITE}}</span>
                  </td>
                  <td style="width:16px;"></td>
                  <td style="background:#f7faff; border:1px solid #e7eefc; border-radius:10px; padding:10px 12px; width:56%;">
                    🏢 <strong>Entidad:</strong> Unidad Materno Infantil del Tolima (UMIT)
                  </td>
                </tr>
                <tr>
                  <td style="background:#f7faff; border:1px solid #e7eefc; border-radius:10px; padding:10px 12px;" colspan="3">
                    📩 <strong>Dirigido a:</strong> {{DIRIGIDO_A}}
                  </td>
                </tr>
              </table>
              <h3 style="margin:22px 0 10px; font-size:16px; color:#0B5ED7;">Cursos pendientes</h3>
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border:1px solid #e8eef7; border-radius:10px; overflow:hidden; font-size:14px;">
                <thead>
                  <tr style="background:#eef5ff;">
                    <th align="left" style="padding:12px 10px; border-bottom:1px solid #e2ebfb; width:48px;">N°</th>
                    <th align="left" style="padding:12px 10px; border-bottom:1px solid #e2ebfb;">Curso</th>
                    <th align="left" style="padding:12px 10px; border-bottom:1px solid #e2ebfb; width:140px;">Estado</th>
                    <th align="left" style="padding:12px 10px; border-bottom:1px solid #e2ebfb; width:140px;">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding:10px; border-bottom:1px solid #f1f4fb;">1</td>
                    <td style="padding:10px; border-bottom:1px solid #f1f4fb;">{{CURSO_1}}</td>
                    <td style="padding:10px; border-bottom:1px solid #f1f4fb;">{{ESTADO_1}}</td>
                    <td style="padding:10px; border-bottom:1px solid #f1f4fb;">{{FECHA_1}}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px; border-bottom:1px solid #f1f4fb;">2</td>
                    <td style="padding:10px; border-bottom:1px solid #f1f4fb;">{{CURSO_2}}</td>
                    <td style="padding:10px; border-bottom:1px solid #f1f4fb;">{{ESTADO_2}}</td>
                    <td style="padding:10px; border-bottom:1px solid #f1f4fb;">{{FECHA_2}}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px; border-bottom:1px solid #f1f4fb;">3</td>
                    <td style="padding:10px; border-bottom:1px solid #f1f4fb;">{{CURSO_3}}</td>
                    <td style="padding:10px; border-bottom:1px solid #f1f4fb;">{{ESTADO_3}}</td>
                    <td style="padding:10px; border-bottom:1px solid #f1f4fb;">{{FECHA_3}}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px;">4</td>
                    <td style="padding:10px;">{{CURSO_4}}</td>
                    <td style="padding:10px;">{{ESTADO_4}}</td>
                    <td style="padding:10px;">{{FECHA_4}}</td>
                  </tr>
                </tbody>
              </table>
              <h3 style="margin:22px 0 10px; font-size:16px; color:#0B5ED7;">Recomendaciones importantes</h3>
              <ul style="margin:0 0 14px 18px; padding:0;">
                <li>Enviar los certificados en formato PDF al correo <strong>auxiliartalentohumanoumit@gmail.com</strong>.</li>
                <li>Asegúrese de que los certificados estén vigentes.</li>
                <li>Si ya envió alguno de los certificados, por favor ignore este mensaje o comuníquese para confirmar su recepción.</li>
              </ul>
              <div style="margin:18px 0; padding:12px; background:#f8fbff; border:1px solid #e6eefc; border-radius:10px;">
                <div style="margin-bottom:6px; font-weight:bold;">Para soporte o dudas</div>
                <div>📞 Teléfono: <a href="tel:+573151509269" style="color:#0B5ED7; text-decoration:none;">3151509269</a></div>
                <div>✉️ Correo: <a href="mailto:auxiliartalentohumanoumit@gmail.com" style="color:#0B5ED7; text-decoration:none;">auxiliartalentohumanoumit@gmail.com</a></div>
              </div>
              <p style="margin:18px 0 6px;">Atentamente,</p>
              <p style="margin:0 0 4px; font-weight:bold;">El equipo de Talento Humano</p>
              <div style="font-size:12px; color:#6b7a99;">Unidad Materno Infantil del Tolima (UMIT)</div>
              <div style="text-align:center; margin:22px 0 4px;">
                <a href="{{ENLACE_SUBIDA_CERTIFICADOS}}" target="_blank"
                   style="display:inline-block; padding:12px 18px; background:#0B5ED7; color:#ffffff; text-decoration:none; border-radius:10px; font-weight:bold;">
                  Subir certificados
                </a>
              </div>
              <p style="margin:12px 0 0; font-size:12px; color:#6b7a99; text-align:center;">
                Este mensaje fue enviado automáticamente. Si recibió este correo por error, ignorelo.
              </p>
            </td>
          </tr>
        </table>
        <div style="height:18px; line-height:18px; font-size:18px;">&nbsp;</div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Template HTML para Recuperación de Contraseña
export const TEMPLATE_HTML_RESET_PASSWORD = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Recuperación de Contraseña - UMIT</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #3b5998; color: white; padding: 30px 0; text-align: center; }
        .header-circle { width: 100px; height: 100px; margin: 0 auto 10px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .header-circle img { max-width: 80%; max-height: 80%; object-fit: contain; }
        .content { padding: 30px; }
        .content h2 { color: #2b2b2b; font-size: 24px; margin: 0 0 20px; }
        .content p { color: #555; font-size: 16px; line-height: 1.6; margin: 15px 0; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .warning p { margin: 5px 0; color: #856404; font-size: 14px; }
        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 12px; padding: 20px; text-align: center; }
        .footer p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-circle">
                <img src="cid:logo" alt="UMIT Logo" />
            </div>
            <h1 style="margin: 10px 0 0; font-size: 28px;">Recuperación de Contraseña</h1>
        </div>
        <div class="content">
            <h2>Hola [NOMBRE],</h2>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en el sistema Masicorreos de UMIT.</p>
            <p>Si solicitaste este cambio, utiliza el siguiente código de verificación para restablecer tu contraseña:</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 30px; margin: 30px 0; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <p style="margin: 0 0 15px 0; color: white; font-size: 16px; font-weight: bold;">🔐 Tu Código de Verificación</p>
                <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block; margin: 10px 0;">
                    <p style="margin: 0; color: #3b5998; font-size: 42px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 8px;">[CODIGO]</p>
                </div>
                <p style="margin: 15px 0 0 0; color: white; font-size: 14px;">Ingresa este código en el sistema para restablecer tu contraseña</p>
            </div>
            
            <div style="background: #f8f9fa; border-left: 4px solid #3b5998; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0 0 10px 0; color: #1a1a2e; font-weight: bold; font-size: 14px;">📋 Instrucciones:</p>
                <ol style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
                    <li>Ve al sistema Masicorreos UMIT</li>
                    <li>Haz clic en "Recuperar Contraseña"</li>
                    <li>Ingresa el código de verificación que aparece arriba</li>
                    <li>Crea tu nueva contraseña</li>
                </ol>
            </div>
            
            <div class="warning">
                <p><strong>⚠️ Importante:</strong></p>
                <p>• Este código es válido por <strong>1 hora</strong> solamente.</p>
                <p>• Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá igual.</p>
                <p>• Por seguridad, nunca compartas este código con nadie.</p>
            </div>
            
            <p>Si tienes problemas o no solicitaste este cambio, contacta al administrador del sistema.</p>
        </div>
        <div class="footer">
            <p><strong>Unidad Materno Infantil Del Tolima - UMIT</strong></p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
    </div>
</body>
</html>
`;

