'use strict';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const jugadorData = { nombre: '', id: '', correo: '', avatarSrc: 'assets/jugador_m.png' };
const estadoJuego = window.estadoJuego = {
    iniciado: false, escenaActual: 0, paso: 1, modalAbierto: false,
    resultados: {}, tiempos: {}, ordenOpciones: {}, ruta: null, rutas: { CC: null, LC: null, EN: null, CE: null, RQ: null }, modo: 'recorrido', finalizado: false, sesionId: '',
    guardadoLocal: false, objetivo: ''
};
const fondoImagen = new Image();
// Tamaño unificado para todas las escenas; la navegación se ancla a los pies.
const jugador2D = { x: 430, y: 228, width: 140, height: 252, speed: 260, radioInteraccion: 115, imagen: new Image() };
const limitesExploracion = { margen: 8, piesMin: 340, margenInferior: 16 };
const teclas = new Set();
let objetosEscena = [];
let ultimoFrame = 0;
let cerrarVista = null;
let focoAnterior = null;
let avisoTimer;

function nodoTexto(etiqueta, texto, clase) {
    const nodo = document.createElement(etiqueta);
    nodo.textContent = texto;
    if (clase) nodo.className = clase;
    return nodo;
}
function mostrarModal({ titulo, imagen, parrafos = [], contenido, acciones = [], clase = '', alCerrar = cerrarModal }) {
    if (!estadoJuego.modalAbierto) focoAnterior = document.activeElement;
    estadoJuego.modalAbierto = true;
    teclas.clear();
    cerrarVista = alCerrar;
    document.getElementById('interaction-modal').className = clase;
    document.getElementById('modal-title').textContent = titulo;
    const img = document.getElementById('modal-object-img');
    img.classList.toggle('hidden', !imagen);
    if (imagen) img.src = imagen;
    else img.removeAttribute('src');
    const cuerpo = document.getElementById('modal-content');
    cuerpo.replaceChildren();
    parrafos.forEach(texto => cuerpo.append(nodoTexto('p', texto)));
    if (contenido) cuerpo.append(contenido);
    const botones = document.getElementById('modal-actions');
    botones.replaceChildren();
    acciones.forEach(({ texto, contenido: contenidoBoton, accion, secundario = false, clase: claseBoton }) => {
        const boton = nodoTexto('button', texto, secundario ? 'secondary-btn' : 'pixel-btn');
        if (claseBoton) boton.classList.add(claseBoton);
        if (contenidoBoton) {
            boton.replaceChildren(contenidoBoton);
            boton.setAttribute('aria-label', texto);
        }
        boton.type = 'button';
        boton.addEventListener('click', accion);
        botones.append(boton);
    });
    document.getElementById('modal-close').textContent = alCerrar === cerrarModal ? 'Volver al escenario' : 'Volver';
    document.getElementById('modal-layer').classList.remove('hidden');
    document.getElementById('modal-scroll').scrollTop = 0;
    document.getElementById('interaction-modal').focus();
}
function cerrarModal() {
    estadoJuego.modalAbierto = false;
    cerrarVista = null;
    document.getElementById('modal-layer').classList.add('hidden');
    teclas.clear();
    if (estadoJuego.escenaActual !== 4) canvas.focus();
    else if (focoAnterior && focoAnterior.isConnected) focoAnterior.focus();
}
function avisar(texto) {
    const aviso = document.getElementById('game-notice');
    aviso.textContent = texto;
    aviso.classList.remove('hidden');
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => aviso.classList.add('hidden'), 3200);
}
function cargarObjetos(lista) {
    objetosEscena = lista.map(obj => {
        const imagen = new Image();
        if (obj.imgSrc) imagen.src = obj.imgSrc;
        return { ...obj, imagen };
    });
}
function cargarEscena({ id, nombre, fondo, objetos, x = 430, piesY = 480 }) {
    cerrarModal();
    estadoJuego.escenaActual = id;
    estadoJuego.paso = 1;
    fondoImagen.src = fondo;
    posicionarJugador(x + jugador2D.width / 2, piesY);
    cargarObjetos(objetos);
    document.getElementById('scene-label').textContent = nombre;
    document.getElementById('game-notice').classList.add('hidden');
    actualizarObjetivo();
}
function actualizarObjetivo() {
    const activo = objetosEscena.find(obj => obj.id === estadoJuego.paso);
    estadoJuego.objetivo = activo ? activo.objetivo || 'Acércate a: ' + activo.nombre : '';
    document.getElementById('scene-objective').textContent = estadoJuego.objetivo;
}
function avanzarPaso(pasoActual, siguientePaso) {
    if (estadoJuego.paso !== pasoActual) return;
    estadoJuego.paso = siguientePaso;
    cerrarModal();
    actualizarObjetivo();
    guardarProgresoLocal();
}
function disponible(objeto) { return typeof objeto.interactuar === 'function' && objeto.id <= estadoJuego.paso; }
function limitarJugador() {
    const { margen, piesMin, margenInferior } = limitesExploracion;
    jugador2D.x = Math.max(margen, Math.min(canvas.width - jugador2D.width - margen, jugador2D.x));
    jugador2D.y = Math.max(Math.max(0, piesMin - jugador2D.height), Math.min(canvas.height - jugador2D.height - margenInferior, jugador2D.y));
}
function posicionarJugador(centroX, piesY) {
    jugador2D.x = centroX - jugador2D.width / 2;
    jugador2D.y = piesY - jugador2D.height;
    limitarJugador();
}
function piesJugador() {
    return { x: jugador2D.x + jugador2D.width / 2, y: jugador2D.y + jugador2D.height };
}
function distanciaObjeto(objeto) {
    const { x: pieX, y: pieY } = piesJugador();
    const puntoX = Math.max(objeto.x, Math.min(pieX, objeto.x + objeto.w));
    const puntoY = Math.max(objeto.y, Math.min(pieY, objeto.y + objeto.h));
    return Math.hypot(pieX - puntoX, pieY - puntoY);
}
function verificarInteraccionCercana() {
    if (!estadoJuego.iniciado || estadoJuego.modalAbierto || estadoJuego.escenaActual === 4) return;
    const cercanos = objetosEscena.filter(obj => disponible(obj) && distanciaObjeto(obj) <= (obj.radio ?? jugador2D.radioInteraccion));
    const elegido = cercanos.find(obj => obj.id === estadoJuego.paso) || cercanos.sort((a, b) => distanciaObjeto(a) - distanciaObjeto(b))[0];
    if (elegido) elegido.interactuar();
    else avisar('Acércate al objeto resaltado y pulsa Espacio.');
}
function actualizarPosicion(delta = 1 / 60) {
    if (estadoJuego.modalAbierto || estadoJuego.escenaActual === 4) return;
    let dx = Number(teclas.has('ArrowRight') || teclas.has('KeyD')) - Number(teclas.has('ArrowLeft') || teclas.has('KeyA'));
    let dy = Number(teclas.has('ArrowDown') || teclas.has('KeyS')) - Number(teclas.has('ArrowUp') || teclas.has('KeyW'));
    const longitud = Math.hypot(dx, dy) || 1;
    dx = dx / longitud * jugador2D.speed * delta;
    dy = dy / longitud * jugador2D.speed * delta;
    jugador2D.x += dx;
    jugador2D.y += dy;
    limitarJugador();
}
function dibujarObjeto(obj) {
    if (obj.soloZona) return;
    if (obj.imagen.complete && obj.imagen.naturalWidth) {
        // Encuadre del contenido de PNG transparentes; no altera los archivos.
        if (obj.recorte) ctx.drawImage(obj.imagen, ...obj.recorte, obj.x, obj.y, obj.w, obj.h);
        else ctx.drawImage(obj.imagen, obj.x, obj.y, obj.w, obj.h);
    }
    else { ctx.fillStyle = '#617B8B'; ctx.fillRect(obj.x, obj.y, obj.w, obj.h); }
}
function renderizar() {
    if (estadoJuego.escenaActual === 4) return;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#343C43';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (fondoImagen.complete && fondoImagen.naturalWidth) ctx.drawImage(fondoImagen, 0, 0, canvas.width, canvas.height);
    objetosEscena.forEach(dibujarObjeto);
    if (jugador2D.imagen.complete && jugador2D.imagen.naturalWidth) ctx.drawImage(jugador2D.imagen, jugador2D.x, jugador2D.y, jugador2D.width, jugador2D.height);
    else { ctx.fillStyle = '#237A45'; ctx.fillRect(jugador2D.x, jugador2D.y, jugador2D.width, jugador2D.height); }
    const activo = objetosEscena.find(obj => obj.id === estadoJuego.paso);
    if (activo) {
        ctx.strokeStyle = '#F4E6C8'; ctx.lineWidth = 3;
        ctx.setLineDash([8, 5]);
        ctx.strokeRect(activo.x - 4, activo.y - 4, activo.w + 8, activo.h + 8);
        ctx.setLineDash([]);
        ctx.font = '10px "Press Start 2P", monospace';
        const tx = Math.max(8, Math.min(activo.x, canvas.width - 108));
        const ty = Math.max(100, activo.y - 10);
        ctx.fillStyle = '#303744'; ctx.fillRect(tx - 4, ty - 15, 104, 21);
        ctx.fillStyle = '#F4E6C8'; ctx.fillText('[ESPACIO]', tx, ty);
    }
}
function gameLoop(tiempo) {
    const delta = ultimoFrame ? Math.min((tiempo - ultimoFrame) / 1000, 0.05) : 0;
    ultimoFrame = tiempo;
    actualizarPosicion(delta);
    renderizar();
    requestAnimationFrame(gameLoop);
}
function iniciarJuego() {
    const form = document.getElementById('login-form');
    if (estadoJuego.iniciado || !form.reportValidity()) return;
    const nombre = document.getElementById('student-name').value.trim();
    const id = document.getElementById('student-id').value.trim();
    const correo = document.getElementById('student-email').value.trim().toLowerCase();
    if (!nombre || !id) { alert('Por favor completa tu nombre e ID.'); return; }
    Object.assign(jugadorData, { nombre, id, correo });
    estadoJuego.iniciado = true;
    estadoJuego.modo = 'recorrido';
    estadoJuego.versionPartida = VERSION_CONTENIDO;
    estadoJuego.sesionId = globalThis.crypto?.randomUUID?.() || Date.now() + '-' + Math.random().toString(36).slice(2);
    estadoJuego.inicio = new Date().toISOString();
    document.getElementById('music-toggle').classList.remove('hidden');
    void iniciarMusica();
    jugador2D.imagen.src = jugadorData.avatarSrc;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('canvas-screen').classList.remove('hidden');
    iniciarEscena0();
    guardarProgresoLocal();
    requestAnimationFrame(gameLoop);
}
window.iniciarJuego = iniciarJuego;
document.getElementById('login-form').addEventListener('submit', evento => { evento.preventDefault(); iniciarJuego(); });

document.getElementById('modal-close').addEventListener('click', () => cerrarVista?.());
const codigosMovimiento = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];
window.addEventListener('keydown', evento => {
    if (!estadoJuego.iniciado) return;
    if (estadoJuego.modalAbierto) {
        // Las flechas eligen el control; Enter lo activa. El tacto conserva sus eventos.
        const controlesModal = [...document.querySelectorAll('#interaction-modal button:not(:disabled), #interaction-modal summary')];
        if (['ArrowDown', 'ArrowUp'].includes(evento.code)) {
            evento.preventDefault();
            const actual = controlesModal.indexOf(document.activeElement);
            const siguiente = actual < 0 ? 0 : (actual + (evento.code === 'ArrowDown' ? 1 : -1) + controlesModal.length) % controlesModal.length;
            controlesModal[siguiente]?.focus();
        }
        if (evento.code === 'Enter') {
            evento.preventDefault();
            if (!evento.repeat) {
                if (controlesModal.includes(document.activeElement)) document.activeElement.click();
                else (document.querySelector('#modal-actions button:not(:disabled)') || controlesModal[0])?.focus();
            }
        }
        if (evento.code === 'Escape') { evento.preventDefault(); cerrarVista?.(); }
        if (evento.key === 'Tab') {
            const controles = [...document.querySelectorAll('#interaction-modal button:not(:disabled), #interaction-modal summary')];
            const primero = controles[0], ultimo = controles[controles.length - 1];
            if (evento.shiftKey && (document.activeElement === primero || document.activeElement.id === 'interaction-modal')) { evento.preventDefault(); ultimo?.focus(); }
            else if (!evento.shiftKey && document.activeElement === ultimo) { evento.preventDefault(); primero?.focus(); }
        }
        return;
    }
    if (estadoJuego.escenaActual === 4) return;
    if (codigosMovimiento.includes(evento.code)) { evento.preventDefault(); teclas.add(evento.code); }
    if (evento.code === 'Space') { evento.preventDefault(); if (!evento.repeat) verificarInteraccionCercana(); }
});
window.addEventListener('keyup', evento => teclas.delete(evento.code));
window.addEventListener('blur', () => teclas.clear());
document.addEventListener('visibilitychange', () => { teclas.clear(); ultimoFrame = 0; });
document.querySelectorAll('[data-key]').forEach(boton => {
    boton.addEventListener('pointerdown', evento => {
        evento.preventDefault();
        if (!estadoJuego.iniciado || estadoJuego.modalAbierto) return;
        boton.setPointerCapture(evento.pointerId);
        teclas.add(boton.dataset.key);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(tipo => boton.addEventListener(tipo, () => teclas.delete(boton.dataset.key)));
});
document.getElementById('touch-interact').addEventListener('click', verificarInteraccionCercana);

