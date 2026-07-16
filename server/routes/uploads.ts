import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { write } from "bun";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const app = new Hono();

// Ensure uploads directory exists
const UPLOADS_DIR = join(process.cwd(), "public", "uploads");
mkdirSync(UPLOADS_DIR, { recursive: true });

app.post("/", authMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["image"] as File;

    if (!file) {
      return c.json({ error: "No image file provided" }, 400);
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      return c.json({ error: "File must be an image" }, 400);
    }

    // Generate unique filename to prevent overwrites
    const ext = file.name.split(".").pop() || "png";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filePath = join(UPLOADS_DIR, filename);

    // Save using Bun's native write
    await write(filePath, file);

    // Return the public URL for the image
    return c.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error("Upload error:", err);
    return c.json({ error: "Failed to upload image" }, 500);
  }
});

export { app as uploadRoutes };
