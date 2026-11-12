'use strict';
// Prueba real explícita: reutiliza UN registro ficticio ya enviado para no crear filas.
if (!process.argv.includes('--conexion-real')) {
    console.log('Usar --conexion-real solo con tmp/conexion/prueba.json ya confirmado.');
    process.exit(0);
}
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.join(__dirname,'..');
async function main() {
    const prueba = JSON.parse(fs.readFileSync(path.join(root,'tmp/conexion/prueba.json'),'utf8'))[0];
    assert.equal(prueba.estudianteId,'PRUEBA-CONEXION');
    const server = http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end('<!doctype html><meta charset="utf-8"><title>Prueba de conexión Ruta Pro</title>');});
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    let socket;
    try {
        const pages=await (await fetch('http://127.0.0.1:9333/json/list')).json();
        socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
        await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
        let id=0;const pendientes=new Map();
        socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(pendientes.has(m.id)){const p=pendientes.get(m.id);clearTimeout(p.timer);pendientes.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}});
        function send(method,params={}){return new Promise((resolve,reject)=>{const n=++id;const timer=setTimeout(()=>{pendientes.delete(n);reject(Error('Tiempo agotado: '+method));},20000);pendientes.set(n,{resolve,reject,timer});socket.send(JSON.stringify({id:n,method,params}));});}
        await send('Page.enable');await send('Runtime.enable');
        await send('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/'});
        await new Promise(resolve=>setTimeout(resolve,250));
        const conexion=fs.readFileSync(path.join(root,'js/conexion.js'),'utf8');
        const expresion=`(async()=>{const datos=${JSON.stringify(prueba)};const jugadorData={nombre:datos.nombre,id:datos.estudianteId,correo:datos.correo};const estadoJuego={sesionId:datos.sesionId,modo:'recorrido',resultados:{[datos.desafio]:datos},rutas:{},ordenOpciones:{},finalizado:false};${conexion}\nawait enviarDatosGS(datos);return {envio:datos.envio,registroId:datos.registroId,guardadoLocal:estadoJuego.guardadoLocal};})()`;
        const respuesta=await send('Runtime.evaluate',{expression:expresion,awaitPromise:true,returnByValue:true});
        if(respuesta.exceptionDetails) throw Error(respuesta.exceptionDetails.exception?.description||JSON.stringify(respuesta.exceptionDetails));
        const resultado=respuesta.result.value;
        assert.equal(resultado.envio,'enviado_sin_confirmar');
        assert.equal(resultado.guardadoLocal,true);
        fs.writeFileSync(path.join(root,'tmp/conexion/navegador.json'),JSON.stringify(resultado,null,2),'utf8');
        console.log('OK navegador: POST real con el código de conexion.js, sin bloqueo de fetch y con copia local.');
        console.log('Se reutilizó un registro PRUEBA-CONEXION; el navegador no puede leer la confirmación por no-cors.');
        await send('Browser.close');
    } finally {socket?.close();server.closeAllConnections();server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
