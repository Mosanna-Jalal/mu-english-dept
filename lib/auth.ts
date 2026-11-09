import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** For admin pages: bounce to the login screen when the session is missing or expired. */
export async function requireAdminPage(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** For Server Actions and route handlers, which can be called directly. */
export async function assertAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Your session has expired. Please sign in again.");
}
