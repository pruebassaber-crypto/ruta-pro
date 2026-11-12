'use strict';

// Primera competencia del recorrido, después del tutorial.
function iniciarCuantitativoMedio() {
    if (!competenciaHabilitada('RQ') || competenciaCompleta('RQ')) return;
    cargarEscenaCuantitativo('medio');
}
function cargarEscenaCuantitativo(nivel) {
    const medio = nivel === 'medio', basico = nivel === 'basico';
    const id = medio ? 'RQ-M01' : basico ? 'RQ-B01' : 'RQ-A01';
    const personaje = PERSONAJES_RQ[id];
    const mapa = {
        nombre: 'Mapa del barrio', x: medio ? 475 : basico ? 320 : 442,
        y: medio ? 240 : basico ? 306 : 274, w: 120, h: 26,
        imgSrc: 'assets/rq/objetos/rq_mapa.png', recorte: [26, 142, 1476, 761], radio: 155
    };
    const foto = {
        nombre: 'Fotografía del cachorro', x: 345, y: 194, w: 50, h: 66,
        imgSrc: 'assets/rq/objetos/rq_foto_cachorro.png', recorte: [292, 182, 647, 892], radio: 155
    };
    cargarEscena({
        id: 'rq-' + nivel, nombre: 'Razonamiento Cuantitativo · ' + (medio ? 'Calle de los Álamos' : basico ? 'Una pista en el parque' : 'Vigilancia del barrio'),
        fondo: medio ? 'assets/rq/fondos/rq_panaderia_medio.png' : basico ? 'assets/rq/fondos/rq_parque_basico.png' : 'assets/rq/fondos/rq_vigilancia_avanzado.png',
        x: medio ? 240 : 390, piesY: 520,
        objetos: [
            { id: medio ? 2 : 1, nombre: personaje.nombre, x: medio ? 630 : basico ? 520 : 650, y: 215,
                w: 112, h: 215, imgSrc: personaje.imagen,
                recorte: medio ? [390, 138, 542, 1007] : basico ? [340, 139, 552, 1004] : [358, 110, 547, 1099],
                objetivo: medio ? 'Pregúntale al panadero si reconoce al perrito que está a tu lado.' : 'Habla con ' + (basico ? 'la vecina' : 'el vigilante') + ' para conocer las pistas.', interactuar: () => mostrarDialogoRQ() },
            { id: 'cachorro', nombre: 'Cachorro', x: medio ? 755 : basico ? 650 : 790, y: 353, w: 62, h: 80,
                imgSrc: 'assets/rq/personajes/rq_cachorro.png', recorte: [322, 250, 588, 774] },
            { id: medio ? 1 : 2, ...(medio ? foto : mapa), objetivo: medio ? 'Acércate a la fotografía de la ventana para leer el anuncio.' : 'Consulta la información del mapa.', interactuar: () => consultarFuenteRQ() },
            ...(!medio && !basico ? [{ id: 3, nombre: 'Vigilante', x: 650, y: 215, w: 112, h: 215, soloZona: true,
                objetivo: 'Vuelve al vigilante para escuchar su afirmación sobre los recorridos.', interactuar: () => mostrarAfirmacionVigilanteRQ() }] : []),
            // Las zonas del mapa y del vigilante reutilizan las imágenes ya dibujadas.
            { id: pasoPreguntaRQ(id), ...mapa, soloZona: !medio, objetivo: 'Acércate al mapa y pulsa Espacio para responder.', interactuar: () => mostrarPreguntaRQ() },
            { id: pasoPreguntaRQ(id) + 1, nombre: basico ? 'Camino del barrio' : 'Acceso al conjunto',
                x: basico ? 600 : 745, y: basico ? 290 : 210, w: basico ? 120 : 225, h: basico ? 85 : 149,
                soloZona: true, objetivo: 'Respuesta registrada. Acércate al acceso señalado para continuar con Competencias Ciudadanas.', interactuar: finalizarCuantitativo }
        ]
    });
}
function transicionCuantitativo() {
    if (!competenciaHabilitada('RQ') || estadoJuego.escenaActual !== 'rq-medio' || !estadoJuego.resultados['RQ-M01']) return;
    iniciarCuantitativoRuta(estadoJuego.resultados['RQ-M01'].correcto);
    guardarProgresoLocal();
}
function iniciarCuantitativoRuta(avanzado) {
    const primero = estadoJuego.resultados['RQ-M01'];
    if (!competenciaHabilitada('RQ') || !primero || primero.correcto !== avanzado || competenciaCompleta('RQ')) return;
    cargarEscenaCuantitativo(avanzado ? 'avanzado' : 'basico');
}
function finalizarCuantitativo() {
    if (!competenciaHabilitada('RQ') || !['rq-basico', 'rq-avanzado'].includes(estadoJuego.escenaActual) || estadoJuego.paso !== pasoPreguntaRQ() + 1 || !competenciaCompleta('RQ')) return;
    continuarRecorrido('RQ');
}
