// Simple in-memory fixed-window rate limiter.
//
// NOTE: state lives in a module-level Map, so it is PER-INSTANCE only. This is
// acceptable for the alpha / single-instance deployment. For multi-instance
// (horizontal scaling, serverless with many workers) a shared store such as
// Redis is required so the window is enforced across all instances.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Fixed-window limiter. Returns whether the request is allowed and, when it is
 * not, how many seconds the caller should wait before retrying.
 *
 * @param key      Unique bucket key (e.g. "login:" + ip).
 * @param limit    Max requests allowed within the window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (existing.count < limit) {
    existing.count += 1;
    return { ok: true, retryAfter: 0 };
  }

  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return { ok: false, retryAfter };
}
