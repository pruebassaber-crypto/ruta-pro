'use strict';
const fs = require('node:fs');
const path = require('node:path');
module.exports = async function verificarPantallas({send,evaluate,port,output,pruebasRuta}) {
    const pausa = ms => new Promise(resolve => setTimeout(resolve,ms));
    async function captura(nombre) {
        const imagen = await send('Page.captureScreenshot',{format:'png'});
        fs.writeFileSync(path.join(output,nombre+'.png'),Buffer.from(imagen.data,'base64'));
    }
    async function comprobarModal(nombre) {
        const datos = await evaluate(`(() => {
            const modal=document.getElementById('interaction-modal').getBoundingClientRect();
            const cerrar=document.getElementById('modal-close').getBoundingClientRect();
            const scroll=document.getElementById('modal-scroll');
            return {dentro:modal.left>=0 && modal.right<=innerWidth+1 && modal.top>=0 && modal.bottom<=innerHeight+1,
                cerrar:cerrar.bottom<=innerHeight+1 && cerrar.height>=44,
                horizontal:scroll.scrollWidth<=scroll.clientWidth+1,alto:scroll.clientHeight};
        })()`);
        if(!datos.dentro || !datos.cerrar || !datos.horizontal || datos.alto<50) throw Error('Ventana no usable: '+nombre+' '+JSON.stringify(datos));
    }
    for(const [width,height] of [[320,568],[360,640],[390,844],[568,320],[844,390],[768,1024]]) {
        const tamano=width+'x'+height;
        await send('Emulation.setDeviceMetricsOverride',{width,height,screenWidth:width,screenHeight:height,deviceScaleFactor:1,mobile:true});
        await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});
        await send('Page.navigate',{url:'http://127.0.0.1:'+port+'/index.html'});
        let lista=false;
        for(let i=0;i<100;i++) {
            try {lista=await evaluate("document.readyState==='complete' && typeof iniciarJuego==='function' && !estadoJuego.iniciado");} catch {}
            if(lista)break; await pausa(80);
        }
        if(!lista) throw Error('Página no lista en '+tamano);
        await evaluate("Promise.race([document.fonts.ready.then(()=>true),new Promise(resolve=>setTimeout(()=>resolve(false),3000))])");
        const inicio=await evaluate(`(() => {
            const login=document.getElementById('login-screen');login.scrollTop=login.scrollHeight;
            const boton=document.querySelector('#login-form button').getBoundingClientRect();
            return {ancho:innerWidth,desborde:document.documentElement.scrollWidth>innerWidth+1,
                ingresar:boton.bottom<=innerHeight+1 && boton.left>=0 && boton.right<=innerWidth+1};
        })()`);
        if(inicio.ancho!==width || inicio.desborde || !inicio.ingresar) throw Error('Inicio no adaptable: '+tamano+' '+JSON.stringify(inicio));
        await captura('inicio-'+tamano);
        await evaluate("document.getElementById('student-name').value='Estudiante <prueba>';document.getElementById('student-id').value='T001';document.getElementById('student-email').value='prueba@cun.edu.co';iniciarJuego();");
        const juego=await evaluate(`(() => {
            const canvas=document.getElementById('gameCanvas').getBoundingClientRect();
            const controles=document.querySelector('.touch-controls').getBoundingClientRect();
            const objetivo=document.getElementById('scene-objective').getBoundingClientRect();
            return {altoEscenario:Math.min(canvas.width/1000,canvas.height/562)*562,
                controles:controles.bottom<=innerHeight+1 && controles.left>=0 && controles.right<=innerWidth+1,
                botones:[...document.querySelectorAll('.touch-controls button')].every(b=>b.getBoundingClientRect().width>=44 && b.getBoundingClientRect().height>=44),
                separados:objetivo.bottom<=canvas.top+1 && canvas.bottom<=controles.top+1};
        })()`);
        if(juego.altoEscenario<90 || !juego.controles || !juego.botones || !juego.separados) throw Error('Exploración no usable: '+tamano+' '+JSON.stringify(juego));
        // Entrada táctil real: mantener derecha, soltar y verificar que no quede activada.
        const derecho=await evaluate(`(() => {const b=document.querySelector('[data-key="ArrowRight"]').getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2,antes:jugador2D.x};})()`);
        await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:derecho.x,y:derecho.y}]});
        await pausa(140);
        await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        if(!await evaluate('jugador2D.x>'+derecho.antes+" && !teclas.has('ArrowRight')")) throw Error('Control táctil no mueve o no se suelta en '+tamano);
        const interactuar=await evaluate(`(() => {
            const obj=objetosEscena.find(o=>o.id===1);posicionarJugador(obj.x+obj.w/2,obj.y+obj.h);
            const b=document.getElementById('touch-interact').getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2};
        })()`);
        await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[interactuar]});
        await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await pausa(40);
        if(!await evaluate('estadoJuego.modalAbierto')) throw Error('Botón táctil Interactuar no abre la ventana en '+tamano);
        await evaluate('cerrarModal()');
        await captura('exploracion-'+tamano);
        await evaluate('('+pruebasRuta.toString()+')()');
        await evaluate("window.__resultadosPantalla=estadoJuego.resultados;estadoJuego.finalizado=false;estadoJuego.resultados={'RQ-M01':window.__resultadosPantalla['RQ-M01']};iniciarCuantitativoRuta(true);estadoJuego.paso=4;mostrarPreguntaRQ('RQ-A01');");
        await comprobarModal('matemáticas '+tamano);
        await captura('matematicas-'+tamano);
        await evaluate("cerrarModal();estadoJuego.resultados={'RQ-M01':{...window.__resultadosPantalla['RQ-M01'],correcto:false}};iniciarCuantitativoRuta(false);estadoJuego.paso=3;mostrarPreguntaRQ('RQ-B01');");
        await comprobarModal('fracción '+tamano);
        if(!await evaluate("document.querySelector('.rq-fraccion').getBoundingClientRect().width>0 && parseFloat(getComputedStyle(document.querySelector('.rq-opcion')).fontSize)===16")) throw Error('Formato matemático perdido en '+tamano);
        await captura('fraccion-'+tamano);
        await evaluate("cerrarModal();estadoJuego.resultados={...window.__resultadosPantalla};delete estadoJuego.resultados['LC-A01'];estadoJuego.finalizado=false;iniciarEscena2();estadoJuego.paso=2;mostrarPreguntaLC('LC-A01');");
        await comprobarModal('Lectura Crítica '+tamano);
        await evaluate("document.getElementById('modal-scroll').scrollTop=document.getElementById('modal-scroll').scrollHeight");
        await captura('pregunta-larga-'+tamano);
        await evaluate("estadoJuego.resultados=window.__resultadosPantalla;estadoJuego.finalizado=true;mostrarPantallaResultados();");
        const resultados=await evaluate(`(() => {
            const panel=document.getElementById('results-screen');
            const tarjetas=[...document.querySelectorAll('.competency-card')];
            return {desborde:panel.scrollWidth>panel.clientWidth+1 || document.documentElement.scrollWidth>innerWidth+1,
                tarjetas:tarjetas.every(t=>t.getBoundingClientRect().right<=innerWidth+1)};
        })()`);
        if(resultados.desborde || !resultados.tarjetas) throw Error('Resultados desbordados: '+tamano);
        await captura('resultados-'+tamano);
        await evaluate("document.querySelector('.competency-feedback').open=true;document.querySelector('.challenge-feedback').open=true;");
        if(!await evaluate("document.getElementById('results-screen').scrollWidth<=document.getElementById('results-screen').clientWidth+1")) throw Error('Retroalimentación desbordada: '+tamano);
        await evaluate("document.querySelector('.answer-details').open=true;document.querySelector('.table-wrapper').scrollLeft=document.querySelector('.table-wrapper').scrollWidth");
        if(!await evaluate("document.getElementById('results-screen').scrollWidth<=document.getElementById('results-screen').clientWidth+1")) throw Error('Tabla desborda el pasaporte en '+tamano);
        console.log('OK pantallas: '+tamano+' · inicio, movimiento táctil, preguntas, matemáticas y resultados.');
    }
    await send('Emulation.setTouchEmulationEnabled',{enabled:false});
    await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
};
