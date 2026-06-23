// First-boot database initializer for single-host deploys (e.g. Render + a
// persistent disk holding the SQLite file). Safe to run on EVERY deploy:
//   1. matches the Prisma provider to DATABASE_URL,
//   2. applies the schema with `prisma db push` (idempotent + additive — it
//      auto-applies any new columns/tables you ship in a later fix),
//   3. seeds the starter catalogue/settings/admin ONLY when the store is empty,
//      so redeploys never overwrite the owner's products, prices, or photos.
import { execSync } from "node:child_process";

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

run("node scripts/db-provider.mjs");
run("npx prisma db push --skip-generate");

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();
try {
  const admins = await prisma.adminUser.count();
  if (admins === 0) {
    console.log("[init-db] fresh database — seeding starter data");
    run("npx prisma db seed");
  } else {
    console.log(`[init-db] database already initialised (${admins} admin user(s)) — skipping seed`);
  }
} finally {
  await prisma.$disconnect();
}
