'use strict';

// Los índices originales identifican las respuestas; las letras son presentación.
function enteroAleatorioOpciones(limite) {
    if (!globalThis.crypto?.getRandomValues) return Math.floor(Math.random() * limite);
    const muestra = new Uint32Array(1);
    const techo = Math.floor(4294967296 / limite) * limite;
    do { globalThis.crypto.getRandomValues(muestra); } while (muestra[0] >= techo);
    return muestra[0] % limite;
}
function ordenOpcionesDesafio(id) {
    if (!estadoJuego.ordenOpciones[id]) {
        const orden = obtenerDesafio(id).opciones.map((_, indice) => indice);
        for (let i = orden.length - 1; i > 0; i--) {
            const j = enteroAleatorioOpciones(i + 1);
            [orden[i], orden[j]] = [orden[j], orden[i]];
        }
        estadoJuego.ordenOpciones[id] = orden;
        guardarProgresoLocal();
    }
    return estadoJuego.ordenOpciones[id];
}
function textoOpcionPresentada(id, indiceOriginal, orden = ordenOpcionesDesafio(id)) {
    const posicion = orden.indexOf(indiceOriginal);
    const contenido = obtenerDesafio(id).opciones[indiceOriginal].replace(/^[A-Z]\.\s*/, '');
    return String.fromCharCode(65 + posicion) + '. ' + contenido;
}
function opcionesParaMostrar(id) {
    return ordenOpcionesDesafio(id).map(indice => ({ indice, texto: textoOpcionPresentada(id, indice) }));
}
function datosOpcionesRespuesta(id, indiceOriginal) {
    const desafio = obtenerDesafio(id);
    const orden = [...ordenOpcionesDesafio(id)];
    return {
        opcionIndice: indiceOriginal, respuesta: textoOpcionPresentada(id, indiceOriginal, orden),
        claveIndice: desafio.correcta, clave: textoOpcionPresentada(id, desafio.correcta, orden),
        respuestaOriginal: desafio.opciones[indiceOriginal], claveOriginal: desafio.opciones[desafio.correcta],
        opcionPresentadaIndice: orden.indexOf(indiceOriginal), clavePresentadaIndice: orden.indexOf(desafio.correcta),
        ordenOpciones: orden, opcionesPresentadas: orden.map(indice => textoOpcionPresentada(id, indice, orden))
    };
}
function letrasRetroalimentacion(resultado, texto) {
    const orden = resultado.ordenOpciones;
    if (!orden) return texto;
    return texto.replace(/\b([A-E])\b/g, (letra, _, posicion) => {
        // Los nombres de rutas del ejercicio de Inglés no son letras de opciones.
        if (/Route\s$/.test(texto.slice(0, posicion))) return letra;
        const original = letra.charCodeAt(0) - 65;
        const presentada = orden.indexOf(original);
        return presentada < 0 ? letra : String.fromCharCode(65 + presentada);
    });
}
