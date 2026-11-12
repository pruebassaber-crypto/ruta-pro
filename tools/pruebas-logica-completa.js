'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
module.exports = function validar(crearContexto) {
    const teclado = crearContexto();
    vm.runInContext(`
        estadoJuego.iniciado = true;
        let activaciones = 0;
        mostrarModal({titulo:'Teclado', acciones:[
            {texto:'Primera', accion:() => activaciones++},
            {texto:'Segunda', accion:() => activaciones += 10}
        ]});
        const pulsar = (code, repeat = false) => eventosVentana.keydown.forEach(fn => fn({code, key:code, repeat, preventDefault(){}}));
        pulsar('Enter');
        if (activaciones !== 0 || document.activeElement.textContent !== 'Primera') throw new Error('Enter debe enfocar sin responder');
        pulsar('ArrowDown'); pulsar('Enter', true);
        if (activaciones !== 0) throw new Error('Enter sostenido repite respuesta');
        pulsar('Enter');
        if (activaciones !== 10) throw new Error('Enter no activa la opción enfocada');
        pulsar('ArrowUp'); pulsar('Enter');
        if (activaciones !== 11) throw new Error('Flecha arriba no selecciona');
        document.querySelectorAll('#modal-actions button')[1].click();
        if (activaciones !== 21) throw new Error('Click o toque dejó de funcionar');
        cerrarModal();
        pulsar('ArrowRight');
        if (!teclas.has('ArrowRight')) throw new Error('Movimiento afectado');
    `, teclado);
    console.log('OK: navegación de botones con flechas y Enter, repetición bloqueada y click conservado.');
    const helper = fs.readFileSync(path.join(__dirname, 'pruebas-recorrido.js'), 'utf8');
    function recorrer(seleccion = {}) {
        const c = crearContexto();
        vm.runInContext(helper, c);
        const resultado = vm.runInContext('pruebasRuta(true,true,true,true,' + JSON.stringify(seleccion) + ')', c);
        return { c, resultado, snapshot: JSON.parse(vm.runInContext('localStorage.getItem(CLAVE_PROGRESO)', c)) };
    }
    // Las 32 combinaciones de ramas x 32 combinaciones de aciertos del segundo ítem.
    const claves = {RQ:0, CC:2, CE:1, EN:1, LC:0};
    const segundas = {RQ:0, CC:2, CE:2, EN:1, LC:1};
    const codigos = Object.keys(claves);
    for (let ramas = 0; ramas < 32; ramas++) for (let finales = 0; finales < 32; finales++) {
        const seleccion = {};
        for (const [i,codigo] of codigos.entries()) {
            const acierto = Boolean(ramas & (1 << i));
            const claveSegunda = codigo === 'CE' && !acierto ? 0 : segundas[codigo];
            seleccion[codigo] = [acierto ? claves[codigo] : (claves[codigo] + 1) % (codigo === 'EN' ? 3 : 4), finales & (1 << i) ? claveSegunda : (claveSegunda + 1) % (codigo === 'EN' ? 3 : 4)];
        }
        recorrer(seleccion);
    }
    console.log('OK: 1024 recorridos completos, 32 combinaciones de rutas, 10 respuestas por sesión y subtotales independientes.');
    for (const codigo of codigos) {
        const cantidad = codigo === 'CE' ? 5 : codigo === 'EN' ? 3 : 4;
        const segunda = codigo === 'EN' ? 3 : 4;
        for (let a = 0; a < cantidad; a++) for (let b = 0; b < segunda; b++) recorrer({[codigo]:[a,b]});
    }
    console.log('OK: todas las alternativas de las cinco competencias conservan la progresión, relectura y puntuación.');
    const completa = recorrer();
    assert.equal(completa.resultado.total,100);
    vm.runInContext(`
        if (!musicaAventura || !musicaAventura.loop || musicaAventura.volume > 0.3 || musicaAventura.reproducciones !== 1) throw new Error('Música no continua o demasiado alta');
        document.getElementById('music-toggle').click();
        if (!musicaAventura.muted) throw new Error('No silencia música');
        document.getElementById('music-toggle').click();
        if (musicaAventura.muted) throw new Error('No reactiva música');
        if (document.getElementById('results-screen').textContent.includes('Descargar') || typeof descargarResultados !== 'undefined') throw new Error('Descarga JSON no retirada');
        for (const codigo of ORDEN_COMPETENCIAS) for (const id of idsCompetencia(codigo)) {
            const item = obtenerDesafio(id), resultado = estadoJuego.resultados[id];
            const letraOriginal = String.fromCharCode(65 + item.correcta);
            const letraPresentada = resultado.clave[0];
            if (letrasRetroalimentacion(resultado,'La opción ' + letraOriginal + ' es correcta.') !== 'La opción ' + letraPresentada + ' es correcta.') throw new Error('Justificación usa letra antigua');
            if (letrasRetroalimentacion(resultado,'Route A y Route B') !== 'Route A y Route B') throw new Error('Nombres de rutas alterados');
        }
    `,completa.c);
    const archivoMusica = fs.readFileSync(path.join(__dirname,'..','assets','audio','pokemon-relaxing-mix.mp3'));
    assert(archivoMusica.length > 0);
    assert(archivoMusica.toString('ascii',0,3) === 'ID3' || (archivoMusica[0] === 255 && (archivoMusica[1] & 224) === 224), 'Cabecera MP3 inválida');
    assert.equal(vm.runInContext('musicaAventura.src', completa.c), 'assets/audio/pokemon-relaxing-mix.mp3');
    assert.equal(vm.runInContext('musicaAventura.loop', completa.c), true);
    console.log('OK: orden estable al consultar, claves y letras adaptadas, música continua con silencio y descarga JSON retirada.');
    const simultaneaA = crearContexto(), simultaneaB = crearContexto();
    const ordenA = vm.runInContext("crypto.getRandomValues = a => {a[0]=0;return a;}; ordenOpcionesDesafio('RQ-M01').join(',')",simultaneaA);
    const ordenB = vm.runInContext("crypto.getRandomValues = a => {a[0]=1;return a;}; ordenOpcionesDesafio('RQ-M01').join(',')",simultaneaB);
    assert.notEqual(ordenA,ordenB);
    vm.runInContext(`
        const bloque = document.getElementById('competencia-RQ').querySelector('.challenge-feedback');
        bloque.open = true;
        bloque.events.toggle.forEach(fn => fn());
        if (!estadoJuego.resultados['RQ-M01'].retroalimentacionVista || estadoJuego.resultados['RQ-A01'].retroalimentacionVista) throw new Error('Lectura de retroalimentación se registra incorrectamente');
    `,completa.c);
    const nuevaVisita = crearContexto(JSON.stringify(completa.snapshot));
    assert.equal(vm.runInContext("document.getElementById('last-results')",nuevaVisita),null);
    assert.equal(vm.runInContext('estadoJuego.iniciado',nuevaVisita),false);
    assert.equal(vm.runInContext('Object.keys(estadoJuego.resultados).length',nuevaVisita),0);
    assert.equal(vm.runInContext("document.getElementById('results-screen').classList.contains('hidden')",nuevaVisita),true);
    console.log('OK: guardado local y consulta actual conservados; sin acceso a resultados de partidas anteriores desde el inicio.');
    const invalida = crearContexto();
    vm.runInContext("document.getElementById('student-name').value='Prueba'; document.getElementById('student-id').value='1'; document.getElementById('student-email').value='invalido'; iniciarJuego();",invalida);
    assert.equal(vm.runInContext('estadoJuego.iniciado',invalida),false);
    vm.runInContext(`
        iniciarEscena0();
        for (const [cx,py] of [[-1000,-1000],[10000,10000],[-1000,10000],[10000,-1000]]) {
            posicionarJugador(cx,py);
            const pies = piesJugador();
            if (jugador2D.x < 0 || jugador2D.y < 0 || jugador2D.x + jugador2D.width > canvas.width || pies.y > canvas.height - 16 || pies.y < 340) throw new Error('Límites incorrectos');
        }
        posicionarJugador(500,480);
        const antes = JSON.stringify(piesJugador());
        mostrarModal({titulo:'Matemáticas',clase:'rq-modal'}); teclas.add('ArrowRight'); actualizarPosicion(1);
        if (JSON.stringify(piesJugador()) !== antes) throw new Error('Se mueve con modal');
        mostrarModal({titulo:'Otra competencia'});
        if (document.getElementById('interaction-modal').classList.contains('rq-modal')) throw new Error('Estilo matemático persiste');
        const llamadas = []; ctx.drawImage = (...args) => llamadas.push(args);
        const img = {complete:true,naturalWidth:100};
        dibujarObjeto({imagen:img,x:1,y:2,w:3,h:4,recorte:[5,6,7,8]});
        dibujarObjeto({imagen:img,x:1,y:2,w:3,h:4});
        if (llamadas[0].slice(1).join(',') !== '5,6,7,8,1,2,3,4' || llamadas[1].length !== 5) throw new Error('Encuadre incorrecto');
    `,invalida);
    console.log('OK: validación de entrada, límites, pausa, encuadre de PNG y estilos aislados de matemáticas.');
};
