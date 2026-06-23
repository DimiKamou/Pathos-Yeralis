// Swappable email provider. Resend is the alpha default; when no API key is
// present a console provider logs sends so local dev + tests never block.
// To swap to Postmark/SES later, implement EmailProvider and return it from
// getEmailProvider().

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailProvider {
  readonly name: string;
  send(msg: EmailMessage): Promise<{ id?: string }>;
}

const DEFAULT_FROM = process.env.EMAIL_FROM || "PATHOS by Yeralis <hello@pathos-yeralis.gr>";

class ConsoleProvider implements EmailProvider {
  readonly name = "console";
  async send(msg: EmailMessage) {
    const to = Array.isArray(msg.to) ? msg.to.join(", ") : msg.to;
    console.log(`\n[email:console] → ${to}\n  subject: ${msg.subject}\n  (set RESEND_API_KEY to actually send)\n`);
    return { id: "console-" + Date.now().toString(36) };
  }
}

class ResendProvider implements EmailProvider {
  readonly name = "resend";
  constructor(private apiKey: string) {}
  async send(msg: EmailMessage) {
    // Imported lazily so the dependency isn't required when unused.
    const { Resend } = await import("resend");
    const resend = new Resend(this.apiKey);
    const { data, error } = await resend.emails.send({
      from: msg.from || DEFAULT_FROM,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      replyTo: msg.replyTo,
    });
    if (error) throw new Error(`Resend error: ${error.message}`);
    return { id: data?.id };
  }
}

let _provider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (_provider) return _provider;
  const key = process.env.RESEND_API_KEY;
  _provider = key ? new ResendProvider(key) : new ConsoleProvider();
  return _provider;
}

export { DEFAULT_FROM };
