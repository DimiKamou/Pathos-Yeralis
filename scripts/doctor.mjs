#!/usr/bin/env node
// Preflight check — verifies the app is ready to run and prints next steps.
// Run with:  npm run doctor
import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ok = (m) => console.log("  \x1b[32m✓\x1b[0m " + m);
const warn = (m) => console.log("  \x1b[33m!\x1b[0m " + m);
const bad = (m) => console.log("  \x1b[31m✗\x1b[0m " + m);

console.log("\n  PATHOS by Yeralis — preflight check\n");

// Node
const major = Number(process.versions.node.split(".")[0]);
major >= 20 ? ok(`Node ${process.versions.node}`) : bad(`Node ${process.versions.node} — please install Node 20+ (nodejs.org)`);

// .env
const envPath = join(root, ".env");
const env = {};
if (existsSync(envPath)) {
  ok(".env present");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} else {
  bad(".env missing — run:  cp .env.example .env   (Windows: copy .env.example .env)");
}

// dependencies
existsSync(join(root, "node_modules")) ? ok("dependencies installed") : bad("node_modules missing — run:  npm install");

// database
const url = env.DATABASE_URL || process.env.DATABASE_URL || "";
if (!url) {
  bad("DATABASE_URL not set in .env");
} else if (url.startsWith("file:")) {
  const rel = url.replace(/^file:/, "");
  const dbPath = resolve(root, "prisma", rel); // file: paths are relative to prisma/
  if (existsSync(dbPath) && statSync(dbPath).size > 0) ok(`SQLite database ready (${rel})`);
  else warn("SQLite database not created yet — run:  npm run setup");
} else {
  ok(`Postgres configured (${(url.split("@")[1] || "remote").split("?")[0]})`);
  warn("If this is the first run, apply schema + seed:  npm run setup");
}

// admin creds
ok(`Admin login:  ${env.ADMIN_EMAIL || "admin@pathos-yeralis.gr"} / ${env.ADMIN_PASSWORD || "change-me"}`);

console.log(
  "\n  Next:\n    npm run dev\n\n  Then open in your browser:\n    Storefront → http://localhost:3000\n    Admin      → http://localhost:3000/admin   (opens directly in dev — no login needed)\n",
);
