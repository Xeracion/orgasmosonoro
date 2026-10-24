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
 *
 * Aviso por correo: cada inscripción nueva envía un email a AVISO_A con sus datos.
 * La primera vez que lo publiques, Google pedirá permiso para enviar correo en tu nombre.
 */

const NOMBRE_HOJA = 'Lista de espera';
const CABECERAS = ['Fecha', 'Email', 'Origen', 'Campaña'];

// Dirección que recibe el aviso de cada inscripción nueva (varias, separadas por comas).
// Déjala vacía ('') para desactivar los avisos.
const AVISO_A = 'info@xeracion.org';

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

    const fecha = new Date();
    hoja.appendRow([fecha, limpiar(email), limpiar(p.origen), limpiar(p.campana)]);
    avisarPorCorreo(email, p, fecha, hoja.getLastRow() - 1);
    return responder({ ok: true });
  } catch (error) {
    return responder({ ok: false, error: 'servidor' });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Envía un email con los datos de la inscripción. Si falla, la inscripción
 * ya está guardada en la hoja y la persona recibe igualmente el "ok".
 */
function avisarPorCorreo(email, p, fecha, total) {
  if (!AVISO_A) return;
  try {
    const cuando = Utilities.formatDate(fecha, 'Europe/Madrid', 'dd/MM/yyyy HH:mm');
    const datos = [
      ['Correo', email],
      ['Fecha', cuando],
      ['Origen', String(p.origen || 'directo').slice(0, 300)],
      ['Campaña', String(p.campana || '-').slice(0, 300)],
      ['Total en la lista', String(total)],
    ];
    const texto = datos.map(function (d) { return d[0] + ': ' + d[1]; }).join('\n') +
      '\n\nHoja: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl();
    const html = '<p>Nueva inscripción en la lista de espera de Orgasmo Sonoro.</p><table cellpadding="6">' +
      datos.map(function (d) {
        return '<tr><td><strong>' + d[0] + '</strong></td><td>' + escaparHtml(d[1]) + '</td></tr>';
      }).join('') +
      '</table><p><a href="' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '">Abrir la hoja</a></p>';

    MailApp.sendEmail({
      to: AVISO_A,
      replyTo: email,
      subject: 'Nueva inscripción en Orgasmo Sonoro: ' + email,
      body: texto,
      htmlBody: html,
      name: 'Orgasmo Sonoro',
    });
  } catch (error) {
    console.error('No se pudo enviar el aviso: ' + error);
  }
}

/** Evita que los datos recibidos se interpreten como HTML en el correo. */
function escaparHtml(texto) {
  return String(texto).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
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
