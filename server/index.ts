// server/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { logger } from "hono/logger";
import { compress } from "hono/compress";
import { serveStatic } from "hono/bun";
import { migrate, db } from "./db";
import { authRoutes } from "./routes/auth";
import { articleRoutes } from "./routes/articles";
import { contactRoutes } from "./routes/contact";
import { seoRoutes } from "./routes/seo";
import { bookRoutes } from "./routes/books";
import { rateLimiter } from "./middleware/rateLimit";

// --- Bootstrap ---
migrate();

const app = new Hono();
const PORT = Number(process.env.PORT || 3000);

// --- Global Middleware ---
app.use("*", secureHeaders());
app.use("*", compress());
app.use(
  "*",
  cors({
    origin: [process.env.PUBLIC_URL || "http://localhost:3000"],
    credentials: true,
  })
);
app.use("*", logger());
app.use("/api/*", rateLimiter({ windowMs: 60_000, max: 100 }));
app.use("/api/contact", rateLimiter({ windowMs: 60_000, max: 3 }));

// --- API Routes ---
app.route("/api/auth", authRoutes);
app.route("/api/articles", articleRoutes);
app.route("/api/contact", contactRoutes);
app.route("/", seoRoutes);
app.route("/api/books", bookRoutes);

// --- Static Files ---
app.use("/manifest.json", serveStatic({ path: "./public/manifest.json" }));
app.use("/robots.txt", serveStatic({ path: "./public/robots.txt" }));
app.use("/favicon.ico", serveStatic({ path: "./public/favicon.ico" }));
app.use("/css/*", serveStatic({ root: "./public" }));
app.use("/js/*", serveStatic({ root: "./public" }));
app.use("/assets/*", serveStatic({ root: "./public" }));

// --- SPA Fallback ---
app.get("*", async (c) => {
  const html = await Bun.file("./public/index.html").text();
  return c.html(html);
});

// --- Error Handler ---
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

app.notFound((c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.html(Bun.file("./public/index.html").toString(), 200);
});

console.log(`
╔═══════════════════════════════════════════════════════╗
║  🚀 Irshad Ali's Portfolio                           ║
║  🌐 http://localhost:${PORT}                           ║
║  📝 Admin: http://localhost:${PORT}/#/admin/login     ║
║  ⚡ Powered by Bun + Hono + SQLite                   ║
╚═══════════════════════════════════════════════════════╝
`);

export default {
  port: PORT,
  fetch: app.fetch,
};
