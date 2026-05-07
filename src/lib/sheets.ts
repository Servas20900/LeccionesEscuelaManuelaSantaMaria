import { google } from "googleapis";
import { teacherFullName, type RespondInput, type SubmissionRecord, type SubmissionState, type TeacherRequestInput } from "./schemas";

const sheetHeaders = [
  "Timestamp",
  "Nombre",
  "Primer Apellido",
  "Segundo Apellido",
  "Cédula",
  "Correo",
  "Fecha Acumulada",
  "Motivo",
  "Detalle",
  "Fecha Rebajo Propuesta",
  "Hora Salida Propuesta",
  "Estado",
  "Fecha Autorización",
  "Comentario Directora",
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

export function buildTeacherSheetTitle(submission: TeacherRequestInput) {
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

function buildSubmissionRecord(sheetTitle: string, rowIndex: number, row: string[]): SubmissionRecord {
  return {
    sheetTitle,
    rowIndex,
    timestamp: row[0] ?? "",
    nombre: row[1] ?? "",
    primerApellido: row[2] ?? "",
    segundoApellido: row[3] ?? "",
    cedula: row[4] ?? "",
    correoInstitucional: row[5] ?? "",
    fechaAcumulada: row[6] ?? "",
    motivo: row[7] ?? "",
    detalle: row[8] ?? "",
    fechaRebajoPropuesta: row[9] ?? "",
    horaSalidaPropuesta: row[10] ?? "",
    estado: (row[11] ?? "Pendiente") as SubmissionState,
    fechaAutorizacion: row[12] ?? "",
    comentarioDirectora: row[13] ?? "",
  };
}

async function findSheetTitleByCedula(cedula: string) {
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID");
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  return response.data.sheets?.find((sheet) => {
    const title = sheet.properties?.title ?? "";
    return title === cedula || title.startsWith(`${cedula} -`);
  })?.properties?.title;
}

async function createTeacherSheet(submission: TeacherRequestInput) {
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID");
  const title = buildTeacherSheetTitle(submission);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title } } }],
    },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${quoteSheetTitle(title)}!A1:N1`,
    valueInputOption: "RAW",
    requestBody: { values: [sheetHeaders] },
  });

  return title;
}

export async function appendSubmissionToSheet(submission: TeacherRequestInput) {
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID");
  const existingTitle = await findSheetTitleByCedula(submission.cedula);
  const sheetTitle = existingTitle ?? (await createTeacherSheet(submission));
  const timestamp = new Date().toISOString();

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${quoteSheetTitle(sheetTitle)}!A:N`,
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
        submission.fechaAcumulada,
        submission.motivo,
        submission.detalle,
        submission.fechaRebajoPropuesta,
        submission.horaSalidaPropuesta,
        "Pendiente",
        "",
        "",
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

export async function listAllSubmissions() {
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID");
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  const submissions: SubmissionRecord[] = [];

  for (const sheet of spreadsheet.data.sheets ?? []) {
    const sheetTitle = sheet.properties?.title;
    if (!sheetTitle) {
      continue;
    }

    const rowsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${quoteSheetTitle(sheetTitle)}!A2:N`,
    });

    const rows = rowsResponse.data.values ?? [];
    rows.forEach((row, index) => {
      submissions.push(buildSubmissionRecord(sheetTitle, index + 2, row.map((value) => String(value ?? ""))));
    });
  }

  return submissions.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

export async function findSubmissionByLocation(cedula: string, rowIndex: number) {
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID");
  const sheetTitle = await findSheetTitleByCedula(cedula);

  if (!sheetTitle) {
    throw new Error("No se encontró una pestaña para esa cédula.");
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${quoteSheetTitle(sheetTitle)}!A${rowIndex}:N${rowIndex}`,
  });

  const row = response.data.values?.[0];
  if (!row) {
    throw new Error("No se encontró la fila solicitada.");
  }

  return buildSubmissionRecord(sheetTitle, rowIndex, row.map((value) => String(value ?? "")));
}

export async function updateSubmissionDecision({ cedula, rowIndex, decision, comment }: RespondInput) {
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID");
  const sheetTitle = await findSheetTitleByCedula(cedula);

  if (!sheetTitle) {
    throw new Error("No se encontró una pestaña para esa cédula.");
  }

  const timestamp = new Date().toISOString();

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${quoteSheetTitle(sheetTitle)}!L${rowIndex}:N${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[decision, timestamp, comment]],
    },
  });

  return findSubmissionByLocation(cedula, rowIndex);
}
