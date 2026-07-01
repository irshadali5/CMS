import { Hono } from "hono";
import { db } from "../db";

const app = new Hono();

app.get("/sitemap.xml", (c) => {
  const baseUrl = process.env.PUBLIC_URL || "http://localhost:3000";
  const articles = db.query("SELECT slug, updated_at FROM articles WHERE published = 1").all() as any[];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><priority>1.0</priority></url>
  <url><loc>${baseUrl}/#/portfolio</loc><priority>0.9</priority></url>
  <url><loc>${baseUrl}/#/articles</loc><priority>0.9</priority></url>
  <url><loc>${baseUrl}/#/about</loc><priority>0.7</priority></url>
  <url><loc>${baseUrl}/#/contact</loc><priority>0.7</priority></url>
${articles.map((a) => `  <url><loc>${baseUrl}/#/article/${a.slug}</loc><lastmod>${a.updated_at}</lastmod><priority>0.8</priority></url>`).join("\n")}
</urlset>`;

  c.header("Content-Type", "application/xml");
  return c.body(xml);
});

export { app as seoRoutes };
