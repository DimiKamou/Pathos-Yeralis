import { PrismaClient } from "@prisma/client";

// Singleton so Next.js dev hot-reload doesn't exhaust DB connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// SQLite only allows a single writer, so multiple pooled connections fight for
// the write lock under concurrent checkout and surface as "database is locked"
// / socket-timeout errors. Forcing a single pooled connection makes concurrent
// transactions queue cleanly (up to pool_timeout) and run one-at-a-time, which
// is the Prisma-recommended setting for SQLite. Postgres/other URLs are left
// untouched (they handle concurrency natively).
function datasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("file:")) return url;
  if (/[?&]connection_limit=/.test(url)) return url;
  return url + (url.includes("?") ? "&" : "?") + "connection_limit=1&pool_timeout=30";
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: datasourceUrl() } },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
