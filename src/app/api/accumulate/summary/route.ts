import { NextResponse } from "next/server";
import { getAccumulationSummaryByCedula } from "@/lib/accumulate-sheets";

function normalizeCedula(value: string) {
  return value.replace(/\D/g, "");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cedulaRaw = searchParams.get("cedula") ?? "";
    const cedula = normalizeCedula(cedulaRaw);

    if (!/^\d{9}$/.test(cedula)) {
      return NextResponse.json(
        {
          success: false,
          error: "La cédula debe contener exactamente 9 dígitos.",
        },
        { status: 400 },
      );
    }

    const summary = await getAccumulationSummaryByCedula(cedula);
    if (!summary) {
      return NextResponse.json(
        {
          success: false,
          error: "No se encontró acumulación para la cédula indicada.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "No fue posible calcular la sumatoria.",
      },
      { status: 400 },
    );
  }
}
