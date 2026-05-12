const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/);
    if (!m) continue;
    let key = m[1];
    let val = m[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    process.env[key] = val;
  }
}

const accumulationHeaders = [
  'Timestamp',
  'Nombre',
  'Primer Apellido',
  'Segundo Apellido',
  'Cédula',
  'Correo',
  'Fecha Lecciones Acumuladas',
  'Cantidad Lecciones',
  'Horario Lecciones',
  'Motivo',
  'Detalle',
  'Estado',
  'Fecha Autorización',
  'Comentario Directora',
];

async function main() {
  try {
    const repoRoot = process.cwd();
    loadEnv(path.join(repoRoot, '.env'));

    const spreadsheetId = process.env.GOOGLE_SHEET_ID_ACCUMULATE;
    if (!spreadsheetId) throw new Error('GOOGLE_SHEET_ID_ACCUMULATE no configurado en .env');

    const client = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties.title' });
    const updated = [];
    const skipped = [];

    for (const s of spreadsheet.data.sheets || []) {
      const title = s.properties && s.properties.title;
      if (!title) continue;

      try {
        const headerResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: `'${title.replace(/'/g, "''")}'!A1:N1` });
        const existing = (headerResp.data.values && headerResp.data.values[0]) || [];
        const hasEstado = String(existing[11] || '').trim() !== '' && existing.length >= accumulationHeaders.length;
        if (hasEstado) {
          skipped.push(title);
          continue;
        }

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `'${title.replace(/'/g, "''")}'!A1:N1`,
          valueInputOption: 'RAW',
          requestBody: { values: [accumulationHeaders] },
        });

        updated.push(title);
      } catch (err) {
        skipped.push(title || '(unknown)');
      }
    }

    console.log('Migración completada.');
    console.log('updated:', updated);
    console.log('skipped:', skipped);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

main();
