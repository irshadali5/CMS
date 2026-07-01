import { Hono } from "hono";
import { db } from "../db";

const app = new Hono();

// GET all published books
app.get("/", (c) => {
  const books = db.query("SELECT * FROM books WHERE published = 1 ORDER BY created_at DESC").all();
  return c.json({ books });
});

// GET single book + Table of Contents
app.get("/:bookSlug", (c) => {
  const book = db.query("SELECT * FROM books WHERE slug = ? AND published = 1").get(c.req.param("bookSlug")) as any;
  if (!book) return c.json({ error: "Book not found" }, 404);

  const chapters = db.query("SELECT id, chapter_index, title, slug FROM book_chapters WHERE book_id = ? ORDER BY chapter_index ASC").all(book.id);
  
  return c.json({ book, chapters });
});

// GET specific chapter + next/prev metadata
app.get("/:bookSlug/:chapterSlug", (c) => {
  const book = db.query("SELECT * FROM books WHERE slug = ? AND published = 1").get(c.req.param("bookSlug")) as any;
  if (!book) return c.json({ error: "Book not found" }, 404);

  const chapter = db.query("SELECT * FROM book_chapters WHERE book_id = ? AND slug = ?").get(book.id, c.req.param("chapterSlug")) as any;
  if (!chapter) return c.json({ error: "Chapter not found" }, 404);

  // Get next and previous chapters for navigation
  const prev = db.query("SELECT slug, title FROM book_chapters WHERE book_id = ? AND chapter_index < ? ORDER BY chapter_index DESC LIMIT 1").get(book.id, chapter.chapter_index) as any;
  const next = db.query("SELECT slug, title FROM book_chapters WHERE book_id = ? AND chapter_index > ? ORDER BY chapter_index ASC LIMIT 1").get(book.id, chapter.chapter_index) as any;

  return c.json({ book, chapter, prev, next });
});

import { authMiddleware } from "../middleware/auth"; // Ensure this is imported at the top

// GET single book by ID (Admin only - ignores published status)
app.get("/admin/:id", authMiddleware, (c) => {
  const book = db.query("SELECT * FROM books WHERE id = ?").get(c.req.param("id")) as any;
  if (!book) return c.json({ error: "Book not found" }, 404);
  const chapters = db.query("SELECT * FROM book_chapters WHERE book_id = ? ORDER BY chapter_index ASC").all(book.id);
  return c.json({ book, chapters });
});

// CREATE BOOK
app.post("/", authMiddleware, async (c) => {
  const { title, slug, description, cover_emoji, published } = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.query("INSERT INTO books (id, title, slug, description, cover_emoji, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, title, slug, description || "", cover_emoji || "📚", published ? 1 : 0, now, now);
  return c.json({ id, message: "Book created" }, 201);
});

// UPDATE BOOK
app.put("/:id", authMiddleware, async (c) => {
  const { title, description, cover_emoji, published } = await c.req.json();
  const now = new Date().toISOString();
  db.query("UPDATE books SET title=?, description=?, cover_emoji=?, published=?, updated_at=? WHERE id=?")
    .run(title, description, cover_emoji, published ? 1 : 0, now, c.req.param("id"));
  return c.json({ message: "Book updated" });
});

// DELETE BOOK (Cascades to chapters)
app.delete("/:id", authMiddleware, (c) => {
  db.query("DELETE FROM books WHERE id = ?").run(c.req.param("id"));
  return c.json({ message: "Book deleted" });
});

// ADD CHAPTER
app.post("/:bookId/chapters", authMiddleware, async (c) => {
  const { title, slug, content, chapter_index } = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.query("INSERT INTO book_chapters (id, book_id, chapter_index, title, slug, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, c.req.param("bookId"), chapter_index, title, slug, content, now, now);
  return c.json({ id, message: "Chapter added" }, 201);
});

// UPDATE CHAPTER
app.put("/:bookId/chapters/:chapterId", authMiddleware, async (c) => {
  const { title, content, chapter_index } = await c.req.json();
  const now = new Date().toISOString();
  db.query("UPDATE book_chapters SET title=?, content=?, chapter_index=?, updated_at=? WHERE id=? AND book_id=?")
    .run(title, content, chapter_index, now, c.req.param("chapterId"), c.req.param("bookId"));
  return c.json({ message: "Chapter updated" });
});

// DELETE CHAPTER
app.delete("/:bookId/chapters/:chapterId", authMiddleware, (c) => {
  db.query("DELETE FROM book_chapters WHERE id = ? AND book_id = ?").run(c.req.param("chapterId"), c.req.param("bookId"));
  return c.json({ message: "Chapter deleted" });
});

export { app as bookRoutes };