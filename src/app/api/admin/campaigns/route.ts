import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCampaigns } from "@/lib/admin-data";
import { sendCampaign, type CampaignData } from "@/lib/email";

export async function GET() {
  return NextResponse.json({ campaigns: await getCampaigns() });
}

const schema = z.object({
  subject: z.string().min(1),
  name: z.string().min(1),
  eyebrow: z.string().optional(),
  tagline: z.string().optional(),
  arriving: z.string().optional(),
  storyTitle: z.string().optional(),
  storyBody: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  pieces: z.array(z.object({ name: z.string(), detail: z.string() })).optional(),
  launch: z.string().optional(),
});

// Send a newsletter campaign to all subscribers via the email provider, then
// record it (was PathosStore.pushCampaign).
export async function POST(req: Request) {
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid campaign" }, { status: 400 });
  }

  const subs = await prisma.subscriber.findMany({ select: { email: true } });
  const recipients = subs.map((s) => s.email);
  const campaignData: CampaignData = {
    eyebrow: data.eyebrow,
    name: data.name,
    tagline: data.tagline,
    arriving: data.arriving,
    storyTitle: data.storyTitle,
    storyBody: data.storyBody,
    ctaLabel: data.ctaLabel,
    ctaHref: data.ctaHref,
    pieces: data.pieces,
  };
  const { sent } = await sendCampaign(campaignData, recipients);

  const campaign = await prisma.campaign.create({
    data: {
      subject: data.subject,
      name: data.name,
      launch: data.launch ?? null,
      recipients: sent,
      status: "Sent",
    },
  });
  return NextResponse.json({
    ok: true,
    sent,
    campaign: {
      id: campaign.id,
      subject: campaign.subject,
      name: campaign.name,
      launch: campaign.launch,
      recipients: campaign.recipients,
      status: campaign.status,
      createdAt: campaign.createdAt.toISOString(),
    },
  });
}
