export const PLANTILLA_BASE = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 14px;
      color: #333;
    }
    .content {
      padding: 16px;
    }
    .highlighted {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 6px;
      margin: 10px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="content">
    <!-- CONTENIDO_AQUI -->
  </div>

  <div class="footer">
    <!-- FOOTER_AQUI -->
  </div>
</body>
</html>
`;
