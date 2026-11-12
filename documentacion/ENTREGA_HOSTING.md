# Entrega al equipo de despliegue

Repositorio privado: https://github.com/pruebassaber-crypto/ruta-pro

## Estado verificado el 12 de noviembre de 2026

- Los 72 archivos del inventario publicable están versionados en Git, incluida la música activa.
- La sintaxis y las referencias locales pasan las verificaciones automatizadas.
- Las pruebas de lógica cubren 1.024 recorridos completos y las del receptor usan servicios simulados.
- La URL de Apps Script configurada responde a GET con `servicio: Ruta Pro` y `configurado: true`. Esta comprobación no escribe datos ni demuestra una escritura nueva en la hoja.
- No se ha verificado un hosting final en esta revisión. Falta probar su enlace y confirmar una sesión de diez respuestas en Google Sheets.

## Qué necesita el hosting

Es un sitio estático de HTML, CSS y JavaScript: no necesita base de datos en el hosting, instalación de paquetes, compilación ni un servidor Node.js en producción.

| Parámetro | Valor |
| --- | --- |
| Rama fuente | `main` |
| Página de entrada | `index.html` |
| Comando de compilación | Ninguno para el juego |
| Archivos publicados | `index.html`, `estilos.css`, `fondo.png`, `js/`, `assets/` |
| Transporte | HTTPS |
| Tamaño aproximado | 127,4 MiB en total; MP3 de 85,1 MiB |
| Audio | Servir `.mp3` como `audio/mpeg`; preferible soporte de peticiones de rango |

Para un hosting conectado al repositorio privado, la persona que lo configure debe autorizar a su proveedor a leer este repositorio. El proveedor y su plan deben admitir el tamaño del archivo de audio y del sitio completo.

El repositorio no incluye una carpeta `dist/` ni un `package.json`: no son requisitos del juego. Tampoco incluye las copias locales `publicar/` ni el ZIP, porque son archivos generados. La [guía de operación](OPERACION.md) explica cómo producir una carpeta con solo los archivos del sitio. Si el proveedor pide un directorio de publicación, usar esa carpeta generada y adaptar su generación al entorno del proveedor.

No publicar `.git/`, `tools/`, `google-sheets/`, `documentacion/` ni archivos temporales como parte del sitio. Conservar nombres y mayúsculas de las rutas. No se necesita una regla de redirección de aplicación SPA: el juego usa `index.html` y sus scripts.

## Google Sheets y servicios externos

`js/conexion.js` ya contiene la URL `/exec` del receptor desplegado. Para conservar la misma hoja no es necesario crear otro receptor al desplegar el sitio. La hoja y Apps Script pertenecen a la cuenta de Google que los administra, independientemente del hosting.

Si se migra a otra hoja o cuenta, seguir [las instrucciones de Google Sheets](../google-sheets/INSTRUCCIONES.txt), publicar el receptor y actualizar la URL del cliente. Dar acceso al repositorio no concede acceso a la hoja ni a Apps Script; ese acceso se comparte aparte si el trabajo lo requiere.

La tipografía se solicita a Google Fonts. El envío de respuestas necesita acceso al receptor de Google Apps Script. El modo `no-cors` no permite al navegador confirmar la escritura: revisar directamente las filas de la hoja.

## Aceptación del despliegue

1. Abrir la URL HTTPS en una ventana privada y comprobar que carguen todos los recursos sin errores de consola ni respuestas 404.
2. Completar una partida con datos ficticios reconocibles. Confirmar el recorrido de cinco competencias, ambas ramas en pruebas separadas, preguntas y relecturas.
3. Comprobar teclado, controles táctiles y ventanas en escritorio, teléfono y tableta.
4. Comprobar música tras Ingresar, silencio y repetición al finalizar el audio. No es necesario esperar la duración completa para las demás pruebas.
5. Confirmar resultados y retroalimentación por tarjeta.
6. Comprobar en Google Sheets diez filas de la misma sesión, ordenadas del 1 al 10, y revisar respuestas y puntos.
7. Entregar a la responsable la URL final, proveedor, rama/commit desplegado y resultado de estas comprobaciones.

No usar datos reales de estudiantes para validar el despliegue. Consultar [recursos y atribuciones](RECURSOS_Y_ATRIBUCIONES.md) para la información registrada sobre los materiales incluidos.
