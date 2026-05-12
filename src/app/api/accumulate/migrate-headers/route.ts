import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { migrateAccumulationHeaders } from "@/lib/accumulate-sheets";

export async function POST() {
  try {
    if (!isAdminSessionValid()) {
      return NextResponse.json({ success: false, error: "Acceso no autorizado." }, { status: 401 });
    }

    const result = await migrateAccumulationHeaders();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "No fue posible ejecutar la migración." },
      { status: 500 },
    );
  }
}
