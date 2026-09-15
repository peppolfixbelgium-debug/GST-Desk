export const ADMIN_EMAIL = "peppolfixbelgium@gmail.com";

export type AccountRole = "admin" | "user";

export function isAdminEmail(email: string | null | undefined): boolean {
  return email?.trim().toLowerCase() === ADMIN_EMAIL;
}

export function accountRoleForEmail(email: string | null | undefined): AccountRole {
  return isAdminEmail(email) ? "admin" : "user";
}
