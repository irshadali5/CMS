Here is the raw Markdown. Click the **Copy** button in the top right corner of the code block below and paste it directly into your `README.md` file.

```markdown
<div align="center">

```text
  ___           _             _     _   _   _ _ 
 |_ _| _ _  ___| |_   __ _ __| |   /_\ | | (_) |
  | | | '_|(_-<| ' \ / _` / _` |  / _ \| | | | |
 |___||_|  /__/|_||_|\__,_\__,_| /_/ \_\_| |_|_|
```

# Irshad Ali | Systems Developer & AI Prompt Engineer

**A blazing-fast, production-ready personal portfolio and CMS.**  
Built with **Bun**, **Hono**, **SQLite**, and **TypeScript**.

[![Bun](https://img.shields.io/badge/Bun-1.1.30-000000?style=flat-square&logo=bun&logoColor=white)](https://bun.sh)
[![Hono](https://img.shields.io/badge/Hono-4.6-FF5F11?style=flat-square&logo=hono&logoColor=white)](https://hono.dev)
[![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

---

## 📖 Overview

This is a full-stack, Single Page Application (SPA) powered by a high-performance Bun backend. It serves a dual purpose:
1. **For Interviewers & Recruiters:** A clean, accessible showcase of my case studies, career timeline, and technical expertise in C++, Rust, SQL, and GNU/Linux.
2. **For Viewers & Readers:** A fast, searchable blog with Markdown rendering, syntax highlighting, and a built-in CMS for publishing articles.

### ✨ Key Features

#### 🚀 Performance & Architecture
- **Bun + Hono:** Ultra-fast HTTP routing and server startup (< 50ms).
- **SQLite (WAL Mode):** Native `bun:sqlite` integration for zero-latency, ACID-compliant data storage.
- **SPA Routing:** Hash-based client-side routing with zero page reloads.
- **Edge-Ready:** Compiles to a single executable or deploys seamlessly to edge runtimes.

#### 🛡️ Production Hardening
- **Rate Limiting:** IP-based throttling on API routes (stricter limits on the contact form).
- **Security Headers:** Implemented via `hono/secure-headers` (CSP, X-Frame-Options, etc.).
- **Input Sanitization:** DOMPurify integration to prevent XSS in Markdown articles.
- **JWT Authentication:** Secure, stateless admin panel access using `jose`.

#### 🎨 UI / UX
- **Terminal Artifact Footer:** A fully interactive, syntax-highlighted bash terminal footer with a live "uptime" counter and ASCII skill tree.
- **Syntax Highlighting:** `highlight.js` integration for C++, Rust, SQL, Bash, and Python code blocks.
- **Dark/Light Mode:** Persistent theme toggling with CSS variables.
- **PWA Support:** Installable via `manifest.json` with offline capabilities.

#### 🔍 SEO & Analytics
- **Dynamic Sitemap:** Auto-generated `sitemap.xml` based on published articles.
- **Open Graph & Twitter Cards:** Rich social media previews.
- **JSON-LD:** Structured data for search engine person entities.
- **Privacy-First Analytics:** Plausible analytics integration.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | [Bun](https://bun.sh) (JavaScript/TypeScript runtime) |
| **Backend Framework** | [Hono](https://hono.dev) (Ultrafast web framework) |
| **Database** | [SQLite](https://sqlite.org) (via `bun:sqlite`) |
| **Validation** | [Zod](https://zod.dev) |
| **Auth** | [jose](https://github.com/panva/jose) (JWT) + `bcryptjs` |
| **Frontend** | Vanilla JS (ES6+), CSS3 (Custom Properties, Grid) |
| **Markdown** | `marked` + `DOMPurify` + `highlight.js` |

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) installed on your system (`curl -fsSL https://bun.sh/install | bash`).

### 1. Clone and Install
```bash
git clone https://github.com/irshadali/portfolio-cms.git
cd portfolio-cms
bun install
```

### 2. Environment Setup
Copy the example environment file and configure your secrets:
```bash
cp .env.example .env
```
*Edit `.env` to set your `JWT_SECRET`, `ADMIN_PASS`, and SMTP credentials for the contact form.*

### 3. Database Migration
Initialize the SQLite database, create tables, and seed sample articles:
```bash
bun run db:migrate
```

### 4. Run Development Server
Start the server with hot-reloading:
```bash
bun run dev
```
Visit **http://localhost:3000** to see the site.  
Visit **http://localhost:3000/#/admin/login** to access the CMS (Default: `admin` / your `.env` password).

---

## 📂 Project Structure

```text
irshad-portfolio/
├── server/                  # Backend (Hono + Bun)
│   ├── index.ts             # Server entry point & middleware
│   ├── db.ts                # SQLite schema, migrations & seed data
│   ├── routes/
│   │   ├── articles.ts      # CRUD API for blog posts
│   │   ├── auth.ts          # Admin JWT login
│   │   ├── contact.ts       # Contact form & Nodemailer
│   │   └── seo.ts           # Dynamic sitemap.xml
│   └── middleware/
│       ├── auth.ts          # JWT verification
│       └── rateLimit.ts     # IP-based rate limiting
├── public/                  # Frontend (SPA)
│   ├── index.html           # Main HTML shell (OG tags, PWA, JSON-LD)
│   ├── manifest.json        # PWA manifest
│   ├── robots.txt           # Search engine directives
│   ├── css/styles.css       # Global styles & Terminal Footer
│   └── js/app.js            # Client-side router, API client, UI logic
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # You are here!
```

---

## ⚙️ Available Scripts

| Command | Description |
| :--- | :--- |
| `bun run dev` | Starts the server with `--hot` reloading. |
| `bun run start` | Starts the server in production mode. |
| `bun run db:migrate` | Runs database migrations and seeds initial data. |
| `bun run build` | Compiles the server into a standalone executable. |

---

## 🌐 API Endpoints

The backend exposes a RESTful API for the frontend SPA and CMS.

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/articles` | ❌ | Fetch paginated, published articles (supports `?tag=`, `?search=`). |
| `GET` | `/api/articles/tags` | ❌ | Fetch all unique tags. |
| `GET` | `/api/articles/:slug` | ❌ | Fetch single article & increment view count. |
| `POST` | `/api/articles` | 🔒 | Create a new article. |
| `PUT` | `/api/articles/:id` | 🔒 | Update an existing article. |
| `DELETE` | `/api/articles/:id` | 🔒 | Delete an article. |
| `POST` | `/api/contact` | ❌ | Submit contact form (Rate limited: 3/min). |
| `POST` | `/api/auth/login` | ❌ | Admin login (Returns JWT). |
| `GET` | `/sitemap.xml` | ❌ | Auto-generated XML sitemap. |

---

## 🚢 Deployment

This application is designed to be deployed as a single container or process with a persistent volume for the SQLite database.

### Docker
```dockerfile
FROM oven/bun:1.1-alpine AS base
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

COPY . .

EXPOSE 3000
ENV NODE_ENV=production
CMD ["bun", "run", "start"]
```

### Fly.io / Railway
1. Create a persistent volume for the database:
   ```bash
   fly volumes create portfolio_data --region lhr --size 1
   ```
2. Set your production secrets:
   ```bash
   fly secrets set JWT_SECRET=$(openssl rand -hex 32) ADMIN_PASS=$(openssl rand -base64 16)
   ```
3. Deploy:
   ```bash
   fly deploy
   ```
*Note: Ensure your volume is mounted to `/app/data` so `portfolio.db` persists across restarts.*

---

## 🗺️ Roadmap
- [x] Add image upload support via `multer` + S3/Cloudinary.
- [x] Implement full-text search (FTS5) in SQLite.
- [x] Add a commenting system (e.g., Giscus or custom SQLite implementation).
- [ ] Migrate frontend to a lightweight reactive framework (like Preact or Alpine.js) if complexity grows.

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ⚡ by <a href="https://github.com/irshadali">Irshad Ali</a></sub>
</div>
```