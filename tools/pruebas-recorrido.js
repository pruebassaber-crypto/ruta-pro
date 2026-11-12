'use strict';

// Compartido por las pruebas con DOM mínimo y las opcionales de navegador.
function pruebasRuta(medioCorrecto = true, segundoCorrecto = true, ciudadanoCorrecto = true, ciudadanoSegundoCorrecto = true, seleccion = {}) {
    let comprobaciones = 0;
    const check = (condicion, mensaje) => { if (!condicion) throw new Error(mensaje); comprobaciones++; };
    function accion(texto) {
        const boton = [...document.querySelectorAll('#modal-actions button')].find(b => b.textContent === texto);
        check(Boolean(boton), 'Falta botón: ' + texto); boton.click();
    }
    function acercarse(id) {
        const obj = objetosEscena.find(o => o.id === id);
        check(Boolean(obj), 'Falta objeto ' + id);
        posicionarJugador(obj.x + obj.w / 2, obj.y + obj.h);
        check(distanciaObjeto(obj) <= (obj.radio ?? jugador2D.radioInteraccion), 'Objeto inaccesible ' + id);
        verificarInteraccionCercana();
    }
    document.getElementById('student-name').value = '  Estudiante <prueba>  ';
    document.getElementById('student-id').value = '  T001  ';
    document.getElementById('student-email').value = 'PRUEBA@CUN.EDU.CO';
    iniciarJuego();
    const sesion = estadoJuego.sesionId;
    iniciarJuego();
    check(estadoJuego.sesionId === sesion && jugadorData.id === 'T001' && jugadorData.correo === 'prueba@cun.edu.co', 'Inicio e identidad');
    // Las entradas posteriores no pueden saltar competencias.
    iniciarCiudadanasMedio(); iniciarEscritaMedio(); iniciarInglesMedio(); iniciarEscena1();
    check(estadoJuego.escenaActual === 0, 'Permite saltar el tutorial o las competencias anteriores');
    acercarse(1); accion('Continuar'); acercarse(2); accion('Continuar');
    acercarse(3); accion('B. Leer con atención, analizar la situación y decidir.'); accion('Continuar');
    acercarse(4); accion('Continuar'); acercarse(5); accion('Salir de casa');
    const configuraciones = [
        { codigo:'RQ', escena:'rq-medio', actual:desafioCuantitativoActual, registrar:registrarRespuestaRQ, finalizar:finalizarCuantitativo, salida:() => pasoPreguntaRQ() + 1 },
        { codigo:'CC', escena:'cc-medio', actual:desafioCiudadanoActual, registrar:registrarRespuestaCC, finalizar:finalizarCiudadanas, salida:3 },
        { codigo:'CE', escena:'ce-medio', actual:desafioEscritaActual, registrar:registrarRespuestaCE, finalizar:finalizarEscrita, salida:4 },
        { codigo:'EN', escena:'en-medio', actual:desafioInglesActual, registrar:registrarRespuestaEN, finalizar:finalizarIngles, salida:4 },
        { codigo:'LC', escena:1, actual:() => estadoJuego.escenaActual === 1 ? 'LC-M01' : estadoJuego.escenaActual === 2 ? 'LC-A01' : 'LC-B01', registrar:registrarRespuestaLC, finalizar:iniciarEscena4, salida:3 }
    ];
    let total = 0;
    const subtotales = {};
    for (const [indice, config] of configuraciones.entries()) {
        const codigo = config.codigo;
        check(estadoJuego.escenaActual === config.escena, 'Orden incorrecto antes de ' + codigo);
        check(!estadoJuego.finalizado && estadoJuego.sesionId === sesion, 'Finalización o sesión incorrecta');
        subtotales[codigo] = 0;
        for (let ronda = 0; ronda < 2; ronda++) {
            const escena = estadoJuego.escenaActual;
            config.finalizar();
            check(estadoJuego.escenaActual === escena && !estadoJuego.finalizado, 'Salida prematura en ' + codigo);
            const id = config.actual(), item = obtenerDesafio(id);
            config.registrar(id, item.correcta);
            check(!estadoJuego.resultados[id], 'Respuesta sin leer en ' + id);
            if (codigo === 'LC') {
                acercarse(1); accion(ronda === 0 ? 'Ir por el celular' : id === 'LC-A01' ? 'Ir al proyector' : 'Revisar el celular');
                acercarse(2);
                if (ronda === 0) { accion('Continuar'); acercarse(3); }
                else if (id === 'LC-B01') accion('Continuar a la pregunta');
            } else {
                const cantidadFuentes = codigo === 'CC' && ronda === 1 ? 1 : 2;
                for (let paso = 1; paso <= cantidadFuentes; paso++) {
                    acercarse(paso);
                    if (id === 'RQ-M01' && paso === 1) {
                        check(document.getElementById('modal-title').textContent === '¡Perrito perdido!', 'Anuncio inicial incorrecto');
                        check(!/104|triple|78|26/.test(document.getElementById('modal-content').textContent), 'Anuncio da pistas');
                    }
                    accion('Continuar');
                }
                if (id === 'RQ-A01') {
                    mostrarPreguntaRQ();
                    check(!estadoJuego.modalAbierto, 'Pregunta disponible antes de la afirmación');
                    config.registrar(id, item.correcta);
                    check(!estadoJuego.resultados[id], 'Respuesta disponible antes de la afirmación');
                    acercarse(3);
                    check(document.getElementById('modal-content').textContent === AFIRMACION_VIGILANTE_RQ, 'Segunda interacción del vigilante incorrecta');
                    accion('Continuar');
                    acercarse(4);
                } else acercarse(codigo === 'CC' && ronda === 1 ? 2 : 3);
            }
            const botones = [...document.querySelectorAll('#modal-actions button')];
            const presentadas = opcionesParaMostrar(id);
            presentadas.forEach((opcion, n) => check(botones[n].textContent === opcion.texto, 'Alternativa incompleta ' + id));
            check(new Set(presentadas.map(o => o.indice)).size === item.opciones.length, 'Opciones repetidas o faltantes');
            if (['RQ','CE','EN','CC'].includes(codigo)) check(document.getElementById('modal-content').textContent === item.enunciado, 'Pregunta contiene repetición ' + id);
            if (id === 'RQ-B01') {
                check(document.querySelector('.rq-numerador').textContent === 'x' && document.querySelector('.rq-denominador').textContent === '2', 'Fracción incorrecta');
            }
            const reloj = estadoJuego.tiempos[id];
            const consulta = botones.slice(item.opciones.length).find(b => /Consultar|Releer|Volver a leer/.test(b.textContent));
            if (consulta) {
                consulta.click();
                const volver = [...document.querySelectorAll('#modal-actions button')].find(b => /Volver a la pregunta|Continuar/.test(b.textContent));
                check(Boolean(volver), 'Consulta no regresa a la pregunta'); volver.click();
                check(estadoJuego.tiempos[id] === reloj, 'Consulta reinicia tiempo');
                check([...document.querySelectorAll('#modal-actions button')].slice(0,item.opciones.length).map(b => b.textContent).join('|') === presentadas.map(o => o.texto).join('|'), 'Consultar reordena las opciones');
            }
            if (id === 'RQ-A01') {
                accion('Releer la afirmación del vigilante');
                check(document.getElementById('modal-content').textContent === AFIRMACION_VIGILANTE_RQ, 'No relee la afirmación');
                accion('Volver a la pregunta');
                check(estadoJuego.tiempos[id] === reloj, 'Releer afirmación reinicia tiempo');
            }
            for (const invalido of [-1, NaN, item.opciones.length, 0.5]) config.registrar(id, invalido);
            check(!estadoJuego.resultados[id], 'Índice inválido aceptado');
            const correcto = codigo === 'LC' ? (ronda === 0 ? medioCorrecto : segundoCorrecto) : codigo === 'CC' ? (ronda === 0 ? ciudadanoCorrecto : ciudadanoSegundoCorrecto) : true;
            const opcion = seleccion[codigo]?.[ronda] ?? (correcto ? item.correcta : (item.correcta + 1) % item.opciones.length);
            accion(textoOpcionPresentada(id, opcion));
            const resultado = estadoJuego.resultados[id];
            check(Boolean(resultado), 'No registra ' + id);
            const original = JSON.stringify(resultado);
            config.registrar(id, (opcion + 1) % item.opciones.length);
            check(JSON.stringify(resultado) === original, 'Respuesta mutable');
            check(resultado.orden === indice * 2 + ronda + 1, 'Orden de respuesta incorrecto');
            check(resultado.puntaje === (opcion === item.correcta ? item.maximo : 0), 'Puntuación incorrecta');
            check(resultado.respuesta === textoOpcionPresentada(id, opcion) && resultado.clave === textoOpcionPresentada(id,item.correcta), 'Letras de respuesta o clave incorrectas');
            check(resultado.ordenOpciones.join(',') === estadoJuego.ordenOpciones[id].join(','), 'No registra el orden mostrado');
            check(document.getElementById('modal-title').textContent === 'Respuesta registrada' && !estadoJuego.finalizado, 'Evaluación o cierre anticipado');
            total += resultado.puntaje; subtotales[codigo] += resultado.puntaje;
            accion('Continuar');
        }
        check(competenciaCompleta(codigo), 'Competencia incompleta ' + codigo);
        acercarse(typeof config.salida === 'function' ? config.salida() : config.salida);
        check(Object.keys(estadoJuego.resultados).length === (indice + 1) * 2, 'Respuestas perdidas entre competencias');
        if (codigo !== 'LC') check(!estadoJuego.finalizado && document.getElementById('results-screen').classList.contains('hidden'), 'Resultados intermedios visibles');
    }
    check(estadoJuego.finalizado && estadoJuego.escenaActual === 4, 'No finaliza tras Lectura Crítica');
    check(document.querySelector('.score').textContent === total + ' puntos', 'Total incorrecto');
    for (const codigo of ORDEN_COMPETENCIAS) {
        const tarjeta = document.getElementById('competencia-' + codigo);
        check(Boolean(tarjeta) && tarjeta.textContent.includes(NOMBRES_COMPETENCIAS[codigo]) && tarjeta.querySelector('.competency-score').textContent === subtotales[codigo] + ' puntos', 'Subtotal incorrecto ' + codigo);
        check(tarjeta.querySelectorAll('.challenge-feedback').length === 2, 'Faltan desafíos en tarjeta ' + codigo);
    }
    const orden = Object.values(estadoJuego.resultados).map(r => r.desafio.slice(0,2)).join(',');
    check(orden === 'RQ,RQ,CC,CC,CE,CE,EN,EN,LC,LC', 'Orden completo incorrecto');
    check([...document.querySelectorAll('#results-screen details')].every(detalle => !detalle.open), 'Retroalimentación y tabla deben iniciar plegadas');
    check(document.querySelectorAll('.competency-card').length === 5, 'Faltan tarjetas de competencias');
    check(Object.values(estadoJuego.resultados).every(r => !r.retroalimentacionVista), 'Mostrar tarjetas marca explicaciones como leídas');
    check(!document.querySelector('.result-actions button'), 'Botón redundante de retroalimentación');
    check(document.querySelectorAll('#results-screen .challenge-feedback').length === 10, 'Retroalimentación incompleta');
    for (const resultado of Object.values(estadoJuego.resultados)) check(document.getElementById('results-screen').textContent.includes('Respuesta correcta: ' + resultado.clave), 'Retroalimentación no corresponde a la clave mostrada');
    for (const bloque of document.querySelectorAll('#results-screen .challenge-feedback')) check([...bloque.children].at(-1).textContent.startsWith('Distractores:'), 'Párrafo adicional después de distractores');
    const snapshot = JSON.parse(localStorage.getItem(CLAVE_PROGRESO));
    check(snapshot.finalizado && snapshot.sesionId === sesion && Object.keys(snapshot.resultados).length === 10, 'Guardado incompleto');
    check(Object.values(snapshot.resultados).every(r => r.envio === 'sin_configurar'), 'Envío a URL de ejemplo');
    return { total, subtotales, comprobaciones };
}
