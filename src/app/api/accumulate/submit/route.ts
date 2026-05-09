import { NextResponse } from "next/server";
import { Resend } from "resend";
import { appendAccumulationToSheet } from "@/lib/accumulate-sheets";
import { buildAccumulationReceiptEmailHtml, buildAccumulationSubmissionEmailHtml } from "@/lib/email";
import { accumulationRecordSchema } from "@/lib/schemas";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? new Resend(apiKey) : null;
}

export async function POST(request: Request) {
  try {
    const submission = accumulationRecordSchema.parse(await request.json());
    const result = await appendAccumulationToSheet(submission);
    const resend = getResendClient();

    if (resend && process.env.SCHOOL_FROM_EMAIL && process.env.DIRECTOR_EMAIL) {
      await resend.emails.send({
        from: process.env.SCHOOL_FROM_EMAIL,
        to: process.env.DIRECTOR_EMAIL,
        subject: `Nuevo registro de acumulación - ${submission.cedula}`,
        html: buildAccumulationSubmissionEmailHtml(submission),
      });

      await resend.emails.send({
        from: process.env.SCHOOL_FROM_EMAIL,
        to: submission.correoInstitucional,
        subject: "Recibimos su registro de lecciones acumuladas",
        html: buildAccumulationReceiptEmailHtml(submission),
      });
    }

    return NextResponse.json({
      success: true,
      message: "El registro de acumulación se guardó correctamente.",
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "No fue posible registrar la acumulación.",
      },
      { status: 400 },
    );
  }
}
