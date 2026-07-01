import type { Context, Next } from "hono";

interface Options {
  windowMs: number;
  max: number;
}

const store = new Map<string, { count: number; reset: number }>();

export function rateLimiter({ windowMs, max }: Options) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header("x-forwarded-for")?.split(",")[0] ||
               c.req.header("x-real-ip") ||
               "unknown";
    const key = `${c.req.path}:${ip}`;
    const now = Date.now();

    const entry = store.get(key);
    if (!entry || entry.reset < now) {
      store.set(key, { count: 1, reset: now + windowMs });
    } else {
      entry.count++;
      if (entry.count > max) {
        const retryAfter = Math.ceil((entry.reset - now) / 1000);
        c.header("Retry-After", String(retryAfter));
        return c.json({ error: "Too many requests" }, 429);
      }
    }

    // Cleanup old entries periodically
    if (store.size > 10000) {
      for (const [k, v] of store) {
        if (v.reset < now) store.delete(k);
      }
    }

    await next();
  };
}
