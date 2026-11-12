'use strict';
// Pruebas de lógica e interacción con un DOM mínimo, sin dependencias externas.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');

function crearContexto(partidaGuardada, claveGuardada = 'rutapro.partida.v2') {
    let document;
    class Element {
        constructor(tag) {
            this.tagName = tag.toLowerCase(); this.children = []; this.events = {}; this.attributes = {};
            this.className = ''; this._text = ''; this.style = {}; this.value = ''; this.dataset = {};
            this.scrollTop = 0; this.isConnected = true;
            this.classList = {
                add: (...names) => { this.className = [...new Set([...this.className.split(' ').filter(Boolean), ...names])].join(' '); },
                remove: (...names) => { this.className = this.className.split(' ').filter(n => !names.includes(n)).join(' '); },
                contains: name => this.className.split(' ').includes(name),
                toggle: (name, force) => { const add = force === undefined ? !this.classList.contains(name) : force; if (add) this.classList.add(name); else this.classList.remove(name); }
            };
        }
        set textContent(value) { this._text = String(value); this.children = []; }
        get textContent() { return this._text + this.children.map(node => node.textContent).join(''); }
        append(...nodes) { for (const node of nodes) { node.parent = this; this.children.push(node); } }
        replaceChildren(...nodes) { this.children.forEach(n => n.isConnected = false); this.children = []; this._text = ''; this.append(...nodes); }
        setAttribute(key, value) { this.attributes[key] = value; }
        removeAttribute(key) { delete this.attributes[key]; }
        addEventListener(key, fn) { (this.events[key] ||= []).push(fn); }
        click() { (this.events.click || []).forEach(fn => fn({ preventDefault() {} })); }
        focus() { document.activeElement = this; }
        remove() { if (this.parent) this.parent.children = this.parent.children.filter(node => node !== this); }
        querySelectorAll(selector) { return select(this, selector); }
        querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
        reportValidity() {
            return ['student-name', 'student-id', 'student-email'].every(id => document.getElementById(id).value) &&
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.getElementById('student-email').value);
        }
    }
    function descendants(node) { return node.children.flatMap(child => [child, ...descendants(child)]); }
    function match(node, selector) {
        if (selector === '[data-key]') return Boolean(node.dataset.key);
        if (selector === 'button:not(:disabled)') return node.tagName === 'button' && !node.disabled;
        if (selector.startsWith('#')) return node.id === selector.slice(1);
        if (selector.startsWith('.')) return node.classList.contains(selector.slice(1));
        return node.tagName === selector.toLowerCase();
    }
    function select(base, selector) {
        const output = [];
        for (const group of selector.split(',')) {
            const segments = group.trim().split(/\s+/);
            let nodes = [base];
            for (const segment of segments) nodes = nodes.flatMap(node => descendants(node).filter(child => match(child, segment)));
            output.push(...nodes);
        }
        return [...new Set(output)];
    }
    document = { body: new Element('body'), activeElement: null, createElement: tag => new Element(tag), addEventListener() {},
        querySelectorAll(selector) { return select(this.body, selector); },
        querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
        getElementById(id) { return descendants(this.body).find(node => node.id === id) || null; } };
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const stack = [document.body];
    for (const token of html.matchAll(/<\/?([a-z][\w-]*)([^>]*)>/gi)) {
        const tag = token[1].toLowerCase();
        if (['html', 'head', 'body', 'meta', 'link', 'title', 'script'].includes(tag)) continue;
        if (token[0].startsWith('</')) { if (stack.length > 1) stack.pop(); continue; }
        const node = new Element(tag);
        for (const attr of token[2].matchAll(/([\w-]+)="([^"]*)"/g)) {
            const key = attr[1], value = attr[2];
            if (key === 'id') node.id = value;
            if (key === 'class') node.className = value;
            if (key === 'data-key') node.dataset.key = value;
        }
        stack.at(-1).append(node);
        if (!['img', 'input', 'br'].includes(tag)) stack.push(node);
    }
    const canvas = document.getElementById('gameCanvas');
    canvas.width = 1000; canvas.height = 562;
    canvas.getContext = () => new Proxy({}, { get: (target, key) => target[key] ?? (() => {}) });
    const storage = new Map();
    if (partidaGuardada) storage.set(claveGuardada, partidaGuardada);
    const context = vm.createContext({
        document, console, setTimeout: () => 1, clearTimeout() {},
        requestAnimationFrame() {}, alert: text => { throw new Error('Alerta inesperada: ' + text); },
        Image: class { constructor() { this.complete = false; this.naturalWidth = 0; } },
        Audio: class {
            constructor(src) { this.src = src; this.reproducciones = 0; this.pausas = 0; }
            play() { this.reproducciones++; return { then() {}, catch() {} }; }
            pause() { this.pausas++; }
        },
        localStorage: { setItem: (k, v) => storage.set(k, v), getItem: k => storage.get(k) || null },
        crypto: { randomUUID: () => 'prueba-' + Math.random() }, Blob, URL,
        fetch() { throw new Error('No debe enviarse a un endpoint sin configurar'); }
    });
    context.window = context;
    context.eventosVentana = {};
    context.addEventListener = (tipo, manejador) => { (context.eventosVentana[tipo] ||= []).push(manejador); };
    const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
    for (const filename of scripts) {
        let codigo = fs.readFileSync(path.join(root, filename), 'utf8');
        // Las pruebas masivas nunca escriben en la hoja real del proyecto.
        if (filename === 'js/conexion.js') codigo = codigo.replace(/^const GOOGLE_SCRIPT_URL = .*;$/m, "const GOOGLE_SCRIPT_URL = 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI';");
        vm.runInContext(codigo, context, { filename });
    }
    return context;
}
if (require.main === module) require('./pruebas-logica-completa.js')(crearContexto);
module.exports = { crearContexto };
