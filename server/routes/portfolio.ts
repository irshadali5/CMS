import { Hono } from "hono";
import { db } from "../db";
import { authMiddleware } from "../middleware/auth";

export const portfolioRoutes = new Hono();

// GET all portfolio projects (Public)
portfolioRoutes.get("/", (c) => {
  const projects = db.query("SELECT * FROM portfolio_projects ORDER BY created_at DESC").all();
  return c.json({ projects });
});

// GET single portfolio project (Public)
portfolioRoutes.get("/:slug", (c) => {
  const project = db.query("SELECT * FROM portfolio_projects WHERE slug = ?").get(c.req.param("slug")) as any;
  if (!project) return c.json({ error: "Project not found" }, 404);
  return c.json({ project });
});

// CREATE Project (Admin)
portfolioRoutes.post("/", authMiddleware, async (c) => {
  const { title, category, description, slug, tags, demo_url, github_url, cover_emoji } = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.query("INSERT INTO portfolio_projects (id, title, category, description, slug, tags, demo_url, github_url, cover_emoji, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, title, category, description || "", slug, tags || "[]", demo_url || "", github_url || "", cover_emoji || "🛠️", now, now);
  return c.json({ id, message: "Project created" }, 201);
});

// UPDATE Project (Admin)
portfolioRoutes.put("/:id", authMiddleware, async (c) => {
  const { title, category, description, tags, demo_url, github_url, cover_emoji } = await c.req.json();
  const now = new Date().toISOString();
  db.query("UPDATE portfolio_projects SET title = ?, category = ?, description = ?, tags = ?, demo_url = ?, github_url = ?, cover_emoji = ?, updated_at = ? WHERE id = ?")
    .run(title, category, description, tags || "[]", demo_url || "", github_url || "", cover_emoji || "🛠️", now, c.req.param("id"));
  return c.json({ message: "Project updated" });
});

// DELETE Project (Admin)
portfolioRoutes.delete("/:id", authMiddleware, (c) => {
  db.query("DELETE FROM portfolio_projects WHERE id = ?").run(c.req.param("id"));
  return c.json({ message: "Project deleted" });
});
