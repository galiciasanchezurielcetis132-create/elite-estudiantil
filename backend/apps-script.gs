/**
 * Élite Estudiantil — recepción de datos en Google Sheets (gratis, sin servidor)
 *
 * PASOS
 * 1. Crea una Hoja de cálculo de Google nueva (solo la planilla debe tener acceso).
 * 2. Menú: Extensiones > Apps Script. Borra lo que haya y pega este archivo.
 * 3. Implementar > Nueva implementación > tipo "Aplicación web".
 *      - Ejecutar como: Yo
 *      - Quién tiene acceso: Cualquier persona
 * 4. Copia la URL que termina en /exec y pégala en CONFIG.sheetsUrl de index.html.
 *
 * Cada vez que cambies este código, crea una NUEVA versión de la implementación.
 */

var SHEETS = {
  support: { name: 'Apoyos', cols: ['createdAt', 'name', 'grade', 'shift', 'interest', 'contact', 'id'] },
  suggestion: { name: 'Sugerencias', cols: ['createdAt', 'topic', 'text', 'id'] }
};

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var def = SHEETS[body.kind];
    if (!def || !body.record) return out_({ ok: false, error: 'bad request' });

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sh = ss.getSheetByName(def.name) || ss.insertSheet(def.name);
      if (sh.getLastRow() === 0) sh.appendRow(def.cols);
      var r = body.record;
      sh.appendRow(def.cols.map(function (c) { return safe_(r[c]); }));
    } finally {
      lock.releaseLock();
    }
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}

function doGet() { return out_({ ok: true, service: 'elite-estudiantil' }); }

// Evita que una celda se ejecute como fórmula (=, +, -, @)
function safe_(v) {
  var s = String(v === undefined || v === null ? '' : v).slice(0, 1200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
