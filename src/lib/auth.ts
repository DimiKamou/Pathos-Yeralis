// Node-side admin auth: credential check (bcrypt) + cookie management. JWT
// sign/verify live in auth-edge.ts so middleware can share them on the edge.
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
  type AdminSession,
} from "./auth-edge";

export { SESSION_COOKIE, createSessionToken, verifySessionToken };
export type { AdminSession };

// Node-side secret accessor mirroring auth-edge's fail-closed policy. The JWT
// sign/verify path resolves its key inside auth-edge; this is the node-runtime
// equivalent for any server-only consumer that needs the raw secret. It never
// falls back to a known secret in production.
const DEV_ONLY_SECRET = "dev-only-insecure-secret-do-not-use-in-prod";

export function nodeSessionSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET must be set to a strong value (16+ chars) in production");
  }
  return DEV_ONLY_SECRET;
}

// Verify credentials against the AdminUser table.
export async function authenticate(email: string, password: string): Promise<AdminSession | null> {
  const user = await prisma.adminUser.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { sub: user.id, email: user.email, name: user.name ?? undefined };
}

// Current admin session (server components / route handlers) or null.
export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// Throw helper for admin API routes.
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Response("Unauthorized", { status: 401 });
  return session;
}

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
