import { NextResponse } from "next/server";
import { Resend } from "resend";
import { appendSubmissionToSheet } from "@/lib/sheets";
import { buildSubmissionEmailHtml, buildTeacherReceiptEmailHtml } from "@/lib/email";
import { teacherRequestSchema } from "@/lib/schemas";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? new Resend(apiKey) : null;
}

export async function POST(request: Request) {
  try {
    const submission = teacherRequestSchema.parse(await request.json());
    const result = await appendSubmissionToSheet(submission);
    const resend = getResendClient();

    if (resend && process.env.SCHOOL_FROM_EMAIL && process.env.DIRECTOR_EMAIL) {
      await resend.emails.send({
        from: process.env.SCHOOL_FROM_EMAIL,
        to: process.env.DIRECTOR_EMAIL,
        subject: `Nueva solicitud de horas - ${submission.cedula}`,
        html: buildSubmissionEmailHtml(submission),
      });

      await resend.emails.send({
        from: process.env.SCHOOL_FROM_EMAIL,
        to: submission.correoInstitucional,
        subject: "Recibimos su solicitud de horas acumuladas",
        html: buildTeacherReceiptEmailHtml(submission),
      });
    }

    return NextResponse.json({
      success: true,
      message: "La solicitud se registró correctamente.",
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "No fue posible registrar la solicitud.",
      },
      { status: 400 },
    );
  }
}
