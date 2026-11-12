'use strict';

// Después de Ciudadanas; al salir del bus continúa Inglés.
function iniciarEscritaMedio() {
    if (!competenciaHabilitada('CE') || competenciaCompleta('CE')) return;
    cargarEscenaEscrita('medio');
}
function cargarEscenaEscrita(nivel) {
    const medio = nivel === 'medio';
    const basico = nivel === 'basico';
    // Coordenadas sobre fondos 1672 x 941, mostrados a 1000 x 562.
    // Los documentos descansan en los asientos que se dejaron vacíos.
    const documento = medio
        ? { nombre: 'Hoja del poema', x: 231, y: 334, w: 42, h: 28, imgSrc: 'assets/ce/objetos/ce_hoja_poema.png' }
        : basico
            ? { nombre: 'Cuaderno del poema', x: 553, y: 329, w: 100, h: 43, imgSrc: 'assets/ce/objetos/ce_cuaderno.png' }
            : { nombre: 'Libro de poemas', x: 506, y: 338, w: 115, h: 33, imgSrc: 'assets/ce/objetos/ce_libro_poemas.png' };
    cargarEscena({
        id: 'ce-' + nivel, nombre: 'Comunicación Escrita · Un poema antes de llegar',
        fondo: medio ? 'assets/ce/fondos/ce_bus_medio.png' : basico ? 'assets/ce/fondos/ce_bus_basico.png' : 'assets/ce/fondos/ce_bus_avanzado.png',
        x: medio ? 480 : basico ? 330 : 370, piesY: 520,
        objetos: [
            { id: 1, nombre: 'Autor del poema', x: medio ? 620 : basico ? 740 : 630, y: 252, w: 170, h: 210, imgSrc: 'assets/ce/personajes/ce_autor_enamorado.png', objetivo: 'Acércate al autor del poema para escuchar su petición.', interactuar: () => mostrarDialogoAutor() },
            { id: 2, ...documento, radio: 140, objetivo: 'Consulta el fragmento apoyado sobre el asiento.', interactuar: () => consultarFuenteCE() },
            { id: 3, nombre: documento.nombre, x: documento.x, y: documento.y, w: documento.w, h: documento.h, soloZona: true, radio: 140, objetivo: 'Pulsa Espacio en el documento para responder.', interactuar: () => mostrarPreguntaCE() },
            { id: 4, nombre: 'Salida del bus', x: basico ? 34 : 724, y: 126, w: 218, h: 292, soloZona: true, objetivo: medio ? 'Continúa revisando el poema.' : 'Acércate a la salida del bus para bajar y caminar el tramo que falta hacia la universidad.', interactuar: finalizarEscrita }
        ]
    });
}
function transicionEscrita() {
    if (!competenciaHabilitada('CE') || estadoJuego.escenaActual !== 'ce-medio' || !estadoJuego.resultados['CE-M01']) return;
    iniciarEscritaRuta(estadoJuego.resultados['CE-M01'].correcto);
    guardarProgresoLocal();
}
function iniciarEscritaRuta(avanzado) {
    const primero = estadoJuego.resultados['CE-M01'];
    if (!competenciaHabilitada('CE') || !primero || primero.correcto !== avanzado || competenciaCompleta('CE')) return;
    cargarEscenaEscrita(avanzado ? 'avanzado' : 'basico');
}
function finalizarEscrita() {
    if (!competenciaHabilitada('CE') || !['ce-basico', 'ce-avanzado'].includes(estadoJuego.escenaActual) || estadoJuego.paso !== 4 || !competenciaCompleta('CE')) return;
    continuarRecorrido('CE');
}
