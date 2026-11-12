# Pruebas y publicación

## Pruebas automatizadas

Desde la raíz, con Node.js:

```sh
node tools/validar.js --solo-archivos
node tools/validar-logica.js
node tools/validar-receptor.js
```

- Archivos: sintaxis JavaScript y existencia de recursos referenciados.
- Lógica: 1.024 recorridos, opciones, puntajes, progresión, botones con teclado y resultados.
- Receptor: validación de campos, claves, puntajes y duplicados con servicios simulados.

`node tools/validar.js` también dispone de pruebas de navegador que requieren Chrome y un entorno que permita iniciarlo. Sus salidas se guardan en `tmp/validacion/` y no se suben a Git. Las pruebas automatizadas de recorrido sustituyen la URL de envío para no escribir en la hoja real.

## Prueba manual

1. Abre el juego desde un servidor local o el hosting.
2. Registra un estudiante ficticio reconocible como prueba.
3. Comprueba ambas ramas de dificultad, relecturas y botones con teclado.
4. Comprueba movimiento e interacción táctil en teléfono y tableta.
5. Comprueba música, silencio y reanudación al volver a la pestaña.
6. Abre las cinco tarjetas finales y sus explicaciones.
7. Verifica diez filas de la misma sesión en Google Sheets y órdenes del 1 al 10.

La comprobación real puede escribir filas en la hoja; revisa y elimina manualmente las pruebas cuando corresponda. No incluyas exportaciones con datos personales en Git.

## Generar una copia publicable

La fuente del juego está en la raíz. No edites solamente la copia `publicar/`, porque esos cambios no quedarían en el código principal.

Para generar una copia nueva desde PowerShell, ejecuta desde la raíz y usa una carpeta de destino que todavía no exista:

```powershell
$destinoPublicacion = 'publicar-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
New-Item -ItemType Directory -Path $destinoPublicacion | Out-Null
Copy-Item -LiteralPath 'index.html','estilos.css','fondo.png' -Destination $destinoPublicacion
Copy-Item -LiteralPath 'js','assets' -Destination $destinoPublicacion -Recurse
Compress-Archive -Path "$destinoPublicacion/*" -DestinationPath "$destinoPublicacion.zip"
```

Publica el **contenido** de esa carpeta. No subas `.git/`, `tools/`, `documentacion/`, `google-sheets/` ni archivos de pruebas al sitio. La música actual ocupa aproximadamente 85 MiB; considera ese tamaño al subir y comprobar la carga inicial.

## Repositorio y hosting

El repositorio guarda código, recursos, documentación y herramientas. Las copias generadas y temporales se excluyen mediante `.gitignore`.

Crear un repositorio en GitHub y subir estos archivos es un paso distinto de activar un hosting. El sitio funciona en un hosting estático; no requiere un servidor Node.js en producción. El receptor de Google Sheets tiene su propia implementación.

Después de desplegar, abre el enlace HTTPS en una ventana privada y en un teléfono. Comprueba que se carguen imágenes y audio y que una sesión de prueba llegue a la hoja. Si cambias archivos, vuelve a generar la copia y despliega esa versión.

## Problemas frecuentes

| Síntoma | Comprobación |
| --- | --- |
| No suena la música | Pulsa Ingresar, revisa el botón de música y el volumen del dispositivo |
| Faltan imágenes o audio | Comprueba que `assets/` esté completo y que las rutas conserven mayúsculas y minúsculas |
| No llegan resultados | Revisa URL `/exec`, implementación, permisos y ejecuciones de Apps Script; consulta la hoja directamente |
| El hosting muestra una versión anterior | Revisa la copia subida y recarga sin caché |
| Cambios locales no aparecen en Sheets | Actualiza también la implementación de Apps Script si cambió el receptor |
