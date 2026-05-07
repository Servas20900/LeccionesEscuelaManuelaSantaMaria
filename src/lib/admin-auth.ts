import crypto from "crypto";
import { cookies } from "next/headers";

export const adminCookieName = "admin_session";

function requiredAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD no está configurada.");
  }
  return password;
}

export function hashAdminPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function getExpectedAdminToken() {
  return hashAdminPassword(requiredAdminPassword());
}

export function isAdminSessionValid() {
  return cookies().get(adminCookieName)?.value === getExpectedAdminToken();
}
