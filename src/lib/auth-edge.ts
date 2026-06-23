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

// Dev-only fallback. Never used in production: secret resolution fails closed
// (throws) when ADMIN_SESSION_SECRET is missing/weak and NODE_ENV=production.
const DEV_ONLY_SECRET = "dev-only-insecure-secret-do-not-use-in-prod";

function resolveSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET must be set to a strong value (16+ chars) in production");
  }
  return DEV_ONLY_SECRET;
}

export function sessionSecret(): Uint8Array {
  return new TextEncoder().encode(resolveSecret());
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
    const { payload } = await jwtVerify(token, sessionSecret(), { algorithms: ["HS256"] });
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      name: payload.name ? String(payload.name) : undefined,
    };
  } catch {
    return null;
  }
}
