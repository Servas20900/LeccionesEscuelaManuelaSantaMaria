import { cookies } from "next/headers";
import { adminCookieName, getExpectedAdminToken, hashAdminPassword } from "./admin-auth";

export function getAdminCookieValue() {
  return cookies().get(adminCookieName)?.value ?? null;
}

export function createAdminToken(password: string) {
  return hashAdminPassword(password);
}

export function isAdminTokenValid(token: string | null) {
  return token !== null && token === getExpectedAdminToken();
}
