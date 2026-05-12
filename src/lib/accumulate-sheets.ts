import { google } from "googleapis";
import { teacherFullName, type AccumulationRecord, type AccumulationRecordInput, type RespondInput, type SubmissionState } from "./schemas";

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
    estado: (row[11] ?? "Aprobada") as SubmissionState,
    fechaAutorizacion: row[12] ?? "",
    comentarioDirectora: row[13] ?? "",
  };
}

function parseLeccionesValue(value: string) {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
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
    range: `${quoteSheetTitle(title)}!A1:N1`,
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
        submission.fechaLeccionesAcumuladas,
        submission.cantidadLecciones,
        submission.horarioLeccionesAcumuladas.join(", "),
        submission.motivo,
        submission.detalle,
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
      range: `${quoteSheetTitle(sheetTitle)}!A2:N`,
    });

    const rows = rowsResponse.data.values ?? [];
    rows.forEach((row, index) => {
      records.push(buildAccumulationRecord(sheetTitle, index + 2, row.map((value) => String(value ?? ""))));
    });
  }

  return records.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

export async function getAccumulationSummaryByCedula(cedula: string) {
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID_ACCUMULATE");
  const sheetTitle = await findSheetTitleByCedula(cedula);

  if (!sheetTitle) {
    return null;
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${quoteSheetTitle(sheetTitle)}!A2:N`,
  });

  const rows = response.data.values ?? [];
  if (rows.length === 0) {
    return {
      sheetTitle,
      cedula,
      docente: "",
      totalLecciones: 0,
      totalRegistros: 0,
      ultimaFechaAcumulada: "",
      ultimoRegistro: "",
    };
  }

  const records = rows.map((row) => row.map((value) => String(value ?? "")));
  const first = records[0];
  const docente = [first[1], first[2], first[3]].filter(Boolean).join(" ").trim();

  let totalLecciones = 0;
  let lastRecordTimestamp = "";
  let ultimaFechaAcumulada = "";

  for (const row of records) {
    const estado = (row[11] ?? "Aprobada").trim();
    if (estado === "Aprobada") {
      totalLecciones += parseLeccionesValue(row[7] ?? "0");
    }

    const timestamp = row[0] ?? "";
    if (estado === "Aprobada" && timestamp && (!lastRecordTimestamp || Date.parse(timestamp) > Date.parse(lastRecordTimestamp))) {
      lastRecordTimestamp = timestamp;
      ultimaFechaAcumulada = row[6] ?? "";
    }
  }

  return {
    sheetTitle,
    cedula,
    docente,
    totalLecciones,
    totalRegistros: records.length,
    ultimaFechaAcumulada,
    ultimoRegistro: lastRecordTimestamp,
  };
}

export async function findAccumulationByLocation(cedula: string, rowIndex: number) {
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID_ACCUMULATE");
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

  return buildAccumulationRecord(sheetTitle, rowIndex, row.map((value) => String(value ?? "")));
}

export async function updateAccumulationDecision({ cedula, rowIndex, decision, comment }: RespondInput) {
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID_ACCUMULATE");
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

  return findAccumulationByLocation(cedula, rowIndex);
}

export async function migrateAccumulationHeaders() {
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID_ACCUMULATE");
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  const updated: string[] = [];
  const skipped: string[] = [];

  for (const sheet of spreadsheet.data.sheets ?? []) {
    const title = sheet.properties?.title;
    if (!title) continue;

    try {
      const headerResp = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${quoteSheetTitle(title)}!A1:N1`,
      });

      const existing = headerResp.data.values?.[0] ?? [];
      const hasEstado = String(existing[11] ?? "").trim() !== "" && existing.length >= accumulationHeaders.length;
      if (hasEstado) {
        skipped.push(title);
        continue;
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${quoteSheetTitle(title)}!A1:N1`,
        valueInputOption: "RAW",
        requestBody: { values: [accumulationHeaders] },
      });

      updated.push(title);
    } catch (err) {
      // If reading/updating failed for a sheet, skip it but continue the migration for others.
      skipped.push(title ?? "(unknown)");
    }
  }

  return { updated, skipped };
}
