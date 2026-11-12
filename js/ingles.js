'use strict';

// Selección aprobada: Exercise 1 de medio, básico y avanzado de INGLES.pdf.
// Los identificadores EN-* son internos del juego. Estímulos, preguntas y opciones
// mantienen el inglés de la ficha; los diálogos son guion de ambientación.
const DESAFIOS_EN = {
    'EN-M01': {
        nombre: 'Follow the directions', nivel: 'Medio', maximo: 10, correcta: 1, familia: 1,
        enunciado: 'Where is the bus stop?',
        opciones: [
            'A. Behind the pharmacy.',
            'B. Next to the supermarket.',
            'C. Across from the university.'
        ],
        justificacion: 'interpreta una secuencia de instrucciones y localiza el destino indicado.',
        distractores: 'La opción A cambia la ubicación por detrás de la farmacia. La opción C sitúa la parada frente a la universidad. Ninguna de esas ubicaciones aparece en las indicaciones.',
        retroalimentacion: 'La expresión “next to” indica que un lugar está al lado de otro. El mensaje sitúa la parada al lado del supermercado; la farmacia es una referencia del recorrido.'
    },
    'EN-B01': {
        nombre: 'Where should Alex go?', nivel: 'Básico', maximo: 5, correcta: 1, familia: 1,
        enunciado: 'Where should Alex wait?',
        opciones: [
            'A. At Platform 1.',
            'B. At Platform 2.',
            'C. Inside the university library.'
        ],
        justificacion: 'identifica información explícita en un aviso breve.',
        distractores: 'La opción A cambia el número de plataforma. La opción C propone la biblioteca, un lugar que el aviso no señala como zona de espera.',
        retroalimentacion: 'El aviso indica “Platform 2”. Para responder, identifica el lugar de espera; la hora de salida es un dato diferente.'
    },
    'EN-A01': {
        nombre: 'Choose the best route', nivel: 'Avanzado', maximo: 10, correcta: 1, familia: 1,
        enunciado: 'Which route is more suitable if he wants to arrive before class?',
        opciones: [
            'A. Route A, because the bus arrives at 7:50.',
            'B. Route B, because he can reach campus at 7:45.',
            'C. Both routes, because both buses go to campus.'
        ],
        justificacion: 'combina la información de llegada del bus y el tiempo de caminata para determinar cuál opción permite llegar antes de clase.',
        distractores: 'La opción A solo considera la llegada del bus e ignora los quince minutos de caminata. La opción C no compara la hora de llegada al campus con la hora de inicio de la clase.',
        retroalimentacion: 'Suma el trayecto a pie a la llegada del bus. Route A: 7:50 + 15 minutos = 8:05. Route B: 7:35 + 10 minutos = 7:45. La clase empieza a las 7:50, por lo que Route B permite llegar antes.'
    }
};
const FUENTES_EN = {
    'EN-M01': {
        titulo: 'Indicaciones para Alex',
        lineas: ['“Walk straight for two blocks. Turn left at the pharmacy. The bus stop is next to the supermarket.”']
    },
    'EN-B01': {
        titulo: 'Aviso del transporte',
        lineas: ['UNIVERSITY BUS', 'Platform 2', 'Departure: 7:30 a.m.']
    },
    'EN-A01': {
        titulo: 'Opciones de viaje',
        lineas: [
            'Route A: “Take bus 12. It arrives at 7:50 a.m. The walk to campus takes 15 minutes.”',
            'Route B: “Take bus 8. It arrives at 7:35 a.m. The walk to campus takes 10 minutes.”',
            'Alex’s class starts at 7:50 a.m.'
        ]
    }
};
const DIALOGOS_EN = {
    'EN-M01': 'Hi! I’m Alex. I’m an exchange student. I’m trying to get to the university, but I’m lost. My phone has no battery. Can you help me read these directions?',
    'EN-B01': 'Here is the bus stop. This sign has information about the university bus. Can you help me find where to wait?',
    'EN-A01': 'Here is the bus stop. There are two travel options. Can you help me compare them? The panel has the times.'
};
function desafioInglesActual() {
    return { 'en-medio': 'EN-M01', 'en-basico': 'EN-B01', 'en-avanzado': 'EN-A01' }[estadoJuego.escenaActual] || null;
}
function mostrarDialogoAlex(volver) {
    const id = desafioInglesActual();
    if (!id) return;
    const continuar = volver || (() => estadoJuego.paso === 1 ? avanzarPaso(1, 2) : cerrarModal());
    mostrarModal({
        titulo: 'Alex', imagen: 'assets/ingles/personajes/alex.png',
        parrafos: [DIALOGOS_EN[id]],
        acciones: [{ texto: volver ? 'Volver a la pregunta' : 'Continuar', accion: continuar }],
        alCerrar: volver || cerrarModal
    });
}
function consultarFuenteEN(id = desafioInglesActual(), volver) {
    if (!id || id !== desafioInglesActual() || estadoJuego.paso < 2) return;
    const fuente = FUENTES_EN[id];
    const contenido = document.createElement('article');
    contenido.className = 'aviso-transporte';
    contenido.lang = 'en';
    fuente.lineas.forEach((linea, indice) => contenido.append(nodoTexto('p', linea, indice === 0 && id === 'EN-B01' ? 'aviso-cabecera' : undefined)));
    const continuar = volver || (() => estadoJuego.paso === 2 ? avanzarPaso(2, 3) : cerrarModal());
    mostrarModal({
        titulo: fuente.titulo, contenido,
        acciones: [{ texto: volver ? 'Volver a la pregunta' : 'Continuar', accion: continuar }],
        alCerrar: volver || cerrarModal
    });
}
function mostrarPreguntaEN(id = desafioInglesActual()) {
    if (!id || id !== desafioInglesActual() || estadoJuego.paso !== 3 || estadoJuego.resultados[id]) return;
    const desafio = DESAFIOS_EN[id];
    if (!estadoJuego.tiempos[id]) estadoJuego.tiempos[id] = Date.now();
    const pregunta = nodoTexto('p', desafio.enunciado, 'question-text');
    pregunta.lang = 'en';
    mostrarModal({
        titulo: desafio.nombre, contenido: pregunta,
        acciones: [
            ...opcionesParaMostrar(id).map(({ texto, indice }) => ({ texto, accion: () => registrarRespuestaEN(id, indice) })),
            { texto: 'Consultar nuevamente la información', accion: () => consultarFuenteEN(id, () => mostrarPreguntaEN(id)), secundario: true },
            { texto: 'Releer el diálogo de Alex', accion: () => mostrarDialogoAlex(() => mostrarPreguntaEN(id)), secundario: true }
        ]
    });
}
function registrarRespuestaEN(id, indice) {
    const desafio = DESAFIOS_EN[id];
    if (!competenciaHabilitada('EN') || !desafio || id !== desafioInglesActual() || estadoJuego.paso !== 3 || estadoJuego.resultados[id] || !Number.isInteger(indice) || indice < 0 || indice >= desafio.opciones.length) return;
    const correcto = indice === desafio.correcta;
    if (id === 'EN-M01') estadoJuego.rutas.EN = correcto ? 'AVANZADO' : 'BÁSICO';
    const resultado = {
        desafio: id, version: VERSION_CONTENIDO, competencia: 'Inglés',
        familia: desafio.familia, nivel: desafio.nivel, escenario: estadoJuego.escenaActual,
        ...datosOpcionesRespuesta(id, indice),
        correcto, puntaje: correcto ? desafio.maximo : 0, maximo: desafio.maximo,
        tiempoSegundos: Math.round((Date.now() - (estadoJuego.tiempos[id] || Date.now())) / 1000),
        orden: Object.keys(estadoJuego.resultados).length + 1,
        rutaAsignada: estadoJuego.rutas.EN, fecha: new Date().toISOString(),
        retroalimentacionVista: false, envio: 'pendiente'
    };
    estadoJuego.resultados[id] = resultado;
    if (id !== 'EN-M01') { estadoJuego.paso = 4; actualizarObjetivo(); }
    guardarProgresoLocal();
    void enviarDatosGS(resultado);
    const continuar = id === 'EN-M01' ? transicionIngles : cerrarModal;
    mostrarModal({
        titulo: 'Respuesta registrada',
        parrafos: [id === 'EN-M01' ? 'Continúa con Alex hacia la zona de transporte.' : 'Acércate al acceso del transporte para continuar hacia la recepción de la universidad.'],
        acciones: [{ texto: 'Continuar', accion: continuar }], alCerrar: continuar
    });
}

