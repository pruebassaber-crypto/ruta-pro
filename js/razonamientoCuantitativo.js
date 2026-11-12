'use strict';

// Preguntas y alternativas de Razonamiento Cuantitativo..pdf.
// El registro conserva x/2; la interfaz muestra la fracción en vertical.
const DESAFIOS_RQ = {
    'RQ-M01': {
        nombre: '¿Cuál es el número de la casa?', nivel: 'Medio', maximo: 10, correcta: 0, familia: 1,
        enunciado: '¿Cuál es el número de la casa de la dueña del perrito?',
        opciones: ['A. 78', 'B. 26', 'C. 52', 'D. 101'],
        justificacion: 'Si x representa el número de la panadería, el de la vivienda es 3x. Como ambos suman 104, x + 3x = 104; entonces 4x = 104 y x = 26. La vivienda es 3(26) = 78. Se verifica que 78 es el triple de 26 y que 26 + 78 = 104.',
        distractores: 'B: 26 es el número de la panadería, no el de la vivienda. C: dividir entre dos supone números iguales, pero la relación es uno a tres. D: restar 3 confunde el triple con una diferencia de tres unidades; no cumple la relación multiplicativa.',
        retroalimentacion: 'Representa cada cantidad y comprueba las dos condiciones: la relación de triple y la suma total. Encontrar x no siempre termina el problema; revisa qué cantidad te preguntan.'
    },
    'RQ-B01': {
        nombre: 'La pista para encontrar al cachorro', nivel: 'Básico', maximo: 5, correcta: 0, familia: 2,
        enunciado: '¿Qué expresión debe seleccionar el estudiante para identificar la distancia hasta la casa del cachorro?',
        opciones: ['A. 2x + 100', 'B. 2(x + 100)', 'C. x/2 + 100', 'D. 2x − 100'],
        justificacion: 'El doble de la distancia a la panadería se representa mediante 2x. La casa está 100 metros más lejos que esa cantidad, por lo que se suman 100 metros: 2x + 100.',
        distractores: 'B suma 100 antes de duplicar y termina duplicando también esos 100 metros. C representa la mitad de la distancia, no el doble. D resta 100 metros, aunque la pista indica que deben sumarse.',
        retroalimentacion: 'Traduce cada relación por separado: «el doble» multiplica por dos; «más 100 metros» añade 100 después de multiplicar. Los paréntesis cambian qué cantidades se duplican.'
    },
    'RQ-A01': {
        nombre: '¿Tiene razón el vigilante?', nivel: 'Avanzado', maximo: 10, correcta: 0, familia: 2,
        enunciado: '¿Es válida su afirmación?',
        opciones: [
            'A. No, porque solo hay 2 recorridos válidos: P–T–V y T–P–V.',
            'B. Sí, porque 3!=6 permite organizar los tres lugares de seis maneras.',
            'C. No, porque hay 3 recorridos válidos al visitar el parque antes que vigilancia.',
            'D. No, porque únicamente puede seguirse P–T–V.'
        ],
        justificacion: 'Aunque tres lugares pueden organizarse de seis maneras, P y T deben visitarse antes que V. Por tanto, V debe quedar al final y solo pueden intercambiarse P y T: P–T–V y T–P–V. Hay dos recorridos válidos.',
        distractores: 'B cuenta todos los órdenes sin aplicar las restricciones. C aplica solamente la condición del parque, pero también la tienda debe visitarse antes que vigilancia. D omite el recorrido T–P–V, que también cumple ambas condiciones.',
        retroalimentacion: 'Antes de usar un factorial, revisa las restricciones. Aquí vigilancia debe ser la última visita; solo quedan dos órdenes posibles para los otros lugares.'
    }
};
// Las pistas dichas por el personaje no se duplican en el documento.
const DIALOGOS_RQ = {
    'RQ-M01': '¡Hola! Sí, reconozco al perrito que está a mi lado. Su dueña vive en una casa cuyo número es el triple del número de la panadería. Si sumamos el número de la casa y el de la panadería, el resultado es 104.',
    'RQ-B01': '¡Hola! Puedo darte otra pista para encontrar su casa: la casa del cachorro está a una distancia del parque que equivale al doble de la distancia hasta la panadería, más 100 metros.',
    'RQ-A01': '¡Hola! Sí, este perrito vive en el conjunto y conozco a su dueña. Pero antes de entregarlo, necesitamos verificar las pistas en los lugares del plano. ¿Estás de acuerdo?'
};
const AFIRMACION_VIGILANTE_RQ = 'Como hay tres lugares, existen 3! = 6 recorridos válidos';
const PERSONAJES_RQ = {
    'RQ-M01': { nombre: 'Panadero', imagen: 'assets/rq/personajes/rq_panadero.png' },
    'RQ-B01': { nombre: 'Vecina', imagen: 'assets/rq/personajes/rq_vecina.png' },
    'RQ-A01': { nombre: 'Vigilante', imagen: 'assets/rq/personajes/rq_vigilante.png' }
};
const FUENTES_RQ = {
    'RQ-M01': { titulo: '¡Perrito perdido!', lineas: ['Mi perrito se ha perdido. Por favor, avísenme si lo ven. ¡Lo estamos buscando y queremos que vuelva a casa!'] },
    'RQ-B01': { titulo: 'Mapa de distancias', lineas: ['En el mapa, la distancia del parque a la panadería se representa con la letra x, medida en metros.'] },
    'RQ-A01': { titulo: 'Lugares y condición del recorrido', lineas: ['Antes de entregar el cachorro en la casa 78, debes visitar tres lugares:', '● P: Parque, recoger una foto.', '● T: Tienda, confirmar la dueña.', '● V: Vigilancia, verificar ambas pistas. Condición: P y T deben visitarse antes que V.'] }
};
function desafioCuantitativoActual() {
    return { 'rq-medio': 'RQ-M01', 'rq-basico': 'RQ-B01', 'rq-avanzado': 'RQ-A01' }[estadoJuego.escenaActual] || null;
}
function pasoPreguntaRQ(id = desafioCuantitativoActual()) { return id === 'RQ-A01' ? 4 : 3; }
// Se conserva el texto original; solo se cambia su presentación.
function textoLegibleRQ(texto, etiqueta = 'p') {
    const nodo = document.createElement(etiqueta);
    const patron = /P–T–V|T–P–V|3!\s*=\s*6|\b\d+\b|\bx\b/g;
    let inicio = 0;
    for (const coincidencia of texto.matchAll(patron)) {
        nodo.append(nodoTexto('span', texto.slice(inicio, coincidencia.index)));
        nodo.append(nodoTexto('strong', coincidencia[0], 'rq-dato'));
        inicio = coincidencia.index + coincidencia[0].length;
    }
    nodo.append(nodoTexto('span', texto.slice(inicio)));
    return nodo;
}
function opcionLegibleRQ(id, texto, indice) {
    if (id !== 'RQ-B01') return textoLegibleRQ(texto, 'span');
    const contenido = document.createElement('span');
    contenido.className = 'rq-expresion';
    if (indice !== 2) {
        contenido.textContent = texto;
        return contenido;
    }
    contenido.append(nodoTexto('span', texto.slice(0, texto.indexOf('.') + 1) + ' '));
    const fraccion = document.createElement('span');
    fraccion.className = 'rq-fraccion';
    fraccion.append(
        nodoTexto('span', 'x', 'rq-numerador'),
        nodoTexto('span', '/', 'rq-fraccion-lectura'),
        nodoTexto('span', '2', 'rq-denominador')
    );
    contenido.append(fraccion, nodoTexto('span', ' + 100'));
    return contenido;
}
function mostrarDialogoRQ(volver) {
    const id = desafioCuantitativoActual();
    if (!competenciaHabilitada('RQ') || !id || (id === 'RQ-M01' && estadoJuego.paso < 2)) return;
    const personaje = PERSONAJES_RQ[id];
    const pasoDialogo = id === 'RQ-M01' ? 2 : 1;
    mostrarModal({
        titulo: personaje.nombre, imagen: personaje.imagen, contenido: textoLegibleRQ(DIALOGOS_RQ[id]), clase: 'rq-modal',
        acciones: [{ texto: volver ? 'Volver a la pregunta' : 'Continuar', accion: volver || (() => estadoJuego.paso === pasoDialogo ? avanzarPaso(pasoDialogo, pasoDialogo + 1) : cerrarModal()) }],
        alCerrar: volver || cerrarModal
    });
}
function consultarFuenteRQ(id = desafioCuantitativoActual(), volver) {
    if (!competenciaHabilitada('RQ') || !id || id !== desafioCuantitativoActual()) return;
    const pasoFuente = id === 'RQ-M01' ? 1 : 2;
    if (estadoJuego.paso < pasoFuente) return;
    const fuente = FUENTES_RQ[id];
    const contenido = document.createElement('article');
    contenido.className = 'aviso-transporte';
    if (id === 'RQ-M01') {
        const foto = document.createElement('img');
        foto.src = 'assets/rq/objetos/rq_foto_cachorro.png';
        foto.alt = 'Fotografía del cachorro de pelaje dorado, mancha café y collar verde.';
        foto.className = 'foto-cachorro';
        contenido.append(foto);
    }
    fuente.lineas.forEach(linea => contenido.append(textoLegibleRQ(linea)));
    mostrarModal({
        titulo: fuente.titulo, contenido, clase: 'rq-modal',
        acciones: [{ texto: volver ? 'Volver a la pregunta' : 'Continuar', accion: volver || (() => estadoJuego.paso === pasoFuente ? avanzarPaso(pasoFuente, pasoFuente + 1) : cerrarModal()) }],
        alCerrar: volver || cerrarModal
    });
}
function mostrarAfirmacionVigilanteRQ(volver) {
    if (!competenciaHabilitada('RQ') || desafioCuantitativoActual() !== 'RQ-A01' || estadoJuego.paso < 3) return;
    mostrarModal({
        titulo: 'Vigilante', imagen: PERSONAJES_RQ['RQ-A01'].imagen,
        contenido: textoLegibleRQ(AFIRMACION_VIGILANTE_RQ), clase: 'rq-modal',
        acciones: [{ texto: volver ? 'Volver a la pregunta' : 'Continuar', accion: volver || (() => estadoJuego.paso === 3 ? avanzarPaso(3, 4) : cerrarModal()) }],
        alCerrar: volver || cerrarModal
    });
}
function mostrarPreguntaRQ(id = desafioCuantitativoActual()) {
    if (!competenciaHabilitada('RQ') || !id || id !== desafioCuantitativoActual() || estadoJuego.paso !== pasoPreguntaRQ(id) || estadoJuego.resultados[id]) return;
    const desafio = DESAFIOS_RQ[id];
    if (!estadoJuego.tiempos[id]) estadoJuego.tiempos[id] = Date.now();
    mostrarModal({
        titulo: desafio.nombre, parrafos: [desafio.enunciado], clase: 'rq-modal',
        acciones: [
            ...opcionesParaMostrar(id).map(({ texto, indice }) => ({ texto, contenido: opcionLegibleRQ(id, texto, indice), clase: 'rq-opcion', accion: () => registrarRespuestaRQ(id, indice) })),
            { texto: 'Consultar nuevamente la información', accion: () => consultarFuenteRQ(id, () => mostrarPreguntaRQ(id)), secundario: true },
            { texto: 'Releer las pistas del personaje', accion: () => mostrarDialogoRQ(() => mostrarPreguntaRQ(id)), secundario: true },
            ...(id === 'RQ-A01' ? [{ texto: 'Releer la afirmación del vigilante', accion: () => mostrarAfirmacionVigilanteRQ(() => mostrarPreguntaRQ(id)), secundario: true }] : [])
        ]
    });
}
function registrarRespuestaRQ(id, indice) {
    const desafio = DESAFIOS_RQ[id];
    if (!competenciaHabilitada('RQ') || !desafio || id !== desafioCuantitativoActual() || estadoJuego.paso !== pasoPreguntaRQ(id) || estadoJuego.resultados[id] || !Number.isInteger(indice) || indice < 0 || indice >= desafio.opciones.length) return;
    const correcto = indice === desafio.correcta;
    if (id === 'RQ-M01') estadoJuego.rutas.RQ = correcto ? 'AVANZADO' : 'BÁSICO';
    const resultado = {
        desafio: id, version: VERSION_CONTENIDO, competencia: 'Razonamiento Cuantitativo',
        familia: desafio.familia, nivel: desafio.nivel, escenario: estadoJuego.escenaActual,
        ...datosOpcionesRespuesta(id, indice),
        correcto, puntaje: correcto ? desafio.maximo : 0, maximo: desafio.maximo,
        tiempoSegundos: Math.round((Date.now() - (estadoJuego.tiempos[id] || Date.now())) / 1000),
        orden: Object.keys(estadoJuego.resultados).length + 1,
        rutaAsignada: estadoJuego.rutas.RQ, fecha: new Date().toISOString(),
        retroalimentacionVista: false, envio: 'pendiente'
    };
    estadoJuego.resultados[id] = resultado;
    if (id !== 'RQ-M01') { estadoJuego.paso = pasoPreguntaRQ(id) + 1; actualizarObjetivo(); }
    guardarProgresoLocal();
    void enviarDatosGS(resultado);
    const continuar = id === 'RQ-M01' ? transicionCuantitativo : cerrarModal;
    mostrarModal({
        titulo: 'Respuesta registrada',
        parrafos: [id === 'RQ-M01' ? 'Continúa buscando información para ayudar al cachorro.' : 'Acércate al acceso señalado para continuar hacia la parada de transporte.'],
        acciones: [{ texto: 'Continuar', accion: continuar }], alCerrar: continuar
    });
}
