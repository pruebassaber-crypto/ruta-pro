'use strict';

function iniciarEscena0() {
    cargarEscena({
        id: 0, nombre: 'Tutorial · Antes de salir', fondo: 'assets/fondo_habitacion_salida.png',
        objetos: [
            { id: 1, nombre: 'Computador', x: 410, y: 200, w: 120, h: 100, imgSrc: 'assets/computador.png' },
            { id: 2, nombre: 'Celular', x: 80, y: 320, w: 50, h: 70, imgSrc: 'assets/celular.png' },
            { id: 3, nombre: 'Libreta', x: 570, y: 230, w: 65, h: 65, imgSrc: 'assets/libreta.png' },
            { id: 4, nombre: 'Mochila', x: 300, y: 350, w: 85, h: 95, imgSrc: 'assets/mochila.png' },
            // Puerta integrada en la pared: solo se marca su zona interactiva.
            { id: 5, nombre: 'Puerta', x: 880, y: 115, w: 108, h: 270, soloZona: true }
        ].map(obj => ({ ...obj, interactuar: () => ejecutarPasoTutorial(obj.id) }))
    });
}
function completarPasoTutorial(pasoActual, siguientePaso) {
    if (estadoJuego.paso === pasoActual) avanzarPaso(pasoActual, siguientePaso);
    else cerrarModal();
}
function ejecutarPasoTutorial(paso) {
    if (estadoJuego.escenaActual !== 0 || paso > estadoJuego.paso) return;
    const textos = {
        1: ['¿Qué es Ruta Pro?', 'Es un reto interactivo con cinco competencias. Recorrerás Razonamiento Cuantitativo, Competencias Ciudadanas, Comunicación Escrita, Inglés y Lectura Crítica, en ese orden. Responderás dos desafíos por competencia y podrás consultar tus resultados y retroalimentación al finalizar el recorrido.'],
        2: ['¿Cómo funcionan los desafíos?', 'Cada competencia tiene tres escenarios disponibles y visitarás dos: el inicial de nivel medio y una ruta avanzada si aciertas o básica si fallas.\n\nAcércate al objeto resaltado y pulsa Espacio. Puedes volver a consultar los mensajes antes de responder.'],
        4: ['Tabla de puntajes', 'Una respuesta correcta vale:\nBásico: 5 puntos.\nMedio: 10 puntos.\nAvanzado: 10 puntos.\n\nLas respuestas incorrectas valen 0 puntos. Los resultados y la retroalimentación estarán disponibles al finalizar.'],
        5: ['Tu resultado es para aprender', 'Ruta Pro es una herramienta formativa para reconocer tus fortalezas. ¡Disfruta el reto y mide tus habilidades!']
    };
    if (paso === 3) {
        mostrarModal({
            titulo: 'Prueba de estrategia', imagen: 'assets/libreta.png',
            parrafos: ['¿Qué debes hacer antes de seleccionar una respuesta en Ruta Pro?'],
            acciones: [
                { texto: 'A. Elegir lo más rápido posible sin leer todo.', accion: () => evaluarQuizTutorial(false) },
                { texto: 'B. Leer con atención, analizar la situación y decidir.', accion: () => evaluarQuizTutorial(true) },
                { texto: 'C. Seleccionar cualquier opción al azar.', accion: () => evaluarQuizTutorial(false) }
            ]
        });
        return;
    }
    mostrarModal({
        titulo: textos[paso][0],
        imagen: objetosEscena.find(obj => obj.id === paso).imgSrc,
        parrafos: [textos[paso][1]],
        acciones: [{
            texto: paso === 5 ? 'Salir de casa' : 'Continuar',
            accion: paso === 5 ? finalizarTutorial : () => completarPasoTutorial(paso, paso + 1)
        }]
    });
}
function evaluarQuizTutorial(correcto) {
    if (estadoJuego.escenaActual !== 0) return;
    mostrarModal({
        titulo: correcto ? '¡Exacto!' : 'Inténtalo de nuevo',
        parrafos: [correcto ? 'Primero analizo el problema y luego decido. Esa es la clave.' : 'Lee con atención y analiza la situación antes de decidir.'],
        acciones: [{ texto: correcto ? 'Continuar' : 'Volver a intentar', accion: correcto ? () => completarPasoTutorial(3, 4) : () => ejecutarPasoTutorial(3) }]
    });
}
function finalizarTutorial() {
    if (estadoJuego.escenaActual !== 0 || estadoJuego.paso !== 5) return;
    iniciarCuantitativoMedio();
    guardarProgresoLocal();
}

