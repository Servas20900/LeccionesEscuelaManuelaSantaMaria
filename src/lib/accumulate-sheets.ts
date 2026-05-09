import { google } from "googleapis";
import { teacherFullName, type AccumulationRecord, type AccumulationRecordInput } from "./schemas";

const accumulationHeaders = [
  "Timestamp",
  "Nombre",
  "Primer Apellido",
  "Segundo Apellido",
  "Cédula",
  "Correo",
  "Fecha Lecciones Acumuladas",
  "Cantidad Lecciones",
  "Horario Lecciones",
  "Motivo",
  "Detalle",
];

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} no está configurada.`);
  }
  return value;
}

function getPrivateKey() {
  return requiredEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
}

function quoteSheetTitle(title: string) {
  return `'${title.replace(/'/g, "''")}'`;
}

function buildTeacherSheetTitle(submission: AccumulationRecordInput) {
  const candidate = `${submission.cedula} - ${teacherFullName(submission)}`.replace(/[\[\]\:*?/\\]/g, " ");
  return candidate.replace(/\s+/g, " ").trim().slice(0, 100);
}

function getSheetsClient() {
  return google.sheets({
    version: "v4",
    auth: new google.auth.JWT({
      email: requiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
      key: getPrivateKey(),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    }),
  });
}

function parseUpdatedRowIndex(updatedRange?: string | null) {
  if (!updatedRange) {
    return null;
  }

  const match = updatedRange.match(/!(?:[A-Z]+)(\d+):(?:[A-Z]+)(\d+)$/);
  if (!match) {
    return null;
  }

  return Number(match[1]);
}

function buildAccumulationRecord(sheetTitle: string, rowIndex: number, row: string[]): AccumulationRecord {
  return {
    sheetTitle,
    rowIndex,
    timestamp: row[0] ?? "",
    nombre: row[1] ?? "",
    primerApellido: row[2] ?? "",
    segundoApellido: row[3] ?? "",
    cedula: row[4] ?? "",
    correoInstitucional: row[5] ?? "",
    fechaLeccionesAcumuladas: row[6] ?? "",
    cantidadLecciones: Number(row[7] ?? 0),
    horarioLeccionesAcumuladas: row[8] ?? "",
    motivo: row[9] ?? "",
    detalle: row[10] ?? "",
  };
}

async function findSheetTitleByCedula(cedula: string) {
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID_ACCUMULATE");
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  return response.data.sheets?.find((sheet) => {
    const title = sheet.properties?.title ?? "";
    return title === cedula || title.startsWith(`${cedula} -`);
  })?.properties?.title;
}

async function createTeacherSheet(submission: AccumulationRecordInput) {
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID_ACCUMULATE");
  const title = buildTeacherSheetTitle(submission);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title } } }],
    },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${quoteSheetTitle(title)}!A1:K1`,
    valueInputOption: "RAW",
    requestBody: { values: [accumulationHeaders] },
  });

  return title;
}

export async function appendAccumulationToSheet(submission: AccumulationRecordInput) {
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID_ACCUMULATE");
  const existingTitle = await findSheetTitleByCedula(submission.cedula);
  const sheetTitle = existingTitle ?? (await createTeacherSheet(submission));
  const timestamp = new Date().toISOString();

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${quoteSheetTitle(sheetTitle)}!A:K`,
    insertDataOption: "INSERT_ROWS",
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        timestamp,
        submission.nombre,
        submission.primerApellido,
        submission.segundoApellido,
        submission.cedula,
        submission.correoInstitucional,
        submission.fechaLeccionesAcumuladas,
        submission.cantidadLecciones,
        submission.horarioLeccionesAcumuladas,
        submission.motivo,
        submission.detalle,
      ]],
    },
    includeValuesInResponse: true,
  });

  return {
    sheetTitle,
    rowIndex: parseUpdatedRowIndex(response.data.updates?.updatedRange) ?? 2,
    timestamp,
  };
}

export async function listAllAccumulations() {
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID_ACCUMULATE");
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  const records: AccumulationRecord[] = [];

  for (const sheet of spreadsheet.data.sheets ?? []) {
    const sheetTitle = sheet.properties?.title;
    if (!sheetTitle) {
      continue;
    }

    const rowsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${quoteSheetTitle(sheetTitle)}!A2:K`,
    });

    const rows = rowsResponse.data.values ?? [];
    rows.forEach((row, index) => {
      records.push(buildAccumulationRecord(sheetTitle, index + 2, row.map((value) => String(value ?? ""))));
    });
  }

  return records.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}
