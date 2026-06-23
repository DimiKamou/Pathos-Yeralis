// Auto-selects the Prisma datasource provider to match DATABASE_URL so the same
// repo deploys to Postgres (serverless / production) and runs on SQLite locally
// with zero manual edits.
//
//   postgres://… or postgresql://…  → provider = "postgresql"
//   file:…                          → provider = "sqlite"
//   (set DATABASE_PROVIDER to force a value; unknown/unset → leave as-is)
//
// Runs automatically from `postinstall`, `build`, `setup`, and `db:push`.
import { readFileSync, writeFileSync } from "node:fs";

const SCHEMA = new URL("../prisma/schema.prisma", import.meta.url);

function pick() {
  const forced = process.env.DATABASE_PROVIDER;
  if (forced === "postgresql" || forced === "sqlite") return forced;
  const url = process.env.DATABASE_URL || "";
  if (/^postgres(ql)?:\/\//i.test(url)) return "postgresql";
  if (/^file:/i.test(url)) return "sqlite";
  return null; // can't tell — don't touch the committed default
}

const provider = pick();
if (!provider) process.exit(0);

const src = readFileSync(SCHEMA, "utf8");
// Match the real datasource line (line-anchored, so commented examples like
// `//   provider = "postgresql"` are ignored). The generator line is
// "prisma-client-js" and never matches the sqlite|postgresql alternation.
const next = src.replace(/^(\s*)provider\s*=\s*"(?:sqlite|postgresql)"/m, `$1provider = "${provider}"`);
if (next !== src) {
  writeFileSync(SCHEMA, next);
  console.log(`[db-provider] Prisma datasource provider → ${provider}`);
}
