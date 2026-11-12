'use strict';

const ORDEN_COMPETENCIAS = ['RQ', 'CC', 'CE', 'EN', 'LC'];
const NOMBRES_COMPETENCIAS = {
    RQ: 'Razonamiento Cuantitativo', CC: 'Competencias Ciudadanas',
    CE: 'Comunicación Escrita', EN: 'Inglés', LC: 'Lectura Crítica'
};
function competenciaHabilitada(codigo) {
    const indice = ORDEN_COMPETENCIAS.indexOf(codigo);
    return estadoJuego.modo === 'recorrido' && !estadoJuego.finalizado && indice >= 0 &&
        ORDEN_COMPETENCIAS.slice(0, indice).every(anterior => competenciaCompleta(anterior));
}
function continuarRecorrido(codigo) {
    if (!competenciaHabilitada(codigo) || !competenciaCompleta(codigo)) return;
    const siguiente = ORDEN_COMPETENCIAS[ORDEN_COMPETENCIAS.indexOf(codigo) + 1];
    const entradas = { CC: iniciarCiudadanasMedio, CE: iniciarEscritaMedio, EN: iniciarInglesMedio, LC: iniciarEscena1 };
    if (siguiente) entradas[siguiente]();
    else {
        estadoJuego.finalizado = true;
        mostrarPantallaResultados();
    }
    guardarProgresoLocal();
}
