# Arquitectura de RUTA PRO

## Componentes

El navegador carga los scripts en el orden declarado en `index.html`. Comparten estado y funciones globales; no usan módulos ni un empaquetador. Conserva ese orden cuando agregues scripts.

| Archivo o carpeta | Responsabilidad |
| --- | --- |
| `index.html` | Registro, canvas, ventanas, controles y carga de scripts |
| `estilos.css` | Identidad visual, resultados y adaptación a pantallas pequeñas |
| `js/motor.js` | Estado de partida, movimiento, renderizado, interacción y ventanas |
| `js/recorrido.js` | Orden de competencias y condiciones de avance |
| `js/opciones.js` | Aleatorización, índices originales y letras de retroalimentación |
| `js/conexion.js` | Persistencia local y envío a Apps Script |
| `js/musica.js` | Audio en bucle, volumen, silencio y visibilidad de la pestaña |
| `js/razonamientoCuantitativo.js`, `competenciasCiudadanas.js`, `comunicacionEscrita.js`, `ingles.js`, `lecturaCritica.js` | Bancos de preguntas, fuentes y explicaciones |
| `js/escenasCuantitativo.js`, `escenasCiudadanas.js`, `escenasEscrita.js`, `escenasIngles.js` | Escenarios e interacciones de cada competencia |
| `js/escena0.js` | Tutorial |
| `js/escena1.js` a `escena3.js` | Escenarios de Lectura Crítica |
| `js/escena4.js` | Resultados y retroalimentación por tarjeta |
| `assets/` y `fondo.png` | Imágenes, iconos y audio del sitio |
| `google-sheets/Code.gs` | Receptor independiente en Google Apps Script |
| `tools/` | Verificaciones y herramientas de mantenimiento |

## Respuestas y progresión

Los identificadores RQ, CC, CE, EN y LC distinguen competencias; M, A y B distinguen niveles. El motor conserva resultados, rutas, tiempos y orden de opciones en `estadoJuego`.

La evaluación utiliza el índice original de la opción. La presentación puede cambiar la letra sin cambiar la respuesta correcta. Los registros conservan la correspondencia entre opciones originales y presentadas para interpretar la retroalimentación.

Los diálogos y documentos se pueden releer. Las explicaciones de corrección se consultan al final, abriendo cada tarjeta y desafío.

## Google Sheets

El navegador envía JSON mediante POST `text/plain` y `mode: no-cors`. La respuesta es opaca: el estado de envío no confirma que se haya creado una fila.

El receptor valida los datos, recalcula puntos y deduplica por sesión y desafío. Usa un bloqueo para coordinar escrituras simultáneas. La hoja registra respuestas individuales; el total de una partida se obtiene sumando sus puntos.

La URL `/exec` en el cliente es un destino de envío visible para quien visita el sitio, no una contraseña. No añadas tokens privados ni credenciales al JavaScript. Los nombres, identificaciones y correos de estudiantes se almacenan fuera del repositorio, en el navegador y la hoja configurada.

## Cambios en contenido

Si cambias preguntas, claves, identificadores o formato de registros, revisa también `google-sheets/Code.gs` y la versión de contenido de `js/conexion.js`. Mantén compatibles el cliente y el receptor. Actualizar el archivo local de Apps Script no actualiza su implementación publicada.
