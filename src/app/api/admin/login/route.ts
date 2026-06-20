import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, createSessionToken, setSessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: Request) {
  // Throttle login attempts per client IP: 10 attempts / 5 minutes.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { ok: allowed, retryAfter } = rateLimit("login:" + ip, 10, 5 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }
  const session = await authenticate(data.email, data.password);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Wrong email or password" }, { status: 401 });
  }
  const token = await createSessionToken(session);
  await setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
