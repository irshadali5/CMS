import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { authMiddleware } from "../middleware/auth";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const purify = DOMPurify(new JSDOM("").window);

const app = new Hono();

const ArticleSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().optional(),
  published: z.boolean().default(false),
});

// GET public articles
app.get("/", (c) => {
  const { tag, search, page = "1", limit = "10" } = c.req.query();
  const offset = (Number(page) - 1) * Number(limit);

  let query = "SELECT * FROM articles WHERE published = 1";
  const params: any[] = [];

  if (tag) {
    query += ` AND tags LIKE ?`;
    params.push(`%"${tag}"%`);
  }
  if (search) {
    query += ` AND (title LIKE ? OR excerpt LIKE ? OR tags LIKE ?)`;
    const q = `%${search}%`;
    params.push(q, q, q);
  }

  const total = (db.query(query.replace("SELECT *", "SELECT COUNT(*) as c")).get(...params) as any).c;

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), offset);

  const articles = db.query(query).all(...params).map((a: any) => ({
    ...a,
    tags: JSON.parse(a.tags || "[]"),
    coverImage: a.cover_image,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  }));

  return c.json({
    articles,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

// GET tags
app.get("/tags", (c) => {
  const rows = db.query("SELECT tags FROM articles WHERE published = 1").all() as any[];
  const tagSet = new Set<string>();
  rows.forEach((r) => JSON.parse(r.tags || "[]").forEach((t: string) => tagSet.add(t)));
  return c.json({ tags: [...tagSet] });
});

// GET single article
app.get("/:slug", (c) => {
  const article = db.query("SELECT * FROM articles WHERE slug = ? AND published = 1").get(c.req.param("slug")) as any;
  if (!article) return c.json({ error: "Not found" }, 404);

  db.query("UPDATE articles SET views = views + 1 WHERE id = ?").run(article.id);

  return c.json({
    ...article,
    tags: JSON.parse(article.tags || "[]"),
    coverImage: article.cover_image,
    createdAt: article.created_at,
    updatedAt: article.updated_at,
    views: article.views + 1,
  });
});

// POST create
app.post("/", authMiddleware, zValidator("json", ArticleSchema), (c) => {
  const data = c.req.valid("json");
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const safeContent = purify.sanitize(data.content);

  db.query(`
    INSERT INTO articles (id, title, slug, excerpt, content, tags, cover_image, published, created_at, updated_at)
    VALUES ($id, $title, $slug, $excerpt, $content, $tags, $cover_image, $published, $now, $now)
  `).run({
    $id: id,
    $title: data.title,
    $slug: data.slug,
    $excerpt: data.excerpt || data.content.slice(0, 200) + "...",
    $content: safeContent,
    $tags: JSON.stringify(data.tags),
    $cover_image: data.coverImage || "",
    $published: data.published ? 1 : 0,
    $now: now,
  });

  return c.json({ id, message: "Article created" }, 201);
});

// PUT update
app.put("/:id", authMiddleware, (c) => {
  const id = c.req.param("id");
  const data = c.req.json() as any;
  const now = new Date().toISOString();

  db.query(`
    UPDATE articles SET
      title = COALESCE($title, title),
      excerpt = COALESCE($excerpt, excerpt),
      content = COALESCE($content, content),
      tags = COALESCE($tags, tags),
      cover_image = COALESCE($cover_image, cover_image),
      published = COALESCE($published, published),
      updated_at = $now
    WHERE id = $id
  `).run({
    $id: id,
    $title: data.title,
    $excerpt: data.excerpt,
    $content: data.content ? purify.sanitize(data.content) : null,
    $tags: data.tags ? JSON.stringify(data.tags) : null,
    $cover_image: data.coverImage,
    $published: typeof data.published === "boolean" ? (data.published ? 1 : 0) : null,
    $now: now,
  });

  return c.json({ message: "Updated" });
});

// DELETE
app.delete("/:id", authMiddleware, (c) => {
  db.query("DELETE FROM articles WHERE id = ?").run(c.req.param("id"));
  return c.json({ message: "Deleted" });
});

// GET all articles (Admin only - includes drafts)
app.get("/admin/all", authMiddleware, (c) => {
  const articles = db.query("SELECT * FROM articles ORDER BY created_at DESC").all().map((a: any) => ({
    ...a, tags: JSON.parse(a.tags || "[]"), coverImage: a.cover_image, createdAt: a.created_at, updatedAt: a.updated_at
  }));
  return c.json({ articles });
});

export { app as articleRoutes };
