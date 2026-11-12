'use strict';

// Transcripción de las fichas 1, 2 y 3. Se conservan los identificadores originales.
// La ficha 2 repite la letra B en la tercera alternativa: se conserva el texto
// y se diferencia internamente mediante el índice de opción (0, 1, 2, 3).
const CORREO_LC = {
    remitente: 'Coordinación Académica CUN',
    asunto: 'Reorganización de espacio docente - Asignatura de Razonamiento',
    texto: '"Se informa a la comunidad estudiantil que el docente a cargo del grupo A no estará presente en el aula 402 durante la primera fracción de la clase por atender una reunión departamental, salvo que el docente titular determine lo contrario a través del aula virtual. Por consiguiente, el desarrollo regular de la sesión académica se trasladará al aula 501 una vez finalizado dicho compromiso."'
};
const MENSAJE_SOFI = '"Parce, suba ya. La reunión del departamento se canceló a última hora, así que el profe no esperó a la segunda hora y nos abrió directamente el aula 501 para empezar la llamada a lista y las exposiciones."';
// Guion mostrado al interactuar con la mesa, separado del contexto de la ficha.
const PENSAMIENTO_CAFETERIA = 'Todavía no he confirmado en qué salón está el profesor. Llevo diez minutos esperando con un tinto y una empanada. Me acaba de llegar un mensaje de Sofi al grupo del curso; voy a revisarlo.';
const DIALOGO_DOCENTE = [
    '"Hola chicos, buenas tardes. Lamento mucho la confusión con el correo de hoy, pero me alegra ver que todos lograron resolver la duda y llegaron bien al salón. Ya que esta es nuestra clase de Historia, aprovechemos exactamente esto que acaba de pasar.',
    'Lo que vivimos hoy con el correo no es nuevo: a lo largo de la historia, la forma en que se redacta un mensaje ha cambiado el rumbo de muchos eventos. Piensen, por ejemplo, en la I Guerra Mundial con el famoso Telegrama Zimmermann (1917). Fue un mensaje oficial lleno de frases condicionales y vacíos de información que buscaba influir en una decisión política, pero cuyo impacto real dependió totalmente de cómo lo interpretaron y verificaron quienes lo recibieron."'
];
const DESAFIOS_LC = {
    'LC-M01': {
        nombre: 'El correo ambiguo', nivel: 'Medio', maximo: 10, correcta: 0, familia: 1,
        enunciado: '¿Cuál es la causa principal que genera ambigüedad e imposibilita determinar con certeza la ubicación inmediata del docente?',
        opciones: [
            'A. La subordinada condicional ("salvo que el docente titular determine lo contrario...") anula la certeza de la primera afirmación, mientras que la falta de precisión temporal del conector consecutivo genera un vacío semántico sobre el momento exacto de inicio en el aula 501.',
            'B. El uso del conector de consecuencia ("Por consiguiente...") establece una contradicción sintáctica directa con el verbo en futuro pasivo, lo que invalida la posibilidad de que la clase se dicte en cualquier espacio físico de la universidad.',
            'C. El núcleo del sujeto ("el docente a cargo") entra en incoherencia semántica con el complemento circunstancial de lugar, insinuando que la reunión departamental se llevará a cabo dentro del aula 402.',
            'D. La oración principal carece de un verbo conjugado en modo indicativo, lo que convierte la instrucción en una proposición hipotética sobre el traslado al aula 501 sin validez normativa.'
        ],
        justificacion: 'La afirmación principal indica que el docente no estará en el aula 402. Sin embargo, la subordinada introducida por el conector de salvedad/excepción ("salvo que el docente titular determine lo contrario...") invalida de inmediato la certeza de la primera afirmación. Como el estudiante desconoce si el docente determinó o no lo contrario en el aula virtual, no puede asegurar que el aula 402 esté vacía.',
        distractores: 'Las opciones B, C y D son incorrectas porque malinterpretan la gramática del texto: la B inventa una contradicción sintáctica inexistente con el conector consecutivo; la C deduce erróneamente que la reunión ocurre dentro del aula 402 cuando la causa explica justamente la ausencia del profesor; y la D comete un error categórico al ignorar que el texto sí usa verbos en modo indicativo ("se informa", "se trasladará").',
        retroalimentacion: '«Para interpretar un texto, identifica las condiciones que modifican una afirmación y revisa si las referencias temporales permiten establecer cuándo ocurrirá un hecho. No confundas una consecuencia probable con una instrucción completamente confirmada».'
    },
    'LC-B01': {
        nombre: '¿Qué pasó con la clase?', nivel: 'Básico', maximo: 5, correcta: 1, familia: 2,
        contexto: 'El estudiante, al no tener certeza, decide bajar a la cafetería a esperar mientras se come una empanada y un tinto. A los 10 minutos, su celular suena con un mensaje de Sofi en el grupo del curso:',
        enunciado: 'Desde una comprensión estrictamente local y explícita del mensaje, ¿cuál es el hecho puntual que desencadenó que la clase iniciara de inmediato en el aula 501?',
        opciones: [
            'A. La decisión previa de la Coordinación Académica de asignar el aula 501 como espacio definitivo desde el inicio de la jornada.',
            'B. La cancelación no prevista de la reunión departamental, lo que modificó la condición temporal del docente para habilitar el aula 501.',
            'B. El llamado a lista urgente por parte del docente a los estudiantes que se encontraban en la cafetería.',
            'D. El cumplimiento del horario de la segunda fracción de la clase estipulado en el correo institucional original.'
        ],
        justificacion: 'La opción B es correcta porque responde a una lectura literal e inferencial directa del mensaje de WhatsApp. Sofi utiliza el conector de causa-efecto "así que" para vincular explícitamente dos hechos: la causa ("La reunión del departamento se canceló a última hora") y la consecuencia inmediata ("el profe no esperó... y nos abrió directamente el aula 501"). Por tanto, es la suspensión imprevista de dicha reunión lo que elimina la restricción de tiempo y desencadena el inicio temprano de la clase en el aula 501.',
        distractores: 'Las opciones A, C y D son incorrectas porque distorsionan la información explícita del mensaje: la A es falsa porque la Coordinación nunca asignó el aula 501 desde el inicio de la jornada, sino que dependía de la reunión previa; la C confunde los hechos, ya que el llamado a lista fue una consecuencia en el aula 501 y no una acción dirigida a la cafetería; y la D contradice el texto, pues el mensaje aclara explícitamente que la clase inició antes de lo estipulado precisamente porque el docente "no esperó a la segunda hora".',
        retroalimentacion: '«La comprensión literal exige identificar lo que el texto comunica de manera explícita. Evita convertir una ausencia temporal en una cancelación o añadir detalles que no aparecen en el mensaje».'
    },
    'LC-A01': {
        nombre: 'Llegada clase', nivel: 'Avanzado', maximo: 10, correcta: 1, familia: 1,
        contexto: 'El estudiante, tras verificar el aula virtual en su celular, confirma que el profesor habilitó el salón a tiempo y sube directo al aula 501. Al ingresar, se acomoda en su puesto mientras el profesor de Historia saluda al grupo:',
        enunciado: 'Al comparar la confusión del correo de la CUN con el caso histórico del Telegrama Zimmermann y el manejo de la información, ¿cuál es el punto de encuentro que demuestra la importancia de la lectura analítica?',
        opciones: [
            'A.En ambos escenarios, el emisor redactó el mensaje en un idioma técnico ilegible para evitar que los destinatarios comprendieran la instrucción.',
            'B. En ambos casos, la presencia de condicionales y vacíos de información exigía al receptor verificar fuentes adicionales para no tomar decisiones basadas en una falsa certeza.',
            'C. El telegrama y el correo institucional demuestran que las comunicaciones oficiales siempre buscan engañar deliberadamente a la comunidad para generar caos.',
            'D. La efectividad de ambos mensajes dependía exclusivamente de que los receptores ignoraran las instrucciones escritas y actuaran por intuición.'
        ],
        justificacion: 'La opción B es correcta porque establece una analogía analítica válida entre ambos hechos: tanto en el correo académico como en el documento histórico, la estructura sintáctica (condicionales e imprecisiones) generaba un margen de interpretación riesgoso. La lectura crítica exige contrastar la información con fuentes secundarias o de verificación antes de actuar.',
        distractores: 'Las opciones A, C y D son incorrectas por errores de interpretación: la A es una falsedad explícita, pues el correo estaba en español normativo y no en un código ilegible; la C cae en una generalización falaz al asumir intencionalidad maliciosa en todo comunicado oficial; y la D incurre en una contradicción, ya que actuar por intuición es lo opuesto a la lectura crítica.',
        retroalimentacion: '«Una conclusión crítica debe respetar la evidencia del texto. Cuando una afirmación está condicionada o contiene vacíos temporales, no debe tratarse como una certeza absoluta. Distingue siempre entre lo que el mensaje anuncia explícitamente, lo que permite inferir con rigor y lo que requiere verificación externa antes de tomar una decisión».'
    }
};
function consultarCorreo(volver = cerrarModal) {
    const documento = document.createElement('div');
    documento.className = 'document-text';
    documento.append(
        nodoTexto('p', 'De: ' + CORREO_LC.remitente),
        nodoTexto('p', 'Asunto: ' + CORREO_LC.asunto),
        nodoTexto('p', CORREO_LC.texto)
    );
    mostrarModal({
        titulo: 'Correo institucional', imagen: 'assets/celular.png', contenido: documento,
        acciones: [{ texto: 'Continuar', accion: volver }], alCerrar: volver
    });
}
function mostrarPreguntaLC(id) {
    const desafio = DESAFIOS_LC[id];
    const esperado = estadoJuego.escenaActual === 1 ? 'LC-M01' : estadoJuego.escenaActual === 2 ? 'LC-A01' : estadoJuego.escenaActual === 3 ? 'LC-B01' : null;
    if (id !== esperado || ![2, 3].includes(estadoJuego.paso)) return;
    if (estadoJuego.resultados[id]) { avisar('Tu respuesta ya quedó registrada. Dirígete a la salida.'); return; }
    if (!estadoJuego.tiempos[id]) estadoJuego.tiempos[id] = Date.now();
    const pregunta = nodoTexto('p', desafio.enunciado, 'question-text');
    const acciones = opcionesParaMostrar(id).map(({ texto, indice }) => ({ texto, accion: () => registrarRespuestaLC(id, indice) }));
    if (id === 'LC-B01') acciones.push({ texto: 'Volver a leer el WhatsApp de Sofi', accion: () => mostrarMensajeSofi(() => mostrarPreguntaLC(id)), secundario: true });
    if (id === 'LC-A01') acciones.push({ texto: 'Volver a leer el diálogo del docente', accion: () => mostrarDialogoDocente(() => mostrarPreguntaLC(id)), secundario: true });
    acciones.push({ texto: 'Consultar nuevamente el correo', accion: () => consultarCorreo(() => mostrarPreguntaLC(id)), secundario: true });
    mostrarModal({
        titulo: desafio.nombre,
        imagen: id === 'LC-A01' ? 'assets/lc_proyector.png' : 'assets/lc_celular_sofi.png',
        contenido: pregunta, acciones
    });
}
function registrarRespuestaLC(id, indice) {
    const desafio = DESAFIOS_LC[id];
    const esperado = estadoJuego.escenaActual === 1 ? 'LC-M01' : estadoJuego.escenaActual === 2 ? 'LC-A01' : estadoJuego.escenaActual === 3 ? 'LC-B01' : null;
    if (!competenciaHabilitada('LC') || esperado !== id || estadoJuego.resultados[id] || !Number.isInteger(indice) || indice < 0 || indice >= desafio.opciones.length) return;
    if ((id === 'LC-M01' && estadoJuego.paso !== 3) || (id !== 'LC-M01' && estadoJuego.paso !== 2)) return;
    const correcto = indice === desafio.correcta;
    if (id === 'LC-M01') {
        estadoJuego.ruta = correcto ? 'AVANZADO' : 'BÁSICO';
        estadoJuego.rutas.LC = estadoJuego.ruta;
    }
    const resultado = {
        desafio: id, version: VERSION_CONTENIDO, competencia: 'Lectura Crítica',
        familia: desafio.familia, nivel: desafio.nivel, escenario: estadoJuego.escenaActual,
        ...datosOpcionesRespuesta(id, indice),
        correcto, puntaje: correcto ? desafio.maximo : 0, maximo: desafio.maximo,
        tiempoSegundos: Math.round((Date.now() - (estadoJuego.tiempos[id] || Date.now())) / 1000),
        orden: Object.keys(estadoJuego.resultados).length + 1,
        rutaAsignada: estadoJuego.ruta, fecha: new Date().toISOString(),
        retroalimentacionVista: false, envio: 'pendiente'
    };
    estadoJuego.resultados[id] = resultado;
    if (id !== 'LC-M01') {
        estadoJuego.paso = 3;
        actualizarObjetivo();
    }
    guardarProgresoLocal();
    void enviarDatosGS(resultado);
    // Acierto, puntaje y explicación solo aparecen al finalizar la competencia.
    const continuar = id === 'LC-M01' ? transicionSiguienteEscena : cerrarModal;
    mostrarModal({
        titulo: 'Respuesta registrada',
        parrafos: [id === 'LC-M01' ? 'Continúa tu recorrido por la universidad.' : 'Ya puedes dirigirte a la puerta de salida para ver tus resultados.'],
        acciones: [{ texto: 'Continuar', accion: continuar }], alCerrar: continuar
    });
}

