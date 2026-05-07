import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { listAllSubmissions } from "@/lib/sheets";

export async function GET() {
  try {
    if (!isAdminSessionValid()) {
      return NextResponse.json({ success: false, error: "Acceso no autorizado." }, { status: 401 });
    }

    const submissions = await listAllSubmissions();
    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "No fue posible cargar las solicitudes.",
      },
      { status: 400 },
    );
  }
}
