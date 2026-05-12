import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { buildAccumulationDecisionEmailHtml } from "@/lib/email";
import { findAccumulationByLocation, updateAccumulationDecision } from "@/lib/accumulate-sheets";
import { respondSchema } from "@/lib/schemas";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? new Resend(apiKey) : null;
}

export async function POST(request: Request) {
  try {
    if (!isAdminSessionValid()) {
      return NextResponse.json({ success: false, error: "Acceso no autorizado." }, { status: 401 });
    }

    const payload = respondSchema.parse(await request.json());
    const current = await findAccumulationByLocation(payload.cedula, payload.rowIndex);
    const updated = await updateAccumulationDecision(payload);
    const resend = getResendClient();

    if (resend && process.env.SCHOOL_FROM_EMAIL) {
      await resend.emails.send({
        from: process.env.SCHOOL_FROM_EMAIL,
        to: updated.correoInstitucional,
        subject: `Su registro fue ${payload.decision.toLowerCase()}`,
        html: buildAccumulationDecisionEmailHtml(
          updated,
          payload.decision,
          payload.comment,
          updated.fechaAutorizacion || current.fechaAutorizacion || new Date().toISOString(),
        ),
      });
    }

    return NextResponse.json({ success: true, accumulation: updated });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "No fue posible registrar la decisión.",
      },
      { status: 400 },
    );
  }
}