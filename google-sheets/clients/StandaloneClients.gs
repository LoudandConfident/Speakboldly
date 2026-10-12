const CLIENT_HEADERS = [
  'Client ID',
  'Name',
  'Email',
  'Student Code',
  'Level / Program',
  'Payment status',
  'Amount paid',
  'Hours taught',
  'Updated at'
];

function setupClientSync() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) {
    throw new Error('Open Apps Script from your Google Sheet.');
  }

  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('CLIENT_SHEET_ID', book.getId());

  if (!properties.getProperty('CLIENT_SYNC_KEY')) {
    properties.setProperty(
      'CLIENT_SYNC_KEY',
      Utilities.getUuid() + Utilities.getUuid()
    );
  }

  const sheet =
    book.getSheetByName('Clients') || book.insertSheet('Clients');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(CLIENT_HEADERS);
  } else {
    const headers = sheet.getRange(1, 1, 1, 9).getValues()[0];
    if (JSON.stringify(headers) !== JSON.stringify(CLIENT_HEADERS)) {
      throw new Error('Clients tab must be empty before first setup.');
    }
  }

  book.setSpreadsheetTimeZone('Africa/Cairo');
  sheet.setFrozenRows(1);
  sheet.getRange('A1:I1').setFontWeight('bold');
  sheet.getRange('D2:D').setNumberFormat('@');
  sheet.autoResizeColumns(1, 9);
}

function response(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const properties = PropertiesService.getScriptProperties();
  return response({
    ok: true,
    service: 'Speak Boldly Clients',
    configured: Boolean(
      properties.getProperty('CLIENT_SHEET_ID') &&
      properties.getProperty('CLIENT_SYNC_KEY')
    )
  });
}

function doPost(event) {
  const lock = LockService.getScriptLock();

  try {
    if (!event || !event.postData ||
        event.postData.contents.length > 8000000) {
      throw new Error('Invalid request.');
    }

    const data = JSON.parse(event.postData.contents);
    const properties = PropertiesService.getScriptProperties();
    const key = properties.getProperty('CLIENT_SYNC_KEY');

    if (!key || data.key !== key) {
      throw new Error('Incorrect connection key.');
    }

    const sheetId = properties.getProperty('CLIENT_SHEET_ID');
    if (!sheetId) {
      throw new Error('Run setupClientSync first.');
    }

    const sheet = SpreadsheetApp
      .openById(sheetId)
      .getSheetByName('Clients');

    if (!sheet) {
      throw new Error('Clients tab is missing.');
    }

    if(data.action!=='sendClientEmail'&&event.postData.contents.length>20000)throw new Error('Request too large.');
    if(data.action==='sendClientEmail')return handleClientEmail(data);

    if (data.action === 'checkConnection') {
      return response({ ok: true, connected: true });
    }

    if(['listTeacherDocuments','saveTeacherDocument'].includes(data.action)){if(typeof handleSheetDocumentAction!=='function')throw new Error('Update your Clients Apps Script to enable shared reports.');return handleSheetDocumentAction(data);}

    if (['listSessions', 'saveSession', 'cancelSession'].includes(data.action)) {
      return handleSheetSessionAction(data);
    }

    if (data.action !== 'upsertClient' || !data.client) {
          if (data.action === 'listClients') {
      const rows = sheet.getLastRow() > 1
        ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues()
        : [];
      const clients = rows.filter(row => row[0] && row[1] && row[2]).map(row => ({
        id: String(row[0]), name: String(row[1]).trim(),
        email: String(row[2]).trim().toLowerCase(),
        code: String(row[3]).padStart(4, '0'), level: String(row[4]),
        payment: String(row[5]), amountPaid: Number(row[6] || 0),
        hours: Number(row[7] || 0),
        permissions: row[9] ? JSON.parse(String(row[9])) : []
      }));
      return response({ ok: true, clients });
    }


      throw new Error('Invalid action.');
    }

    const client = data.client;
    if(client.permissions!==undefined&&(!Array.isArray(client.permissions)||client.permissions.length>500||client.permissions.some(p=>typeof p!=='string'||p.length>2000||!/^(section:|file:)/.test(p))))throw new Error('Invalid client access selections.');
    const text = value => String(value == null ? '' : value).trim();

    const id = text(client.id);
    const name = text(client.name);
    const email = text(client.email).toLowerCase();
    const code = text(client.code);
    const level = text(client.level);
    const payment = text(client.payment);
    const amount = Number(client.amountPaid || 0);
    const hours = Number(client.hours);

    if (!/^[A-Za-z0-9-]{1,100}$/.test(id)) {
      throw new Error('Invalid student ID.');
    }
    if (!name || name.length > 100) {
      throw new Error('Check the student name.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        email.length > 254) {
      throw new Error('Check the student email.');
    }
    if (!/^\d{4}$/.test(code) || code === '1962') {
      throw new Error('Choose a valid four-digit student code.');
    }
    if (!level || level.length > 100) {
      throw new Error('Check the level or program.');
    }
    if (!['Unpaid', 'Part paid', 'Paid'].includes(payment)) {
      throw new Error('Check the payment status.');
    }
    if (!Number.isFinite(amount) || amount < 0 ||
        amount > 100000000 ||
        !Number.isFinite(hours) || hours < 0 ||
        hours > 100000) {
      throw new Error('Check the amount paid and hours.');
    }

    lock.waitLock(20000);

    const rows = sheet.getLastRow() > 1
      ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getValues()
      : [];

    const normalize = value =>
      text(value).normalize('NFKC').replace(/\s+/g, ' ').toLowerCase();

    let targetRow = sheet.getLastRow() + 1;

    rows.forEach((row, index) => {
      if (String(row[0]) === id) {
        targetRow = index + 2;
        return;
      }

      if (String(row[3]).padStart(4, '0') === code) {
        throw new Error('Student code is already assigned.');
      }
      if (normalize(row[1]) === normalize(name)) {
        throw new Error('Student name is already registered.');
      }
      if (text(row[2]).toLowerCase() === email) {
        throw new Error('Email already belongs to another student.');
      }
    });

    const safe = value =>
      /^[=+\-@\t\r]/.test(value) ? "'" + value : value;

    sheet.getRange(targetRow, 4).setNumberFormat('@');
    sheet.getRange(targetRow, 1, 1, 9).setValues([[
      id,
      safe(name),
      safe(email),
      code,
      safe(level),
      payment,
      amount,
      hours,
      new Date().toISOString()
    ]]);

    if(client.permissions!==undefined){sheet.getRange(1,10).setValue('Permissions');sheet.getRange(targetRow,10).setValue(JSON.stringify(client.permissions));}
    return response({ ok: true, clientId: id });

  } catch (error) {
    return response({ ok: false, error: error.message });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}