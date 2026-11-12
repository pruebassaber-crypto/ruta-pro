'use strict';

function iniciarEscena4() {
    const segundoId = estadoJuego.ruta === 'AVANZADO' ? 'LC-A01' : 'LC-B01';
    if (!ORDEN_COMPETENCIAS.every(codigo => competenciaCompleta(codigo)) || !estadoJuego.resultados['LC-M01'] || !estadoJuego.resultados[segundoId] || estadoJuego.paso !== 3 || ![2, 3].includes(estadoJuego.escenaActual)) return;
    continuarRecorrido('LC');
}
function mostrarPantallaResultados() {
    if (!estadoJuego.finalizado) return;
    cerrarModal();
    estadoJuego.escenaActual = 4;
    estadoJuego.finalizado = true;
    estadoJuego.fin = estadoJuego.fin || new Date().toISOString();
    teclas.clear();
    guardarProgresoLocal();
    document.getElementById('canvas-screen').classList.add('hidden');
    const pantalla = document.getElementById('results-screen');
    pantalla.classList.remove('hidden');
    pantalla.replaceChildren();
    const tarjeta = document.createElement('div');
    tarjeta.className = 'results-card';
    const encabezado = document.createElement('header');
    encabezado.className = 'passport-header';
    const emblema = document.createElement('img');
    emblema.src = 'assets/ui/pasaporte.svg';
    emblema.alt = '';
    emblema.className = 'passport-emblem';
    const presentacion = document.createElement('div');
    presentacion.append(nodoTexto('p', 'RUTA PRO · PASAPORTE DE COMPETENCIAS', 'passport-eyebrow'));
    const titulo = nodoTexto('h1', 'Recorrido completado');
    titulo.tabIndex = -1;
    presentacion.append(titulo, nodoTexto('p', jugadorData.nombre + ', este es el registro de tu aventura.', 'passport-greeting'));
    encabezado.append(emblema, presentacion);
    tarjeta.append(encabezado);
    const resultados = Object.values(estadoJuego.resultados).sort((a, b) => a.orden - b.orden);
    const puntaje = resultados.reduce((suma, resultado) => suma + resultado.puntaje, 0);
    const visitadas = ORDEN_COMPETENCIAS.filter(codigo => competenciaCompleta(codigo));
    const resumen = document.createElement('section');
    resumen.className = 'passport-overview';
    const puntuacion = document.createElement('div');
    puntuacion.className = 'passport-score';
    puntuacion.append(nodoTexto('p', 'PUNTAJE TOTAL', 'passport-eyebrow'), nodoTexto('p', puntaje + ' puntos', 'score'), nodoTexto('p', 'de ' + visitadas.length * 20 + ' puntos posibles', 'passport-caption'));
    const registro = document.createElement('div');
    registro.className = 'passport-record';
    registro.append(nodoTexto('p', visitadas.length + ' competencias exploradas', 'passport-record-title'), nodoTexto('p', resultados.length + ' desafíos respondidos · 2 por competencia'), nodoTexto('p', 'Tu puntaje es un punto de partida. Revisa las explicaciones para reconocer qué puedes fortalecer.', 'passport-caption'));
    resumen.append(puntuacion, registro);
    tarjeta.append(resumen, nodoTexto('h2', 'Las paradas de tu recorrido', 'passport-section-title'), nodoTexto('p', 'Abre cada tarjeta para revisar tus dos desafíos.', 'passport-caption'));
    const competencias = document.createElement('div');
    competencias.className = 'competency-grid';
    visitadas.forEach((codigo, indice) => {
        const respuestas = resultados.filter(r => r.desafio.startsWith(codigo + '-'));
        const subtotal = respuestas.reduce((suma, r) => suma + r.puntaje, 0);
        const panel = document.createElement('article');
        panel.className = 'competency-card';
        panel.id = 'competencia-' + codigo;
        const cabecera = document.createElement('div');
        cabecera.className = 'competency-heading';
        const icono = document.createElement('img');
        icono.src = { RQ:'assets/ui/rq.svg', CC:'assets/ui/cc.svg', CE:'assets/ui/ce.svg', EN:'assets/ui/en.svg', LC:'assets/ui/lc.svg' }[codigo];
        icono.alt = '';
        icono.className = 'competency-icon';
        const textos = document.createElement('div');
        textos.append(nodoTexto('p', 'PARADA ' + String(indice + 1).padStart(2, '0'), 'passport-eyebrow'), nodoTexto('h3', NOMBRES_COMPETENCIAS[codigo]));
        cabecera.append(icono, textos);
        const datos = document.createElement('div');
        datos.className = 'competency-data';
        datos.append(nodoTexto('p', subtotal + ' puntos', 'competency-score'), nodoTexto('p', 'Ruta ' + (estadoJuego.rutas[codigo] === 'AVANZADO' ? 'avanzada' : 'básica'), 'route-stamp'));
        const feedback = document.createElement('details');
        feedback.className = 'competency-feedback';
        feedback.append(nodoTexto('summary', 'Revisar mi retroalimentación'));
        respuestas.forEach(resultado => feedback.append(crearBloqueRetroalimentacion(resultado)));
        panel.append(cabecera, datos, feedback);
        competencias.append(panel);
    });
    tarjeta.append(competencias);
    const tabla = document.createElement('table');
    tabla.className = 'pixel-table';
    const cabecera = document.createElement('thead');
    const filaCabecera = document.createElement('tr');
    ['Competencia', 'Desafío', 'Nivel', 'Resultado', 'Puntos'].forEach(texto => {
        const celda = nodoTexto('th', texto); celda.scope = 'col'; filaCabecera.append(celda);
    });
    cabecera.append(filaCabecera);
    const cuerpo = document.createElement('tbody');
    resultados.forEach(resultado => {
        const fila = document.createElement('tr');
        [resultado.competencia, obtenerDesafio(resultado.desafio).nombre, resultado.nivel, resultado.correcto ? 'Correcto' : 'Incorrecto', String(resultado.puntaje)].forEach(texto => fila.append(nodoTexto('td', texto)));
        cuerpo.append(fila);
    });
    tabla.append(cabecera, cuerpo);
    const contenedorTabla = document.createElement('div');
    contenedorTabla.className = 'table-wrapper';
    contenedorTabla.append(tabla);
    const detalle = document.createElement('details');
    detalle.className = 'answer-details';
    detalle.append(nodoTexto('summary', 'Ver detalle de respuestas'), contenedorTabla);
    tarjeta.append(detalle);
    const estado = nodoTexto('p', '');
    estado.id = 'save-status';
    estado.setAttribute('role', 'status');
    tarjeta.append(estado);
    pantalla.append(tarjeta);
    actualizarEstadoGuardado();
    titulo.focus();
}
function actualizarEstadoGuardado() {
    const estado = document.getElementById('save-status');
    if (!estado) return;
    const resultados = Object.values(estadoJuego.resultados);
    let mensaje = estadoJuego.guardadoLocal ? 'Tus resultados están guardados en este navegador.' : 'No fue posible guardar los resultados en este navegador.';
    if (resultados.some(resultado => resultado.envio === 'enviando')) mensaje += ' Envío en curso.';
    else if (resultados.some(resultado => resultado.envio === 'pendiente')) mensaje += ' El envío a la hoja está pendiente.';
    else if (resultados.some(resultado => resultado.envio === 'enviado_sin_confirmar')) mensaje += ' El envío se realizó, pero su recepción no pudo confirmarse.';
    estado.textContent = mensaje;
}
function crearBloqueRetroalimentacion(resultado) {
        const desafio = obtenerDesafio(resultado.desafio);
        const bloque = document.createElement('details');
        bloque.className = 'challenge-feedback';
        bloque.append(nodoTexto('summary', desafio.nivel + ' · ' + desafio.nombre));
        bloque.append(nodoTexto('p', (resultado.correcto ? 'Respuesta correcta' : 'Respuesta por fortalecer') + ' · ' + resultado.puntaje + ' puntos', 'feedback-outcome'));
        if (resultado.desafio.startsWith('RQ-')) {
            bloque.append(nodoTexto('p', DIALOGOS_RQ[resultado.desafio]));
            FUENTES_RQ[resultado.desafio].lineas.forEach(linea => bloque.append(nodoTexto('p', linea)));
            if (resultado.desafio === 'RQ-A01') bloque.append(nodoTexto('p', AFIRMACION_VIGILANTE_RQ));
        }
        if (resultado.desafio.startsWith('CE-')) FUENTES_CE[resultado.desafio].lineas.forEach(linea => bloque.append(nodoTexto('p', linea)));
        bloque.append(
            nodoTexto('p', desafio.enunciado),
            nodoTexto('p', 'Tu respuesta: ' + resultado.respuesta),
            nodoTexto('p', 'Respuesta correcta: ' + resultado.clave),
            nodoTexto('p', 'Justificación: ' + letrasRetroalimentacion(resultado, desafio.justificacion)),
            nodoTexto('p', 'Distractores: ' + letrasRetroalimentacion(resultado, desafio.distractores))
        );
        bloque.addEventListener('toggle', () => {
            if (bloque.open) {
                resultado.retroalimentacionVista = true;
                guardarProgresoLocal();
                actualizarEstadoGuardado();
            }
        });
        return bloque;
}

