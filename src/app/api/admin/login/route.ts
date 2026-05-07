import { NextResponse } from "next/server";
import { createAdminToken } from "@/lib/admin-utils";
import { loginSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedPassword || payload.password !== expectedPassword) {
      return NextResponse.json({ success: false, error: "Contraseña inválida." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", createAdminToken(payload.password), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "No fue posible iniciar sesión.",
      },
      { status: 400 },
    );
  }
}
