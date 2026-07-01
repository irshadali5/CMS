import type { Context, Next } from "hono";
import * as jose from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export async function authMiddleware(c: Context, next: Next) {
  const auth = c.req.header("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return c.json({ error: "Authentication required" }, 401);
  }
  try {
    const { payload } = await jose.jwtVerify(auth.slice(7), SECRET);
    c.set("user", payload);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 403);
  }
}

export async function signToken(payload: Record<string, unknown>) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(SECRET);
}
