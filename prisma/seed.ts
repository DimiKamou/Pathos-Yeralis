// Seeds the DB from the data in prototypes/pathos-store.js.
// Run with: npm run db:seed  (after db:push / db:migrate).
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const HOUR = 1000 * 60 * 60;
const ago = (h: number) => new Date(Date.now() - h * HOUR);

// ── Catalog (prices in euros → stored as cents) ──
const PRODUCTS = [
  { id: "PB-014", name: "Aegean Beaded Bracelet", art: "bracelet", collection: "Aegean", price: 52, stock: 38, status: "Active", sold: 214, material: "Hematite · 24K plate", swatches: ["#141414", "#5b5b5b", "#b8946b"], desc: "Smooth hematite beads strung by hand on a 24K-gold-plated thread — a weighty, everyday talisman from the Aegean shore." },
  { id: "PN-031", name: "Hematite Pendant Necklace", art: "necklace", collection: "Hematite", price: 80, stock: 12, status: "Active", sold: 168, material: "Hematite · Silver 925", swatches: ["#4a4742", "#a9824a", "#cdb78f"], desc: "A faceted hematite drop on a fine sterling chain that catches the light with every movement." },
  { id: "PE-022", name: "Coral Drop Earrings", art: "earrings", collection: "Shells & Corals", price: 45, stock: 4, status: "Active", sold: 142, material: "Coral · Gold fill", swatches: ["#9b5a4a", "#a9824a", "#e6d6b8"], desc: "Mediterranean coral drops on gold-filled hooks — light as air, warm in tone." },
  { id: "PR-009", name: "Chalcedony Signet Ring", art: "ring", collection: "Gemstones", price: 60, stock: 0, status: "Active", sold: 97, material: "Chalcedony · Silver 925", swatches: ["#7d9b94", "#a9824a", "#4a4742"], desc: "A soft blue chalcedony set flush in a hand-finished sterling signet." },
  { id: "PS-046", name: "Spiral Shell Pendant", art: "shell", collection: "Shells & Corals", price: 36, stock: 56, status: "Active", sold: 203, material: "Shell · Gold fill", swatches: ["#e6d6b8", "#a9824a", "#9b5a4a"], desc: "A tiny spiral shell cast in gold-fill, strung on an adjustable cord." },
  { id: "PD-017", name: "Paua Teardrop Pendant", art: "drop", collection: "Minerals", price: 42, stock: 21, status: "Active", sold: 88, material: "Paua · 24K plate", swatches: ["#5a6f6a", "#a9824a", "#4a4742"], desc: "Iridescent paua shell framed in 24K plate — no two are exactly alike." },
  { id: "PB-051", name: "Lava Stone Wrap", art: "bracelet", collection: "Minerals", price: 34, stock: 9, status: "Active", sold: 76, material: "Lava · Leather", swatches: ["#141414", "#6f6f6f", "#a98c66"], desc: "Matte volcanic lava beads on a soft leather wrap — grounding and unisex." },
  { id: "PR-028", name: "Moonstone Stacking Ring", art: "ring", collection: "Bridal", price: 48, stock: 0, status: "Draft", sold: 0, material: "Moonstone · Gold 14K", swatches: ["#dfe6ea", "#a9824a", "#cdb78f"], desc: "A milky moonstone on a slim 14K band, made to stack or stand alone." },
  { id: "PN-040", name: "Olive Branch Choker", art: "necklace", collection: "Aegean", price: 58, stock: 31, status: "Active", sold: 119, material: "Brass · 24K plate", swatches: ["#a9824a", "#5b5b5b", "#cdb78f"], desc: "An olive-branch motif in gold-plated brass — a nod to Athenian summers." },
];

const DISCOUNTS = [
  { code: "WELCOME10", pct: 0.1, label: "10% off", freeShip: false },
  { code: "ATELIER20", pct: 0.2, label: "20% off", freeShip: false },
  { code: "FREESHIP", pct: 0, label: "Free shipping", freeShip: true },
];

const MESSAGES = [
  { name: "Marco Bianchi", email: "marco.b@example.it", topic: "Order", message: "Hi! Is the Hematite Pendant available in a longer 50cm chain? Would love to order if so.", read: false, createdAt: ago(5) },
  { name: "Chloé Dubois", email: "chloe.d@example.fr", topic: "Sizing", message: "Bonjour, do the Moonstone stacking rings run true to size? I usually wear a 52 (EU).", read: true, createdAt: ago(28) },
];

const SUBSCRIBERS = [
  { email: "eleni.m@example.com", source: "Welcome popup", createdAt: ago(9) },
  { email: "s.andersen@example.de", source: "Footer", createdAt: ago(30) },
  { email: "yara.h@example.nl", source: "Footer", createdAt: ago(52) },
  { email: "niamh.ob@example.ie", source: "Checkout", createdAt: ago(96) },
];

const CAMPAIGNS = [
  { subject: "Summer arrivals — Thálassa", name: "Thálassa", launch: "Fri · 22 May", recipients: 4, status: "Sent", createdAt: ago(24 * 13) },
];

const SETTINGS: { key: string; value: object }[] = [
  {
    key: "menu",
    value: [
      { id: "about", label: "About", type: "page", enabled: true, system: true },
      { id: "collections", label: "Collections", type: "collections", enabled: true, system: true },
      { id: "jewelry", label: "Jewelry & Accessories", type: "page", enabled: true, system: true },
    ],
  },
  {
    key: "popup",
    value: {
      enabled: true,
      heading: "The Summer Edit is here",
      message: "Enjoy 15% off your first order — handmade Aegean pieces, made to last.",
      code: "AEGEAN15",
      button: "Shop the offer",
      delay: 1.2,
      frequency: "session",
    },
  },
  {
    key: "announcement",
    value: { enabled: true, text: "FREE SHIPPING ACROSS GREECE & THE EU FOR ORDERS ABOVE 100€" },
  },
  { key: "season", value: { key: "none", useGreeting: false, auto: false } },
];

async function main() {
  console.log("→ Seeding products…");
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        art: p.art,
        collection: p.collection,
        priceCents: Math.round(p.price * 100),
        stock: p.stock,
        status: p.status,
        sold: p.sold,
        material: p.material,
        swatches: JSON.stringify(p.swatches),
        description: p.desc,
        position: i,
      },
    });
  }

  console.log("→ Seeding discounts…");
  for (const d of DISCOUNTS) {
    await prisma.discount.upsert({ where: { code: d.code }, update: {}, create: d });
  }

  console.log("→ Seeding settings…");
  for (const s of SETTINGS) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: JSON.stringify(s.value) },
    });
  }

  console.log("→ Seeding messages / subscribers / campaigns…");
  // Seeded only when the inbox is empty so re-running doesn't duplicate.
  if ((await prisma.message.count()) === 0) {
    for (const m of MESSAGES) await prisma.message.create({ data: m });
  }
  for (const s of SUBSCRIBERS) {
    await prisma.subscriber.upsert({ where: { email: s.email }, update: {}, create: s });
  }
  if ((await prisma.campaign.count()) === 0) {
    for (const c of CAMPAIGNS) await prisma.campaign.create({ data: c });
  }

  console.log("→ Seeding admin user…");
  const email = (process.env.ADMIN_EMAIL || "admin@pathos-yeralis.gr").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "pathos-admin";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name: "Yeralis K." },
    create: { email, passwordHash, name: "Yeralis K." },
  });
  console.log(`   admin: ${email}  (password from ADMIN_PASSWORD env)`);

  console.log("✓ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
