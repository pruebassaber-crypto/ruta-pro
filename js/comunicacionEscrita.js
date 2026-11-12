'use strict';

// Fragmentos y alternativas transcritos de Comunicación Escrita.pdf.
// Se conservan las cinco alternativas de CE-M01, incluida la E.
const DESAFIOS_CE = {
    'CE-M01': {
        nombre: 'Una idea que no se entiende', nivel: 'Medio', maximo: 10, correcta: 1, familia: 1,
        enunciado: '¿Cuál de las siguientes opciones de reescritura expresa la idea de manera correcta, sintáctica y gramaticalmente, conservando la intención del autor?',
        opciones: [
            'A. Mi corazón mira de la ventana las estrellas, porque la noche me recuerda de ti…',
            'B. Miro las estrellas por la ventana y la noche me recuerda a ti…',
            'C. …Las ideas verdes duermen cuando te veo.',
            'D. Mi corazón mira la noche por la ventana y recuerda las estrellas de ti…',
            'E. …Las ideas se vuelven incoloras y duermen cuando te veo'
        ],
        justificacion: 'La opción B organiza las ideas de manera clara: el hablante mira las estrellas por la ventana y la noche le recuerda a una persona importante. Conserva la intención del poema y establece una relación comprensible entre las ideas. La cita de Noam Chomsky tiene una estructura sintáctica y gramatical correcta, aunque carezca de sentido.',
        distractores: 'A conserva «me recuerda de ti» y una construcción forzada. C recorta la cita y elimina elementos del mensaje original. D altera el significado con «las estrellas de ti». E modifica la cita y omite la idea de la ventana, la noche y las estrellas.',
        retroalimentacion: 'Al revisar un texto, comprueba que las palabras estén organizadas de manera que el lector pueda reconocer quién realiza la acción y cómo se relacionan las ideas. La corrección debe conservar la intención del autor.'
    },
    'CE-B01': {
        nombre: 'Los versos que no concuerdan', nivel: 'Básico', maximo: 5, correcta: 0, familia: 2,
        enunciado: '¿Cuál opción corrige los errores gramaticales del fragmento?',
        opciones: [
            'A. Tu palabra tiene las luces que iluminan mi camino, y las estrellas brillan por ti. Realmente me has cazado el corazón y te has quedado con él.',
            'B. Tú palabra tienen las luces que iluminan mi camino y las estrellas brillan por ti. Realmente me has cazado el corazón y te haz quedado con él.',
            'C. Tu palabra tiene las luces que iluminan mi camino y las estrellas brillan por ti. Realmente me has casado el corazón y te has quedado con el.',
            'D. Tú palabra tiene las luces que ilumina mi camino y las estrellas brillan por ti. Realmente me has cazado el corazón y te haz quedado con él.'
        ],
        justificacion: 'La opción A usa el posesivo «Tu» sin tilde, «tiene» en singular para concordar con «palabra» e «iluminan» en plural para concordar con «luces». «Cazado» expresa capturar el corazón en sentido figurado; «has» es el auxiliar de «te has quedado», y el pronombre «él» lleva tilde.',
        // Corrección de la explicación de la ficha: B sí contiene «cazado».
        distractores: 'B conserva el posesivo incorrecto «Tú», la falta de concordancia «palabra tienen» y «haz» por «has». C conserva «casado» y omite la tilde del pronombre «él». D mantiene «Tú», «las luces que ilumina» y «haz».',
        retroalimentacion: 'Revisa si los verbos concuerdan con sus sujetos y si los sustantivos concuerdan con las palabras que los acompañan. Estas relaciones ayudan a que el texto sea gramaticalmente correcto.'
    },
    'CE-A01': {
        nombre: 'Un poema con palabras de doble sentido', nivel: 'Avanzado', maximo: 10, correcta: 2, familia: 2,
        enunciado: '¿Cuál opción completa correctamente el fragmento?',
        opciones: ['A. quiteme / más / por que.', 'B. quitemen / mas / porqué.', 'C. quíteme / más / porque.', 'D. quítemen / mas / por qué.'],
        justificacion: 'La opción C escribe «quíteme» con tilde porque es esdrújula, «más» con tilde porque expresa cantidad y «porque» junto y sin tilde como conjunción causal: introduce la razón de la pena del hablante poético.',
        distractores: 'A omite la tilde de «quíteme» y separa «porque». B emplea «quitemen», «mas» y el sustantivo «porqué». D emplea «quítemen», «mas» y la forma interrogativa «por qué». Estas formas no encajan en la estructura y el sentido del fragmento.',
        retroalimentacion: 'Lee la oración completa para identificar la intención del texto. Verifica la acentuación de «quíteme», el sentido de cantidad de «más» y la relación causal expresada por «porque».'
    }
};
const FUENTES_CE = {
    'CE-M01': { titulo: 'El poema', lineas: ['«Mi corazón a la ventana mira las estrellas porque la noche me recuerda de ti, pero siempre recuerdo que ‘las ideas verdes incoloras duermen furiosamente’ cuando te veo».'] },
    'CE-B01': { titulo: 'Otro verso del poema', lineas: ['«Tú palabra tienen las luces que ilumina mi camino y las estrellas brillan por ti. Realmente me has casado el corazón y te haz quedado con él».'] },
    'CE-A01': { titulo: 'Vivo sin vivir en mí', lineas: ['«Porque si es dulce el amor,\nno lo es la esperanza larga:\n__ Dios esta carga,\n__ pesada que el acero,\nque muero ___ no muero.»', '(Biblioteca CUN, Teresa o. A., . (2011). Antología: cartas varias. Barcelona)'] }
};
const DIALOGOS_CE = {
    'CE-M01': '¡Por favor, ayúdame! Hoy quiero decirle lo que siento, pero estoy tan nervioso que las palabras se me enredan. He escrito este poema y ahora no sé si expresa lo que llevo en el corazón. ¡No quiero arruinar este momento! ¿Podrías leerlo conmigo?',
    'CE-B01': 'Gracias por seguir ayudándome. Mira este otro verso… Lo he leído tantas veces que ya no sé si las palabras concuerdan. ¿Me ayudas a revisarlo?',
    'CE-A01': 'Acabo de recordar un poema que me gusta mucho de Santa Teresa de Ávila titulado Vivo sin vivir en mí, me gustaría incluir unos versos porque expresan lo que siento, pero con tantos nervios he olvidado algunas palabras. ¡Por favor, ayúdame a completarlos!'
};

function desafioEscritaActual() {
    return { 'ce-medio': 'CE-M01', 'ce-basico': 'CE-B01', 'ce-avanzado': 'CE-A01' }[estadoJuego.escenaActual] || null;
}
function mostrarDialogoAutor(volver) {
    const id = desafioEscritaActual();
    if (!id) return;
    const continuar = volver || (() => estadoJuego.paso === 1 ? avanzarPaso(1, 2) : cerrarModal());
    mostrarModal({
        titulo: 'Autor', imagen: 'assets/ce/personajes/ce_autor_enamorado.png',
        parrafos: [DIALOGOS_CE[id]],
        acciones: [{ texto: volver ? 'Volver a la pregunta' : 'Continuar', accion: continuar }],
        alCerrar: volver || cerrarModal
    });
}
function consultarFuenteCE(id = desafioEscritaActual(), volver) {
    if (!id || id !== desafioEscritaActual() || estadoJuego.paso < 2) return;
    const fuente = FUENTES_CE[id];
    const contenido = document.createElement('article');
    contenido.className = 'aviso-transporte';
    contenido.lang = 'es';
    fuente.lineas.forEach(linea => contenido.append(nodoTexto('p', linea, 'document-text')));
    const continuar = volver || (() => estadoJuego.paso === 2 ? avanzarPaso(2, 3) : cerrarModal());
    mostrarModal({
        titulo: fuente.titulo, contenido,
        acciones: [{ texto: volver ? 'Volver a la pregunta' : 'Continuar', accion: continuar }],
        alCerrar: volver || cerrarModal
    });
}
function mostrarPreguntaCE(id = desafioEscritaActual()) {
    if (!id || id !== desafioEscritaActual() || estadoJuego.paso !== 3 || estadoJuego.resultados[id]) return;
    const desafio = DESAFIOS_CE[id];
    if (!estadoJuego.tiempos[id]) estadoJuego.tiempos[id] = Date.now();
    const pregunta = nodoTexto('p', desafio.enunciado, 'question-text');
    pregunta.lang = 'es';
    mostrarModal({
        titulo: desafio.nombre, contenido: pregunta,
        acciones: [
            ...opcionesParaMostrar(id).map(({ texto, indice }) => ({ texto, accion: () => registrarRespuestaCE(id, indice) })),
            { texto: 'Consultar nuevamente la información', accion: () => consultarFuenteCE(id, () => mostrarPreguntaCE(id)), secundario: true },
            { texto: 'Releer el diálogo del autor', accion: () => mostrarDialogoAutor(() => mostrarPreguntaCE(id)), secundario: true }
        ]
    });
}
function registrarRespuestaCE(id, indice) {
    const desafio = DESAFIOS_CE[id];
    if (!competenciaHabilitada('CE') || !desafio || id !== desafioEscritaActual() || estadoJuego.paso !== 3 || estadoJuego.resultados[id] || !Number.isInteger(indice) || indice < 0 || indice >= desafio.opciones.length) return;
    const correcto = indice === desafio.correcta;
    if (id === 'CE-M01') estadoJuego.rutas.CE = correcto ? 'AVANZADO' : 'BÁSICO';
    const resultado = {
        desafio: id, version: VERSION_CONTENIDO, competencia: 'Comunicación Escrita',
        familia: desafio.familia, nivel: desafio.nivel, escenario: estadoJuego.escenaActual,
        ...datosOpcionesRespuesta(id, indice),
        correcto, puntaje: correcto ? desafio.maximo : 0, maximo: desafio.maximo,
        tiempoSegundos: Math.round((Date.now() - (estadoJuego.tiempos[id] || Date.now())) / 1000),
        orden: Object.keys(estadoJuego.resultados).length + 1,
        rutaAsignada: estadoJuego.rutas.CE, fecha: new Date().toISOString(),
        retroalimentacionVista: false, envio: 'pendiente'
    };
    estadoJuego.resultados[id] = resultado;
    if (id !== 'CE-M01') { estadoJuego.paso = 4; actualizarObjetivo(); }
    guardarProgresoLocal();
    void enviarDatosGS(resultado);
    const continuar = id === 'CE-M01' ? transicionEscrita : cerrarModal;
    mostrarModal({
        titulo: 'Respuesta registrada',
        parrafos: [id === 'CE-M01' ? 'Continúa revisando el poema con su autor.' : 'Acércate a la salida del bus para bajar y caminar el tramo que falta hacia la universidad.'],
        acciones: [{ texto: 'Continuar', accion: continuar }], alCerrar: continuar
    });
}

