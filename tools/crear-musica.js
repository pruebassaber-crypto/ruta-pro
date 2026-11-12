'use strict';
// Reconstruye la muestra aprobada: Camino a la universidad (3-camino).
const fs = require('node:fs');
const path = require('node:path');
require('./preparar-muestras-musica.js');
const root = path.join(__dirname,'..');
fs.copyFileSync(path.join(root,'tmp','musica','3-camino.wav'),path.join(root,'assets','audio','aventura.wav'));
console.log('Musica activa: Camino a la universidad, 96 BPM, 20.7 segundos en bucle.');
