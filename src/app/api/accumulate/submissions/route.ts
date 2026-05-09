import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { listAllAccumulations } from "@/lib/accumulate-sheets";

export async function GET() {
  try {
    if (!isAdminSessionValid()) {
      return NextResponse.json({ success: false, error: "Acceso no autorizado." }, { status: 401 });
    }

    const records = await listAllAccumulations();
    return NextResponse.json({ success: true, records });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "No fue posible cargar los registros de acumulación.",
      },
      { status: 400 },
    );
  }
}
