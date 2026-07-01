// ============================================================
// server/server.js — Express API Server
// ============================================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const DATA_FILE = path.join(__dirname, 'data', 'articles.json');

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Ensure data file exists ---
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// --- Helper: Read/Write Articles ---
function readArticles() {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
}

function writeArticles(articles) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2));
}

// --- Auth Middleware ---
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
}

// ============================================================
// AUTH ROUTES
// ============================================================
// Simple single-admin login (replace with DB in production)
const ADMIN_USER = {
    username: process.env.ADMIN_USER || 'admin',
    passwordHash: bcrypt.hashSync(process.env.ADMIN_PASS || 'admin123', 10)
};

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username !== ADMIN_USER.username || !bcrypt.compareSync(password, ADMIN_USER.passwordHash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username });
});

// ============================================================
// ARTICLES API
// ============================================================

// GET all articles (public, published only)
app.get('/api/articles', (req, res) => {
    const articles = readArticles();
    const { tag, search, page = 1, limit = 10 } = req.query;

    let filtered = articles.filter(a => a.published);

    if (tag) {
        filtered = filtered.filter(a => a.tags?.includes(tag));
    }
    if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(a =>
            a.title.toLowerCase().includes(q) ||
            a.excerpt?.toLowerCase().includes(q) ||
            a.tags?.some(t => t.toLowerCase().includes(q))
        );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Pagination
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + Number(limit));

    res.json({
        articles: paginated,
        total: filtered.length,
        page: Number(page),
        totalPages: Math.ceil(filtered.length / limit)
    });
});

// GET all tags
app.get('/api/articles/tags', (req, res) => {
    const articles = readArticles();
    const tagSet = new Set();
    articles.filter(a => a.published).forEach(a => a.tags?.forEach(t => tagSet.add(t)));
    res.json({ tags: [...tagSet] });
});

// GET single article by slug
app.get('/api/articles/:slug', (req, res) => {
    const articles = readArticles();
    const article = articles.find(a => a.slug === req.params.slug);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    if (!article.published) return res.status(404).json({ error: 'Article not found' });

    // Increment views
    article.views = (article.views || 0) + 1;
    writeArticles(articles);

    res.json(article);
});

// POST create article (admin)
app.post('/api/articles', authenticate, (req, res) => {
    const articles = readArticles();
    const { title, slug, excerpt, content, tags, coverImage, published } = req.body;

    if (!title || !slug || !content) {
        return res.status(400).json({ error: 'Title, slug, and content are required' });
    }

    const now = new Date().toISOString();
    const article = {
        id: uuidv4(),
        title,
        slug,
        excerpt: excerpt || content.substring(0, 200) + '...',
        content,
        tags: tags || [],
        coverImage: coverImage || '',
        published: published ?? false,
        views: 0,
        createdAt: now,
        updatedAt: now
    };

    articles.push(article);
    writeArticles(articles);
    res.status(201).json(article);
});

// PUT update article (admin)
app.put('/api/articles/:id', authenticate, (req, res) => {
    const articles = readArticles();
    const index = articles.findIndex(a => a.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Article not found' });

    const { title, slug, excerpt, content, tags, coverImage, published } = req.body;
    articles[index] = {
        ...articles[index],
        title: title ?? articles[index].title,
        slug: slug ?? articles[index].slug,
        excerpt: excerpt ?? articles[index].excerpt,
        content: content ?? articles[index].content,
        tags: tags ?? articles[index].tags,
        coverImage: coverImage ?? articles[index].coverImage,
        published: published ?? articles[index].published,
        updatedAt: new Date().toISOString()
    };

    writeArticles(articles);
    res.json(articles[index]);
});

// DELETE article (admin)
app.delete('/api/articles/:id', authenticate, (req, res) => {
    let articles = readArticles();
    articles = articles.filter(a => a.id !== req.params.id);
    writeArticles(articles);
    res.json({ message: 'Article deleted' });
});

// ============================================================
// CONTACT API
// ============================================================
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields required' });
    }

    // In production: send email via Nodemailer, SendGrid, etc.
    const contactsFile = path.join(__dirname, 'data', 'contacts.json');
    let contacts = [];
    if (fs.existsSync(contactsFile)) {
        contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf-8'));
    }
    contacts.push({ name, email, subject, message, receivedAt: new Date().toISOString() });
    fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));

    res.json({ message: 'Message received successfully!' });
});

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Portfolio server running at http://localhost:${PORT}`);
});
