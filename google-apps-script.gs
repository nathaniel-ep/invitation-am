/**
 * Script à coller dans le Google Sheet (Extensions → Apps Script).
 * Reçoit les réponses RSVP du site et les ajoute en ligne dans la feuille.
 * Voir SETUP-GOOGLE-SHEETS.md pour le déploiement.
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (!data.name || !data.email || (data.attendance !== 'oui' && data.attendance !== 'non')) {
      return jsonResponse({ ok: false, error: 'Champs requis manquants' });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Créer la ligne d'en-têtes si la feuille est vide
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Date', 'Nom', 'Email', 'Présence', 'Nb personnes', 'Accompagnants', 'Régime / Allergies', 'Message']);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    }

    var isAttending = data.attendance === 'oui';
    sheet.appendRow([
      Utilities.formatDate(new Date(), 'Indian/Reunion', 'dd/MM/yyyy HH:mm'),
      String(data.name).slice(0, 200),
      String(data.email).slice(0, 200),
      isAttending ? 'Présent' : 'Absent',
      isAttending ? (parseInt(data.guests, 10) || 1) : 0,
      String(data.guestNames || '').slice(0, 1000),
      String(data.diet || '').slice(0, 1000),
      String(data.message || '').slice(0, 2000)
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
