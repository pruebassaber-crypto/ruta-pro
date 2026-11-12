'use strict';

// Ruta básica: ficha 2, LC-B01.
function iniciarEscena3() {
    if (!estadoJuego.resultados['LC-M01'] || estadoJuego.resultados['LC-M01'].correcto) return;
    cargarEscena({
        id: 3, nombre: 'Lectura Crítica · Cafetería', fondo: 'assets/fondo_lc_basico_cafeteria_salida.png', x: 260, piesY: 500,
        objetos: [
            { id: 1, nombre: 'Mesa de espera', x: 30, y: 300, w: 215, h: 125, soloZona: true, objetivo: 'Acércate a la mesa con la empanada y el tinto.', interactuar: mostrarEsperaCafeteria },
            { id: 2, nombre: 'Celular de Sofi', x: 170, y: 315, w: 44, h: 62, imgSrc: 'assets/lc_celular_sofi.png', objetivo: 'Revisa el mensaje de Sofi y responde en el celular.', interactuar: () => mostrarMensajeSofi() },
            // Puerta empotrada en el muro; los pies se acercan a su umbral.
            { id: 3, nombre: 'Salida', x: 340, y: 170, w: 110, h: 185, soloZona: true, objetivo: 'Respuesta registrada. Ve a la puerta para consultar tus resultados.', interactuar: iniciarEscena4 }
        ]
    });
}
function mostrarEsperaCafeteria() {
    if (estadoJuego.escenaActual !== 3) return;
    mostrarModal({
        titulo: 'Tu personaje · Cafetería',
        parrafos: [PENSAMIENTO_CAFETERIA],
        acciones: [{ texto: 'Revisar el celular', accion: () => estadoJuego.paso === 1 ? avanzarPaso(1, 2) : cerrarModal() }]
    });
}
function mostrarMensajeSofi(volver) {
    if (estadoJuego.escenaActual !== 3 || estadoJuego.paso < 2) return;
    const continuar = volver || (() => estadoJuego.resultados['LC-B01'] ? cerrarModal() : mostrarPreguntaLC('LC-B01'));
    mostrarModal({
        titulo: 'WhatsApp de Sofi · Grupo del curso', imagen: 'assets/lc_celular_sofi.png',
        parrafos: [MENSAJE_SOFI],
        acciones: [{ texto: volver ? 'Volver a la pregunta' : estadoJuego.resultados['LC-B01'] ? 'Guardar celular' : 'Continuar a la pregunta', accion: continuar }],
        alCerrar: volver || cerrarModal
    });
}

