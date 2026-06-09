// Edge-safe session helpers (pure jose, no prisma/bcrypt) so middleware can
// verify the admin cookie on the edge runtime.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "pathos_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AdminSession {
  sub: string;
  email: string;
  name?: string;
}

export function sessionSecret(): Uint8Array {
  const s = process.env.ADMIN_SESSION_SECRET || "dev-insecure-secret-change-me";
  return new TextEncoder().encode(s);
}

export async function createSessionToken(session: AdminSession): Promise<string> {
  return new SignJWT({ email: session.email, name: session.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(sessionSecret());
}

export async function verifySessionToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      name: payload.name ? String(payload.name) : undefined,
    };
  } catch {
    return null;
  }
}
