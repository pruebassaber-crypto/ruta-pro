'use strict';
// URL /exec de Google Apps Script. El receptor debe leer JSON.parse(e.postData.contents)
// y deduplicar por registroId. La respuesta opaca no confirma el guardado en la hoja.
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbylNCx-jjTmqMMimYHjvNoazBf3YIHD3Ou50xZxX5_sTAZXErmDbl8zUc3QP99-WQhZ5g/exec';
const CLAVE_PROGRESO = 'rutapro.partida.v2';
const VERSION_CONTENIDO = 'RutaPro-opciones-aleatorias-v7';

function obtenerProgreso() {
    return {
        version: estadoJuego.versionPartida || VERSION_CONTENIDO, sesionId: estadoJuego.sesionId, modo: estadoJuego.modo,
        estudiante: { nombre: jugadorData.nombre, id: jugadorData.id, correo: jugadorData.correo },
        inicio: estadoJuego.inicio, fin: estadoJuego.fin || null, actualizado: new Date().toISOString(),
        escena: estadoJuego.escenaActual, paso: estadoJuego.paso,
        ruta: estadoJuego.ruta, rutas: estadoJuego.rutas, finalizado: estadoJuego.finalizado,
        resultados: estadoJuego.resultados, ordenOpciones: estadoJuego.ordenOpciones
    };
}
function guardarProgresoLocal() {
    try {
        localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(obtenerProgreso()));
        estadoJuego.guardadoLocal = true;
    } catch (error) {
        estadoJuego.guardadoLocal = false;
        console.warn('No se pudo guardar la partida en este navegador.', error);
    }
    return estadoJuego.guardadoLocal;
}
async function enviarDatosGS(resultado) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI') {
        resultado.envio = 'sin_configurar';
        guardarProgresoLocal();
        return;
    }
    const controlador = new AbortController();
    const limite = setTimeout(() => controlador.abort(), 8000);
    resultado.envio = 'enviando';
    const datos = {
        registroId: estadoJuego.sesionId + ':' + resultado.desafio,
        sesionId: estadoJuego.sesionId,
        estudianteId: jugadorData.id, nombre: jugadorData.nombre, correo: jugadorData.correo,
        ...resultado
    };
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST', mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: JSON.stringify(datos), signal: controlador.signal
        });
        resultado.envio = 'enviado_sin_confirmar';
    } catch (error) {
        resultado.envio = 'pendiente';
        console.warn('Envío no confirmado; se conserva la copia local.', error);
    } finally {
        clearTimeout(limite);
        guardarProgresoLocal();
        if (estadoJuego.finalizado && typeof actualizarEstadoGuardado === 'function') actualizarEstadoGuardado();
    }
}
