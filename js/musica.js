'use strict';

// Chill & Relaxing Pokémon Music Mix: archivo MP3 proporcionado por la usuaria, servido con el juego.
let musicaAventura = null;
let musicaSilenciada = false;
function actualizarControlMusica() {
    const boton = document.getElementById('music-toggle');
    boton.textContent = musicaSilenciada ? 'Música: apagada' : 'Música: encendida';
    boton.setAttribute('aria-pressed', String(musicaSilenciada));
    boton.setAttribute('aria-label', musicaSilenciada ? 'Activar música de aventura' : 'Silenciar música de aventura');
}
async function iniciarMusica() {
    if (typeof Audio !== 'function') return;
    if (!musicaAventura) {
        musicaAventura = new Audio('assets/audio/pokemon-relaxing-mix.mp3');
        musicaAventura.loop = true;
        musicaAventura.volume = 0.18;
        musicaAventura.muted = musicaSilenciada;
    }
    if (musicaSilenciada || document.hidden) return;
    try { await musicaAventura.play(); }
    catch {
        // Un clic en el control permite reintentar si el navegador bloqueó el audio.
        musicaSilenciada = true;
        actualizarControlMusica();
    }
}
document.getElementById('music-toggle').addEventListener('click', () => {
    musicaSilenciada = !musicaSilenciada;
    if (musicaAventura) musicaAventura.muted = musicaSilenciada;
    actualizarControlMusica();
    if (!musicaSilenciada) void iniciarMusica();
});
document.addEventListener('visibilitychange', () => {
    if (document.hidden) musicaAventura?.pause();
    else if (estadoJuego.iniciado && !musicaSilenciada) void iniciarMusica();
});
