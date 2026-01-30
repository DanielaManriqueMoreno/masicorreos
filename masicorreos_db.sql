-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-01-2026 a las 22:01:50
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

--
-- Volcado de datos para la tabla `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `username`, `action`, `description`, `ip_address`, `timestamp`) VALUES
(139, 1, 'Usuario', 'CREAR_PLANTILLA', 'Plantilla creada: plantilla 1', '', '2025-12-10 19:33:28'),
(140, 1, 'hola@gmail.com', 'ENVIO_CORREOS_PLANTILLA_PERSONALIZADA', 'Plantilla: plantilla 1, Procesados: 4, Enviados: 2, Programados: 0, Fallidos: 2', '', '2025-12-10 19:40:07'),
(141, 2, 'curiosidades318511@gmail.com', 'SOLICITAR_RECUPERACION_PASSWORD', 'Solicitud de recuperación de contraseña', '', '2025-12-10 19:52:37'),
(142, 2, 'curiosidades318511@gmail.com', 'RESET_PASSWORD', 'Contraseña restablecida exitosamente', '', '2025-12-10 19:53:29'),
(143, 2, 'curiosidades318511@gmail.com', 'SOLICITAR_RECUPERACION_PASSWORD', 'Solicitud de recuperación de contraseña', '', '2025-12-10 19:55:25'),
(144, 2, 'curiosidades318511@gmail.com', 'RESET_PASSWORD', 'Contraseña restablecida exitosamente', '', '2025-12-10 19:56:01'),
(145, 2, 'curiosidades318511@gmail.com', 'SOLICITAR_RECUPERACION_PASSWORD', 'Solicitud de recuperación de contraseña', '', '2025-12-10 19:57:29'),
(146, 2, 'curiosidades318511@gmail.com', 'SOLICITAR_RECUPERACION_PASSWORD', 'Solicitud de recuperación de contraseña', '', '2025-12-10 19:59:23'),
(147, 2, 'curiosidades318511@gmail.com', 'RESET_PASSWORD', 'Contraseña restablecida exitosamente', '', '2025-12-10 20:03:05'),
(148, 2, 'Usuario', 'CREAR_PLANTILLA', 'Plantilla creada: daniela', '', '2025-12-10 20:34:52'),
(149, 2, 'curiosidades318511@gmail.com', 'ENVIO_CORREOS_PLANTILLA_PERSONALIZADA', 'Plantilla: daniela, Procesados: 2, Enviados: 2, Programados: 0, Fallidos: 0', '', '2025-12-10 20:36:11'),
(150, 2, 'Usuario', 'ELIMINAR_PLANTILLA', 'Plantilla eliminada: daniela', '', '2025-12-10 20:47:06'),
(151, 3, 'jefe@gmail.com', 'ENVIO_CORREOS_CITAS', 'Procesados: 2, Enviados: 2, Programados: 0, Fallidos: 0', '', '2025-12-16 17:59:08'),
(152, 3, 'Usuario', 'CREAR_PLANTILLA', 'Plantilla creada: plantilla ejemplo', '', '2025-12-16 18:01:39'),
(153, 3, 'jefe@gmail.com', 'ENVIO_CORREOS_PLANTILLA_PERSONALIZADA', 'Plantilla: plantilla ejemplo, Procesados: 2, Enviados: 2, Programados: 0, Fallidos: 0', '', '2025-12-16 18:04:58'),
(154, 3, 'jefe@gmail.com', 'ENVIO_CORREOS_DENGUE', 'Procesados: 2, Enviados: 2, Programados: 0, Fallidos: 0', '', '2025-12-16 18:06:56'),
(155, 4, 'Usuario', 'CREAR_PLANTILLA', 'Plantilla creada: Plantilla  ingeniera', '', '2025-12-16 19:38:41'),
(156, 4, 'Dani123', 'ENVIO_CORREOS_PLANTILLA_PERSONALIZADA', 'Plantilla: Plantilla  ingeniera, Procesados: 2, Enviados: 2, Programados: 0, Fallidos: 0', '', '2025-12-16 19:44:22'),
(157, 5, 'sistemas@umit.com.co', 'SOLICITAR_RECUPERACION_PASSWORD', 'Solicitud de recuperación de contraseña', '', '2025-12-16 19:51:46'),
(158, 5, 'sistemas@umit.com.co', 'RESET_PASSWORD', 'Contraseña restablecida exitosamente', '', '2025-12-16 19:53:03'),
(159, 4, 'Dani123', 'ENVIO_CORREOS_CITAS', 'Procesados: 2, Enviados: 2, Programados: 0, Fallidos: 0', '', '2025-12-16 20:36:46'),
(160, 4, 'Dani123', 'ENVIO_CORREOS_DENGUE', 'Procesados: 2, Enviados: 0, Programados: 0, Fallidos: 2', '', '2025-12-16 20:41:10'),
(161, 4, 'Dani123', 'ENVIO_CORREOS_DENGUE', 'Procesados: 2, Enviados: 2, Programados: 0, Fallidos: 0', '', '2025-12-16 20:42:30'),
(162, 4, 'Dani123', 'ENVIO_CORREOS_DENGUE', 'Procesados: 2, Enviados: 2, Programados: 0, Fallidos: 0', '', '2025-12-16 20:42:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas`
--

CREATE TABLE `areas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `estado` enum('ACTIVA','INACTIVA') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `areas`
--

INSERT INTO `areas` (`id`, `nombre`, `estado`) VALUES
(5, 'Citas', 'ACTIVA'),
(6, 'Calidad', 'ACTIVA'),
(7, 'Talento Humano', 'ACTIVA'),
(8, 'Contabilidad', 'ACTIVA'),
(9, 'Radicacion', 'ACTIVA'),
(10, 'Sistemas', 'ACTIVA'),
(11, 'Registros', 'ACTIVA');

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
(56, 11111111, 7),
(57, 11111111, 9),
(58, 11111111, 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `correosfallidosdecursosobligatorios`
--

CREATE TABLE `correosfallidosdecursosobligatorios` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `nombre_empleado` text DEFAULT NULL,
  `nombre_curso` text DEFAULT NULL,
  `fecha_vencimiento` text DEFAULT NULL,
  `subject` text DEFAULT NULL,
  `html_content` longtext DEFAULT NULL,
  `error_message` text NOT NULL,
  `intentos_envio` int(11) DEFAULT 1,
  `from_email` varchar(255) DEFAULT NULL COMMENT 'Correo de talentohumano',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_attempt_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `correosfallidosdengue_calidad`
--

CREATE TABLE `correosfallidosdengue_calidad` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `tipo_plantilla` varchar(100) DEFAULT NULL COMMENT 'Dengue, Preparto, Posparto, Planificación',
  `subject` text DEFAULT NULL,
  `html_content` longtext DEFAULT NULL,
  `error_message` text NOT NULL,
  `intentos_envio` int(11) DEFAULT 1,
  `from_email` varchar(255) DEFAULT NULL COMMENT 'Correo de calidad',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_attempt_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `correosfallidosdengue_calidad`
--

INSERT INTO `correosfallidosdengue_calidad` (`id`, `user_id`, `recipient_email`, `tipo_plantilla`, `subject`, `html_content`, `error_message`, `intentos_envio`, `from_email`, `created_at`, `last_attempt_at`) VALUES
(1, 4, 'destinatario@example.com', 'Dengue', 'Información sobre Dengue - UMIT', '\n<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Prevención del Dengue - UMIT</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            background-color: #fff;\n            margin: 0;\n            padding: 0;\n            color: #000;\n        }\n        .container {\n            width: 90%;\n            max-width: 800px;\n            border-radius: 8px;\n            overflow: hidden;\n            box-shadow: 0 0 8px rgba(0,0,0,0.1);\n            border: 1px solid #ddd;\n        }\n        .header {\n            background-color: #3b5998;\n            color: white;\n            padding: 15px 0;\n            text-align: center;\n            font-weight: 700;\n            font-size: 20px;\n        }\n        .header-circle {\n            width: 80px;\n            height: 80px;\n            margin: 0 auto 5px;\n            background-color: white;\n            border-radius: 50%;\n            border: 1px solid #ddd;\n            box-sizing: border-box;\n            display: flex;\n            align-items: center;\n            justify-content: flex-start;\n            padding-left: 20px;\n            padding-top: 15px;\n            font-size: 35px;\n        }\n        .content {\n            padding: 20px;\n            display: grid;\n            grid-template-columns: 1fr 1fr;\n            gap: 15px;\n        }\n        .content h2 {\n            font-weight: 700;\n            font-size: 16px;\n            margin: 0 0 10px;\n            color: #3b5998;\n            grid-column: 1 / -1;\n            text-align: center;\n        }\n        .info-box {\n            background-color: #f3f6fb;\n            padding: 12px;\n            border-radius: 6px;\n            font-size: 12px;\n            min-height: 120px;\n        }\n        .warning-box {\n            background-color: #fff5f5;\n            border-left: 4px solid #e74c3c;\n            padding: 12px;\n            border-radius: 6px;\n            font-size: 12px;\n            grid-column: 1 / -1;\n            margin-top: 5px;\n        }\n        .footer {\n            background-color: #2e3b55;\n            color: #a0b5d9;\n            font-size: 11px;\n            padding: 15px;\n            text-align: center;\n        }\n        b {\n            color: #2b2b2b;\n        }\n        ul {\n            padding-left: 15px;\n            margin: 8px 0;\n        }\n        li {\n            margin-bottom: 5px;\n            font-size: 11px;\n        }\n        .intro {\n            grid-column: 1 / -1;\n            text-align: center;\n            font-size: 12px;\n            margin-bottom: 10px;\n        }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <div class=\"header-circle\">\n                🦟\n            </div>\n            PREVENCIÓN DEL DENGUE\n        </div>\n        <div class=\"content\">\n            <h2>Información importante sobre el dengue</h2>\n            <p class=\"intro\">Enfermedad transmitida por el mosquito <b>Aedes aegypti</b> que se reproduce en agua limpia acumulada.</p>\n\n            <div class=\"info-box\">\n                <p><b>🩺 En el hogar:</b></p>\n                <ul>\n                    <li>Elimine recipientes con agua</li>\n                    <li>Lave tanques semanalmente</li>\n                    <li>Mantenga entorno limpio</li>\n                    <li>Use tapas en tanques</li>\n                </ul>\n            </div>\n\n            <div class=\"info-box\">\n                <p><b>👨‍👩‍👧‍👦 Personales:</b></p>\n                <ul>\n                    <li>Use ropa que cubra</li>\n                    <li>Aplique repelente</li>\n                    <li>Coloque toldillos</li>\n                    <li>Instale mallas</li>\n                </ul>\n            </div>\n\n            <div class=\"warning-box\">\n                <p><b>🚨 Signos de alarma:</b></p>\n                <p>Fiebre alta, dolor intenso, náuseas, sangrado. <b>No se automedique - Consulte inmediatamente</b></p>\n            </div>\n\n            <p style=\"grid-column: 1 / -1; text-align: center; font-size: 12px; margin: 5px 0;\">\n                <b>💧 Sin criaderos no hay mosquitos. Sin mosquitos, no hay dengue.</b>\n            </p>\n        </div>\n        <div class=\"footer\">\n            Unidad Materno Infantil del Tolima S.A.<br/>\n            <a href=\"https://www.umit.com.co/escuela-de-padres\" target=\"_blank\" style=\"color: #a0b5d9;\">www.umit.com.co</a>\n        </div>\n    </div>\n</body>\n</html>\n', 'Fila 2: Email inválido o vacío', 1, 'calidad@umit.com.co', '2025-12-16 20:41:10', NULL),
(2, 4, 'destinatario2@example.com', 'Dengue', 'Información sobre Dengue - UMIT', '\n<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Prevención del Dengue - UMIT</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            background-color: #fff;\n            margin: 0;\n            padding: 0;\n            color: #000;\n        }\n        .container {\n            width: 90%;\n            max-width: 800px;\n            border-radius: 8px;\n            overflow: hidden;\n            box-shadow: 0 0 8px rgba(0,0,0,0.1);\n            border: 1px solid #ddd;\n        }\n        .header {\n            background-color: #3b5998;\n            color: white;\n            padding: 15px 0;\n            text-align: center;\n            font-weight: 700;\n            font-size: 20px;\n        }\n        .header-circle {\n            width: 80px;\n            height: 80px;\n            margin: 0 auto 5px;\n            background-color: white;\n            border-radius: 50%;\n            border: 1px solid #ddd;\n            box-sizing: border-box;\n            display: flex;\n            align-items: center;\n            justify-content: flex-start;\n            padding-left: 20px;\n            padding-top: 15px;\n            font-size: 35px;\n        }\n        .content {\n            padding: 20px;\n            display: grid;\n            grid-template-columns: 1fr 1fr;\n            gap: 15px;\n        }\n        .content h2 {\n            font-weight: 700;\n            font-size: 16px;\n            margin: 0 0 10px;\n            color: #3b5998;\n            grid-column: 1 / -1;\n            text-align: center;\n        }\n        .info-box {\n            background-color: #f3f6fb;\n            padding: 12px;\n            border-radius: 6px;\n            font-size: 12px;\n            min-height: 120px;\n        }\n        .warning-box {\n            background-color: #fff5f5;\n            border-left: 4px solid #e74c3c;\n            padding: 12px;\n            border-radius: 6px;\n            font-size: 12px;\n            grid-column: 1 / -1;\n            margin-top: 5px;\n        }\n        .footer {\n            background-color: #2e3b55;\n            color: #a0b5d9;\n            font-size: 11px;\n            padding: 15px;\n            text-align: center;\n        }\n        b {\n            color: #2b2b2b;\n        }\n        ul {\n            padding-left: 15px;\n            margin: 8px 0;\n        }\n        li {\n            margin-bottom: 5px;\n            font-size: 11px;\n        }\n        .intro {\n            grid-column: 1 / -1;\n            text-align: center;\n            font-size: 12px;\n            margin-bottom: 10px;\n        }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <div class=\"header-circle\">\n                🦟\n            </div>\n            PREVENCIÓN DEL DENGUE\n        </div>\n        <div class=\"content\">\n            <h2>Información importante sobre el dengue</h2>\n            <p class=\"intro\">Enfermedad transmitida por el mosquito <b>Aedes aegypti</b> que se reproduce en agua limpia acumulada.</p>\n\n            <div class=\"info-box\">\n                <p><b>🩺 En el hogar:</b></p>\n                <ul>\n                    <li>Elimine recipientes con agua</li>\n                    <li>Lave tanques semanalmente</li>\n                    <li>Mantenga entorno limpio</li>\n                    <li>Use tapas en tanques</li>\n                </ul>\n            </div>\n\n            <div class=\"info-box\">\n                <p><b>👨‍👩‍👧‍👦 Personales:</b></p>\n                <ul>\n                    <li>Use ropa que cubra</li>\n                    <li>Aplique repelente</li>\n                    <li>Coloque toldillos</li>\n                    <li>Instale mallas</li>\n                </ul>\n            </div>\n\n            <div class=\"warning-box\">\n                <p><b>🚨 Signos de alarma:</b></p>\n                <p>Fiebre alta, dolor intenso, náuseas, sangrado. <b>No se automedique - Consulte inmediatamente</b></p>\n            </div>\n\n            <p style=\"grid-column: 1 / -1; text-align: center; font-size: 12px; margin: 5px 0;\">\n                <b>💧 Sin criaderos no hay mosquitos. Sin mosquitos, no hay dengue.</b>\n            </p>\n        </div>\n        <div class=\"footer\">\n            Unidad Materno Infantil del Tolima S.A.<br/>\n            <a href=\"https://www.umit.com.co/escuela-de-padres\" target=\"_blank\" style=\"color: #a0b5d9;\">www.umit.com.co</a>\n        </div>\n    </div>\n</body>\n</html>\n', 'Fila 3: Email inválido o vacío', 1, 'calidad@umit.com.co', '2025-12-16 20:41:10', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `correosfallidosdesistemascitas`
--

CREATE TABLE `correosfallidosdesistemascitas` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `patient_name` text DEFAULT NULL,
  `appointment_date` text DEFAULT NULL,
  `appointment_time` text DEFAULT NULL,
  `tipo_cita` varchar(100) DEFAULT NULL COMMENT 'Recordatorio, Reprogramación, Cancelación, Autorización vigente',
  `subject` text DEFAULT NULL,
  `html_content` longtext DEFAULT NULL,
  `error_message` text NOT NULL,
  `intentos_envio` int(11) DEFAULT 1,
  `from_email` varchar(255) DEFAULT 'micita@umit.com.co',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_attempt_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `custom_template_emails`
--

CREATE TABLE `custom_template_emails` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `template_id` int(11) NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `subject` varchar(500) DEFAULT NULL,
  `status` varchar(50) NOT NULL COMMENT 'ENVIADO, FALLIDO, PROGRAMADO, PREVIEW_GENERADO',
  `variables_data` text DEFAULT NULL COMMENT 'JSON con los valores de las variables usadas',
  `html_content` longtext DEFAULT NULL COMMENT 'HTML generado con las variables reemplazadas',
  `from_email` varchar(255) DEFAULT NULL COMMENT 'Correo remitente usado',
  `error_message` text DEFAULT NULL,
  `scheduled_datetime` datetime DEFAULT NULL COMMENT 'Fecha y hora programada si aplica',
  `sent_datetime` datetime DEFAULT NULL COMMENT 'Fecha y hora en que se envió',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `intentos_envio` int(11) DEFAULT 1 COMMENT 'Cantidad de intentos de envío',
  `last_attempt_at` timestamp NULL DEFAULT NULL COMMENT 'Fecha y hora del último intento de envío'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `custom_template_emails`
--

INSERT INTO `custom_template_emails` (`id`, `user_id`, `template_id`, `recipient_email`, `subject`, `status`, `variables_data`, `html_content`, `from_email`, `error_message`, `scheduled_datetime`, `sent_datetime`, `created_at`, `intentos_envio`, `last_attempt_at`) VALUES
(68, 1, 16, 'curiosidades318511@gmail.com', 'Correo: plantilla 1', 'ENVIADO', '{\"Nombre\":\"Juan Pérez\",\"Apellido\":\"palacios \",\"Actividad\":\"trabajando\"}', '<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Recordatorio de Cita Médica</title>\n    <style>\n        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; color: #000; }\n        .container { max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }\n        .header { background-color: #3b5998; color: white; padding: 25px 0; text-align: center; font-weight: 700; font-size: 24px; }\n        .header-circle { width: 120px; height: 120px; margin: 0 auto 3px; background-color: white; border-radius: 50%; border: 1px solid #ddd; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }\n        .header-circle img { max-width: 90%; max-height: 300%; object-fit: contain; margin-left: 8px; border-radius: 200px; }\n        .content { padding: 25px 30px; }\n        .content h2 { font-weight: 700; font-size: 20px; margin: 0 0 20px; }\n        .content p { font-size: 14px; line-height: 1.5; margin: 10px 0; }\n        .highlighted { background-color: #f3f6fb; padding: 15px 20px; margin: 20px 0; border-radius: 6px; font-size: 14px; }\n        .highlighted b { color: #2b2b2b; }\n        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 13px; padding: 20px 30px; text-align: center; }\n        .footer b { color: #fff; }\n        a, a:visited { color: #3b5998; text-decoration: none; font-weight: 600; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <div class=\"header-circle\">\n                <img src=\"cid:logo\" alt=\"UMIT Logo\" />\n            </div>\n        </div>\n        <div class=\"content\">\n            <h2>Hola Juan Pérez<br>&nbsp;<br>&nbsp;cual es tu a<font color=\"#da1616\">pellid</font><font color=\"#1675da\">o </font>palacios &nbsp;<br>&nbsp;<br>&nbsp;que estas haciendo trabajando&nbsp;</h2>\n        </div>\n        <div class=\"footer\">\n            Atentamente,<br/>El equipo de <b>Unidad materno infantil</b>\n        </div>\n    </div>\n</body>\n</html>', 'micita@umit.com.co', NULL, NULL, '2025-12-10 14:40:03', '2025-12-10 19:40:00', 1, NULL),
(69, 1, 16, 'curiosidades318511@gmail.com', 'Correo: plantilla 1', 'ENVIADO', '{\"Nombre\":\"María García\",\"Apellido\":\"contreras\",\"Actividad\":\"nada\"}', '<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Recordatorio de Cita Médica</title>\n    <style>\n        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; color: #000; }\n        .container { max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }\n        .header { background-color: #3b5998; color: white; padding: 25px 0; text-align: center; font-weight: 700; font-size: 24px; }\n        .header-circle { width: 120px; height: 120px; margin: 0 auto 3px; background-color: white; border-radius: 50%; border: 1px solid #ddd; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }\n        .header-circle img { max-width: 90%; max-height: 300%; object-fit: contain; margin-left: 8px; border-radius: 200px; }\n        .content { padding: 25px 30px; }\n        .content h2 { font-weight: 700; font-size: 20px; margin: 0 0 20px; }\n        .content p { font-size: 14px; line-height: 1.5; margin: 10px 0; }\n        .highlighted { background-color: #f3f6fb; padding: 15px 20px; margin: 20px 0; border-radius: 6px; font-size: 14px; }\n        .highlighted b { color: #2b2b2b; }\n        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 13px; padding: 20px 30px; text-align: center; }\n        .footer b { color: #fff; }\n        a, a:visited { color: #3b5998; text-decoration: none; font-weight: 600; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <div class=\"header-circle\">\n                <img src=\"cid:logo\" alt=\"UMIT Logo\" />\n            </div>\n        </div>\n        <div class=\"content\">\n            <h2>Hola María García<br>&nbsp;<br>&nbsp;cual es tu a<font color=\"#da1616\">pellid</font><font color=\"#1675da\">o </font>contreras&nbsp;<br>&nbsp;<br>&nbsp;que estas haciendo nada&nbsp;</h2>\n        </div>\n        <div class=\"footer\">\n            Atentamente,<br/>El equipo de <b>Unidad materno infantil</b>\n        </div>\n    </div>\n</body>\n</html>', 'micita@umit.com.co', NULL, NULL, '2025-12-10 14:40:06', '2025-12-10 19:40:04', 1, NULL),
(70, 1, 16, '12', 'Correo: plantilla 1', 'FALLIDO', '{\"Nombre\":34,\"Apellido\":65,\"Actividad\":78}', '<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Recordatorio de Cita Médica</title>\n    <style>\n        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; color: #000; }\n        .container { max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }\n        .header { background-color: #3b5998; color: white; padding: 25px 0; text-align: center; font-weight: 700; font-size: 24px; }\n        .header-circle { width: 120px; height: 120px; margin: 0 auto 3px; background-color: white; border-radius: 50%; border: 1px solid #ddd; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }\n        .header-circle img { max-width: 90%; max-height: 300%; object-fit: contain; margin-left: 8px; border-radius: 200px; }\n        .content { padding: 25px 30px; }\n        .content h2 { font-weight: 700; font-size: 20px; margin: 0 0 20px; }\n        .content p { font-size: 14px; line-height: 1.5; margin: 10px 0; }\n        .highlighted { background-color: #f3f6fb; padding: 15px 20px; margin: 20px 0; border-radius: 6px; font-size: 14px; }\n        .highlighted b { color: #2b2b2b; }\n        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 13px; padding: 20px 30px; text-align: center; }\n        .footer b { color: #fff; }\n        a, a:visited { color: #3b5998; text-decoration: none; font-weight: 600; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <div class=\"header-circle\">\n                <img src=\"cid:logo\" alt=\"UMIT Logo\" />\n            </div>\n        </div>\n        <div class=\"content\">\n            <h2>Hola 34<br>&nbsp;<br>&nbsp;cual es tu a<font color=\"#da1616\">pellid</font><font color=\"#1675da\">o </font>65&nbsp;<br>&nbsp;<br>&nbsp;que estas haciendo 78&nbsp;</h2>\n        </div>\n        <div class=\"footer\">\n            Atentamente,<br/>El equipo de <b>Unidad materno infantil</b>\n        </div>\n    </div>\n</body>\n</html>', 'micita@umit.com.co', 'Fila 4: Email inválido o vacío. Asegúrate de tener una columna \"Email\" o \"Gmail\" con correos válidos. - Email inválido: 12', NULL, NULL, '2025-12-10 19:40:07', 1, '2025-12-10 19:40:07'),
(71, 1, 16, '90', 'Correo: plantilla 1', 'FALLIDO', '{\"Nombre\":8,\"Apellido\":7,\"Actividad\":6}', '<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Recordatorio de Cita Médica</title>\n    <style>\n        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; color: #000; }\n        .container { max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }\n        .header { background-color: #3b5998; color: white; padding: 25px 0; text-align: center; font-weight: 700; font-size: 24px; }\n        .header-circle { width: 120px; height: 120px; margin: 0 auto 3px; background-color: white; border-radius: 50%; border: 1px solid #ddd; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }\n        .header-circle img { max-width: 90%; max-height: 300%; object-fit: contain; margin-left: 8px; border-radius: 200px; }\n        .content { padding: 25px 30px; }\n        .content h2 { font-weight: 700; font-size: 20px; margin: 0 0 20px; }\n        .content p { font-size: 14px; line-height: 1.5; margin: 10px 0; }\n        .highlighted { background-color: #f3f6fb; padding: 15px 20px; margin: 20px 0; border-radius: 6px; font-size: 14px; }\n        .highlighted b { color: #2b2b2b; }\n        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 13px; padding: 20px 30px; text-align: center; }\n        .footer b { color: #fff; }\n        a, a:visited { color: #3b5998; text-decoration: none; font-weight: 600; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <div class=\"header-circle\">\n                <img src=\"cid:logo\" alt=\"UMIT Logo\" />\n            </div>\n        </div>\n        <div class=\"content\">\n            <h2>Hola 8<br>&nbsp;<br>&nbsp;cual es tu a<font color=\"#da1616\">pellid</font><font color=\"#1675da\">o </font>7&nbsp;<br>&nbsp;<br>&nbsp;que estas haciendo 6&nbsp;</h2>\n        </div>\n        <div class=\"footer\">\n            Atentamente,<br/>El equipo de <b>Unidad materno infantil</b>\n        </div>\n    </div>\n</body>\n</html>', 'micita@umit.com.co', 'Fila 5: Email inválido o vacío. Asegúrate de tener una columna \"Email\" o \"Gmail\" con correos válidos. - Email inválido: 90', NULL, NULL, '2025-12-10 19:40:07', 1, '2025-12-10 19:40:07'),
(74, 3, 18, 'curiosidades318511@gmail.com', 'Correo: plantilla ejemplo', 'ENVIADO', '{\"Estadoanimico\":\"biwb \",\"Edad\":18}', '<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Recordatorio de Cita Médica</title>\n    <style>\n        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; color: #000; }\n        .container { max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }\n        .header { background-color: #3b5998; color: white; padding: 25px 0; text-align: center; font-weight: 700; font-size: 24px; }\n        .header-circle { width: 120px; height: 120px; margin: 0 auto 3px; background-color: white; border-radius: 50%; border: 1px solid #ddd; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }\n        .header-circle img { max-width: 90%; max-height: 300%; object-fit: contain; margin-left: 8px; border-radius: 200px; }\n        .content { padding: 25px 30px; }\n        .content h2 { font-weight: 700; font-size: 20px; margin: 0 0 20px; }\n        .content p { font-size: 14px; line-height: 1.5; margin: 10px 0; }\n        .highlighted { background-color: #f3f6fb; padding: 15px 20px; margin: 20px 0; border-radius: 6px; font-size: 14px; }\n        .highlighted b { color: #2b2b2b; }\n        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 13px; padding: 20px 30px; text-align: center; }\n        .footer b { color: #fff; }\n        a, a:visited { color: #3b5998; text-decoration: none; font-weight: 600; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <div class=\"header-circle\">\n                <img src=\"cid:logo\" alt=\"UMIT Logo\" />\n            </div>\n        </div>\n        <div class=\"content\">\n            <h2><span style=\"font-weight: normal;\">Hola esto es un <font color=\"#f10e0e\">ejempl</font>o&nbsp;</span><br>&nbsp;<br>&nbsp;como estas biwb <br>&nbsp;<br>&nbsp;que edad tienes 18</h2>\n        </div>\n        <div class=\"footer\">\n            Atentamente,<br/>El equipo de <b>Unidad materno infantil</b>\n        </div>\n    </div>\n</body>\n</html>', 'eliancontreras089@gmail.com', NULL, NULL, '2025-12-16 13:04:55', '2025-12-16 18:04:50', 1, NULL),
(75, 3, 18, 'curiosidades318511@gmail.com', 'Correo: plantilla ejemplo', 'ENVIADO', '{\"Estadoanimico\":\"casual\",\"Edad\":25}', '<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Recordatorio de Cita Médica</title>\n    <style>\n        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; color: #000; }\n        .container { max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }\n        .header { background-color: #3b5998; color: white; padding: 25px 0; text-align: center; font-weight: 700; font-size: 24px; }\n        .header-circle { width: 120px; height: 120px; margin: 0 auto 3px; background-color: white; border-radius: 50%; border: 1px solid #ddd; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }\n        .header-circle img { max-width: 90%; max-height: 300%; object-fit: contain; margin-left: 8px; border-radius: 200px; }\n        .content { padding: 25px 30px; }\n        .content h2 { font-weight: 700; font-size: 20px; margin: 0 0 20px; }\n        .content p { font-size: 14px; line-height: 1.5; margin: 10px 0; }\n        .highlighted { background-color: #f3f6fb; padding: 15px 20px; margin: 20px 0; border-radius: 6px; font-size: 14px; }\n        .highlighted b { color: #2b2b2b; }\n        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 13px; padding: 20px 30px; text-align: center; }\n        .footer b { color: #fff; }\n        a, a:visited { color: #3b5998; text-decoration: none; font-weight: 600; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <div class=\"header-circle\">\n                <img src=\"cid:logo\" alt=\"UMIT Logo\" />\n            </div>\n        </div>\n        <div class=\"content\">\n            <h2><span style=\"font-weight: normal;\">Hola esto es un <font color=\"#f10e0e\">ejempl</font>o&nbsp;</span><br>&nbsp;<br>&nbsp;como estas casual<br>&nbsp;<br>&nbsp;que edad tienes 25</h2>\n        </div>\n        <div class=\"footer\">\n            Atentamente,<br/>El equipo de <b>Unidad materno infantil</b>\n        </div>\n    </div>\n</body>\n</html>', 'eliancontreras089@gmail.com', NULL, NULL, '2025-12-16 13:04:58', '2025-12-16 18:04:56', 1, NULL),
(76, 4, 19, 'sistemas@umit.com.co', 'Correo: Plantilla  ingeniera', 'ENVIADO', '{\"nombre\":\"ELIAN\",\"Estadoanimico\":\"BIEN CASUAL\"}', '<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Recordatorio de Cita Médica</title>\n    <style>\n        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; color: #000; }\n        .container { max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }\n        .header { background-color: #3b5998; color: white; padding: 25px 0; text-align: center; font-weight: 700; font-size: 24px; }\n        .header-circle { width: 120px; height: 120px; margin: 0 auto 3px; background-color: white; border-radius: 50%; border: 1px solid #ddd; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }\n        .header-circle img { max-width: 90%; max-height: 300%; object-fit: contain; margin-left: 8px; border-radius: 200px; }\n        .content { padding: 25px 30px; }\n        .content h2 { font-weight: 700; font-size: 20px; margin: 0 0 20px; }\n        .content p { font-size: 14px; line-height: 1.5; margin: 10px 0; }\n        .highlighted { background-color: #f3f6fb; padding: 15px 20px; margin: 20px 0; border-radius: 6px; font-size: 14px; }\n        .highlighted b { color: #2b2b2b; }\n        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 13px; padding: 20px 30px; text-align: center; }\n        .footer b { color: #fff; }\n        a, a:visited { color: #3b5998; text-decoration: none; font-weight: 600; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <div class=\"header-circle\">\n                <img src=\"cid:logo\" alt=\"UMIT Logo\" />\n            </div>\n        </div>\n        <div class=\"content\">\n            <h2><span style=\"font-weight: normal;\">Hola ELIAN como <font color=\"#e40c0c\">estas <u>BIEN CASUAL<br></u>&nbsp;</font></span></h2>\n        </div>\n        <div class=\"footer\">\n            Atentamente,<br/>El equipo de <b>Unidad materno infantil</b>\n        </div>\n    </div>\n</body>\n</html>', 'eliancontreras089@gmail.com', NULL, NULL, '2025-12-16 14:44:19', '2025-12-16 19:44:16', 1, NULL),
(77, 4, 19, 'soportetecnico@umit.com.co', 'Correo: Plantilla  ingeniera', 'ENVIADO', '{\"nombre\":\"ALEXANDRA\",\"Estadoanimico\":\"FELIZ\"}', '<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Recordatorio de Cita Médica</title>\n    <style>\n        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; color: #000; }\n        .container { max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }\n        .header { background-color: #3b5998; color: white; padding: 25px 0; text-align: center; font-weight: 700; font-size: 24px; }\n        .header-circle { width: 120px; height: 120px; margin: 0 auto 3px; background-color: white; border-radius: 50%; border: 1px solid #ddd; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }\n        .header-circle img { max-width: 90%; max-height: 300%; object-fit: contain; margin-left: 8px; border-radius: 200px; }\n        .content { padding: 25px 30px; }\n        .content h2 { font-weight: 700; font-size: 20px; margin: 0 0 20px; }\n        .content p { font-size: 14px; line-height: 1.5; margin: 10px 0; }\n        .highlighted { background-color: #f3f6fb; padding: 15px 20px; margin: 20px 0; border-radius: 6px; font-size: 14px; }\n        .highlighted b { color: #2b2b2b; }\n        .footer { background-color: #2e3b55; color: #a0b5d9; font-size: 13px; padding: 20px 30px; text-align: center; }\n        .footer b { color: #fff; }\n        a, a:visited { color: #3b5998; text-decoration: none; font-weight: 600; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <div class=\"header-circle\">\n                <img src=\"cid:logo\" alt=\"UMIT Logo\" />\n            </div>\n        </div>\n        <div class=\"content\">\n            <h2><span style=\"font-weight: normal;\">Hola ALEXANDRA como <font color=\"#e40c0c\">estas <u>FELIZ<br></u>&nbsp;</font></span></h2>\n        </div>\n        <div class=\"footer\">\n            Atentamente,<br/>El equipo de <b>Unidad materno infantil</b>\n        </div>\n    </div>\n</body>\n</html>', 'eliancontreras089@gmail.com', NULL, NULL, '2025-12-16 14:44:22', '2025-12-16 19:44:20', 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `email_logs`
--

CREATE TABLE `email_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `patient_name` text DEFAULT NULL,
  `appointment_date` text DEFAULT NULL,
  `subject` text DEFAULT NULL,
  `status` varchar(100) NOT NULL,
  `error_message` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `email_logs`
--

INSERT INTO `email_logs` (`id`, `user_id`, `recipient_email`, `patient_name`, `appointment_date`, `subject`, `status`, `error_message`, `timestamp`) VALUES
(221, 1, 'curiosidades318511@gmail.com', 'Juan Pérez', '', 'Correo: plantilla 1', 'ENVIADO', '', '2025-12-10 19:40:03'),
(222, 1, 'curiosidades318511@gmail.com', 'María García', '', 'Correo: plantilla 1', 'ENVIADO', '', '2025-12-10 19:40:06'),
(223, 1, '12', '34', '', 'Correo: plantilla 1', 'ERROR', 'Fila 4: Email inválido o vacío. Asegúrate de tener una columna \"Email\" o \"Gmail\" con correos válidos.', '2025-12-10 19:40:07'),
(224, 1, '90', '8', '', 'Correo: plantilla 1', 'ERROR', 'Fila 5: Email inválido o vacío. Asegúrate de tener una columna \"Email\" o \"Gmail\" con correos válidos.', '2025-12-10 19:40:07'),
(225, 2, 'curiosidades318511@gmail.com', 'Juan Pérez', '', 'Correo: daniela', 'ENVIADO', '', '2025-12-10 20:36:08'),
(226, 2, 'curiosidades318511@gmail.com', 'María García', '', 'Correo: daniela', 'ENVIADO', '', '2025-12-10 20:36:11'),
(227, 3, 'curiosidades318511@gmail.com', 'Elian', '2025-12-16', 'Recordatorio de cita - Ginecologia - 15/12/2025 - 09:00', 'ENVIADO', '', '2025-12-16 17:59:05'),
(228, 3, 'coordcitas@umit.com.co', 'Jefe Alejandra ', '2025-12-18', 'Recordatorio de cita - Medicina General - 17/12/2025 - 14:30', 'ENVIADO', '', '2025-12-16 17:59:08'),
(229, 3, 'curiosidades318511@gmail.com', '', '', 'Correo: plantilla ejemplo', 'ENVIADO', '', '2025-12-16 18:04:55'),
(230, 3, 'curiosidades318511@gmail.com', '', '', 'Correo: plantilla ejemplo', 'ENVIADO', '', '2025-12-16 18:04:58'),
(231, 3, 'curiosidades318511@gmail.com', 'Destinatario Dengue', '', 'Información sobre Dengue - UMIT', 'ENVIADO', '', '2025-12-16 18:06:54'),
(232, 3, 'curiosidades318511@gmail.com', 'Destinatario Dengue', '', 'Información sobre Dengue - UMIT', 'ENVIADO', '', '2025-12-16 18:06:56'),
(233, 4, 'sistemas@umit.com.co', '', '', 'Correo: Plantilla  ingeniera', 'ENVIADO', '', '2025-12-16 19:44:19'),
(234, 4, 'soportetecnico@umit.com.co', '', '', 'Correo: Plantilla  ingeniera', 'ENVIADO', '', '2025-12-16 19:44:22'),
(235, 4, 'daniela.manrique.mo@gmail.com', 'Daniela Manrique', '2025-12-16', 'Recordatorio de cita - Ginecologia - 15/12/2025 - 09:00', 'ENVIADO', '', '2025-12-16 20:36:43'),
(236, 4, 'sistemas@umit.com.co', 'Carlos López', '2025-12-18', 'Recordatorio de cita - Medicina General - 17/12/2025 - 0.6041666666666666', 'ENVIADO', '', '2025-12-16 20:36:46'),
(237, 4, 'destinatario@example.com', 'Destinatario Dengue', '', 'Información sobre Dengue - UMIT', 'ERROR', 'Fila 2: Email inválido o vacío', '2025-12-16 20:41:10'),
(238, 4, 'destinatario2@example.com', 'Destinatario Dengue', '', 'Información sobre Dengue - UMIT', 'ERROR', 'Fila 3: Email inválido o vacío', '2025-12-16 20:41:10'),
(239, 4, 'curiosidades318511@gmail.com', 'Destinatario Dengue', '', 'Información sobre Dengue - UMIT', 'PREVIEW_GENERADO', '', '2025-12-16 20:42:30'),
(240, 4, 'curiosidades318511@gmail.com', 'Destinatario Dengue', '', 'Información sobre Dengue - UMIT', 'PREVIEW_GENERADO', '', '2025-12-16 20:42:30'),
(241, 4, 'curiosidades318511@gmail.com', 'Destinatario Dengue', '', 'Información sobre Dengue - UMIT', 'PREVIEW_GENERADO', '', '2025-12-16 20:42:49'),
(242, 4, 'curiosidades318511@gmail.com', 'Destinatario Dengue', '', 'Información sobre Dengue - UMIT', 'PREVIEW_GENERADO', '', '2025-12-16 20:42:49');

-- --------------------------------------------------------

--
--
 --------------------------------------------------------

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
  `area_is` int(11) NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `scheduled_emails`
--

CREATE TABLE `scheduled_emails` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `patient_name` text DEFAULT NULL,
  `appointment_date` text DEFAULT NULL,
  `subject` text DEFAULT NULL,
  `html_content` longtext DEFAULT NULL,
  `scheduled_datetime` datetime NOT NULL,
  `status` varchar(50) DEFAULT 'PENDING',
  `sent_datetime` datetime DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(22222222, 'prueba2', 'prueba2@gmail.com', '$2a$10$.O7GZa4RGs5tKwHfFV.1ku7T9W2ENMZ3X6bZxE1A7MlsUKdTIJDpq', '2026-01-07 20:46:32', 6, 'ACTIVO', NULL, NULL, 'ESTANDAR');

--
-- Índices para tablas volcadas
--

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
-- Indices de la tabla `correosfallidosdecursosobligatorios`
--
ALTER TABLE `correosfallidosdecursosobligatorios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_recipient_email` (`recipient_email`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indices de la tabla `correosfallidosdengue_calidad`
--
ALTER TABLE `correosfallidosdengue_calidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_recipient_email` (`recipient_email`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_tipo_plantilla` (`tipo_plantilla`);

--
-- Indices de la tabla `correosfallidosdesistemascitas`
--
ALTER TABLE `correosfallidosdesistemascitas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_recipient_email` (`recipient_email`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_tipo_cita` (`tipo_cita`);

--
-- Indices de la tabla `custom_template_emails`
--
ALTER TABLE `custom_template_emails`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_template_id` (`template_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_recipient_email` (`recipient_email`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_scheduled_datetime` (`scheduled_datetime`),
  ADD KEY `idx_from_email` (`from_email`);

--
-- Indices de la tabla `email_logs`
--
ALTER TABLE `email_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_status` (`status`);

--
--
-- Indices de la tabla `plantillas`
--
ALTER TABLE `plantillas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `plantilla_area` (`area_is`),
  ADD KEY `plantilla_usuario` (`user_id`);

--
-- Indices de la tabla `scheduled_emails`
--
ALTER TABLE `scheduled_emails`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_scheduled_datetime` (`scheduled_datetime`);

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
-- AUTO_INCREMENT de la tabla `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=163;

--
-- AUTO_INCREMENT de la tabla `areas`
--
ALTER TABLE `areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `area_usuario`
--
ALTER TABLE `area_usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT de la tabla `correosfallidosdecursosobligatorios`
--
ALTER TABLE `correosfallidosdecursosobligatorios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `correosfallidosdengue_calidad`
--
ALTER TABLE `correosfallidosdengue_calidad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `correosfallidosdesistemascitas`
--
ALTER TABLE `correosfallidosdesistemascitas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `custom_template_emails`
--
ALTER TABLE `custom_template_emails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT de la tabla `email_logs`
--
ALTER TABLE `email_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=243;

--
-- AUTO_INCREMENT de la tabla `plantillas`
--
ALTER TABLE `plantillas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `scheduled_emails`
--
ALTER TABLE `scheduled_emails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`documento`) ON DELETE CASCADE;

--
-- Filtros para la tabla `area_usuario`
--
ALTER TABLE `area_usuario`
  ADD CONSTRAINT `areas` FOREIGN KEY (`id_area`) REFERENCES `areas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`documento`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `correosfallidosdecursosobligatorios`
--
ALTER TABLE `correosfallidosdecursosobligatorios`
  ADD CONSTRAINT `correosfallidosdecursosobligatorios_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`documento`) ON DELETE CASCADE;

--
-- Filtros para la tabla `correosfallidosdengue_calidad`
--
ALTER TABLE `correosfallidosdengue_calidad`
  ADD CONSTRAINT `correosfallidosdengue_calidad_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`documento`) ON DELETE CASCADE;

--
-- Filtros para la tabla `correosfallidosdesistemascitas`
--
ALTER TABLE `correosfallidosdesistemascitas`
  ADD CONSTRAINT `correosfallidosdesistemascitas_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`documento`) ON DELETE CASCADE;

--
-- Filtros para la tabla `custom_template_emails`
--
ALTER TABLE `custom_template_emails`
  ADD CONSTRAINT `custom_template_emails_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`documento`) ON DELETE CASCADE,
  ADD CONSTRAINT `custom_template_emails_ibfk_2` FOREIGN KEY (`template_id`) REFERENCES `email_templates` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `email_logs`
--
ALTER TABLE `email_logs`
  ADD CONSTRAINT `email_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`documento`) ON DELETE CASCADE;

--
-- Filtros para la tabla `plantillas`
--
ALTER TABLE `plantillas`
  ADD CONSTRAINT `plantilla_area` FOREIGN KEY (`area_is`) REFERENCES `areas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `plantilla_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`documento`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `scheduled_emails`
--
ALTER TABLE `scheduled_emails`
  ADD CONSTRAINT `scheduled_emails_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`documento`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
