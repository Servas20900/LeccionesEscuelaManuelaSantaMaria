import { z } from "zod";

export const submissionStates = ["Pendiente", "Aprobada", "Rechazada"] as const;

export type SubmissionState = (typeof submissionStates)[number];

export const motivoOptions = [
  "Español",
  "Ciencias",
  "Matemáticas",
  "Estudios Sociales",
  "Inglés",
  "Física",
  "Hogar",
  "Religión",
  "Formación Tecnológica",
  "Lección libre",
] as const;

export type MotivoOption = (typeof motivoOptions)[number];

function normalizeDetailValue(value: string) {
  return value.normalize("NFKC").trim();
}

function isMeaningfulDetail(value: string) {
  const normalized = normalizeDetailValue(value);
  const compact = normalized.replace(/\s+/g, "");
  const letters = normalized.match(/\p{L}/gu) ?? [];

  if (normalized.length < 20) {
    return false;
  }

  if (compact.length === 0) {
    return false;
  }

  if (new Set(compact).size <= 1) {
    return false;
  }

  if (letters.length < 10) {
    return false;
  }

  if (new Set(letters.map((letter) => letter.toLowerCase())).size < 3) {
    return false;
  }

  return true;
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;
const timeRangePattern = /^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/;

function toLocalMidday(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function startOfToday() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
}

function isWeekend(dateValue: string) {
  const weekday = toLocalMidday(dateValue).getDay();
  return weekday === 0 || weekday === 6;
}

function isFutureDate(dateValue: string) {
  return toLocalMidday(dateValue).getTime() > startOfToday().getTime();
}

function isPastDate(dateValue: string) {
  return toLocalMidday(dateValue).getTime() < startOfToday().getTime();
}

function addDateIssues(
  ctx: z.RefinementCtx,
  field: string,
  label: string,
  value: string,
  type: "past" | "future",
) {
  if (!datePattern.test(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [field],
      message: `${label} debe tener un formato de fecha válido.`,
    });
    return;
  }

  if (isWeekend(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [field],
      message: `${label} no puede caer en fin de semana.`,
    });
  }

  if (type === "future" && isFutureDate(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [field],
      message: `${label} no puede ser una fecha futura.`,
    });
  }

  if (type === "past" && isPastDate(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [field],
      message: `${label} no puede ser una fecha pasada.`,
    });
  }
}

export const teacherRequestSchema = z
  .object({
    nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
    primerApellido: z
      .string()
      .trim()
      .min(2, "El primer apellido debe tener al menos 2 caracteres."),
    segundoApellido: z
      .string()
      .trim()
      .min(2, "El segundo apellido debe tener al menos 2 caracteres."),
    cedula: z
      .string()
      .trim()
      .regex(/^\d{9}$/, "La cédula debe contener exactamente 9 dígitos."),
    correoInstitucional: z
      .string()
      .trim()
      .toLowerCase()
      .email("Ingrese un correo institucional válido.")
      .refine((value) => value.endsWith("@mep.go.cr"), {
        message: "El correo debe terminar en @mep.go.cr.",
      }),
    fechaAcumulada: z.string().trim(),
    motivo: z
      .string()
      .trim()
      .refine((value) => motivoOptions.includes(value as (typeof motivoOptions)[number]), {
        message: "Seleccione un motivo válido.",
      }),
    detalle: z.string().trim().max(1000, "El detalle es demasiado largo."),
    fechaRebajoPropuesta: z.string().trim(),
    horaSalidaPropuesta: z
      .string()
      .trim()
      .regex(timePattern, "La hora de salida debe ser válida."),
  })
  .superRefine((data, ctx) => {
    if (!isMeaningfulDetail(data.detalle)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["detalle"],
        message:
          "Explique el detalle con al menos 20 caracteres, varias letras distintas y sin repetir un solo carácter.",
      });
    }

    addDateIssues(ctx, "fechaAcumulada", "La fecha de la acumulada", data.fechaAcumulada, "future");
    addDateIssues(
      ctx,
      "fechaRebajoPropuesta",
      "La fecha de rebajo propuesta",
      data.fechaRebajoPropuesta,
      "past",
    );
  });

export const respondSchema = z.object({
  cedula: z
    .string()
    .trim()
    .regex(/^\d{9}$/, "La cédula debe contener exactamente 9 dígitos."),
  rowIndex: z.coerce.number().int().min(2, "La fila indicada no es válida."),
  decision: z.enum(["Aprobada", "Rechazada"]),
  comment: z.string().trim().max(1000, "El comentario es demasiado largo.").default(""),
});

export const accumulationRecordSchema = z
  .object({
    nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
    primerApellido: z
      .string()
      .trim()
      .min(2, "El primer apellido debe tener al menos 2 caracteres."),
    segundoApellido: z
      .string()
      .trim()
      .min(2, "El segundo apellido debe tener al menos 2 caracteres."),
    cedula: z
      .string()
      .trim()
      .regex(/^\d{9}$/, "La cédula debe contener exactamente 9 dígitos."),
    correoInstitucional: z
      .string()
      .trim()
      .toLowerCase()
      .email("Ingrese un correo institucional válido.")
      .refine((value) => value.endsWith("@mep.go.cr"), {
        message: "El correo debe terminar en @mep.go.cr.",
      }),
    fechaLeccionesAcumuladas: z.string().trim(),
    cantidadLecciones: z.coerce
      .number({ invalid_type_error: "Indique cuántas lecciones acumuló." })
      .int("La cantidad debe ser un número entero.")
      .min(1, "La cantidad mínima es 1 lección.")
      .max(20, "La cantidad máxima permitida es 20 lecciones."),
    horarioLeccionesAcumuladas: z
      .string()
      .trim()
      .regex(timeRangePattern, "Use el formato HH:MM - HH:MM para el horario."),
    motivo: z
      .string()
      .trim()
      .refine((value) => motivoOptions.includes(value as (typeof motivoOptions)[number]), {
        message: "Seleccione un motivo válido.",
      }),
    detalle: z.string().trim().max(1000, "El detalle es demasiado largo."),
  })
  .superRefine((data, ctx) => {
    if (!isMeaningfulDetail(data.detalle)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["detalle"],
        message:
          "Explique el detalle con al menos 20 caracteres, varias letras distintas y sin repetir un solo carácter.",
      });
    }

    addDateIssues(
      ctx,
      "fechaLeccionesAcumuladas",
      "La fecha de lecciones acumuladas",
      data.fechaLeccionesAcumuladas,
      "future",
    );

    const [startRaw, endRaw] = data.horarioLeccionesAcumuladas.split("-").map((value) => value.trim());
    if (timePattern.test(startRaw) && timePattern.test(endRaw)) {
      const [startHour, startMinute] = startRaw.split(":").map(Number);
      const [endHour, endMinute] = endRaw.split(":").map(Number);
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      if (endTotalMinutes <= startTotalMinutes) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["horarioLeccionesAcumuladas"],
          message: "La hora final debe ser posterior a la hora inicial.",
        });
      }
    }
  });

export const loginSchema = z.object({
  password: z.string().min(1, "Ingrese la contraseña de administración."),
});

export type TeacherRequestInput = z.infer<typeof teacherRequestSchema>;
export type AccumulationRecordInput = z.infer<typeof accumulationRecordSchema>;
export type RespondInput = z.infer<typeof respondSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface SubmissionRecord extends TeacherRequestInput {
  timestamp: string;
  estado: SubmissionState;
  fechaAutorizacion: string;
  comentarioDirectora: string;
  rowIndex: number;
  sheetTitle: string;
}

export interface AccumulationRecord extends AccumulationRecordInput {
  timestamp: string;
  rowIndex: number;
  sheetTitle: string;
}

export function teacherFullName(data: Pick<TeacherRequestInput, "nombre" | "primerApellido" | "segundoApellido">) {
  return `${data.nombre} ${data.primerApellido} ${data.segundoApellido}`;
}

export function formatDateForDisplay(dateValue: string) {
  return new Intl.DateTimeFormat("es-CR", { dateStyle: "long" }).format(new Date(`${dateValue}T12:00:00`));
}

export function formatDateTimeForDisplay(dateValue: string) {
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}
