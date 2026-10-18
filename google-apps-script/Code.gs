/**
 * Orgasmo Sonoro: recibe los correos de la lista de espera y los guarda en Google Sheets.
 *
 * Instalación:
 * 1. Crea una hoja de cálculo nueva en Google Drive.
 * 2. Menú Extensiones > Apps Script. Borra el contenido y pega este archivo.
 * 3. Guarda y pulsa Implementar > Nueva implementación > Tipo: Aplicación web.
 *    Ejecutar como: Yo. Quién tiene acceso: Cualquier usuario.
 * 4. Autoriza los permisos y copia la URL que termina en /exec.
 * 5. Pega esa URL en el atributo action del formulario de index.html.
 *
 * Si cambias este código, ve a Implementar > Gestionar implementaciones,
 * edita la implementación y elige "Nueva versión" para que se aplique sin cambiar la URL.
 */

const NOMBRE_HOJA = 'Lista de espera';
const CABECERAS = ['Fecha', 'Email', 'Origen', 'Campaña'];

/** Recibe cada envío del formulario. */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // evita filas duplicadas si llegan dos envíos a la vez

  try {
    const p = (e && e.parameter) || {};

    // Campo trampa: si viene relleno es un bot. Respondemos "ok" sin guardar nada.
    if (p.website) return responder({ ok: true });

    const email = String(p.email || '').trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return responder({ ok: false, error: 'email' });
    }

    const hoja = obtenerHoja();

    // Si el correo ya está en la lista, no lo repetimos
    const filas = hoja.getLastRow() - 1;
    if (filas > 0) {
      const existentes = hoja.getRange(2, 2, filas, 1).getValues().flat();
      if (existentes.indexOf(email) !== -1) return responder({ ok: true, repetido: true });
    }

    hoja.appendRow([new Date(), limpiar(email), limpiar(p.origen), limpiar(p.campana)]);
    return responder({ ok: true });
  } catch (error) {
    return responder({ ok: false, error: 'servidor' });
  } finally {
    lock.releaseLock();
  }
}

/** Permite comprobar en el navegador que la implementación responde. */
function doGet() {
  return responder({ ok: true, servicio: 'Orgasmo Sonoro, lista de espera' });
}

/** Devuelve la hoja de la lista y la crea con cabeceras si no existe. */
function obtenerHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(NOMBRE_HOJA);
  if (!hoja) {
    hoja = libro.insertSheet(NOMBRE_HOJA);
    hoja.appendRow(CABECERAS);
    hoja.setFrozenRows(1);
    hoja.getRange(1, 1, 1, CABECERAS.length).setFontWeight('bold');
  }
  return hoja;
}

/** Recorta el texto y neutraliza valores que la hoja podría interpretar como fórmulas. */
function limpiar(valor) {
  const texto = String(valor || '').slice(0, 300);
  return /^[=+\-@]/.test(texto) ? "'" + texto : texto;
}

/** Respuesta JSON para el formulario. */
function responder(datos) {
  return ContentService
    .createTextOutput(JSON.stringify(datos))
    .setMimeType(ContentService.MimeType.JSON);
}
