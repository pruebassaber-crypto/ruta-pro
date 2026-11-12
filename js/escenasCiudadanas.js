'use strict';

// Los identificadores de escena son independientes de Lectura Crítica.
// Recibe el recorrido de Razonamiento Cuantitativo y continúa en el bus.
function iniciarCiudadanasMedio() {
    if (!competenciaHabilitada('CC') || competenciaCompleta('CC')) return;
    cargarEscena({
        id: 'cc-medio', nombre: 'Competencias Ciudadanas · La parada bajo presión',
        fondo: 'assets/cc/fondos/cc_parada_medio.png', x: 370, piesY: 510,
        objetos: [
            { id: 1, nombre: 'Trabajador', x: 145, y: 210, w: 170, h: 270, imgSrc: 'assets/cc/personajes/cc_trabajador.png', objetivo: 'Escucha al trabajador que comenta el rumor.', interactuar: () => consultarFuenteCC('trabajador', () => continuarConsultaCC(1, 2)) },
            { id: 2, nombre: 'Pasajera', x: 555, y: 210, w: 170, h: 270, imgSrc: 'assets/cc/personajes/cc_pasajera.png', objetivo: 'Acércate a la pasajera para consultar el aviso que muestra.', interactuar: () => consultarFuenteCC('aviso', () => continuarConsultaCC(2, 3)) },
            { id: 3, nombre: 'Parada', x: 399, y: 180, w: 125, h: 185, soloZona: true, objetivo: 'Acércate a la parada para responder el desafío.', interactuar: () => mostrarPreguntaCC('CC-M01') },
            { id: 'orientador', x: 825, y: 230, w: 155, h: 250, imgSrc: 'assets/cc/personajes/cc_orientador.png' },
            { id: 'mayor', x: 15, y: 260, w: 130, h: 220, imgSrc: 'assets/cc/personajes/cc_persona_mayor.png' },
            { id: 'cuidadora', x: 300, y: 260, w: 200, h: 210, imgSrc: 'assets/cc/personajes/cc_cuidadora_nino.png' },
            { id: 'movilidad', x: 700, y: 290, w: 175, h: 190, imgSrc: 'assets/cc/personajes/cc_movilidad_reducida.png' }
        ]
    });
}
function continuarConsultaCC(actual, siguiente) {
    if (estadoJuego.escenaActual !== 'cc-medio') return;
    if (estadoJuego.paso === actual) avanzarPaso(actual, siguiente);
    else cerrarModal();
}
function transicionCiudadana() {
    if (estadoJuego.escenaActual !== 'cc-medio' || !estadoJuego.resultados['CC-M01']) return;
    iniciarCiudadanasRuta(estadoJuego.resultados['CC-M01'].correcto);
    guardarProgresoLocal();
}
function iniciarCiudadanasRuta(avanzado) {
    const primero = estadoJuego.resultados['CC-M01'];
    if (!primero || primero.correcto !== avanzado) return;
    const grupo = avanzado ? [
        { id: 'fila-trabajador', x: 650, y: 180, w: 160, h: 260, imgSrc: 'assets/cc/personajes/cc_trabajador.png' },
        { id: 'fila-pasajera', x: 540, y: 180, w: 160, h: 260, imgSrc: 'assets/cc/personajes/cc_pasajera.png' },
        { id: 'fila-mayor', x: 430, y: 190, w: 160, h: 250, imgSrc: 'assets/cc/personajes/cc_persona_mayor.png' },
        { id: 'fila-cuidadora', x: 310, y: 240, w: 200, h: 200, imgSrc: 'assets/cc/personajes/cc_cuidadora_nino.png' }
    ] : [
        { id: 'grupo-trabajador', x: 650, y: 180, w: 160, h: 260, imgSrc: 'assets/cc/personajes/cc_trabajador.png' },
        { id: 'grupo-pasajera', x: 705, y: 235, w: 145, h: 245, imgSrc: 'assets/cc/personajes/cc_pasajera.png' },
        { id: 'grupo-mayor', x: 775, y: 205, w: 130, h: 230, imgSrc: 'assets/cc/personajes/cc_persona_mayor.png' },
        { id: 'grupo-cuidadora', x: 590, y: 275, w: 175, h: 190, imgSrc: 'assets/cc/personajes/cc_cuidadora_nino.png' }
    ];
    cargarEscena({
        id: avanzado ? 'cc-avanzado' : 'cc-basico',
        nombre: 'Competencias Ciudadanas · ' + (avanzado ? 'Organizar la espera sin excluir' : 'Una parada para todos'),
        fondo: avanzado ? 'assets/cc/fondos/cc_parada_avanzado.png' : 'assets/cc/fondos/cc_parada_basico.png',
        x: 190, piesY: 510,
        objetos: [
            ...grupo,
            { id: 1, nombre: 'Persona con movilidad reducida', x: avanzado ? 570 : 485, y: 300, w: 185, h: 200, imgSrc: 'assets/cc/personajes/cc_movilidad_reducida.png', objetivo: 'Observa la parada y escucha a la persona con movilidad reducida.', interactuar: () => mostrarSituacionCC() },
            { id: 2, nombre: 'Parada', x: avanzado ? 310 : 399, y: 180, w: 125, h: 185, soloZona: true, objetivo: 'Acércate a la parada para responder. Puedes volver a observar el acceso.', interactuar: () => mostrarPreguntaCC() },
            { id: 'orientador', x: 45, y: 225, w: 170, h: 270, imgSrc: 'assets/cc/personajes/cc_orientador.png' },
            // El acceso del bus y la rampa forman parte del fondo: no se superponen puertas.
            { id: 3, nombre: 'Acceso al bus', x: avanzado ? 755 : 720, y: 300, w: 90, h: 70, soloZona: true, objetivo: 'Continúa para subir al transporte que te llevará a la universidad.', interactuar: finalizarCiudadanas }
        ]
    });
}
function mostrarSituacionCC(volver) {
    const id = desafioCiudadanoActual();
    if (!id || id === 'CC-M01') return;
    const continuar = volver || (() => estadoJuego.paso === 1 ? avanzarPaso(1, 2) : cerrarModal());
    mostrarModal({
        titulo: 'Pasajero', imagen: 'assets/cc/personajes/cc_movilidad_reducida.png',
        parrafos: [DIALOGOS_CC[id]],
        acciones: [{ texto: volver ? 'Volver a la pregunta' : 'Continuar', accion: continuar }],
        alCerrar: volver || cerrarModal
    });
}
function finalizarCiudadanas() {
    if (!['cc-basico', 'cc-avanzado'].includes(estadoJuego.escenaActual) || estadoJuego.paso !== 3 || !competenciaCompleta('CC')) return;
    continuarRecorrido('CC');
}

