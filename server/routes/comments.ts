import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { authMiddleware } from "../middleware/auth";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const purify = DOMPurify(new JSDOM("").window);

const app = new Hono();

const CommentSchema = z.object({
  articleId: z.string().uuid(),
  authorName: z.string().min(2).max(100),
  content: z.string().min(5).max(1000),
});

// GET comments for an article (only approved)
app.get("/:articleId", (c) => {
  const articleId = c.req.param("articleId");
  const comments = db.query(`
    SELECT id, author_name as authorName, content, created_at as createdAt 
    FROM comments 
    WHERE article_id = ? AND status = 'approved'
    ORDER BY created_at DESC
  `).all(articleId);

  return c.json({ comments });
});

// POST a new comment (pending by default)
app.post("/", zValidator("json", CommentSchema), (c) => {
  const data = c.req.valid("json");
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const safeContent = purify.sanitize(data.content);

  db.query(`
    INSERT INTO comments (id, article_id, author_name, content, status, created_at)
    VALUES (?, ?, ?, ?, 'pending', ?)
  `).run(id, data.articleId, purify.sanitize(data.authorName), safeContent, now);

  return c.json({ message: "Comment submitted successfully and is awaiting moderation." }, 201);
});

// GET all comments (Admin only)
app.get("/admin/all", authMiddleware, (c) => {
  const comments = db.query(`
    SELECT c.id, c.article_id as articleId, a.title as articleTitle, c.author_name as authorName, c.content, c.status, c.created_at as createdAt
    FROM comments c
    LEFT JOIN articles a ON c.article_id = a.id
    ORDER BY c.created_at DESC
  `).all();

  return c.json({ comments });
});

// PUT approve a comment (Admin only)
app.put("/:id/approve", authMiddleware, (c) => {
  const id = c.req.param("id");
  db.query("UPDATE comments SET status = 'approved' WHERE id = ?").run(id);
  return c.json({ message: "Comment approved" });
});

// DELETE a comment (Admin only)
app.delete("/:id", authMiddleware, (c) => {
  const id = c.req.param("id");
  db.query("DELETE FROM comments WHERE id = ?").run(id);
  return c.json({ message: "Comment deleted" });
});

export { app as commentRoutes };
