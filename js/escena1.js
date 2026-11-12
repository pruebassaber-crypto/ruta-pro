'use strict';

// Primer desafío: ficha 1, LC-M01.
function iniciarEscena1() {
    if (!competenciaHabilitada('LC') || competenciaCompleta('LC')) return;
    cargarEscena({
        id: 1, nombre: 'Lectura Crítica · Recepción CUN', fondo: 'assets/fondo_cun_recepcion_escalera.png', x: 270, piesY: 480,
        objetos: [
            { id: 1, nombre: 'Recepcionista', x: 80, y: 225, w: 220, h: 280, imgSrc: 'assets/recepcionista.png', objetivo: 'Habla con la recepcionista.', interactuar: () => ejecutarPasoEscena1(1) },
            // La base visible del celular coincide con la superficie de la mesa.
            { id: 2, nombre: 'Celular', x: 464, y: 295, w: 40, h: 40, imgSrc: 'assets/celular.png', objetivo: 'Consulta el correo institucional en el celular.', interactuar: () => ejecutarPasoEscena1(2) },
            // La escalera es parte del fondo; la interacción se sitúa en el primer peldaño.
            { id: 3, nombre: 'Escaleras', x: 615, y: 370, w: 205, h: 65, soloZona: true, objetivo: 'Acércate a las escaleras para responder el primer desafío.', interactuar: () => ejecutarPasoEscena1(3) }
        ]
    });
}
function ejecutarPasoEscena1(paso) {
    if (estadoJuego.escenaActual !== 1 || paso > estadoJuego.paso) return;
    if (paso === 1) {
        mostrarModal({
            titulo: 'Recepción CUN', imagen: 'assets/recepcionista.png',
            parrafos: ['¡Hola! Bienvenido a la CUN. Antes de subir a los salones, revisa el celular que está sobre la mesa de la sala de espera; la Coordinación envió un comunicado importante sobre la clase.'],
            acciones: [{ texto: 'Ir por el celular', accion: () => estadoJuego.paso === 1 ? avanzarPaso(1, 2) : cerrarModal() }]
        });
    } else if (paso === 2) {
        consultarCorreo(() => estadoJuego.paso === 2 ? avanzarPaso(2, 3) : cerrarModal());
    } else mostrarPreguntaLC('LC-M01');
}
function transicionSiguienteEscena() {
    if (estadoJuego.escenaActual !== 1 || !estadoJuego.resultados['LC-M01']) return;
    if (estadoJuego.resultados['LC-M01'].correcto) iniciarEscena2();
    else iniciarEscena3();
    guardarProgresoLocal();
}

