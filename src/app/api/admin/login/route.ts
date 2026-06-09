import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, createSessionToken, setSessionCookie } from "@/lib/auth";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: Request) {
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
