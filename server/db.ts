// server/db.ts
import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = process.env.DB_PATH || "./data/portfolio.db";

// FIX: Ensure the parent directory exists before creating the database file
mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH, { create: true });

// Enable WAL mode for better concurrency
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      cover_image TEXT DEFAULT '',
      published INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      ip TEXT,
      received_at TEXT NOT NULL
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
      title, excerpt, content, tags, content='articles', content_rowid='rowid'
    );

    CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
      INSERT INTO articles_fts(rowid, title, excerpt, content, tags) 
      VALUES (new.rowid, new.title, new.excerpt, new.content, new.tags);
    END;

    CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
      INSERT INTO articles_fts(articles_fts, rowid, title, excerpt, content, tags) 
      VALUES ('delete', old.rowid, old.title, old.excerpt, old.content, old.tags);
    END;

    CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
      INSERT INTO articles_fts(articles_fts, rowid, title, excerpt, content, tags) 
      VALUES ('delete', old.rowid, old.title, old.excerpt, old.content, old.tags);
      INSERT INTO articles_fts(rowid, title, excerpt, content, tags) 
      VALUES (new.rowid, new.title, new.excerpt, new.content, new.tags);
    END;

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT NOT NULL,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      cover_emoji TEXT DEFAULT '📚',
      type TEXT DEFAULT 'html',
      file_path TEXT,
      published INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      content TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      UNIQUE (book_id, slug)
    );

    CREATE TABLE IF NOT EXISTS portfolio_projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      tags TEXT DEFAULT '[]',
      demo_url TEXT,
      github_url TEXT,
      cover_emoji TEXT DEFAULT '🛠️',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

// At the bottom of migrate(), add the book seeder
const bookCount = db.query("SELECT COUNT(*) as c FROM books").get() as any;
if (bookCount.c === 0) seedSampleBooks();

  // Seed admin user if missing
  const bcrypt = require("bcryptjs");
  const count = db.query("SELECT COUNT(*) as c FROM admin_users").get() as any;
  if (count.c === 0) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASS || "admin123", 10);
    db.query(
      "INSERT INTO admin_users (username, password_hash, created_at) VALUES (?, ?, ?)"
    ).run(
      process.env.ADMIN_USER || "admin",
      hash,
      new Date().toISOString()
    );
    console.log("✓ Default admin user created");
  }

  // Seed sample articles if table is empty
  const artCount = db.query("SELECT COUNT(*) as c FROM articles").get() as any;
  if (artCount.c === 0) seedSampleArticles();

  // Seed portfolio projects if table is empty
  const portCount = db.query("SELECT COUNT(*) as c FROM portfolio_projects").get() as any;
  if (portCount.c === 0) seedSamplePortfolio();

  // Backfill FTS5
  db.exec(`
    INSERT INTO articles_fts(articles_fts) VALUES('rebuild');
  `);
}

function seedSamplePortfolio() {
  const projects = [
    { id: crypto.randomUUID(), title: "Lock-Free Queue (Rust)", category: "systems", description: "Michael-Scott queue achieving 28M ops/sec on 16 threads. No unsafe blocks in public API. Full benchmarks included.", slug: "lock-free-queue", tags: JSON.stringify(['Rust', 'Atomics', 'Arc']), demo_url: "#", github_url: "", cover_emoji: "🦀", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: crypto.randomUUID(), title: "Custom Slab Allocator", category: "systems", description: "C++ memory allocator 4x faster than glibc for HFT workloads. Template-based, zero-overhead.", slug: "slab-allocator", tags: JSON.stringify(['C++20', 'Templates', 'SIMD']), demo_url: "#", github_url: "", cover_emoji: "⚙️", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: crypto.randomUUID(), title: "AI Document Extractor", category: "ai", description: "Production pipeline processing 10K+ docs/day with 94% accuracy using schema-first prompting.", slug: "ai-doc-extractor", tags: JSON.stringify(['Python', 'OpenAI', 'PostgreSQL']), demo_url: "#", github_url: "", cover_emoji: "🤖", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: crypto.randomUUID(), title: "Query Optimizer Engine", category: "data", description: "Tool that analyzes PostgreSQL EXPLAIN output and suggests indexes. Reduced a 30s query to 3ms.", slug: "query-optimizer", tags: JSON.stringify(['SQL', 'PostgreSQL', 'Python']), demo_url: "#", github_url: "", cover_emoji: "🗄️", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: crypto.randomUUID(), title: "Systemd Service Manager", category: "linux", description: "CLI tool for generating, validating, and deploying systemd unit files across clusters.", slug: "systemd-manager", tags: JSON.stringify(['Go', 'Systemd', 'Linux']), demo_url: "#", github_url: "", cover_emoji: "🐧", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: crypto.randomUUID(), title: "RAG Pipeline for Docs", category: "ai", description: "Retrieval-Augmented Generation system for internal docs. 85% answer accuracy with citation tracking.", slug: "rag-pipeline", tags: JSON.stringify(['LangChain', 'OpenAI', 'Pinecone']), demo_url: "#", github_url: "", cover_emoji: "📊", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];
  
  const insert = db.prepare(
    "INSERT INTO portfolio_projects (id, title, category, description, slug, tags, demo_url, github_url, cover_emoji, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const transaction = db.transaction(() => {
    for (const p of projects) {
      insert.run(p.id, p.title, p.category, p.description, p.slug, p.tags, p.demo_url, p.github_url, p.cover_emoji, p.created_at, p.updated_at);
    }
  });
  transaction();
  console.log("✓ Seeded sample portfolio projects");
}

function seedSampleArticles() {
  const samples = [
    {
      id: crypto.randomUUID(),
      title: "Zero-Cost Abstractions in Rust: Building a Lock-Free Queue",
      slug: "rust-zero-cost-lock-free-queue",
      excerpt: "How Rust's type system and ownership model enable safe concurrent data structures without runtime overhead.",
      content: `## Introduction\n\nRust provides zero-cost abstractions — you pay only for what you use. In this deep dive, we'll build a Michael-Scott lock-free queue from scratch, exploring how \`Arc\`, \`AtomicPtr\`, and \`Ordering\` work together.\n\n### The Core Idea\n\nA lock-free queue uses compare-and-swap (CAS) operations instead of mutexes. This gives us:\n\n- **No priority inversion**\n- **No deadlocks**\n- **Better cache locality** under contention\n\n\`\`\`rust\nuse std::sync::atomic::{AtomicPtr, Ordering};\nuse std::sync::Arc;\n\nstruct Node<T> {\n    value: Option<T>,\n    next: AtomicPtr<Node<T>>,\n}\n\npub struct Queue<T> {\n    head: AtomicPtr<Node<T>>,\n    tail: AtomicPtr<Node<T>>,\n}\n\`\`\`\n\n### Safety with Ownership\n\nThe magic of Rust is that the compiler prevents data races at compile time. No \`unsafe\` blocks needed for the public API!\n\n### Benchmarks\n\nOn an AMD Ryzen 9 7950X, our queue achieves **28M ops/sec** under 16 threads, compared to 12M ops/sec for \`std::sync::Mutex<VecDeque>\`.\n\n## Conclusion\n\nRust isn't just about safety — it's about giving you the tools to write high-performance systems code that you can actually reason about.`,
      tags: JSON.stringify(["Rust", "Systems", "Concurrency"]),
      published: 1,
      views: 342,
      created_at: "2026-03-15T10:00:00Z",
    },
    {
      id: crypto.randomUUID(),
      title: "Advanced Prompt Engineering: Structured Output with Chain-of-Thought",
      slug: "advanced-prompt-engineering-structured-output",
      excerpt: "Techniques for reliably extracting JSON, schemas, and reasoning chains from LLMs in production systems.",
      content: `## Beyond "Act as a..."\n\nMost prompt engineering tutorials stop at role-playing. In production AI systems, we need **reliability**. Here's what actually works.\n\n### Technique 1: Schema-First Prompting\n\n\`\`\`python\nSYSTEM = """You are a strict JSON extractor.\nReturn ONLY valid JSON matching this schema:\n\n{\n  "entities": [{"name": "string", "type": "string", "confidence": 0.0-1.0}],\n  "summary": "string"\n}\n\nNo markdown. No explanation. If unsure, use null."""\n\`\`\`\n\n### Technique 2: Chain-of-Thought with Self-Verification\n\n\`\`\`\nStep 1: Read the input carefully.\nStep 2: List all candidate entities.\nStep 3: Verify each against the schema.\nStep 4: Output the final JSON only.\n\`\`\`\n\n### Technique 3: Few-Shot Calibration\n\nProvide 3-5 examples covering edge cases. LLMs are pattern matchers — show them the pattern.\n\n## Real-World Results\n\nOn a dataset of 10,000 support tickets, structured prompting improved extraction accuracy from **67% → 94%** with GPT-4.\n\n## The Prompt Engineer's Mindset\n\nThink like a compiler designer: define your input schema, handle errors explicitly, and test deterministically.`,
      tags: JSON.stringify(["AI", "Prompt Engineering", "LLMs"]),
      published: 1,
      views: 1205,
      created_at: "2026-04-22T14:30:00Z",
    },
    {
      id: crypto.randomUUID(),
      title: "Mastering GNU/Linux: From Bash One-Liners to Systemd Services",
      slug: "gnu-linux-bash-systemd-mastery",
      excerpt: "Essential Linux skills every developer should have — text processing, process management, and service creation.",
      content: `## The Power of the Terminal\n\nGNU/Linux isn't just an OS — it's a philosophy of composability. Small tools, glued together with pipes.\n\n### Bash One-Liners That Save Hours\n\n\`\`\`bash\n# Find and kill zombie processes\nps aux | awk '$8 ~ /Z/ {print $2}' | xargs -r kill -9\n\n# Top 10 largest files in current dir\nfind . -type f -exec du -h {} + | sort -rh | head -n 10\n\n# Real-time log monitoring with color\ntail -f /var/log/syslog | grep --color 'ERROR\\|WARN\\|$'\n\`\`\`\n\n### Creating a Systemd Service\n\n\`\`\`ini\n# /etc/systemd/system/myapp.service\n[Unit]\nDescription=My Rust Web Service\nAfter=network.target\n\n[Service]\nType=simple\nUser=appuser\nExecStart=/opt/myapp/target/release/myapp\nRestart=always\nRestartSec=5\nEnvironment=RUST_LOG=info\n\n[Install]\nWantedBy=multi-user.target\n\`\`\`\n\nThen: \`sudo systemctl enable --now myapp\`\n\n### Process Management Deep Dive\n\nUnderstanding \`fork()\`, \`exec()\`, and signal handling is what separates users from engineers.\n\n\`\`\`c\n#include <unistd.h>\n#include <signal.h>\n\n// Graceful shutdown handling\nvoid handle_sigterm(int sig) {\n    cleanup();\n    exit(0);\n}\n\`\`\`\n\n## Conclusion\n\nThe terminal is your most powerful IDE. Invest in mastering it — it pays dividends across every project you'll ever touch.`,
      tags: JSON.stringify(["GNU/Linux", "Bash", "Systems"]),
      published: 1,
      views: 891,
      created_at: "2026-05-10T09:00:00Z",
    },
    {
      id: crypto.randomUUID(),
      title: "SQL Query Optimization: From 30s to 3ms",
      slug: "sql-query-optimization-30s-to-3ms",
      excerpt: "A real-world case study of diagnosing and fixing a slow PostgreSQL query using EXPLAIN ANALYZE.",
      content: `## The Problem\n\nA report that used to take 30 seconds. After 2 hours of work: **3 milliseconds**.\n\n### The Original Query\n\n\`\`\`sql\nSELECT u.name, COUNT(o.id) as order_count, SUM(o.total) as total_spent\nFROM users u\nJOIN orders o ON u.id = o.user_id\nWHERE o.created_at > NOW() - INTERVAL '90 days'\nGROUP BY u.id\nORDER BY total_spent DESC\nLIMIT 100;\n\`\`\`\n\n### EXPLAIN ANALYZE Output\n\nThe smoking gun: **Seq Scan on orders** — 4.2M rows scanned.\n\n### The Fixes\n\n1. **Composite index**:\n\`\`\`sql\nCREATE INDEX idx_orders_user_created_total\nON orders (user_id, created_at) INCLUDE (total, id);\n\`\`\`\n\n2. **Materialized view** for daily snapshots\n3. **Covering index** eliminates table lookups entirely\n\n### Results\n\n- Before: 31.2 seconds, 4.2M rows\n- After: 2.8 milliseconds, 1,247 rows\n- **10,000x improvement**\n\n## Key Takeaways\n\n1. Always \`EXPLAIN ANALYZE\` before optimizing\n2. Know your index types (B-tree, GIN, BRIN)\n3. Understand table statistics (\`ANALYZE\`)\n4. Sometimes denormalization is the right answer\n\nSQL is not just a query language — it's a database programming language. Treat it with respect.`,
      tags: JSON.stringify(["SQL", "PostgreSQL", "Performance"]),
      published: 1,
      views: 567,
      created_at: "2026-06-05T16:20:00Z",
    },
  ];

  // ✅ FIX: Use positional parameters (?) instead of named parameters ($name)
  // This completely avoids the object key mismatch that caused the NOT NULL error.
  const insert = db.query(`
    INSERT INTO articles (id, title, slug, excerpt, content, tags, cover_image, published, views, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?)
  `);

  for (const s of samples) {
    insert.run(
      s.id,
      s.title,
      s.slug,
      s.excerpt,
      s.content,
      s.tags,
      s.published,
      s.views,
      s.created_at,
      s.created_at // maps to updated_at
    );
  }
  console.log(`✓ Seeded ${samples.length} sample articles`);
}

function seedSampleBooks() {
  const bookId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.query(`
    INSERT INTO books (id, title, slug, description, cover_emoji, published, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(bookId, "Rust for Systems Programmers", "rust-systems", "A practical guide to migrating your C++ mental models to Rust. Learn ownership, concurrency, and zero-cost abstractions.", "🦀", 1, now, now);

  const chapters = [
    {
      id: crypto.randomUUID(), idx: 1, title: "Introduction: Why Rust?", slug: "intro",
      content: "## Welcome to Rust\n\nIf you are coming from C++, you already understand memory. Rust doesn't want to hide memory from you; it wants to help you manage it without the segfaults.\n\n### The C++ Baggage\n\nIn C++, you manually call `new` and `delete`. In Rust, the compiler calls them for you via RAII (Resource Acquisition Is Initialization), but with strict borrowing rules."
    },
    {
      id: crypto.randomUUID(), idx: 2, title: "Ownership & Borrowing", slug: "ownership",
      content: "## The Golden Rules\n\n1. Each value in Rust has a variable that’s called its *owner*.\n2. There can only be one owner at a time.\n3. When the owner goes out of scope, the value will be dropped.\n\n```rust\nlet s1 = String::from(\"hello\");\nlet s2 = s1; // s1 is moved, no longer valid\n```"
    },
    {
      id: crypto.randomUUID(), idx: 3, title: "Lifetimes Demystified", slug: "lifetimes",
      content: "## What is a Lifetime?\n\nLifetimes are simply a way to describe the scope for which a reference is valid. Most of the time, they are implicit.\n\n```rust\n&i32        // a reference\n&'a i32     // a reference with an explicit lifetime\n&'a mut i32 // a mutable reference with an explicit lifetime\n```"
    }
  ];

  const insertChapter = db.query(`
    INSERT INTO book_chapters (id, book_id, chapter_index, title, slug, content, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ch of chapters) {
    insertChapter.run(ch.id, bookId, ch.idx, ch.title, ch.slug, ch.content, now, now);
  }
  console.log(`✓ Seeded sample book with ${chapters.length} chapters`);
}