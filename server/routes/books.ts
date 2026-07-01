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

export { app as bookRoutes };