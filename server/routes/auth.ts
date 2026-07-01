import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { signToken } from "../middleware/auth";

const app = new Hono();

app.post("/login", async (c) => {
  const { username, password } = await c.req.json();
  const user = db.query("SELECT * FROM admin_users WHERE username = ?").get(username) as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await signToken({ username, id: user.id });
  return c.json({ token, username });
});

export { app as authRoutes };
