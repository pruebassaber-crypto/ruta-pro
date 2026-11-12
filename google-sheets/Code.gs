// RUTA PRO — pegar en el proyecto Apps Script abierto desde la hoja de cálculo.
// Ejecutar configurarHoja UNA VEZ desde el editor antes de implementar.
const ENCABEZADOS_RUTAPRO = [
  'Registro ID', 'Sesión ID', 'ID estudiante', 'Nombre', 'Correo',
  'Fecha recepción', 'Fecha respuesta', 'Competencia', 'Desafío', 'Nivel',
  'Familia', 'Escena', 'Orden', 'Ruta', 'Índice original elegido (desde 0)',
  'Letra elegida', 'Respuesta presentada', 'Clave presentada', 'Correcto',
  'Puntos', 'Máximo del desafío', 'Tiempo (segundos)',
  'Orden de opciones originales', 'Opciones presentadas', 'Versión'
];
const CLAVES_RUTAPRO = {
  'RQ-M01':[0,4,10,'Razonamiento Cuantitativo','Medio',1],
  'RQ-A01':[0,4,10,'Razonamiento Cuantitativo','Avanzado',2],
  'RQ-B01':[0,4,5,'Razonamiento Cuantitativo','Básico',2],
  'CC-M01':[2,4,10,'Competencias Ciudadanas','Medio',1],
  'CC-A02':[2,4,10,'Competencias Ciudadanas','Avanzado',2],
  'CC-B02':[2,4,5,'Competencias Ciudadanas','Básico',2],
  'CE-M01':[1,5,10,'Comunicación Escrita','Medio',1],
  'CE-A01':[2,4,10,'Comunicación Escrita','Avanzado',2],
  'CE-B01':[0,4,5,'Comunicación Escrita','Básico',2],
  'EN-M01':[1,3,10,'Inglés','Medio',1],
  'EN-A01':[1,3,10,'Inglés','Avanzado',1],
  'EN-B01':[1,3,5,'Inglés','Básico',1],
  'LC-M01':[0,4,10,'Lectura Crítica','Medio',1],
  'LC-A01':[1,4,10,'Lectura Crítica','Avanzado',1],
  'LC-B01':[1,4,5,'Lectura Crítica','Básico',2]
};

function configurarHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  if (!libro) throw new Error('Abre Apps Script desde Extensiones de la hoja de cálculo.');
  PropertiesService.getScriptProperties().setProperty('RUTAPRO_HOJA_ID',libro.getId());
  const hoja = libro.getSheetByName('Respuestas') || libro.insertSheet('Respuestas');
  if (hoja.getLastRow() > 0 && hoja.getRange(1,1).getValue() !== ENCABEZADOS_RUTAPRO[0]) {
    throw new Error('La pestaña Respuestas ya tiene otra estructura. Usa una hoja nueva.');
  }
  hoja.getRange(1,1,1,ENCABEZADOS_RUTAPRO.length).setValues([ENCABEZADOS_RUTAPRO])
    .setBackground('#237A45').setFontColor('#FFFFFF').setFontWeight('bold');
  hoja.setFrozenRows(1);
  hoja.autoResizeColumns(1,ENCABEZADOS_RUTAPRO.length);
  console.log('Ruta Pro preparado. Implementa como aplicación web y copia la URL /exec.');
}

function textoCeldaRutaPro(valor) {
  const texto = String(valor === undefined || valor === null ? '' : valor);
  // Los datos del estudiante y las respuestas se guardan como texto, no fórmulas.
  return /^\s*[=+@-]/.test(texto) ? "'" + texto : texto;
}

function validarRespuestaRutaPro(datos) {
  const clave = CLAVES_RUTAPRO[datos.desafio];
  if (!clave || datos.version !== 'RutaPro-opciones-aleatorias-v7') throw new Error('Desafío o versión no reconocido.');
  for (const [campo,maximo] of [['sesionId',128],['estudianteId',50],['nombre',120],['correo',160]]) {
    if (typeof datos[campo] !== 'string' || !datos[campo].trim() || datos[campo].length > maximo) throw new Error('Campo no válido: ' + campo);
  }
  if (datos.registroId !== datos.sesionId + ':' + datos.desafio) throw new Error('Registro ID no coincide.');
  if (!Number.isInteger(datos.opcionIndice) || datos.opcionIndice < 0 || datos.opcionIndice >= clave[1]) throw new Error('Opción no válida.');
  const orden = datos.ordenOpciones;
  if (!Array.isArray(orden) || orden.length !== clave[1] || new Set(orden).size !== clave[1] || orden.some(i => !Number.isInteger(i) || i < 0 || i >= clave[1])) throw new Error('Orden de opciones no válido.');
  if (!Array.isArray(datos.opcionesPresentadas) || datos.opcionesPresentadas.length !== clave[1] || datos.opcionesPresentadas.some(t => typeof t !== 'string' || t.length > 5000)) throw new Error('Textos de opciones no válidos.');
  if (!Number.isInteger(datos.orden) || datos.orden < 1 || datos.orden > 10) throw new Error('Orden de respuesta no válido.');
  if (!Number.isFinite(datos.tiempoSegundos) || datos.tiempoSegundos < 0) throw new Error('Tiempo no válido.');
  if (!['AVANZADO','BÁSICO'].includes(datos.rutaAsignada)) throw new Error('Ruta no válida.');
  return clave;
}

function doPost(e) {
  let bloqueo;
  try {
    if (!e || !e.postData || typeof e.postData.contents !== 'string' || e.postData.contents.length > 50000) throw new Error('No se recibió una respuesta válida.');
    const datos = JSON.parse(e.postData.contents);
    const clave = validarRespuestaRutaPro(datos);
    const hojaId = PropertiesService.getScriptProperties().getProperty('RUTAPRO_HOJA_ID');
    if (!hojaId) throw new Error('Ejecuta configurarHoja antes de implementar.');
    bloqueo = LockService.getScriptLock();
    bloqueo.waitLock(30000);
    const hoja = SpreadsheetApp.openById(hojaId).getSheetByName('Respuestas');
    if (!hoja) throw new Error('No existe la pestaña Respuestas.');
    const ultima = hoja.getLastRow();
    const repetida = ultima > 1 && hoja.getRange(2,1,ultima-1,1).createTextFinder(datos.registroId).matchEntireCell(true).useRegularExpression(false).findNext();
    if (repetida) return salidaRutaPro({ok:true,duplicado:true});
    const posicion = datos.ordenOpciones.indexOf(datos.opcionIndice);
    const posicionClave = datos.ordenOpciones.indexOf(clave[0]);
    const correcto = datos.opcionIndice === clave[0];
    const fila = [
      datos.registroId,datos.sesionId,datos.estudianteId,datos.nombre,datos.correo,
      new Date().toISOString(),datos.fecha,clave[3],datos.desafio,clave[4],clave[5],datos.escenario,
      datos.orden,datos.rutaAsignada,datos.opcionIndice,String.fromCharCode(65+posicion),
      datos.opcionesPresentadas[posicion],datos.opcionesPresentadas[posicionClave],correcto,
      correcto ? clave[2] : 0,clave[2],datos.tiempoSegundos,
      JSON.stringify(datos.ordenOpciones),JSON.stringify(datos.opcionesPresentadas),datos.version
    ].map(valor => typeof valor === 'string' ? textoCeldaRutaPro(valor) : valor);
    hoja.getRange(ultima+1,1,1,fila.length).setValues([fila]);
    SpreadsheetApp.flush();
    return salidaRutaPro({ok:true});
  } catch (error) {
    console.error('Ruta Pro: ' + error.message);
    return salidaRutaPro({ok:false,error:'No se pudo registrar la respuesta. Consulta las ejecuciones de Apps Script.'});
  } finally {
    if (bloqueo && bloqueo.hasLock()) bloqueo.releaseLock();
  }
}

function doGet() {
  // Esta dirección no publica ni devuelve los datos de los estudiantes.
  const configurado = Boolean(PropertiesService.getScriptProperties().getProperty('RUTAPRO_HOJA_ID'));
  return salidaRutaPro({servicio:'Ruta Pro',configurado:configurado});
}
function salidaRutaPro(datos) {
  return ContentService.createTextOutput(JSON.stringify(datos)).setMimeType(ContentService.MimeType.JSON);
}
