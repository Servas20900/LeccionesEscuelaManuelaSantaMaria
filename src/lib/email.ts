import {
  formatDateForDisplay,
  formatDateTimeForDisplay,
  teacherFullName,
  type AccumulationRecordInput,
  type SubmissionRecord,
  type TeacherRequestInput,
} from "./schemas";

const accent = "#0f4c5c";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function field(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 0;color:#64748b;font-size:13px;width:220px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;color:#0f172a;font-size:15px;font-weight:600;">${escapeHtml(value || "-")}</td>
    </tr>
  `;
}

function emailShell(title: string, body: string) {
  return `
    <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:720px;margin:0 auto;padding:32px 16px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(15,23,42,.08);">
          <div style="padding:28px 32px;background:linear-gradient(135deg, ${accent}, #1d4ed8);color:#fff;">
            <div style="font-size:12px;letter-spacing:.24em;text-transform:uppercase;opacity:.8;">Escuela Manuela Santa María</div>
            <h1 style="margin:8px 0 0;font-size:24px;line-height:1.2;">${escapeHtml(title)}</h1>
          </div>
          <div style="padding:32px;">${body}</div>
        </div>
      </div>
    </div>
  `;
}

export function buildSubmissionEmailHtml(submission: TeacherRequestInput) {
  return emailShell(
    `Nueva Solicitud de Horas – ${teacherFullName(submission)}`,
    `
      <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;">
        Se recibió una nueva solicitud de horas acumuladas. A continuación se muestran los datos enviados por la persona docente.
      </p>
      <table role="presentation" style="width:100%;border-collapse:collapse;">${field("Nombre", submission.nombre)}${field("Primer apellido", submission.primerApellido)}${field("Segundo apellido", submission.segundoApellido)}${field("Cédula", submission.cedula)}${field("Correo institucional", submission.correoInstitucional)}${field("Fecha acumulada", formatDateForDisplay(submission.fechaAcumulada))}${field("Motivo", submission.motivo)}${field("Detalle", submission.detalle || "-")}${field("Fecha de rebajo propuesta", formatDateForDisplay(submission.fechaRebajoPropuesta))}${field("Hora de salida propuesta", submission.horaSalidaPropuesta)}</table>
    `,
  );
}

export function buildTeacherReceiptEmailHtml(submission: TeacherRequestInput) {
  return emailShell(
    "Recibimos su solicitud",
    `
      <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;">
        Hola ${escapeHtml(submission.nombre)}, su solicitud fue recibida correctamente y quedó en estado <strong>Pendiente</strong> para revisión de la dirección.
      </p>
      <table role="presentation" style="width:100%;border-collapse:collapse;">${field("Nombre completo", teacherFullName(submission))}${field("Cédula", submission.cedula)}${field("Fecha acumulada", formatDateForDisplay(submission.fechaAcumulada))}${field("Fecha de rebajo propuesta", formatDateForDisplay(submission.fechaRebajoPropuesta))}${field("Hora de salida propuesta", submission.horaSalidaPropuesta)}</table>
      <p style="margin:24px 0 0;color:#64748b;font-size:14px;line-height:1.6;">Le notificaremos por correo cuando la solicitud sea aprobada o rechazada.</p>
    `,
  );
}

export function buildAccumulationSubmissionEmailHtml(submission: AccumulationRecordInput) {
  return emailShell(
    `Nuevo Registro de Acumulación – ${teacherFullName(submission)}`,
    `
      <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;">
        Se recibió un nuevo registro de lecciones acumuladas. Estos son los datos enviados por la persona docente.
      </p>
      <table role="presentation" style="width:100%;border-collapse:collapse;">${field("Nombre", submission.nombre)}${field("Primer apellido", submission.primerApellido)}${field("Segundo apellido", submission.segundoApellido)}${field("Cédula", submission.cedula)}${field("Correo institucional", submission.correoInstitucional)}${field("Fecha de acumulación", formatDateForDisplay(submission.fechaLeccionesAcumuladas))}${field("Cantidad de lecciones", `${submission.cantidadLecciones}`)}${field("Horario", submission.horarioLeccionesAcumuladas)}${field("Motivo", submission.motivo)}${field("Detalle", submission.detalle || "-")}</table>
    `,
  );
}

export function buildAccumulationReceiptEmailHtml(submission: AccumulationRecordInput) {
  return emailShell(
    "Recibimos su registro de acumulación",
    `
      <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;">
        Hola ${escapeHtml(submission.nombre)}, su registro de lecciones acumuladas quedó guardado correctamente.
      </p>
      <table role="presentation" style="width:100%;border-collapse:collapse;">${field("Nombre completo", teacherFullName(submission))}${field("Cédula", submission.cedula)}${field("Fecha de acumulación", formatDateForDisplay(submission.fechaLeccionesAcumuladas))}${field("Cantidad de lecciones", `${submission.cantidadLecciones}`)}${field("Horario", submission.horarioLeccionesAcumuladas)}</table>
      <p style="margin:24px 0 0;color:#64748b;font-size:14px;line-height:1.6;">Gracias por mantener actualizado su registro docente.</p>
    `,
  );
}

export function buildDecisionEmailHtml(submission: SubmissionRecord, decision: "Aprobada" | "Rechazada", comment: string, timestamp: string) {
  return emailShell(
    `Su solicitud fue ${decision.toLowerCase()}`,
    `
      <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;">
        La dirección revisó su solicitud de horas acumuladas y registró la siguiente decisión.
      </p>
      <table role="presentation" style="width:100%;border-collapse:collapse;">${field("Nombre completo", teacherFullName(submission))}${field("Cédula", submission.cedula)}${field("Fecha acumulada", formatDateForDisplay(submission.fechaAcumulada))}${field("Fecha de rebajo propuesta", formatDateForDisplay(submission.fechaRebajoPropuesta))}${field("Hora de salida propuesta", submission.horaSalidaPropuesta)}${field("Decisión", decision)}${field("Fecha de autorización", formatDateTimeForDisplay(timestamp))}${field("Comentario de la directora", comment || "Sin comentario")}</table>
      <p style="margin:24px 0 0;color:#64748b;font-size:14px;line-height:1.6;">Gracias por utilizar el sistema de horas acumuladas.</p>
    `,
  );
}
