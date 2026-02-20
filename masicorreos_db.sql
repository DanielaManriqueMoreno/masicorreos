-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-02-2026 a las 16:30:58
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `masicorreos_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `acciones_usuario_envio`
--

CREATE TABLE `acciones_usuario_envio` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `accion` enum('crear','cancelar','reintentar','eliminar') NOT NULL,
  `envio_id` int(11) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `action` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas`
--

CREATE TABLE `areas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `areas`
--

INSERT INTO `areas` (`id`, `nombre`, `estado`) VALUES
(5, 'Citas', 'ACTIVO'),
(6, 'Calidad', 'ACTIVO'),
(7, 'Talento Humano', 'ACTIVO'),
(8, 'Contabilidad', 'ACTIVO'),
(9, 'Radicacion', 'ACTIVO'),
(10, 'Sistemas', 'ACTIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `area_usuario`
--

CREATE TABLE `area_usuario` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_area` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `area_usuario`
--

INSERT INTO `area_usuario` (`id`, `id_usuario`, `id_area`) VALUES
(27, 22222222, 8),
(59, 11111111, 7),
(60, 11111111, 9),
(61, 11111111, 10),
(62, 33333333, 5),
(63, 33333333, 10),
(64, 33333333, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `destinatarios_envio`
--

CREATE TABLE `destinatarios_envio` (
  `id` int(11) NOT NULL,
  `envio_id` int(11) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `estado` enum('pendiente','procesando','enviado','fallido','reintentando') DEFAULT 'pendiente',
  `intentos` int(11) DEFAULT 0,
  `mensaje_error` text DEFAULT NULL,
  `fecha_envio` datetime DEFAULT NULL,
  `fecha_apertura` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `destinatarios_envio`
--

INSERT INTO `destinatarios_envio` (`id`, `envio_id`, `correo`, `estado`, `intentos`, `mensaje_error`, `fecha_envio`, `fecha_apertura`) VALUES
(1, 30, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 71dfb90a1353d-56769ab0762sm15395143e0c.4 - gsmtp', NULL, NULL),
(2, 30, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 71dfb90a1353d-56769ab0762sm15395182e0c.4 - gsmtp', NULL, NULL),
(3, 30, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ada2fe7eead31-5fde8ae2c86sm16115241137.11 - gsmtp', NULL, NULL),
(4, 30, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 71dfb90a1353d-5674c01d31asm17876219e0c.9 - gsmtp', NULL, NULL),
(5, 30, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 71dfb90a1353d-56767276f8bsm16788107e0c.14 - gsmtp', NULL, NULL),
(6, 30, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials a1e0cc1a2514c-94afd1ab720sm16312356241.4 - gsmtp', NULL, NULL),
(7, 30, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 71dfb90a1353d-5674c2429c9sm17705548e0c.16 - gsmtp', NULL, NULL),
(8, 30, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 71dfb90a1353d-5674c20a6b8sm17471467e0c.10 - gsmtp', NULL, NULL),
(9, 30, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials a1e0cc1a2514c-94afd1ab72bsm17490859241.5 - gsmtp', NULL, NULL),
(10, 31, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ada2fe7eead31-5fe153b3231sm14104157137.5 - gsmtp', NULL, NULL),
(11, 31, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials a1e0cc1a2514c-94afd1ab72bsm17490926241.5 - gsmtp', NULL, NULL),
(12, 31, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 71dfb90a1353d-5674bfeff10sm18214650e0c.8 - gsmtp', NULL, NULL),
(13, 31, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 71dfb90a1353d-5674c01d31asm17876568e0c.9 - gsmtp', NULL, NULL),
(14, 31, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ada2fe7eead31-5fde87fb7f5sm16021277137.2 - gsmtp', NULL, NULL),
(15, 31, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials a1e0cc1a2514c-94afd1f1f82sm16696922241.8 - gsmtp', NULL, NULL),
(16, 31, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 71dfb90a1353d-5674c25ecdesm17476344e0c.20 - gsmtp', NULL, NULL),
(17, 31, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ada2fe7eead31-5fde8adf700sm16761024137.12 - gsmtp', NULL, NULL),
(18, 31, 'danielamanrique.mo@gmail.com', 'fallido', 1, 'Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ada2fe7eead31-5fde87fc73esm16229303137.1 - gsmtp', NULL, NULL),
(19, 32, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:08', NULL),
(20, 32, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:09', NULL),
(21, 32, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:10', NULL),
(22, 32, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:11', NULL),
(23, 32, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:13', NULL),
(24, 32, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:14', NULL),
(25, 32, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:16', NULL),
(26, 32, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:17', NULL),
(27, 32, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:18', NULL),
(28, 33, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:18', NULL),
(29, 33, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:20', NULL),
(30, 33, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:21', NULL),
(31, 33, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:23', NULL),
(32, 33, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:24', NULL),
(33, 33, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:25', NULL),
(34, 33, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:27', NULL),
(35, 33, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:28', NULL),
(36, 33, 'danielamanrique.mo@gmail.com', 'enviado', 0, NULL, '2026-02-20 08:51:30', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `email_templates`
--

CREATE TABLE `email_templates` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `html_content` longtext NOT NULL,
  `variables` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `email_templates`
--

INSERT INTO `email_templates` (`id`, `nombre`, `descripcion`, `html_content`, `variables`, `created_at`, `updated_at`) VALUES
(15, 'hola', 'hola', '<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Recordatorio de Cita Médica</title>\n    <style>\n        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; color: #000; }\n        .container { max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }\n        .header { background-color: #3b5998; color: white; padding: 25px 0; text-align: center; font-weight: 700; font-size: 24px; }\n        .header-circle { width: 120px; height: 120px; margin: 0 auto 3px; background-color: white; border-radius: 50%; border: 1px solid #ddd; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }\n        .header-circle img { max-width: 90%; max-height: 300%; object-fit: contain; margin-left: 8px; border-radius: 200px; }\n        .content { padding: 25px 30px; }\n        .content h2 { font-weight: 700; font-size: 20px; margin: 0 0 20px; }\n        .content p { font-size: 14px; line-height: 1.5; margin: 10px 0; }\n        .highlighted { background-color: #f3f6fb; padding: 15px 20px; margin: 20px 0; border-radius: 6px; font-size: 14px; }\n        .highlighted b { color: #2b2b2b; }\n        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 13px; padding: 20px 30px; text-align: center; }\n        .footer b { color: #fff; }\n        a, a:visited { color: #3b5998; text-decoration: none; font-weight: 600; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <div class=\"header-circle\">\n                <img src=\"cid:logo\" alt=\"UMIT Logo\" />\n            </div>\n        </div>\n        <div class=\"content\">\n            <h2>hola {{Nombre}}<br>&nbsp;<br>Que edad tienes {{Edad}}<br>&nbsp;</h2>\n        </div>\n        <div class=\"footer\">\n            Atentamente,<br/>El equipo de <b>Unidad materno infantil</b>\n        </div>\n    </div>\n</body>\n</html>', '[\"Nombre\",\"Edad\"]', '2025-12-09 22:42:29', '2025-12-09 22:42:29'),
(16, 'plantilla 1', 'descripción plantilla 1', '<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Recordatorio de Cita Médica</title>\n    <style>\n        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; color: #000; }\n        .container { max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }\n        .header { background-color: #3b5998; color: white; padding: 25px 0; text-align: center; font-weight: 700; font-size: 24px; }\n        .header-circle { width: 120px; height: 120px; margin: 0 auto 3px; background-color: white; border-radius: 50%; border: 1px solid #ddd; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }\n        .header-circle img { max-width: 90%; max-height: 300%; object-fit: contain; margin-left: 8px; border-radius: 200px; }\n        .content { padding: 25px 30px; }\n        .content h2 { font-weight: 700; font-size: 20px; margin: 0 0 20px; }\n        .content p { font-size: 14px; line-height: 1.5; margin: 10px 0; }\n        .highlighted { background-color: #f3f6fb; padding: 15px 20px; margin: 20px 0; border-radius: 6px; font-size: 14px; }\n        .highlighted b { color: #2b2b2b; }\n        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 13px; padding: 20px 30px; text-align: center; }\n        .footer b { color: #fff; }\n        a, a:visited { color: #3b5998; text-decoration: none; font-weight: 600; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <div class=\"header-circle\">\n                <img src=\"cid:logo\" alt=\"UMIT Logo\" />\n            </div>\n        </div>\n        <div class=\"content\">\n            <h2>Hola {{Nombre}}<br>&nbsp;<br>&nbsp;cual es tu a<font color=\"#da1616\">pellid</font><font color=\"#1675da\">o </font>{{Apellido}}&nbsp;<br>&nbsp;<br>&nbsp;que estas haciendo {{Actividad}}&nbsp;</h2>\n        </div>\n        <div class=\"footer\">\n            Atentamente,<br/>El equipo de <b>Unidad materno infantil</b>\n        </div>\n    </div>\n</body>\n</html>', '[\"Nombre\",\"Apellido\",\"Actividad\"]', '2025-12-10 19:33:28', '2025-12-10 19:33:28'),
(18, 'plantilla ejemplo', 'ejemplo', '<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Recordatorio de Cita Médica</title>\n    <style>\n        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; color: #000; }\n        .container { max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }\n        .header { background-color: #3b5998; color: white; padding: 25px 0; text-align: center; font-weight: 700; font-size: 24px; }\n        .header-circle { width: 120px; height: 120px; margin: 0 auto 3px; background-color: white; border-radius: 50%; border: 1px solid #ddd; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }\n        .header-circle img { max-width: 90%; max-height: 300%; object-fit: contain; margin-left: 8px; border-radius: 200px; }\n        .content { padding: 25px 30px; }\n        .content h2 { font-weight: 700; font-size: 20px; margin: 0 0 20px; }\n        .content p { font-size: 14px; line-height: 1.5; margin: 10px 0; }\n        .highlighted { background-color: #f3f6fb; padding: 15px 20px; margin: 20px 0; border-radius: 6px; font-size: 14px; }\n        .highlighted b { color: #2b2b2b; }\n        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 13px; padding: 20px 30px; text-align: center; }\n        .footer b { color: #fff; }\n        a, a:visited { color: #3b5998; text-decoration: none; font-weight: 600; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <div class=\"header-circle\">\n                <img src=\"cid:logo\" alt=\"UMIT Logo\" />\n            </div>\n        </div>\n        <div class=\"content\">\n            <h2><span style=\"font-weight: normal;\">Hola esto es un <font color=\"#f10e0e\">ejempl</font>o&nbsp;</span><br>&nbsp;<br>&nbsp;como estas {{Estadoanimico}}<br>&nbsp;<br>&nbsp;que edad tienes {{Edad}}</h2>\n        </div>\n        <div class=\"footer\">\n            Atentamente,<br/>El equipo de <b>Unidad materno infantil</b>\n        </div>\n    </div>\n</body>\n</html>', '[\"Estadoanimico\",\"Edad\"]', '2025-12-16 18:01:39', '2025-12-16 18:01:39'),
(19, 'Plantilla  ingeniera', 'prueba de plantilla', '<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Recordatorio de Cita Médica</title>\n    <style>\n        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; color: #000; }\n        .container { max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }\n        .header { background-color: #3b5998; color: white; padding: 25px 0; text-align: center; font-weight: 700; font-size: 24px; }\n        .header-circle { width: 120px; height: 120px; margin: 0 auto 3px; background-color: white; border-radius: 50%; border: 1px solid #ddd; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }\n        .header-circle img { max-width: 90%; max-height: 300%; object-fit: contain; margin-left: 8px; border-radius: 200px; }\n        .content { padding: 25px 30px; }\n        .content h2 { font-weight: 700; font-size: 20px; margin: 0 0 20px; }\n        .content p { font-size: 14px; line-height: 1.5; margin: 10px 0; }\n        .highlighted { background-color: #f3f6fb; padding: 15px 20px; margin: 20px 0; border-radius: 6px; font-size: 14px; }\n        .highlighted b { color: #2b2b2b; }\n        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 13px; padding: 20px 30px; text-align: center; }\n        .footer b { color: #fff; }\n        a, a:visited { color: #3b5998; text-decoration: none; font-weight: 600; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <div class=\"header-circle\">\n                <img src=\"cid:logo\" alt=\"UMIT Logo\" />\n            </div>\n        </div>\n        <div class=\"content\">\n            <h2><span style=\"font-weight: normal;\">Hola {{nombre}} como <font color=\"#e40c0c\">estas <u>{{Estadoanimico}}<br></u>&nbsp;</font></span></h2>\n        </div>\n        <div class=\"footer\">\n            Atentamente,<br/>El equipo de <b>Unidad materno infantil</b>\n        </div>\n    </div>\n</body>\n</html>', '[\"nombre\",\"Estadoanimico\"]', '2025-12-16 19:38:41', '2025-12-16 19:38:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `envios`
--

CREATE TABLE `envios` (
  `id` int(11) NOT NULL,
  `tipo` enum('PROGRAMADO','INMEDIATO') NOT NULL,
  `remitente_id` int(11) NOT NULL,
  `plantilla_id` int(11) NOT NULL,
  `asunto` varchar(255) DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `archivo_adjunto` varchar(255) DEFAULT NULL,
  `cantidad_destinatarios` int(11) DEFAULT 0,
  `estado` enum('pendiente','procesando','parcial','completado','fallido','cancelado') DEFAULT 'pendiente',
  `total_destinatarios` int(11) DEFAULT 0,
  `enviados` int(11) DEFAULT 0,
  `fallidos` int(11) DEFAULT 0,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_programada` datetime DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `fecha_envio` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `envios`
--

INSERT INTO `envios` (`id`, `tipo`, `remitente_id`, `plantilla_id`, `asunto`, `mensaje`, `archivo_adjunto`, `cantidad_destinatarios`, `estado`, `total_destinatarios`, `enviados`, `fallidos`, `fecha_creacion`, `fecha_programada`, `fecha_inicio`, `fecha_fin`, `fecha_envio`) VALUES
(3, '', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:49', NULL, NULL, NULL, '2026-02-18 16:23:49'),
(4, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:52', NULL, NULL, NULL, '2026-02-18 16:23:52'),
(5, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:53', NULL, NULL, NULL, '2026-02-18 16:23:53'),
(6, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:54', NULL, NULL, NULL, '2026-02-18 16:23:54'),
(7, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:54', NULL, NULL, NULL, '2026-02-18 16:23:54'),
(8, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:54', NULL, NULL, NULL, '2026-02-18 16:23:54'),
(9, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:54', NULL, NULL, NULL, '2026-02-18 16:23:54'),
(10, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:55', NULL, NULL, NULL, '2026-02-18 16:23:55'),
(11, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:55', NULL, NULL, NULL, '2026-02-18 16:23:55'),
(12, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:55', NULL, NULL, NULL, '2026-02-18 16:23:55'),
(13, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:55', NULL, NULL, NULL, '2026-02-18 16:23:55'),
(14, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:56', NULL, NULL, NULL, '2026-02-18 16:23:56'),
(15, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:56', NULL, NULL, NULL, '2026-02-18 16:23:56'),
(16, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:56', NULL, NULL, NULL, '2026-02-18 16:23:56'),
(17, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:56', NULL, NULL, NULL, '2026-02-18 16:23:56'),
(18, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:56', NULL, NULL, NULL, '2026-02-18 16:23:56'),
(19, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:56', NULL, NULL, NULL, '2026-02-18 16:23:56'),
(20, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:23:56', NULL, NULL, NULL, '2026-02-18 16:23:56'),
(22, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:34:05', NULL, NULL, NULL, '2026-02-18 16:34:05'),
(23, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:34:35', NULL, NULL, NULL, '2026-02-18 16:34:35'),
(24, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-18 16:35:22', NULL, NULL, NULL, '2026-02-18 16:35:22'),
(25, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-19 15:38:40', NULL, NULL, NULL, '2026-02-19 15:38:40'),
(26, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-19 15:43:23', NULL, NULL, NULL, '2026-02-19 15:43:23'),
(27, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-19 16:51:49', NULL, NULL, NULL, '2026-02-19 16:51:49'),
(28, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-19 16:59:46', NULL, NULL, NULL, '2026-02-19 16:59:46'),
(29, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, '', 0, 0, 0, '2026-02-19 17:00:22', NULL, NULL, NULL, '2026-02-19 17:00:22'),
(30, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, 'fallido', 9, 0, 9, '2026-02-20 08:13:27', NULL, '2026-02-20 08:13:32', '2026-02-20 08:13:38', '2026-02-20 08:13:27'),
(31, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, 'fallido', 9, 0, 9, '2026-02-20 08:13:28', NULL, '2026-02-20 08:13:38', '2026-02-20 08:13:43', '2026-02-20 08:13:28'),
(32, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, 'completado', 9, 9, 0, '2026-02-20 08:51:02', NULL, '2026-02-20 08:51:06', '2026-02-20 08:51:18', '2026-02-20 08:51:02'),
(33, 'INMEDIATO', 1, 7, NULL, NULL, NULL, 0, 'completado', 9, 8, 0, '2026-02-20 08:51:03', NULL, '2026-02-20 08:51:19', '2026-02-20 08:51:30', '2026-02-20 08:51:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `errores_envio`
--

CREATE TABLE `errores_envio` (
  `id` int(11) NOT NULL,
  `envio_id` int(11) NOT NULL,
  `tipo_error` varchar(100) DEFAULT NULL,
  `mensaje_error` text DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plantillas`
--

CREATE TABLE `plantillas` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `nom_plantilla` varchar(25) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `html_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `variables` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `area_id` int(11) NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `plantillas`
--

INSERT INTO `plantillas` (`id`, `user_id`, `nom_plantilla`, `descripcion`, `html_content`, `variables`, `area_id`, `estado`, `created_at`, `update_at`) VALUES
(1, 6, 'prueba1', 'prueba1', '{{ Nombre }}', '[\" Nombre \"]', 5, 'ACTIVO', '2026-01-30 01:54:12', '2026-01-30 01:54:12'),
(2, 6, 'prueba2', 'asd', 'hola {{ nombre }} este es un mensaje de prueba enviado el {{ fecha }}', '[\" nombre \",\" fecha \"]', 10, 'ACTIVO', '2026-01-30 02:51:20', '2026-01-30 02:51:20'),
(3, 6, 'prueba1', 'prueba1\n', 'Hola {{nombre}} {{ mensaje }}', '[\" mensaje \"]', 6, 'ACTIVO', '2026-01-30 16:47:12', '2026-01-30 16:47:12'),
(4, 6, 'prueba2', '´poiuy', 'les informo que {{ mensaje }}', '[\" mensaje \"]', 6, 'ACTIVO', '2026-01-30 16:52:32', '2026-01-30 16:52:32'),
(5, 6, 'plantilla 1', 'Descripcion', 'Hola {{ nombre }} este es un mensaje de prueba hecho el {{ fecha }}', '[\" nombre \",\" fecha \"]', 5, 'ACTIVO', '2026-02-02 21:08:01', '2026-02-02 21:08:01'),
(6, 6, 'prueba1', 'prueba', 'hola {{ nombre }} este es un mensaje de prueba hecho el {{ fecha}}', '[\" nombre \",\" fecha\"]', 6, 'ACTIVO', '2026-02-02 22:32:38', '2026-02-02 22:32:38'),
(7, 6, 'calidad 1', 'ninguna', 'Hola este es un correo de prueba enviado el dia {{ fecha }} a las {{ hora }}, enviado a {{ nombre }} que vive en {{ direccion }}', '[\" fecha \",\" hora \",\" nombre \",\" direccion \"]', 6, 'ACTIVO', '2026-02-18 20:31:25', '2026-02-18 20:31:25'),
(8, 6, 'plantilla contabilidad', 'no aplica', 'Este es un mensaje de prueba del area {{ contabilidad }}', '[\" contabilidad \"]', 8, 'ACTIVO', '2026-02-19 20:36:08', '2026-02-19 20:36:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `remitentes`
--

CREATE TABLE `remitentes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `smtp_host` varchar(150) NOT NULL,
  `smtp_port` int(11) NOT NULL,
  `secure` tinyint(1) NOT NULL,
  `password_app` varchar(255) NOT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `remitentes`
--

INSERT INTO `remitentes` (`id`, `nombre`, `correo`, `smtp_host`, `smtp_port`, `secure`, `password_app`, `estado`, `created_at`) VALUES
(1, 'correo de prueba', 'pruebasmasicorreos@gmail.com', 'smtp.gmail.com', 465, 1, 'tbsetdqyymwwbiye', 'activo', '2026-02-16 16:33:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `documento` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `correo` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `creado_por` int(11) NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `rol` enum('ADMINISTRADOR','ESTANDAR') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`documento`, `nombre`, `correo`, `password`, `fecha_registro`, `creado_por`, `estado`, `reset_token`, `reset_token_expires`, `rol`) VALUES
(1, 'hola', 'hola@gmail.com', '$2a$10$NBWEQd868z3.QdvlDbG6UOTO2KrsQ3V4zlqNm8AO54xnU9W/eRa/K', '2025-11-24 20:04:44', 0, 'ACTIVO', NULL, NULL, 'ADMINISTRADOR'),
(2, 'curiosidades', 'curiosidades318511@gmail.com', '$2a$10$PRWlMsupsdIXnRLQUB0lBueODeMHfn427IoKyIkEE3ykmVp/Wd/Je', '2025-12-10 19:52:06', 0, 'ACTIVO', NULL, NULL, 'ADMINISTRADOR'),
(3, 'jefe', 'jefe@gmail.com', '$2a$10$H6aaSDbsz6/AtfLeI.19z.zlbON2yVhRd3dy4VyfS7j.wH9pank3e', '2025-12-16 17:55:59', 0, 'ACTIVO', NULL, NULL, 'ADMINISTRADOR'),
(4, 'Daniela Manrique', 'Dani123', '$2a$10$y9PngRvGILyu.AgzgSOukOwBUxilSiPQuCpXTcBvK/Fy0KLX3YTSO', '2025-12-16 19:32:30', 0, 'ACTIVO', NULL, NULL, 'ADMINISTRADOR'),
(5, 'Alexandra Barreto', 'sistemas@umit.com.co', '$2a$10$cq9YEmZbrVwvFX6yf1QMJeOsQ3/IrVcalJ6mhfgbpVk2kRevjyutq', '2025-12-16 19:50:56', 0, 'ACTIVO', NULL, NULL, 'ADMINISTRADOR'),
(6, 'daniela ', 'dmm@gmail.com', '$2a$10$0W3u.YphdEYAwvd2jKLqEepDZDxTDDuhhw5fSYtMnB7PeaQbOn4Xi', '2025-12-17 20:58:46', 0, 'ACTIVO', NULL, NULL, 'ADMINISTRADOR'),
(11111111, 'prueba01', 'prueba1@gmail.com', '$2a$10$lDMnxm08UhPxIx2/le20R.hHisHrW.APPLbL2bIFUucwudg3GVlFq', '2026-01-07 20:32:34', 6, 'ACTIVO', NULL, NULL, 'ESTANDAR'),
(22222222, 'prueba2', 'prueba2@gmail.com', '$2a$10$.O7GZa4RGs5tKwHfFV.1ku7T9W2ENMZ3X6bZxE1A7MlsUKdTIJDpq', '2026-01-07 20:46:32', 6, 'ACTIVO', NULL, NULL, 'ESTANDAR'),
(33333333, 'prueba3', 'prueba3@gmail.com', '$2a$10$m1VXiIB/kOoZLcsKkR0WLu1B2h6fFf3tfIK2NLTxQUMt2AOJJnX3u', '2026-02-19 20:06:34', 6, 'ACTIVO', NULL, NULL, 'ESTANDAR');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `acciones_usuario_envio`
--
ALTER TABLE `acciones_usuario_envio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `envio_id` (`envio_id`),
  ADD KEY `usuario` (`usuario_id`);

--
-- Indices de la tabla `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_timestamp` (`timestamp`);

--
-- Indices de la tabla `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `area_usuario`
--
ALTER TABLE `area_usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuarios` (`id_usuario`),
  ADD KEY `areas` (`id_area`);

--
-- Indices de la tabla `destinatarios_envio`
--
ALTER TABLE `destinatarios_envio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `envio_id` (`envio_id`),
  ADD KEY `estado` (`estado`);

--
-- Indices de la tabla `email_templates`
--
ALTER TABLE `email_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `envios`
--
ALTER TABLE `envios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `remitente` (`remitente_id`),
  ADD KEY `plantilla` (`plantilla_id`),
  ADD KEY `idx_envios_estado` (`estado`),
  ADD KEY `idx_envios_usuario` (`remitente_id`);

--
-- Indices de la tabla `errores_envio`
--
ALTER TABLE `errores_envio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `envio_id` (`envio_id`);

--
-- Indices de la tabla `plantillas`
--
ALTER TABLE `plantillas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `plantilla_area` (`area_id`),
  ADD KEY `plantilla_usuario` (`user_id`);

--
-- Indices de la tabla `remitentes`
--
ALTER TABLE `remitentes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`documento`),
  ADD UNIQUE KEY `usuario` (`correo`),
  ADD KEY `idx_usuario` (`correo`),
  ADD KEY `idx_reset_token` (`reset_token`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `acciones_usuario_envio`
--
ALTER TABLE `acciones_usuario_envio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `areas`
--
ALTER TABLE `areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `area_usuario`
--
ALTER TABLE `area_usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT de la tabla `destinatarios_envio`
--
ALTER TABLE `destinatarios_envio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de la tabla `envios`
--
ALTER TABLE `envios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `errores_envio`
--
ALTER TABLE `errores_envio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `plantillas`
--
ALTER TABLE `plantillas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `remitentes`
--
ALTER TABLE `remitentes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `acciones_usuario_envio`
--
ALTER TABLE `acciones_usuario_envio`
  ADD CONSTRAINT `acciones_usuario_envio_ibfk_1` FOREIGN KEY (`envio_id`) REFERENCES `envios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`documento`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`documento`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `area_usuario`
--
ALTER TABLE `area_usuario`
  ADD CONSTRAINT `areas` FOREIGN KEY (`id_area`) REFERENCES `areas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`documento`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `envios`
--
ALTER TABLE `envios`
  ADD CONSTRAINT `plantilla` FOREIGN KEY (`plantilla_id`) REFERENCES `plantillas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `remitente` FOREIGN KEY (`remitente_id`) REFERENCES `usuarios` (`documento`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `errores_envio`
--
ALTER TABLE `errores_envio`
  ADD CONSTRAINT `errores_envio_ibfk_1` FOREIGN KEY (`envio_id`) REFERENCES `envios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `plantillas`
--
ALTER TABLE `plantillas`
  ADD CONSTRAINT `plantilla_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `plantilla_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`documento`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
