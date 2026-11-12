'use strict';

// Ruta avanzada: ficha 3, LC-A01.
function iniciarEscena2() {
    if (!estadoJuego.resultados['LC-M01']?.correcto) return;
    cargarEscena({
        id: 2, nombre: 'Lectura Crítica · Aula 501', fondo: 'assets/fondo_lc_avanzado_aula501_salida.png', x: 390, piesY: 510,
        objetos: [
            { id: 1, nombre: 'Docente', x: 220, y: 190, w: 230, h: 280, imgSrc: 'assets/lc_docente.png', objetivo: 'Acércate al docente para escuchar su diálogo.', interactuar: () => mostrarDialogoDocente() },
            { id: 2, nombre: 'Proyector', x: 520, y: 270, w: 135, h: 135, imgSrc: 'assets/lc_proyector.png', objetivo: 'Acércate al proyector para responder el desafío.', interactuar: () => mostrarPreguntaLC('LC-A01') },
            // Puerta integrada al fondo: interacción junto al umbral, sin otro sprite encima.
            { id: 3, nombre: 'Salida', x: 780, y: 145, w: 130, h: 195, soloZona: true, objetivo: 'Respuesta registrada. Ve a la puerta para consultar tus resultados.', interactuar: iniciarEscena4 }
        ]
    });
}
function mostrarDialogoDocente(volver) {
    if (estadoJuego.escenaActual !== 2) return;
    const continuar = volver || (() => estadoJuego.paso === 1 ? avanzarPaso(1, 2) : cerrarModal());
    mostrarModal({
        titulo: 'Docente · Clase de Historia', imagen: 'assets/lc_docente.png',
        parrafos: DIALOGO_DOCENTE,
        acciones: [{ texto: volver ? 'Volver a la pregunta' : 'Ir al proyector', accion: continuar }],
        alCerrar: volver || cerrarModal
    });
}

