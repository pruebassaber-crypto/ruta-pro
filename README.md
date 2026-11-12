# RUTA PRO

Videojuego educativo de exploración para practicar cinco competencias. El estudiante recorre escenarios en pixel art, consulta personajes y documentos, responde preguntas y revisa sus resultados al terminar.

## Recorrido

Casa (tutorial) → Razonamiento Cuantitativo → Competencias Ciudadanas → Comunicación Escrita → Inglés → Lectura Crítica → Resultados y retroalimentación.

Cada competencia comienza con un desafío de nivel medio. Una respuesta correcta conduce al escenario avanzado; una incorrecta, al básico. Se responden dos desafíos por competencia: diez en una partida completa.

Las respuestas correctas de nivel medio y avanzado otorgan 10 puntos; las de nivel básico, 5. Las incorrectas otorgan 0. El máximo es de 100 puntos. Las opciones se presentan en orden aleatorio y conservan ese orden cuando se vuelve a consultar la pregunta.

## Ejecutar en el equipo

El juego usa HTML, CSS y JavaScript, sin instalación de paquetes ni compilación.

1. Abre esta carpeta en Visual Studio Code.
2. Inicia un servidor estático, por ejemplo con la extensión Live Server sobre `index.html`.
3. Abre la dirección local que indique el servidor.
4. Completa nombre, ID y correo, y pulsa **Ingresar**.

También puedes usar `python -m http.server 8080` si tienes Python instalado y abrir `http://localhost:8080`. Usa un servidor local para probar el comportamiento de publicación.

## Controles

| Acción | Teclado | Móvil o tableta |
| --- | --- | --- |
| Moverse | Flechas o WASD | Botones de dirección |
| Interactuar con el objeto cercano | Espacio | Interactuar |
| Elegir un botón de una ventana | ↑ / ↓ o Tab | Tocar el botón |
| Activar el botón seleccionado | Enter | Tocar el botón |
| Volver desde una ventana | Escape o botón Volver | Botón Volver |

Si no hay un botón enfocado, el primer Enter lo selecciona sin responder. En resultados, Tab y Enter permiten abrir las tarjetas y sus explicaciones.

La música comienza tras Ingresar, continúa entre escenas y se repite al terminar. Se puede silenciar; al ocultar la pestaña se pausa y al volver se reanuda si está activada.

## Resultados y almacenamiento

Al terminar se muestran el puntaje total, cinco tarjetas con resultados y retroalimentación por desafío, y una tabla desplegable. No hay descarga de resultados en PDF.

La partida actual se guarda en `localStorage` de ese navegador. Además, cada respuesta se envía al receptor de Google Apps Script configurado en `js/conexion.js`. Una partida completa produce diez filas en Google Sheets. El envío desde el navegador no confirma por sí solo la escritura: comprueba la hoja.

**Un recorrido manual con la conexión actual puede escribir datos en la hoja configurada.** Usa datos ficticios identificables para las pruebas. Las pruebas automatizadas de lógica usan una conexión simulada.

## Documentación

- [Arquitectura y archivos](documentacion/ARQUITECTURA.md)
- [Pruebas y publicación](documentacion/OPERACION.md)
- [Recursos y atribuciones](documentacion/RECURSOS_Y_ATRIBUCIONES.md)
- [Configuración de Google Sheets](google-sheets/INSTRUCCIONES.txt)
- [Inventario del sitio publicable](documentacion/INVENTARIO_PUBLICACION.txt)

## Verificaciones locales

Con Node.js instalado, ejecuta desde la raíz:

```sh
node tools/validar.js --solo-archivos
node tools/validar-logica.js
node tools/validar-receptor.js
```

Las comprobaciones incluyen recursos locales, sintaxis, 1.024 recorridos y validación del receptor con servicios simulados. No sustituyen una prueba manual en dispositivos reales ni la comprobación de Google Sheets después de publicar.

## Publicación

El sitio necesita hosting estático con HTTPS. Publica `index.html`, `estilos.css`, `fondo.png`, `js/` y `assets/`, con `index.html` en la raíz. La carpeta local `publicar/` y el ZIP son copias generadas que se excluyen de Git; deben regenerarse después de cualquier cambio. Consulta la [guía de operación](documentacion/OPERACION.md).

El código del receptor se publica por separado en Google Apps Script. Subir el repositorio a GitHub no publica automáticamente el juego ni el receptor.

## Uso y derechos

Este repositorio no declara una licencia general de redistribución. Los recursos externos conservan los derechos de sus titulares. La música activa es el archivo **Chill & Relaxing Pokémon Music Mix** proporcionado para el proyecto; su procedencia y condiciones de uso se registran en la documentación de recursos.
