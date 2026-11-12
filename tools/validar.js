'use strict';
// Sin dependencias: node tools/validar.js [ruta-opcional-al-pdf]
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const zlib = require('node:zlib');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'tmp', 'validacion');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

function extraerPdf(file) {
    const raw = fs.readFileSync(file).toString('latin1');
    const objects = new Map(), streams = new Map(), maps = new Map(), fonts = new Map(), refs = new Map();
    for (const m of raw.matchAll(/(\d+) 0 obj([\s\S]*?)endobj/g)) {
        const id = Number(m[1]), body = m[2];
        objects.set(id, body);
        const stream = body.match(/stream\r?\n([\s\S]*?)\r?\nendstream/);
        if (stream && body.includes('/FlateDecode')) {
            try { streams.set(id, zlib.inflateSync(Buffer.from(stream[1], 'latin1')).toString('latin1')); } catch {}
        }
    }
    for (const [id, text] of streams) {
        if (!text.includes('begincmap')) continue;
        const map = new Map();
        for (const block of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g))
            for (const m of block[1].matchAll(/<([\da-f]+)>\s*<([\da-f]+)>/gi))
                map.set(parseInt(m[1], 16), String.fromCharCode(parseInt(m[2], 16)));
        for (const block of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g))
            for (const m of block[1].matchAll(/<([\da-f]+)>\s*<([\da-f]+)>\s*<([\da-f]+)>/gi)) {
                const start = parseInt(m[1], 16), end = parseInt(m[2], 16), dest = parseInt(m[3], 16);
                for (let n = start; n <= end; n++) map.set(n, String.fromCharCode(dest + n - start));
            }
        maps.set(id, map);
    }
    for (const [id, body] of objects) {
        const m = body.match(/\/ToUnicode (\d+) 0 R/);
        if (m) fonts.set(id, maps.get(Number(m[1])));
    }
    for (const m of raw.matchAll(/\/F(\d+) (\d+) 0 R/g)) refs.set(m[1], fonts.get(Number(m[2])));
    let result = '';
    for (const [, text] of [...streams].sort((a, b) => a[0] - b[0])) {
        if (!/^BT/m.test(text)) continue;
        let font;
        for (const token of text.matchAll(/\/F(\d+) [\d.]+ Tf|<([\da-f]+)> Tj|EMC/gi)) {
            if (token[1]) font = refs.get(token[1]);
            else if (token[2]) for (let i = 0; i < token[2].length; i += 4)
                result += font?.get(parseInt(token[2].slice(i, i + 4), 16)) || '?';
            else result += '\n';
        }
    }
    return result;
}
function validarArchivos() {
    const files = fs.readdirSync(path.join(root, 'js')).filter(file => file.endsWith('.js'));
    for (const file of files) new vm.Script(fs.readFileSync(path.join(root, 'js', file), 'utf8'), { filename: file });
    const text = [fs.readFileSync(path.join(root, 'index.html'), 'utf8'), fs.readFileSync(path.join(root, 'estilos.css'), 'utf8'), ...files.map(file => fs.readFileSync(path.join(root, 'js', file), 'utf8'))].join('\n');
    for (const m of text.matchAll(/(?:assets\/[^'"\s)]+\.(?:png|svg|wav|mp3)|js\/[^'"\s]+\.js)/g)) assert(fs.existsSync(path.join(root, m[0])), 'Falta recurso: ' + m[0]);
    const pdf = process.argv.slice(2).find(argumento => !argumento.startsWith('--'));
    if (pdf) {
        const source = extraerPdf(pdf);
        const context = vm.createContext({});
        const esCiudadanas = /CC-M01/.test(source);
        const esIngles = /Lost on the Way/.test(source);
        const esEscrita = /CE-M01/.test(source);
        const archivo = esEscrita ? 'comunicacionEscrita.js' : esIngles ? 'ingles.js' : esCiudadanas ? 'competenciasCiudadanas.js' : 'lecturaCritica.js';
        vm.runInContext(fs.readFileSync(path.join(root, 'js', archivo), 'utf8'), context);
        const data = vm.runInContext(esEscrita ? '({ desafios: DESAFIOS_CE, fuentes: Object.values(FUENTES_CE).flatMap(fuente => fuente.lineas) })' : esIngles ? '({ desafios: DESAFIOS_EN, fuentes: Object.values(FUENTES_EN).flatMap(fuente => fuente.lineas) })' : esCiudadanas ? '({ desafios: DESAFIOS_CC, fuentes: [] })' : '({ desafios: DESAFIOS_LC, fuentes: [CORREO_LC.texto, CORREO_LC.asunto, MENSAJE_SOFI, ...DIALOGO_DOCENTE] })', context);
        const normalizar = value => value.replace(/\s+/g, ' ').trim();
        const original = normalizar(source);
        for (const [id, item] of Object.entries(data.desafios)) {
            for (const [key, value] of Object.entries(item)) {
                // La ficha inglesa no redacta distractores ni retroalimentación:
                // esas explicaciones son guion del juego, no transcripción literal.
                if (esIngles && !['nombre', 'enunciado', 'justificacion'].includes(key)) continue;
                // Las explicaciones CE corrigen inconsistencias documentadas del PDF.
                if (esEscrita && !['nombre', 'enunciado'].includes(key)) continue;
                const textoFuente = key === 'enunciado' && item.enunciadoOriginal ? item.enunciadoOriginal : value;
                if (typeof textoFuente === 'string') assert(original.includes(normalizar(textoFuente)), id + ' no coincide con PDF: ' + key);
            }
            item.opciones.forEach((opcion, indice) => {
                // Corrección solicitada en Correcciones RUTA PRO.docx: oriGinal -> original.
                const textoComparacion = id === 'LC-B01' && indice === 3 ? original.replace('oriGinal', 'original') : original;
                assert(textoComparacion.includes(normalizar(opcion)), id + ' alternativa ' + indice + ' no coincide con PDF');
            });
        }
        for (const value of data.fuentes)
            assert(original.includes(normalizar(value)), 'Mensaje/diálogo no coincide con PDF: ' + value.slice(0, 70));
        console.log(esEscrita ? 'OK: fragmentos, preguntas y las 13 alternativas de Comunicación Escrita coinciden con el PDF.' : esIngles ? 'OK: estímulos, preguntas, opciones y justificaciones de Inglés coinciden con el PDF.' : 'OK: textos fuente, alternativas, justificaciones y retroalimentación coinciden con el PDF; las adaptaciones conservan el enunciado original.');
    }
    console.log('OK: sintaxis JavaScript y recursos locales.');
}
const pruebasRuta = new Function(fs.readFileSync(path.join(__dirname, 'pruebas-recorrido.js'), 'utf8') + '\nreturn pruebasRuta;')();
async function main() {
    validarArchivos();
    if (process.argv.includes('--solo-archivos')) return;
    fs.mkdirSync(output, { recursive: true });
    const mime = { '.html': 'text/html;charset=utf-8', '.js': 'text/javascript;charset=utf-8', '.css': 'text/css;charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.mp3': 'audio/mpeg' };
    const server = http.createServer((req, res) => {
        const filename = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
        if (!filename.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
        fs.readFile(filename, (error, data) => {
            if (error) { res.writeHead(404).end(); return; }
            if (filename === path.join(root,'js','conexion.js')) {
                // Este servidor solo valida el juego: evita envíos masivos a la hoja real.
                data = Buffer.from(data.toString('utf8').replace(/^const GOOGLE_SCRIPT_URL = .*;$/m, "const GOOGLE_SCRIPT_URL = 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI';"));
            }
            res.setHeader('Content-Type', mime[path.extname(filename)] || 'application/octet-stream');
            res.end(data);
        });
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    console.log('Servidor local de pruebas:', port);
    const browserPath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const profile = path.join(output, 'perfil-' + Date.now());
    let browser;
    try {
        browser = process.env.RUTAPRO_DEBUG_PORT ? null : spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-extensions', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    } catch (error) {
        server.closeAllConnections(); server.close();
        throw error;
    }
    console.log('Navegador de pruebas:', browser?.pid || 'conexión externa local');
    let stderr = '';
    browser?.stderr.on('data', data => { stderr += data; });
    let socket;
    try {
        let debugPort = process.env.RUTAPRO_DEBUG_PORT;
        for (let i = 0; !debugPort && i < 80; i++) {
            const active = path.join(profile, 'DevToolsActivePort');
            if (fs.existsSync(active)) { debugPort = fs.readFileSync(active, 'utf8').split('\n')[0].trim(); break; }
            if (browser?.exitCode !== null) throw new Error('Chrome terminó: ' + stderr);
            await pause(100);
        }
        assert(debugPort, 'Chrome no inició: ' + stderr);
        console.log('Puerto de verificación:', debugPort);
        const pages = await (await fetch('http://127.0.0.1:' + debugPort + '/json/list')).json();
        socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
        console.log('Conectando al navegador...');
        await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
        let counter = 0;
        const pending = new Map(), errors = [];
        socket.addEventListener('message', event => {
            const message = JSON.parse(event.data);
            if (message.id && pending.has(message.id)) {
                const { resolve, reject } = pending.get(message.id); pending.delete(message.id);
                if (message.error) reject(new Error(JSON.stringify(message.error))); else resolve(message.result);
            }
            if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
        });
        const send = (method, params = {}) => new Promise((resolve, reject) => {
            const id = ++counter;
            pending.set(id, { resolve, reject });
            socket.send(JSON.stringify({ id, method, params }));
        });
        const evaluate = async expression => {
            const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
            if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || JSON.stringify(result.exceptionDetails));
            return result.result.value;
        };
        await send('Page.enable'); await send('Runtime.enable');
        console.log('Navegador conectado.');
        for (const [medio, segundo] of [[true, true], [true, false], [false, true], [false, false]]) {
            await send('Page.navigate', { url: 'http://127.0.0.1:' + port + '/index.html' });
            let ready = false;
            for (let i = 0; i < 80; i++) {
                try { ready = await evaluate("document.readyState === 'complete' && typeof iniciarEscena4 === 'function' && !estadoJuego.iniciado"); } catch {}
                if (ready) break;
                await pause(100);
            }
            assert(ready, 'La página no está lista');
            console.log('OK navegador:', await evaluate('(' + pruebasRuta.toString() + ')(' + medio + ',' + segundo + ')'));
        }
        await require('./pruebas-pantallas.js')({send,evaluate,port,output,pruebasRuta});
        // Capturas reales de pregunta extensa y de ambos escenarios.
        await evaluate("estadoJuego.finalizado=false; estadoJuego.resultados=Object.fromEntries(Object.entries(estadoJuego.resultados).filter(([id])=>!id.startsWith('LC-'))); estadoJuego.tiempos={}; estadoJuego.escenaActual=1; estadoJuego.paso=3; document.getElementById('results-screen').classList.add('hidden'); document.getElementById('canvas-screen').classList.remove('hidden'); registrarRespuestaLC('LC-M01',0); transicionSiguienteEscena();");
        await pause(500);
        for (const [name, expression] of [
            ['aula', 'cerrarModal();renderizar();'],
            ['pregunta-avanzada', 'estadoJuego.paso=2;mostrarPreguntaLC("LC-A01");'],
            ['cafeteria', 'cerrarModal();estadoJuego.resultados["LC-M01"].correcto=false;iniciarEscena3();']
        ]) {
            await evaluate(expression); await pause(300);
            const shot = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(output, name + '.png'), Buffer.from(shot.data, 'base64'));
        }
        // Comprobar que los botones largos caben horizontalmente y existe scroll vertical.
        await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
        await evaluate("estadoJuego.paso=2;mostrarMensajeSofi();");
        await pause(200);
        assert(await evaluate("document.getElementById('interaction-modal').getBoundingClientRect().right <= innerWidth && document.documentElement.scrollWidth <= innerWidth"), 'Desbordamiento horizontal en móvil');
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(output, 'movil.png'), Buffer.from(shot.data, 'base64'));
        assert.equal(errors.length, 0, 'Excepciones de navegador: ' + JSON.stringify(errors));
        console.log('OK: sin excepciones de navegador; capturas en tmp/validacion.');
        await send('Browser.close');
    } finally {
        socket?.close();
        if (browser && browser.exitCode === null) browser.kill();
        server.closeAllConnections();
        server.close();
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

