// ============================================================
// app.js — SPA Router, Pages, API Client, Theme, Animations
// ============================================================

// ===================== CONFIG =====================
const API_BASE = '/api';
const APP = {
    name: 'John Doe',
    title: 'Full-Stack Developer',
    tagline: 'I build exceptional digital experiences and write about the craft of software engineering.',
    email: 'hello@johndoe.dev',
    github: 'https://github.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
    twitter: 'https://twitter.com/johndoe',
};

// ===================== STATE =====================
const state = {
    currentRoute: '/',
    token: localStorage.getItem('auth_token'),
    articles: [],
    articlesTotal: 0,
    articlesPage: 1,
    searchQuery: '',
    selectedTag: '',
};

// ===================== API CLIENT =====================
async function api(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers: { ...headers, ...options.headers } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

// ===================== ROUTER =====================
function getRoute() {
    const hash = window.location.hash.slice(1) || '/';
    return hash;
}

function navigate(path) {
    window.location.hash = path;
}

async function router() {
    const route = getRoute();
    state.currentRoute = route;
    const app = document.getElementById('app');

    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        const r = link.dataset.route;
        link.classList.toggle('active',
            (r === 'home' && route === '/') ||
            (r === 'portfolio' && route === '/portfolio') ||
            (r === 'articles' && (route === '/articles' || route.startsWith('/article/'))) ||
            (r === 'about' && route === '/about') ||
            (r === 'contact' && route === '/contact')
        );
    });

    // Close mobile menu
    document.getElementById('navLinks')?.classList.remove('open');
    document.getElementById('mobileMenuBtn')?.classList.remove('active');

    // Route matching
    if (route === '/') renderHome(app);
    else if (route === '/portfolio') renderPortfolio(app);
    else if (route === '/articles') renderArticles(app);
    else if (route.startsWith('/article/')) renderArticleDetail(app, route.split('/article/')[1]);
    else if (route === '/about') renderAbout(app);
    else if (route === '/contact') renderContact(app);
    else if (route === '/admin') renderAdmin(app);
    else if (route === '/admin/login') renderLogin(app);
    else if (route === '/admin/new') renderArticleEditor(app);
    else if (route.startsWith('/admin/edit/')) renderArticleEditor(app, route.split('/admin/edit/')[1]);
    else renderHome(app);

    // Scroll to top & trigger animations
    window.scrollTo(0, 0);
    initRevealAnimations();
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavbar();
    router();
});

// ===================== THEME =====================
function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('themeToggle')?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}

// ===================== NAVBAR =====================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 50);
    });

    menuBtn?.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navLinks.classList.toggle('open');
    });
}

// ===================== TOAST =====================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ===================== REVEAL ANIMATION =====================
function initRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ============================================================
// PAGE: HOME
// ============================================================
function renderHome(app) {
    app.innerHTML = `
        <!-- HERO -->
        <section class="hero">
            <div class="hero-grid-bg"></div>
            <div class="hero-orb hero-orb-1"></div>
            <div class="hero-orb hero-orb-2"></div>
            <div class="hero-orb hero-orb-3"></div>
            <div class="container">
                <div class="hero-content">
                    <div class="hero-badge">
                        <span class="pulse"></span>
                        Available for opportunities
                    </div>
                    <h1 class="hero-title">
                        Hi, I'm <span class="gradient-text">${APP.name}</span>.<br>
                        I build things<br>for the web.
                    </h1>
                    <p class="hero-subtitle">${APP.tagline}</p>
                    <div class="hero-actions">
                        <a href="#/portfolio" class="btn btn-primary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                            View Portfolio
                        </a>
                        <a href="#/articles" class="btn btn-secondary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                            Read Articles
                        </a>
                        <a href="#/contact" class="btn btn-ghost">Get in Touch →</a>
                    </div>
                    <div class="hero-stats">
                        <div>
                            <span class="hero-stat-number">5+</span>
                            <span class="hero-stat-label">Years Experience</span>
                        </div>
                        <div>
                            <span class="hero-stat-number">40+</span>
                            <span class="hero-stat-label">Projects Delivered</span>
                        </div>
                        <div>
                            <span class="hero-stat-number">20+</span>
                            <span class="hero-stat-label">Articles Published</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- SKILLS PREVIEW -->
        <section class="section" style="background: var(--bg-secondary);">
            <div class="container">
                <div class="reveal">
                    <span class="section-label">Expertise</span>
                    <h2 class="section-title">Skills & Technologies</h2>
                    <p class="section-subtitle">A comprehensive toolkit honed over years of building production systems.</p>
                </div>
                <div class="skills-grid reveal">
                    ${renderSkillCard('🎨', 'Frontend', ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vue.js', 'HTML/CSS'])}
                    ${renderSkillCard('⚙️', 'Backend', ['Node.js', 'Python', 'Go', 'PostgreSQL', 'MongoDB', 'Redis'])}
                    ${renderSkillCard('☁️', 'DevOps & Cloud', ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'])}
                    ${renderSkillCard('🧪', 'Practices', ['TDD', 'Agile/Scrum', 'System Design', 'Code Review', 'REST/GraphQL', 'Microservices'])}
                </div>
            </div>
        </section>

        <!-- FEATURED PROJECTS -->
        <section class="section">
            <div class="container">
                <div class="reveal">
                    <span class="section-label">Featured Work</span>
                    <h2 class="section-title">Selected Projects</h2>
                </div>
                <div class="projects-grid reveal">
                    ${renderProjectCard('🛒', 'E-Commerce Platform', 'Full-Stack', 'A scalable marketplace handling 10K+ daily transactions with real-time inventory.', ['React', 'Node.js', 'PostgreSQL', 'Stripe'], '#')}
                    ${renderProjectCard('📊', 'Analytics Dashboard', 'Frontend', 'Real-time data visualization platform with customizable widgets and team collaboration.', ['Next.js', 'D3.js', 'WebSocket', 'Redis'], '#')}
                    ${renderProjectCard('🤖', 'AI Content Assistant', 'Full-Stack', 'ML-powered writing assistant with NLP capabilities serving 5K+ active users.', ['Python', 'FastAPI', 'React', 'OpenAI'], '#')}
                </div>
                <div style="text-align: center; margin-top: 48px;" class="reveal">
                    <a href="#/portfolio" class="btn btn-secondary">View All Projects →</a>
                </div>
            </div>
        </section>

        <!-- LATEST ARTICLES -->
        <section class="section" style="background: var(--bg-secondary);">
            <div class="container">
                <div class="reveal">
                    <span class="section-label">Writing</span>
                    <h2 class="section-title">Latest Articles</h2>
                    <p class="section-subtitle">Thoughts on software engineering, architecture, and developer experience.</p>
                </div>
                <div id="homeArticles" class="articles-grid reveal">
                    <div class="loading-spinner"><div class="spinner"></div></div>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section class="section">
            <div class="container" style="text-align: center;">
                <div class="reveal">
                    <h2 class="section-title" style="max-width: 600px; margin: 0 auto 16px;">Let's Build Something <span style="color: var(--accent);">Great</span> Together</h2>
                    <p class="section-subtitle" style="margin: 0 auto 32px; text-align: center;">Whether you're a recruiter, a fellow developer, or someone with an idea — I'd love to hear from you.</p>
                    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                        <a href="#/contact" class="btn btn-primary">Start a Conversation</a>
                        <a href="#/about" class="btn btn-secondary">Download Resume</a>
                    </div>
                </div>
            </div>
        </section>
    `;

    // Load latest articles
    loadHomeArticles();
}

async function loadHomeArticles() {
    try {
        const data = await api('/articles?limit=3');
        const container = document.getElementById('homeArticles');
        if (container) {
            container.innerHTML = data.articles.map(a => renderArticleCardHTML(a)).join('') ||
                '<p style="color: var(--text-tertiary); text-align: center; grid-column: 1/-1;">No articles yet. Check back soon!</p>';
        }
    } catch (e) {
        console.error('Failed to load articles:', e);
    }
}

// ============================================================
// PAGE: PORTFOLIO (For Interviewers)
// ============================================================
function renderPortfolio(app) {
    app.innerHTML = `
        <section class="section" style="padding-top: calc(var(--nav-height) + 60px);">
            <div class="container">
                <div class="reveal">
                    <span class="section-label">Portfolio</span>
                    <h2 class="section-title">My Work & Case Studies</h2>
                    <p class="section-subtitle">A curated collection of projects demonstrating my skills across the full stack.</p>
                </div>

                <div class="filter-tabs reveal">
                    <button class="filter-tab active" data-filter="all">All</button>
                    <button class="filter-tab" data-filter="fullstack">Full-Stack</button>
                    <button class="filter-tab" data-filter="frontend">Frontend</button>
                    <button class="filter-tab" data-filter="backend">Backend</button>
                    <button class="filter-tab" data-filter="devops">DevOps</button>
                </div>

                <div class="projects-grid reveal" id="portfolioGrid">
                    ${renderProjectCard('🛒', 'E-Commerce Platform', 'Full-Stack', 'A scalable marketplace handling 10K+ daily transactions with real-time inventory management, payment processing, and order fulfillment.', ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis'], '#', 'fullstack')}
                    ${renderProjectCard('📊', 'Analytics Dashboard', 'Frontend', 'Real-time data visualization platform with customizable widgets, team collaboration, and PDF report generation.', ['Next.js', 'D3.js', 'WebSocket', 'TypeScript'], '#', 'frontend')}
                    ${renderProjectCard('🤖', 'AI Content Assistant', 'Full-Stack', 'ML-powered writing assistant with NLP capabilities, serving 5K+ active users with 99.9% uptime.', ['Python', 'FastAPI', 'React', 'OpenAI', 'AWS'], '#', 'fullstack')}
                    ${renderProjectCard('🔐', 'Auth Microservice', 'Backend', 'Centralized authentication service with OAuth2, JWT, MFA support, handling 1M+ auth requests daily.', ['Go', 'gRPC', 'PostgreSQL', 'Redis'], '#', 'backend')}
                    ${renderProjectCard('🚀', 'CI/CD Pipeline', 'DevOps', 'Automated deployment pipeline reducing release cycles from days to minutes with zero-downtime deployments.', ['GitHub Actions', 'Docker', 'K8s', 'Terraform'], '#', 'devops')}
                    ${renderProjectCard('📱', 'Health Tracker App', 'Frontend', 'Cross-platform mobile app for health metrics tracking with offline-first architecture and data sync.', ['React Native', 'SQLite', 'GraphQL'], '#', 'frontend')}
                </div>

                <!-- Experience Timeline -->
                <div style="margin-top: 100px;">
                    <div class="reveal">
                        <span class="section-label">Experience</span>
                        <h2 class="section-title">Career Journey</h2>
                    </div>
                    <div class="timeline reveal">
                        ${renderTimelineItem('2024 — Present', 'Senior Full-Stack Developer', 'TechCorp Inc.', [
                            'Led migration of monolith to microservices, reducing deployment time by 80%',
                            'Mentored team of 5 junior developers, conducting weekly code reviews',
                            'Architected real-time notification system serving 500K+ users'
                        ])}
                        ${renderTimelineItem('2022 — 2024', 'Full-Stack Developer', 'StartupXYZ', [
                            'Built MVP from zero to 10K users in 6 months',
                            'Implemented payment integration processing $2M+ in transactions',
                            'Established testing culture achieving 90%+ code coverage'
                        ])}
                        ${renderTimelineItem('2021 — 2022', 'Frontend Developer', 'Agency Creative', [
                            'Delivered 15+ client projects on time and within budget',
                            'Created reusable component library reducing development time by 40%',
                            'Optimized Core Web Vitals achieving 95+ Lighthouse scores'
                        ])}
                    </div>
                </div>
            </div>
        </section>
    `;

    // Filter functionality
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const filter = tab.dataset.filter;
            document.querySelectorAll('.project-card').forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ============================================================
// PAGE: ARTICLES (For Viewers)
// ============================================================
async function renderArticles(app) {
    app.innerHTML = `
        <section class="section" style="padding-top: calc(var(--nav-height) + 60px);">
            <div class="container">
                <div class="articles-header reveal">
                    <div>
                        <span class="section-label">Blog</span>
                        <h2 class="section-title">Articles & Insights</h2>
                        <p class="section-subtitle">Deep dives into web development, system design, and engineering best practices.</p>
                    </div>
                    <div class="search-box">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        <input type="text" id="articleSearch" placeholder="Search articles..." value="${state.searchQuery}">
                    </div>
                </div>
                <div class="filter-tabs reveal" id="articleTags"></div>
                <div class="articles-grid reveal" id="articlesGrid">
                    <div class="loading-spinner"><div class="spinner"></div></div>
                </div>
                <div id="articlesPagination" style="display: flex; justify-content: center; gap: 8px; margin-top: 40px;"></div>
            </div>
        </section>
    `;

    // Load tags
    try {
        const tagData = await api('/articles/tags');
        const tagContainer = document.getElementById('articleTags');
        tagContainer.innerHTML = `<button class="filter-tab active" data-tag="">All</button>` +
            tagData.tags.map(t => `<button class="filter-tab" data-tag="${t}">${t}</button>`).join('');

        tagContainer.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                tagContainer.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                state.selectedTag = tab.dataset.tag;
                state.articlesPage = 1;
                loadArticlesList();
            });
        });
    } catch (e) { console.error(e); }

    // Search
    document.getElementById('articleSearch')?.addEventListener('input', debounce((e) => {
        state.searchQuery = e.target.value;
        state.articlesPage = 1;
        loadArticlesList();
    }, 300));

    loadArticlesList();
}

async function loadArticlesList() {
    try {
        const params = new URLSearchParams({ page: state.articlesPage, limit: 6 });
        if (state.searchQuery) params.set('search', state.searchQuery);
        if (state.selectedTag) params.set('tag', state.selectedTag);

        const data = await api(`/articles?${params}`);
        const grid = document.getElementById('articlesGrid');
        const pagination = document.getElementById('articlesPagination');

        grid.innerHTML = data.articles.length
            ? data.articles.map(a => renderArticleCardHTML(a)).join('')
            : '<p style="color: var(--text-tertiary); text-align: center; grid-column: 1/-1; padding: 40px;">No articles found.</p>';

        // Pagination
        if (data.totalPages > 1) {
            let html = '';
            for (let i = 1; i <= data.totalPages; i++) {
                html += `<button class="btn btn-sm ${i === data.page ? 'btn-primary' : 'btn-secondary'}" onclick="state.articlesPage=${i}; loadArticlesList();">${i}</button>`;
            }
            pagination.innerHTML = html;
        } else {
            pagination.innerHTML = '';
        }
    } catch (e) {
        console.error('Failed to load articles:', e);
        document.getElementById('articlesGrid').innerHTML = '<p style="color: var(--text-tertiary); text-align: center; grid-column: 1/-1;">Failed to load articles.</p>';
    }
}

// ============================================================
// PAGE: ARTICLE DETAIL (Reading View)
// ============================================================
async function renderArticleDetail(app, slug) {
    app.innerHTML = `<div class="loading-spinner" style="min-height: 80vh;"><div class="spinner"></div></div>`;

    try {
        const article = await api(`/articles/${slug}`);
        app.innerHTML = `
            <article class="article-detail container page-enter">
                <div class="article-detail-header">
                    <a href="#/articles" class="article-back">← Back to Articles</a>
                    <h1 class="article-detail-title">${escapeHtml(article.title)}</h1>
                    <div class="article-detail-meta">
                        <span>📅 ${formatDate(article.createdAt)}</span>
                        <span>👁️ ${article.views || 0} views</span>
                        <span>⏱️ ${estimateReadTime(article.content)} min read</span>
                    </div>
                    <div class="article-tags" style="margin-top: 16px;">
                        ${article.tags.map(t => `<span class="article-tag">${escapeHtml(t)}</span>`).join('')}
                    </div>
                </div>
                <div class="article-content">
                    ${marked.parse(article.content)}
                </div>
                <div style="margin-top: 60px; padding-top: 40px; border-top: 1px solid var(--border); text-align: center;">
                    <h3 style="margin-bottom: 8px;">Enjoyed this article?</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 24px;">Share your thoughts or explore more content.</p>
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <a href="#/articles" class="btn btn-secondary">More Articles</a>
                        <a href="#/contact" class="btn btn-primary">Get in Touch</a>
                    </div>
                </div>
            </article>
        `;
    } catch (e) {
        app.innerHTML = `
            <div class="container" style="text-align: center; padding-top: 200px;">
                <h2>Article Not Found</h2>
                <p style="color: var(--text-secondary); margin: 16px 0 32px;">The article you're looking for doesn't exist or has been removed.</p>
                <a href="#/articles" class="btn btn-primary">Browse Articles</a>
            </div>
        `;
    }
}

// ============================================================
// PAGE: ABOUT
// ============================================================
function renderAbout(app) {
    app.innerHTML = `
        <section class="section" style="padding-top: calc(var(--nav-height) + 60px);">
            <div class="container">
                <div class="about-grid">
                    <div class="reveal">
                        <div class="about-image">👨‍💻</div>
                    </div>
                    <div class="reveal">
                        <span class="section-label">About Me</span>
                        <h2 class="section-title">John Doe</h2>
                        <div class="about-text">
                            <p>I'm a full-stack developer with 5+ years of experience building web applications that scale. I'm passionate about clean architecture, developer experience, and writing code that other humans can actually read.</p>
                            <p>When I'm not coding, I write technical articles to share what I've learned. I believe in open source, continuous learning, and the power of well-crafted software to solve real problems.</p>
                            <p><strong>For Interviewers:</strong> I've included my career timeline on the Portfolio page, and you can download my resume below. I'm always open to discussing system design, architecture trade-offs, and engineering culture.</p>
                        </div>
                        <div class="about-highlights">
                            <div class="highlight-card">
                                <div class="highlight-number">5+</div>
                                <div class="highlight-label">Years Experience</div>
                            </div>
                            <div class="highlight-card">
                                <div class="highlight-number">40+</div>
                                <div class="highlight-label">Projects</div>
                            </div>
                            <div class="highlight-card">
                                <div class="highlight-number">20+</div>
                                <div class="highlight-label">Articles</div>
                            </div>
                            <div class="highlight-card">
                                <div class="highlight-number">500+</div>
                                <div class="highlight-label">GitHub Stars</div>
                            </div>
                        </div>
                        <div style="margin-top: 32px; display: flex; gap: 12px; flex-wrap: wrap;">
                            <button class="btn btn-primary" onclick="showToast('Resume download started!', 'success')">📄 Download Resume (PDF)</button>
                            <a href="${APP.github}" target="_blank" class="btn btn-secondary">GitHub Profile</a>
                            <a href="${APP.linkedin}" target="_blank" class="btn btn-secondary">LinkedIn</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// ============================================================
// PAGE: CONTACT
// ============================================================
function renderContact(app) {
    app.innerHTML = `
        <section class="section" style="padding-top: calc(var(--nav-height) + 60px);">
            <div class="container">
                <div class="reveal">
                    <span class="section-label">Contact</span>
                    <h2 class="section-title">Get In Touch</h2>
                    <p class="section-subtitle">Have a project in mind, a question, or just want to say hello? I'd love to hear from you.</p>
                </div>
                <div class="contact-grid">
                    <div class="reveal">
                        <div class="contact-info-card">
                            <div class="contact-icon">📧</div>
                            <div>
                                <h4>Email</h4>
                                <p>${APP.email}</p>
                            </div>
                        </div>
                        <div class="contact-info-card">
                            <div class="contact-icon">📍</div>
                            <div>
                                <h4>Location</h4>
                                <p>San Francisco, CA (Remote-friendly)</p>
                            </div>
                        </div>
                        <div class="contact-info-card">
                            <div class="contact-icon">💼</div>
                            <div>
                                <h4>Availability</h4>
                                <p>Open to full-time roles & freelance projects</p>
                            </div>
                        </div>
                        <div class="contact-info-card">
                            <div class="contact-icon">⏱️</div>
                            <div>
                                <h4>Response Time</h4>
                                <p>Usually within 24 hours</p>
                            </div>
                        </div>
                    </div>
                    <form class="reveal" id="contactForm">
                        <div class="form-group">
                            <label class="form-label">Name *</label>
                            <input type="text" class="form-input" name="name" required placeholder="Your name">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email *</label>
                            <input type="email" class="form-input" name="email" required placeholder="your@email.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Subject</label>
                            <input type="text" class="form-input" name="subject" placeholder="What's this about?">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Message *</label>
                            <textarea class="form-textarea" name="message" required placeholder="Tell me about your project, question, or just say hi..."></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
                            Send Message →
                        </button>
                    </form>
                </div>
            </div>
        </section>
    `;

    document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        try {
            await api('/contact', { method: 'POST', body: JSON.stringify(data) });
            showToast('Message sent successfully!', 'success');
            e.target.reset();
        } catch (err) {
            showToast(err.message || 'Failed to send message', 'error');
        }
    });
}

// ============================================================
// PAGE: ADMIN LOGIN
// ============================================================
function renderLogin(app) {
    app.innerHTML = `
        <div class="login-card page-enter">
            <h2>🔐 Admin Login</h2>
            <p>Enter your credentials to manage articles.</p>
            <form id="loginForm">
                <div class="form-group">
                    <input type="text" class="form-input" name="username" required placeholder="Username">
                </div>
                <div class="form-group">
                    <input type="password" class="form-input" name="password" required placeholder="Password">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">Login</button>
            </form>
        </div>
    `;

    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const data = await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify(Object.fromEntries(formData))
            });
            state.token = data.token;
            localStorage.setItem('auth_token', data.token);
            showToast('Logged in successfully!', 'success');
            navigate('/admin');
        } catch (err) {
            showToast(err.message || 'Login failed', 'error');
        }
    });
}

// ============================================================
// PAGE: ADMIN DASHBOARD
// ============================================================
async function renderAdmin(app) {
    if (!state.token) { navigate('/admin/login'); return; }

    app.innerHTML = `
        <div class="admin-panel container page-enter">
            <div class="admin-header">
                <div>
                    <span class="section-label">Dashboard</span>
                    <h2 class="section-title">Manage Articles</h2>
                </div>
                <div style="display: flex; gap: 12px;">
                    <a href="#/admin/new" class="btn btn-primary btn-sm">+ New Article</a>
                    <button class="btn btn-secondary btn-sm" id="logoutBtn">Logout</button>
                </div>
            </div>
            <div id="adminTableContainer">
                <div class="loading-spinner"><div class="spinner"></div></div>
            </div>
        </div>
    `;

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        state.token = null;
        localStorage.removeItem('auth_token');
        showToast('Logged out', 'success');
        navigate('/');
    });

    try {
        // Admin sees all articles including drafts — using public endpoint filtered
        const data = await api('/articles?limit=100');
        // For admin view, we'd need an admin endpoint; for demo, show published
        const container = document.getElementById('adminTableContainer');
        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.articles.map(a => `
                        <tr>
                            <td><strong>${escapeHtml(a.title)}</strong></td>
                            <td><span class="status-badge ${a.published ? 'published' : 'draft'}">${a.published ? 'Published' : 'Draft'}</span></td>
                            <td>${a.views || 0}</td>
                            <td>${formatDate(a.updatedAt)}</td>
                            <td>
                                <a href="#/admin/edit/${a.id}" class="btn btn-sm btn-secondary">Edit</a>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (e) {
        document.getElementById('adminTableContainer').innerHTML = '<p style="color: var(--text-tertiary);">Failed to load articles.</p>';
    }
}

// ============================================================
// PAGE: ARTICLE EDITOR
// ============================================================
function renderArticleEditor(app, editId = null) {
    if (!state.token) { navigate('/admin/login'); return; }

    app.innerHTML = `
        <div class="admin-panel container page-enter">
            <div class="admin-header">
                <h2 class="section-title">${editId ? 'Edit Article' : 'New Article'}</h2>
                <a href="#/admin" class="btn btn-secondary btn-sm">← Back to Dashboard</a>
            </div>
            <form id="articleForm">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Title *</label>
                        <input type="text" class="form-input" name="title" id="editorTitle" required placeholder="Article title">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Slug *</label>
                        <input type="text" class="form-input" name="slug" id="editorSlug" required placeholder="url-friendly-slug">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Excerpt</label>
                    <input type="text" class="form-input" name="excerpt" id="editorExcerpt" placeholder="Brief summary (auto-generated if empty)">
                </div>
                <div class="form-group">
                    <label class="form-label">Tags (comma separated)</label>
                    <input type="text" class="form-input" name="tags" id="editorTags" placeholder="React, Node.js, Tutorial">
                </div>
                <div class="form-group">
                    <label class="form-label">Content (Markdown) *</label>
                    <div class="editor-container">
                        <div class="editor-toolbar">
                            <button type="button" onclick="insertMarkdown('**', '**')">Bold</button>
                            <button type="button" onclick="insertMarkdown('*', '*')">Italic</button>
                            <button type="button" onclick="insertMarkdown('## ', '')">H2</button>
                            <button type="button" onclick="insertMarkdown('### ', '')">H3</button>
                            <button type="button" onclick="insertMarkdown('\\n\`\`\`javascript\\n', '\\n\`\`\`\\n')">Code</button>
                            <button type="button" onclick="insertMarkdown('- ', '')">List</button>
                            <button type="button" onclick="insertMarkdown('> ', '')">Quote</button>
                            <button type="button" onclick="insertMarkdown('[', '](url)')">Link</button>
                        </div>
                        <textarea class="editor-textarea" name="content" id="editorContent" required placeholder="Write your article in Markdown..."></textarea>
                    </div>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button type="button" class="btn btn-secondary" onclick="saveArticle(false)">Save as Draft</button>
                    <button type="button" class="btn btn-primary" onclick="saveArticle(true)">Publish</button>
                </div>
            </form>
            <div style="margin-top: 40px;">
                <h3 style="margin-bottom: 16px;">Preview</h3>
                <div class="article-content" id="editorPreview" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 32px; min-height: 200px;">
                    <p style="color: var(--text-tertiary);">Start typing to see preview...</p>
                </div>
            </div>
        </div>
    `;

    // Auto-generate slug from title
    document.getElementById('editorTitle')?.addEventListener('input', (e) => {
        const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        document.getElementById('editorSlug').value = slug;
    });

    // Live preview
    document.getElementById('editorContent')?.addEventListener('input', (e) => {
        document.getElementById('editorPreview').innerHTML = marked.parse(e.target.value) || '<p style="color: var(--text-tertiary);">Start typing to see preview...</p>';
    });

    // Load existing article for editing
    if (editId) {
        loadArticleForEdit(editId);
    }
}

async function loadArticleForEdit(id) {
    try {
        // For simplicity, load all and find
        const data = await api('/articles?limit=100');
        const article = data.articles.find(a => a.id === id);
        if (article) {
            document.getElementById('editorTitle').value = article.title;
            document.getElementById('editorSlug').value = article.slug;
            document.getElementById('editorExcerpt').value = article.excerpt || '';
            document.getElementById('editorTags').value = article.tags?.join(', ') || '';
            document.getElementById('editorContent').value = article.content;
            document.getElementById('editorPreview').innerHTML = marked.parse(article.content);
        }
    } catch (e) {
        showToast('Failed to load article', 'error');
    }
}

// Make saveArticle global
window.saveArticle = async function(publish) {
    const title = document.getElementById('editorTitle').value;
    const slug = document.getElementById('editorSlug').value;
    const excerpt = document.getElementById('editorExcerpt').value;
    const content = document.getElementById('editorContent').value;
    const tagsStr = document.getElementById('editorTags').value;
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

    if (!title || !slug || !content) {
        showToast('Title, slug, and content are required', 'error');
        return;
    }

    try {
        await api('/articles', {
            method: 'POST',
            body: JSON.stringify({ title, slug, excerpt, content, tags, published: publish })
        });
        showToast(publish ? 'Article published!' : 'Draft saved!', 'success');
        navigate('/admin');
    } catch (e) {
        showToast(e.message || 'Failed to save', 'error');
    }
};

window.insertMarkdown = function(before, after) {
    const textarea = document.getElementById('editorContent');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    textarea.value = text.substring(0, start) + before + selected + after + text.substring(end);
    textarea.focus();
    textarea.selectionStart = start + before.length;
    textarea.selectionEnd = start + before.length + selected.length;
    textarea.dispatchEvent(new Event('input'));
};

// ============================================================
// HELPER / RENDER FUNCTIONS
// ============================================================
function renderSkillCard(icon, title, skills) {
    return `
        <div class="skill-category">
            <div class="skill-category-icon">${icon}</div>
            <h3>${title}</h3>
            <div class="skill-tags">
                ${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
        </div>
    `;
}

function renderProjectCard(icon, title, type, desc, tech, link, category = '') {
    return `
        <div class="project-card" data-category="${category}">
            <div class="project-image">${icon}</div>
            <div class="project-body">
                <div class="project-type">${type}</div>
                <h3 class="project-title">${title}</h3>
                <p class="project-desc">${desc}</p>
                <div class="project-tech">
                    ${tech.map(t => `<span>${t}</span>`).join('')}
                </div>
                <div class="project-links">
                    <a href="${link}" class="project-link">🔗 Live Demo</a>
                    <a href="#" class="project-link">📂 Source Code</a>
                    <a href="#" class="project-link">📖 Case Study</a>
                </div>
            </div>
        </div>
    `;
}

function renderTimelineItem(date, role, company, points) {
    return `
        <div class="timeline-item">
            <div class="timeline-date">${date}</div>
            <div class="timeline-card">
                <div class="timeline-role">${role}</div>
                <div class="timeline-company">${company}</div>
                <div class="timeline-desc">
                    <ul>${points.map(p => `<li>${p}</li>`).join('')}</ul>
                </div>
            </div>
        </div>
    `;
}

function renderArticleCardHTML(article) {
    const emojis = ['📝', '🚀', '💡', '⚡', '🔧', '🎯', '🧠', '🌐'];
    const emoji = emojis[Math.abs(hashCode(article.slug)) % emojis.length];
    return `
        <a href="#/article/${article.slug}" class="article-card" style="text-decoration: none; color: inherit;">
            <div class="article-cover">${emoji}</div>
            <div class="article-body">
                <div class="article-meta">
                    <span>📅 ${formatDate(article.createdAt)}</span>
                    <span>⏱️ ${estimateReadTime(article.content)} min</span>
                    <span>👁️ ${article.views || 0}</span>
                </div>
                <h3 class="article-title">${escapeHtml(article.title)}</h3>
                <p class="article-excerpt">${escapeHtml(article.excerpt)}</p>
                <div class="article-tags">
                    ${article.tags.map(t => `<span class="article-tag">${escapeHtml(t)}</span>`).join('')}
                </div>
            </div>
        </a>
    `;
}

// ===================== UTILITIES =====================
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function estimateReadTime(text) {
    if (!text) return 1;
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash;
}

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
