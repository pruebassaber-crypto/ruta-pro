'use strict';
// Muestras para elegir: no modifica la música ni los archivos de ejecución del juego.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const destino = path.join(__dirname,'..','tmp','musica');
fs.mkdirSync(destino,{recursive:true});
const actual = path.join(__dirname,'..','assets','audio','aventura.wav');
const hashAntes = crypto.createHash('sha256').update(fs.readFileSync(actual)).digest('hex');
const opciones = [
    { id:'1-brujula', nombre:'Brújula de aventura', bpm:108, estilo:'retro', descripcion:'Más movimiento: melodía retro, arpegios y pulso ligero. Para un recorrido con energía.', acordes:[[48,52,55],[45,48,52],[41,45,48],[43,47,50]], melodias:[[72,76,79,81,79,76,74,72],[76,79,81,84,81,79,76,72],[77,76,72,69,72,74,77,79],[79,74,71,74,79,81,79,74]] },
    { id:'2-campus', nombre:'Paseo por el campus', bpm:84, estilo:'calma', descripcion:'Exploración tranquila: notas suaves y más espacio entre frases. Mi recomendación para acompañar la lectura.', acordes:[[48,52,55],[52,55,59],[45,48,52],[41,45,48]], melodias:[[76,null,79,null,74,null,72,null],[71,null,74,null,79,null,76,null],[72,null,76,null,79,null,76,null],[77,null,76,null,72,null,69,null]] },
    { id:'3-camino', nombre:'Camino a la universidad', bpm:96, estilo:'cuerdas', descripcion:'Aventura cálida: timbres de cuerdas pulsadas y percusión suave, sintetizados. Un sonido menos electrónico.', acordes:[[50,54,57],[45,49,52],[47,50,54],[43,47,50]], melodias:[[74,78,81,null,78,76,74,null],[73,76,81,null,76,73,71,null],[71,74,78,null,81,78,74,null],[79,78,76,null,74,73,74,null]] }
];
function wav(muestras, frecuencia, bits) {
    const bytes = bits / 8, buffer = Buffer.alloc(44 + muestras.length * bytes);
    buffer.write('RIFF'); buffer.writeUInt32LE(buffer.length-8,4); buffer.write('WAVEfmt ',8);
    buffer.writeUInt32LE(16,16); buffer.writeUInt16LE(1,20); buffer.writeUInt16LE(1,22);
    buffer.writeUInt32LE(frecuencia,24); buffer.writeUInt32LE(frecuencia*bytes,28);
    buffer.writeUInt16LE(bytes,32); buffer.writeUInt16LE(bits,34); buffer.write('data',36);
    buffer.writeUInt32LE(muestras.length*bytes,40);
    for (let i=0;i<muestras.length;i++) {
        const x=Math.max(-1,Math.min(1,muestras[i]));
        if(bits===16) buffer.writeInt16LE(Math.round(x*32767),44+i*2);
        else buffer[44+i]=Math.round(x*127+128);
    }
    return buffer;
}
for (const opcion of opciones) {
    const frecuencia=22050, pulso=60/opcion.bpm, duracion=8*4*pulso+0.7;
    const mezcla = new Float64Array(Math.ceil(duracion*frecuencia));
    function nota(midi,inicio,largo,volumen,tipo) {
        if(midi===null) return;
        const hz=440*2**((midi-69)/12), offset=Math.round(inicio*frecuencia);
        for(let i=0;i<largo*frecuencia && offset+i<mezcla.length;i++) {
            const t=i/frecuencia, fase=2*Math.PI*hz*t;
            const ataque=Math.min(1,t/(tipo==='pad'?0.16:0.008));
            const salida=Math.min(1,(largo-t)/0.08);
            let onda, decaimiento=1;
            if(tipo==='bajo') onda=Math.sin(fase)+0.1*Math.sin(2*fase);
            else if(tipo==='pad') onda=Math.sin(fase)+0.12*Math.sin(2*fase);
            else if(tipo==='campana') { onda=Math.sin(fase)+0.25*Math.sin(3*fase)*Math.exp(-7*t); decaimiento=Math.exp(-2.3*t); }
            else if(tipo==='cuerda') { onda=Math.sin(fase)+0.4*Math.sin(2*fase)+0.2*Math.sin(3*fase)+0.1*Math.sin(4*fase); decaimiento=Math.exp(-3.8*t); }
            else { onda=Math.sin(fase)+0.23*Math.sin(3*fase)+0.08*Math.sin(5*fase); decaimiento=Math.exp(-1.2*t); }
            mezcla[offset+i]+=onda*ataque*Math.max(0,salida)*decaimiento*volumen;
        }
    }
    for(let compas=0;compas<8;compas++) {
        const acorde=opcion.acordes[compas%4], inicio=compas*4*pulso+0.05;
        if(opcion.estilo==='calma') {
            acorde.forEach(n=>nota(n+12,inicio,4*pulso,0.03,'pad'));
            nota(acorde[0]-12,inicio,3.5*pulso,0.085,'bajo');
        } else {
            for(let paso=0;paso<8;paso++) nota(acorde[[0,1,2,1,0,2,1,2][paso]]+12,inicio+paso*pulso/2,pulso*0.85,0.055,opcion.estilo==='cuerdas'?'cuerda':'retro');
            for(let paso=0;paso<4;paso++) nota(acorde[paso%2?2:0]-12,inicio+paso*pulso,pulso*0.7,0.09,'bajo');
        }
        opcion.melodias[compas%4].forEach((n,paso)=>nota(n,inicio+paso*pulso/2,pulso*(opcion.estilo==='calma'?1.5:0.8),0.10,opcion.estilo==='calma'?'campana':opcion.estilo==='cuerdas'?'cuerda':'retro'));
    }
    // Eco discreto y desvanecimiento para que las muestras no se corten en seco.
    const seco=Float64Array.from(mezcla), retraso=Math.round(pulso*0.75*frecuencia);
    for(let i=retraso;i<mezcla.length;i++) mezcla[i]+=seco[i-retraso]*0.12;
    let pico=0;for(const valor of mezcla)pico=Math.max(pico,Math.abs(valor));
    for(let i=0;i<mezcla.length;i++) mezcla[i]=mezcla[i]/pico*0.68*Math.min(1,i/(frecuencia*0.08),(mezcla.length-i)/(frecuencia*0.65));
    fs.writeFileSync(path.join(destino,opcion.id+'.wav'),wav(mezcla,frecuencia,16));
    // Extracto ligero para la escucha inline; la página incluye el WAV completo.
    const clip=new Float64Array(6*8000);
    for(let i=0;i<clip.length;i++) clip[i]=mezcla[Math.floor(i*frecuencia/8000)]*Math.min(1,(clip.length-i)/3200);
    fs.writeFileSync(path.join(destino,opcion.id+'-clip.wav'),wav(clip,8000,8));
    console.log(opcion.nombre+': '+duracion.toFixed(1)+' segundos.');
}
const html=`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Ruta Pro · Elegir música</title><style>body{margin:0;background:#343c43;color:#26313b;font:16px/1.65 system-ui,sans-serif;padding:24px}main{max-width:760px;margin:auto;background:#f3f5f6;border:4px solid #18231e;padding:28px;box-shadow:6px 6px #18231e}h1{color:#237a45;font-size:26px}article{background:white;border:2px solid #617b8b;padding:18px;margin:20px 0}h2{font-size:20px;margin:0}audio{width:100%;margin-top:12px}small{color:#465661}button{background:#237a45;color:white;padding:10px;border:2px solid #18231e;cursor:pointer}</style><main><h1>Elige la música de Ruta Pro</h1><p>Tres composiciones instrumentales originales para comparar. Generar estas muestras no modifica la pista activa del juego.</p>${opciones.map((o,i)=>`<article><h2>${i+1}. ${o.nombre}</h2><p>${o.descripcion}</p><audio controls preload="metadata" src="${o.id}.wav"></audio><small>${o.bpm} BPM · Sin voces</small></article>`).join('')}<p>Escucha cada muestra con un volumen similar al que usarías durante las preguntas.</p><button type="button" onclick="document.querySelectorAll('audio').forEach(a=>a.pause())">Pausar todas</button></main><script>document.querySelectorAll('audio').forEach(a=>{a.volume=0.4;a.addEventListener('play',()=>document.querySelectorAll('audio').forEach(b=>{if(a!==b)b.pause()}))})</script></html>`;
fs.writeFileSync(path.join(destino,'escuchar.html'),html,'utf8');
const hashDespues=crypto.createHash('sha256').update(fs.readFileSync(actual)).digest('hex');
if(hashAntes!==hashDespues) throw new Error('La música actual cambió');
console.log('Página de escucha: tmp/musica/escuchar.html. Música del juego sin cambios.');
