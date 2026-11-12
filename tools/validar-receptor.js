'use strict';
// Verifica el receptor con servicios simulados; no accede a Google ni envía datos.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname,'..');
const filas = [], propiedades = new Map();
let bloqueo = false;
const hoja = {
    getLastRow:() => filas.length,
    setFrozenRows() {}, autoResizeColumns() {},
    getRange(fila,columna,alto=1,ancho=1) {
        const rango = {
            getValue:() => filas[fila-1]?.[columna-1] ?? '',
            setValues(datos) { assert.equal(datos.length,alto);datos.forEach((r,i)=>{assert.equal(r.length,ancho);filas[fila+i-1] ||= [];r.forEach((v,j)=>filas[fila+i-1][columna+j-1]=v);});return rango; },
            setBackground:() => rango, setFontColor:() => rango, setFontWeight:() => rango,
            createTextFinder(texto) { return {matchEntireCell(){return this;},useRegularExpression(){return this;},findNext:()=>filas.slice(fila-1,fila-1+alto).find(r=>r[columna-1]===texto) || null}; }
        };
        return rango;
    }
};
const libro = {getId:()=>'hoja-prueba',getSheetByName:()=>hoja,insertSheet:()=>hoja};
const errores = [];
const c = vm.createContext({
    console:{log(){},error:t=>errores.push(t)},
    SpreadsheetApp:{getActiveSpreadsheet:()=>libro,openById:id=>{assert.equal(id,'hoja-prueba');return libro;},flush(){}},
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>propiedades.get(k),setProperty(k,v){propiedades.set(k,v);return this;}})},
    LockService:{getScriptLock:()=>({waitLock(){assert(!bloqueo);bloqueo=true;},hasLock:()=>bloqueo,releaseLock(){bloqueo=false;}})},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:texto=>({texto,setMimeType(){return this;}})}
});
vm.runInContext(fs.readFileSync(path.join(root,'google-sheets','Code.gs'),'utf8'),c);
function evaluar(codigo){return vm.runInContext(codigo,c);}
assert.equal(JSON.parse(evaluar('doGet().texto')).configurado,false);
evaluar('configurarHoja()');
assert.equal(filas.length,1);
assert.equal(filas[0].length,25);
assert.equal(JSON.parse(evaluar('doGet().texto')).configurado,true);
const bancos = vm.createContext({});
for(const archivo of ['lecturaCritica.js','competenciasCiudadanas.js','comunicacionEscrita.js','ingles.js','razonamientoCuantitativo.js']) vm.runInContext(fs.readFileSync(path.join(root,'js',archivo),'utf8'),bancos);
const desafios = vm.runInContext('({...DESAFIOS_LC,...DESAFIOS_CC,...DESAFIOS_CE,...DESAFIOS_EN,...DESAFIOS_RQ})',bancos);
let ultimo;
function enviar(datos){c.entrada=datos;return JSON.parse(evaluar('doPost({postData:{contents:JSON.stringify(entrada)}}).texto'));}
for(const [id,item] of Object.entries(desafios)) {
    const clave = evaluar('CLAVES_RUTAPRO['+JSON.stringify(id)+']');
    assert.equal(clave[0],item.correcta);assert.equal(clave[1],item.opciones.length);assert.equal(clave[2],item.maximo);assert.equal(clave[4],item.nivel);assert.equal(clave[5],item.familia);
    const orden = item.opciones.map((_,i)=>i).reverse();
    const opciones = orden.map((i,n)=>String.fromCharCode(65+n)+'. '+item.opciones[i].replace(/^[A-Z]\.\s*/,''));
    ultimo = {sesionId:'sesion-prueba',registroId:'sesion-prueba:'+id,estudianteId:'PRUEBA1',nombre:'Prueba Ruta Pro',correo:'prueba@example.com',version:'RutaPro-opciones-aleatorias-v7',desafio:id,opcionIndice:item.correcta,ordenOpciones:orden,opcionesPresentadas:opciones,orden:1,tiempoSegundos:10,rutaAsignada:'AVANZADO',fecha:new Date().toISOString(),escenario:'prueba',puntaje:999};
    assert.equal(enviar(ultimo).ok,true);
    const fila = filas.at(-1);
    assert.equal(fila[16],opciones[orden.indexOf(item.correcta)]);
    assert.equal(fila[17],fila[16]);assert.equal(fila[18],true);assert.equal(fila[19],item.maximo);
    assert.equal(bloqueo,false);
}
assert.equal(filas.length,16);
assert.equal(enviar(ultimo).duplicado,true);assert.equal(filas.length,16);
assert.equal(enviar({...ultimo,sesionId:'otra-sesion',registroId:'otra-sesion:'+ultimo.desafio,nombre:'=SUM(1,2)',opcionIndice:(ultimo.opcionIndice+1)%ultimo.ordenOpciones.length}).ok,true);
assert.equal(filas.at(-1)[3],"'=SUM(1,2)");assert.equal(filas.at(-1)[19],0);
const cantidad = filas.length;
assert.equal(enviar({...ultimo,ordenOpciones:[0,0,0,0]}).ok,false);
assert.equal(enviar({...ultimo,version:'otra-version'}).ok,false);
assert.equal(JSON.parse(evaluar("doPost({postData:{contents:'{mal'}}).texto")).ok,false);
assert.equal(filas.length,cantidad);
assert.equal(bloqueo,false);
console.log('OK: 15 desafíos compatibles, puntajes recalculados, letras aleatorias, duplicados, campos y entradas inválidas.');
console.log('Prueba local con servicios simulados; falta publicar y verificar la escritura real en Google Sheets.');
