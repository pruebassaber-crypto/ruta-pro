'use strict';

// Después de Comunicación Escrita; continúa en la recepción de Lectura Crítica.
function iniciarInglesMedio() {
    if (!competenciaHabilitada('EN') || competenciaCompleta('EN')) return;
    cargarEscena({
        id: 'en-medio', nombre: 'Inglés · Lost on the Way', fondo: 'assets/ingles/fondos/ingles_medio_calle.png',
        x: 440, piesY: 510,
        objetos: [
            { id: 1, nombre: 'Alex', x: 140, y: 225, w: 180, h: 280, imgSrc: 'assets/ingles/personajes/alex.png', objetivo: 'Acércate a Alex para leer su mensaje.', interactuar: () => mostrarDialogoAlex() },
            { id: 2, nombre: 'Hoja de indicaciones', x: 305, y: 195, w: 50, h: 32, radio: 145, imgSrc: 'assets/ingles/objetos/hoja_indicaciones.png', objetivo: 'Consulta la hoja apoyada en la repisa.', interactuar: () => consultarFuenteEN() },
            { id: 3, nombre: 'Señal de información', x: 895, y: 150, w: 85, h: 238, soloZona: true, objetivo: 'Acércate a la señal de información para responder.', interactuar: () => mostrarPreguntaEN() }
        ]
    });
}
function transicionIngles() {
    if (!competenciaHabilitada('EN') || estadoJuego.escenaActual !== 'en-medio' || !estadoJuego.resultados['EN-M01']) return;
    iniciarInglesRuta(estadoJuego.resultados['EN-M01'].correcto);
    guardarProgresoLocal();
}
function iniciarInglesRuta(avanzado) {
    const primero = estadoJuego.resultados['EN-M01'];
    if (!competenciaHabilitada('EN') || !primero || primero.correcto !== avanzado) return;
    cargarEscena({
        id: avanzado ? 'en-avanzado' : 'en-basico',
        nombre: 'Inglés · ' + (avanzado ? 'Choose the best route' : 'Where should Alex go?'),
        fondo: avanzado ? 'assets/ingles/fondos/ingles_avanzado_rutas.png' : 'assets/ingles/fondos/ingles_basico_plataformas.png',
        x: 180, piesY: 520,
        objetos: [
            { id: 1, nombre: 'Alex', x: 85, y: 245, w: 180, h: 280, imgSrc: 'assets/ingles/personajes/alex.png', objetivo: 'Habla con Alex antes de consultar la información.', interactuar: () => mostrarDialogoAlex() },
            { id: 2, nombre: avanzado ? 'Panel de rutas' : 'Aviso de transporte', x: avanzado ? 387 : 250, y: avanzado ? 153 : 150, w: avanzado ? 210 : 165, h: avanzado ? 125 : 200, soloZona: true, objetivo: avanzado ? 'Consulta las dos rutas y la hora de inicio de la clase.' : 'Lee el aviso del transporte universitario.', interactuar: () => consultarFuenteEN() },
            { id: 3, nombre: avanzado ? 'Panel de decisión' : 'Señal de plataforma', x: avanzado ? 387 : 620, y: avanzado ? 153 : 180, w: avanzado ? 210 : 60, h: avanzado ? 125 : 155, soloZona: true, objetivo: avanzado ? 'Pulsa Espacio en el panel para responder.' : 'Acércate a la señal de plataforma para responder.', interactuar: () => mostrarPreguntaEN() },
            // El bus y su acceso ya pertenecen al fondo.
            { id: 4, nombre: 'Acceso al transporte', x: avanzado ? 785 : 795, y: 280, w: 95, h: 70, soloZona: true, objetivo: 'Respuesta registrada. Acércate al acceso del transporte para continuar hacia la universidad.', interactuar: finalizarIngles }
        ]
    });
}
function finalizarIngles() {
    if (!competenciaHabilitada('EN') || !['en-basico', 'en-avanzado'].includes(estadoJuego.escenaActual) || estadoJuego.paso !== 4 || !competenciaCompleta('EN')) return;
    continuarRecorrido('EN');
}

