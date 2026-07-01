import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import nodemailer from "nodemailer";
import { db } from "../db";

const app = new Hono();

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(5000),
});

// Lazy transporter
let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (!transporter && process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

app.post("/", zValidator("json", ContactSchema), async (c) => {
  const data = c.req.valid("json");
  const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
  const now = new Date().toISOString();

  // Persist
  db.query(`
    INSERT INTO contacts (name, email, subject, message, ip, received_at)
    VALUES ($name, $email, $subject, $message, $ip, $now)
  `).run({
    $name: data.name,
    $email: data.email,
    $subject: data.subject || "",
    $message: data.message,
    $ip,
    $now: now,
  });

  // Email (async, don't block response)
  const t = getTransporter();
  if (t) {
    t.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.SMTP_USER,
      subject: `Portfolio Contact: ${data.subject || "New message"}`,
      text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
      html: `<p><b>${data.name}</b> (${data.email}) sent a message:</p><p>${data.message.replace(/\n/g, "<br>")}</p>`,
    }).catch((err) => console.error("Email failed:", err));
  }

  return c.json({ message: "Message received. I'll reply within 24 hours." });
});

export { app as contactRoutes };
