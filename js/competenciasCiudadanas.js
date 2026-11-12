'use strict';

// Opciones de las fichas originales. Enunciados básico y avanzado adaptados
// para no repetir los diálogos; se conserva el original como referencia.
// CC-B02: la ficha redacta de forma distinta la clave; se conserva la opción C
// tal como figura en las alternativas y se evalúa por índice.
const DESAFIOS_CC = {
    'CC-M01': {
        nombre: '¿Qué sabemos realmente?', nivel: 'Medio', maximo: 10, correcta: 2, familia: 1,
        contexto: 'Mientras espera el transporte, el jugador escucha a un pasajero afirmar que la ruta será cancelada porque un conductor se lo comentó. Otro pasajero muestra un aviso oficial publicado hace dos semanas que informa sobre un cambio temporal, pero no menciona la cancelación.',
        enunciado: '¿Cuál es la conclusión mejor sustentada con la información disponible?',
        opciones: [
            'A. La ruta será cancelada porque el comentario del conductor es más reciente.',
            'B. La ruta seguirá funcionando sin cambios porque el aviso oficial no menciona una cancelación.',
            'C. La cancelación no está confirmada; es necesario verificar si existe información oficial más reciente.',
            'D. Las dos versiones tienen el mismo respaldo porque ambas fueron comunicadas por otras personas.'
        ],
        justificacion: 'La opción C reconoce que la información disponible no permite confirmar la cancelación. El comentario indirecto no constituye una confirmación y el aviso oficial, por ser anterior, tampoco permite descartar que existan novedades. La respuesta distingue entre lo que se sabe y lo que todavía debe verificarse.',
        distractores: 'A: asume que la información más reciente es necesariamente verdadera, sin verificar su procedencia. B: interpreta la ausencia de una cancelación en un aviso anterior como prueba de que no existen cambios posteriores. D: equipara las fuentes sin considerar su procedencia, vigencia y capacidad para sustentar la afirmación.',
        retroalimentacion: '«Contrastar versiones exige valorar su procedencia y vigencia. Cuando la evidencia no permite confirmar una afirmación, la conclusión mejor sustentada es reconocer esa incertidumbre y buscar información adicional».'
    },
    'CC-B02': {
        nombre: 'Una parada para todos', nivel: 'Básico', maximo: 5, correcta: 2, familia: 2,
        contexto: 'Mientras los pasajeros comentan el rumor sobre la ruta, un grupo ocupa el espacio de acceso al vehículo. Una persona con movilidad reducida advierte que la obstrucción le dificulta acercarse al lugar de abordaje.',
        enunciado: 'Ante la obstrucción del acceso al vehículo, ¿cuál es la consideración más pertinente para analizar esta situación?',
        enunciadoOriginal: 'Mientras los pasajeros discuten el rumor, una persona con movilidad reducida señala que el grupo está ocupando el espacio de acceso al vehículo. ¿Cuál es la consideración más pertinente para analizar esta situación?',
        opciones: [
            'A. El grupo puede ocupar el espacio si llegó primero a la parada.',
            'B. La persona debe buscar otra parada, aunque la ruta sea la misma.',
            'C. Los que esperan deben permitir el acceso al transporte sin bloquear el paso.',
            'D. El acceso debe resolverse únicamente cuando llegue el vehículo.'
        ],
        justificacion: 'La opción C reconoce que la organización del espacio compartido debe considerar las condiciones de acceso de todos los usuarios. El orden de llegada no justifica ocupar un espacio de manera que impida la circulación o el acceso de otras personas.',
        distractores: 'A: confunde el orden de llegada con un derecho a ocupar cualquier espacio. B: traslada a la persona afectada la responsabilidad de resolver la obstrucción. D: posterga la atención del problema, aunque la barrera ya está presente.',
        retroalimentacion: '«El espacio público debe organizarse de forma que permita la circulación y el acceso de diferentes personas. Haber llegado primero no justifica impedir que otros usuarios puedan acceder al transporte».'
    },
    'CC-A02': {
        nombre: 'Organizar la espera sin excluir', nivel: 'Avanzado', maximo: 10, correcta: 2, familia: 2,
        contexto: 'Para evitar aglomeraciones, algunos pasajeros proponen formar una fila que ocupa parte de la zona de paso. La medida parece facilitar la organización de la espera, pero dificulta el tránsito peatonal y el acceso de una persona con movilidad reducida.',
        enunciado: '¿Cuál es el criterio más adecuado para evaluar la fila propuesta por los pasajeros?',
        enunciadoOriginal: 'Para evitar aglomeraciones, algunos pasajeros proponen formar una fila que ocupa parte de la zona de paso. La medida parece organizar la espera, pero dificulta el tránsito peatonal y el acceso de una persona con movilidad reducida. ¿Cuál es el criterio más adecuado para evaluar la propuesta?',
        opciones: [
            'A. Mantenerla porque organizar la fila beneficia a la mayoría de los pasajeros.',
            'B. Rechazar cualquier fila, porque organizar a los pasajeros siempre restringe la libertad individual.',
            'C. Valorar si organiza la espera sin restringir el paso y ajustar su ubicación para garantizar el acceso.',
            'D. Mantenerla hasta que llegue el vehículo y evaluar después si hubo dificultades.'
        ],
        justificacion: 'La opción C considera tanto el propósito de organizar la espera como los efectos de la medida sobre diferentes usuarios. Permite mantener el objetivo colectivo y, al mismo tiempo, corregir una barrera de acceso evitable.',
        distractores: 'A: privilegia el beneficio para la mayoría sin examinar los efectos sobre quienes encuentran una barrera. B: rechaza cualquier forma de organización sin valorar alternativas que puedan resolver el problema. D: posterga la corrección pese a que la dificultad ya es visible y previsible.',
        retroalimentacion: '«Una decisión colectiva debe evaluarse por sus efectos sobre las personas involucradas. Organizar la espera puede ser útil, pero la medida debe permitir la circulación y el acceso al transporte. La solución consiste en valorar sus consecuencias y ajustar aquello que genera una barrera evitable».'
    }
};
// Guion ficticio de consulta: no se atribuye a una ruta ni a una entidad real.
const FUENTES_CC = {
    trabajador: { titulo: 'Trabajador', imagen: 'assets/cc/personajes/cc_trabajador.png', texto: 'Hola, vecino. El conductor me comentó que la ruta que esperamos será cancelada.' },
    aviso: { titulo: 'Aviso de transporte', fecha: 'Publicado hace dos semanas', asunto: 'Cambio temporal en la operación de la ruta', texto: 'Se informa a los usuarios de un cambio temporal en la operación de esta ruta.' }
};
const DIALOGOS_CC = {
    'CC-B02': 'Hola, ¿me ayudas? Ese grupo está ocupando el acceso al bus y no puedo acercarme a la zona de abordaje.',
    'CC-A02': 'Hola, vecino. Propusieron hacer una fila para evitar aglomeraciones, pero está ocupando parte del paso. Me cuesta llegar al bus y las otras personas tampoco pueden circular con facilidad.'
};
function obtenerDesafio(id) { return DESAFIOS_CC[id] || DESAFIOS_LC[id] || DESAFIOS_EN[id] || DESAFIOS_CE[id] || DESAFIOS_RQ[id]; }
function idsCompetencia(codigo, resultados = estadoJuego.resultados) {
    const ids = { CC: ['CC-M01', 'CC-A02', 'CC-B02'], LC: ['LC-M01', 'LC-A01', 'LC-B01'], EN: ['EN-M01', 'EN-A01', 'EN-B01'], CE: ['CE-M01', 'CE-A01', 'CE-B01'], RQ: ['RQ-M01', 'RQ-A01', 'RQ-B01'] }[codigo];
    if (!ids) return [];
    return [ids[0], resultados[ids[0]]?.correcto ? ids[1] : ids[2]];
}
function competenciaCompleta(codigo, resultados = estadoJuego.resultados) {
    const ids = idsCompetencia(codigo, resultados);
    return ids.length === 2 && ids.every(id => Boolean(resultados[id]));
}
function consultarFuenteCC(fuente, volver = cerrarModal) {
    const datos = FUENTES_CC[fuente];
    if (!datos) return;
    let contenido;
    if (fuente === 'aviso') {
        contenido = document.createElement('article');
        contenido.className = 'aviso-transporte';
        contenido.append(
            nodoTexto('p', 'TRANSPORTE PÚBLICO · AVISO A LOS USUARIOS', 'aviso-cabecera'),
            nodoTexto('p', datos.fecha, 'aviso-fecha'),
            nodoTexto('h3', datos.asunto),
            nodoTexto('p', datos.texto)
        );
    }
    mostrarModal({
        titulo: datos.titulo, imagen: datos.imagen,
        parrafos: contenido ? [] : [datos.texto], contenido,
        acciones: [{ texto: 'Continuar', accion: volver }], alCerrar: volver
    });
}
function desafioCiudadanoActual() {
    return { 'cc-medio': 'CC-M01', 'cc-basico': 'CC-B02', 'cc-avanzado': 'CC-A02' }[estadoJuego.escenaActual] || null;
}
function mostrarPreguntaCC(id = desafioCiudadanoActual()) {
    if (!id || id !== desafioCiudadanoActual()) return;
    const pasoPregunta = id === 'CC-M01' ? 3 : 2;
    if (estadoJuego.paso !== pasoPregunta || estadoJuego.resultados[id]) return;
    const desafio = DESAFIOS_CC[id];
    if (!estadoJuego.tiempos[id]) estadoJuego.tiempos[id] = Date.now();
    const acciones = opcionesParaMostrar(id).map(({ texto, indice }) => ({ texto, accion: () => registrarRespuestaCC(id, indice) }));
    if (id === 'CC-M01') {
        for (const [fuente, texto] of [['trabajador', 'Releer el testimonio'], ['aviso', 'Consultar el aviso oficial']])
            acciones.push({ texto, accion: () => consultarFuenteCC(fuente, () => mostrarPreguntaCC(id)), secundario: true });
    } else {
        acciones.push({ texto: 'Volver a leer la situación', accion: () => mostrarSituacionCC(() => mostrarPreguntaCC(id)), secundario: true });
        acciones.push({ texto: 'Volver a observar la parada', accion: cerrarModal, secundario: true });
    }
    mostrarModal({ titulo: desafio.nombre, contenido: nodoTexto('p', desafio.enunciado, 'question-text'), acciones });
}
function registrarRespuestaCC(id, indice) {
    const desafio = DESAFIOS_CC[id];
    if (!competenciaHabilitada('CC') || !desafio || id !== desafioCiudadanoActual() || estadoJuego.resultados[id] || !Number.isInteger(indice) || indice < 0 || indice >= desafio.opciones.length) return;
    if (estadoJuego.paso !== (id === 'CC-M01' ? 3 : 2)) return;
    const correcto = indice === desafio.correcta;
    if (id === 'CC-M01') estadoJuego.rutas.CC = correcto ? 'AVANZADO' : 'BÁSICO';
    const resultado = {
        desafio: id, version: VERSION_CONTENIDO, competencia: 'Competencias Ciudadanas',
        familia: desafio.familia, nivel: desafio.nivel, escenario: estadoJuego.escenaActual,
        ...datosOpcionesRespuesta(id, indice),
        correcto, puntaje: correcto ? desafio.maximo : 0, maximo: desafio.maximo,
        tiempoSegundos: Math.round((Date.now() - (estadoJuego.tiempos[id] || Date.now())) / 1000),
        orden: Object.keys(estadoJuego.resultados).length + 1,
        rutaAsignada: estadoJuego.rutas.CC, fecha: new Date().toISOString(),
        retroalimentacionVista: false, envio: 'pendiente'
    };
    estadoJuego.resultados[id] = resultado;
    if (id !== 'CC-M01') { estadoJuego.paso = 3; actualizarObjetivo(); }
    guardarProgresoLocal();
    void enviarDatosGS(resultado);
    const continuar = id === 'CC-M01' ? transicionCiudadana : cerrarModal;
    mostrarModal({
        titulo: 'Respuesta registrada',
        parrafos: [id === 'CC-M01' ? 'Continúa explorando la parada.' : 'Continúa para subir al transporte que te llevará a la universidad.'],
        acciones: [{ texto: 'Continuar', accion: continuar }], alCerrar: continuar
    });
}

