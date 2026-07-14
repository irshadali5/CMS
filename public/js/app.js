// ============================================================
// app.js — SPA Router, Pages, API Client, Theme, Animations
// ============================================================

// ===================== CONFIG =====================
// ============= TOP OF app.js =============
const API_BASE = '/api';
const APP = {
    name: 'Irshad Ali',
    title: 'Systems Developer & AI Prompt Engineer',
    tagline: 'I write C++ for speed, Rust for safety, SQL for data, and prompts for intelligence. Welcome to my corner of the internet.',
    email: 'irshadali5@proton.me',
    github: 'https://github.com/irshadali5',
    linkedin: 'https://linkedin.com/in/irshadali',
    twitter: 'https://twitter.com/irshadali',
};

// Configure marked with highlight.js
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true,
});

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
            (r === 'books' && route.startsWith('/book')) ||
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
    else if (route === '/books') renderBooks(app);
    else if (route.match(/^\/book\/[^\/]+$/)) renderBookTOC(app, route.split('/book/')[1]);
    else if (route.match(/^\/book\/[^\/]+\/[^\/]+$/)) {
    const parts = route.replace('/book/', '').split('/');
    renderBookChapter(app, parts[0], parts[1]);
    }
    else if (route === '/about') renderAbout(app);
    else if (route === '/contact') renderContact(app);
        // ... existing routes ...
    else if (route === '/admin') renderAdmin(app);
    else if (route === '/admin/login') renderLogin(app);
    else if (route === '/admin/article/new') renderArticleEditor(app);
    else if (route.startsWith('/admin/article/edit/')) renderArticleEditor(app, route.split('/admin/article/edit/')[1]);
    else if (route === '/admin/book/new') renderBookEditor(app);
    else if (route.match(/^\/admin\/book\/[^\/]+$/)) renderBookManager(app, route.split('/admin/book/')[1]);
    else if (route.match(/^\/admin\/book\/([^\/]+)\/chapter\/([^\/]+)/)) {
        const match = route.match(/^\/admin\/book\/([^\/]+)\/chapter\/([^\/]+)/);
        renderChapterEditor(app, match[1], match[2]);
    }
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
                        I build systems<br>that <span class="gradient-text">perform</span>.
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
                            <span class="hero-stat-label">Years in Systems</span>
                        </div>
                        <div>
                            <span class="hero-stat-number">30+</span>
                            <span class="hero-stat-label">Projects Shipped</span>
                        </div>
                        <div>
                            <span class="hero-stat-number">15+</span>
                            <span class="hero-stat-label">Articles Published</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- SKILLS -->
        <section class="section" style="background: var(--bg-secondary);">
            <div class="container">
                <div class="reveal">
                    <span class="section-label">Expertise</span>
                    <h2 class="section-title">Skills & Technologies</h2>
                    <p class="section-subtitle">A specialist's toolkit — built around performance, safety, and reliability.</p>
                </div>
                <div class="skills-grid reveal">
                    ${renderSkillCard('⚡', 'Systems Programming', ['C++', 'C++20', 'Rust', 'Memory Management', 'Concurrency', 'Lock-Free DS'])}
                    ${renderSkillCard('🐧', 'GNU/Linux & DevOps', ['Bash', 'Systemd', 'Docker', 'Linux Kernel', 'GCC/Clang', 'Make/CMake'])}
                    ${renderSkillCard('🗄️', 'Data & SQL', ['PostgreSQL', 'MySQL', 'SQLite', 'Query Optimization', 'Schema Design', 'Redis'])}
                    ${renderSkillCard('🧠', 'AI & Prompt Engineering', ['LLMs', 'Chain-of-Thought', 'Structured Output', 'RAG', 'OpenAI API', 'LangChain'])}
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
                    ${renderProjectCard('🦀', 'Lock-Free Queue (Rust)', 'Systems', 'A Michael-Scott lock-free queue implementation with 28M ops/sec throughput, zero unsafe blocks in the public API.', ['Rust', 'Atomics', 'Concurrency'], '#')}
                    ${renderProjectCard('⚙️', 'C++ Memory Allocator', 'Systems', 'Custom slab allocator 4x faster than glibc malloc for specific workloads, used in a high-frequency trading system.', ['C++', 'Templates', 'Benchmarking'], '#')}
                    ${renderProjectCard('🤖', 'AI Content Extractor', 'AI/Prompt', 'Production LLM pipeline extracting structured data from 10K+ documents daily with 94% accuracy via schema-first prompting.', ['Python', 'OpenAI', 'PostgreSQL'], '#')}
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
                    <p class="section-subtitle">Deep dives into systems programming, database optimization, and AI prompt engineering.</p>
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
                    <h2 class="section-title" style="max-width: 700px; margin: 0 auto 16px;">Let's Build Something <span style="color: var(--accent);">Fast, Safe & Smart</span></h2>
                    <p class="section-subtitle" style="margin: 0 auto 32px; text-align: center;">Whether you need a systems engineer, a SQL optimizer, or an AI prompt architect — let's talk.</p>
                    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                        <a href="#/contact" class="btn btn-primary">Start a Conversation</a>
                        <a href="#/about" class="btn btn-secondary">Download Resume</a>
                    </div>
                </div>
            </div>
        </section>
    `;
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
                    <p class="section-subtitle">Projects demonstrating systems programming, database optimization, and AI engineering.</p>
                </div>

                <div class="filter-tabs reveal">
                    <button class="filter-tab active" data-filter="all">All</button>
                    <button class="filter-tab" data-filter="systems">Systems</button>
                    <button class="filter-tab" data-filter="data">Data & SQL</button>
                    <button class="filter-tab" data-filter="ai">AI/Prompt</button>
                    <button class="filter-tab" data-filter="linux">Linux/DevOps</button>
                </div>

                <div class="projects-grid reveal" id="portfolioGrid">
                    ${renderProjectCard('🦀', 'Lock-Free Queue (Rust)', 'Systems', 'Michael-Scott queue achieving 28M ops/sec on 16 threads. No unsafe blocks in public API. Full benchmarks included.', ['Rust', 'Atomics', 'Arc'], '#', 'systems')}
                    ${renderProjectCard('⚙️', 'Custom Slab Allocator', 'Systems', 'C++ memory allocator 4x faster than glibc for HFT workloads. Template-based, zero-overhead.', ['C++20', 'Templates', 'SIMD'], '#', 'systems')}
                    ${renderProjectCard('🤖', 'AI Document Extractor', 'AI/Prompt', 'Production pipeline processing 10K+ docs/day with 94% accuracy using schema-first prompting.', ['Python', 'OpenAI', 'PostgreSQL'], '#', 'ai')}
                    ${renderProjectCard('🗄️', 'Query Optimizer Engine', 'Data & SQL', 'Tool that analyzes PostgreSQL EXPLAIN output and suggests indexes. Reduced a 30s query to 3ms.', ['SQL', 'PostgreSQL', 'Python'], '#', 'data')}
                    ${renderProjectCard('🐧', 'Systemd Service Manager', 'Linux/DevOps', 'CLI tool for generating, validating, and deploying systemd unit files across clusters.', ['Go', 'Systemd', 'Linux'], '#', 'linux')}
                    ${renderProjectCard('📊', 'RAG Pipeline for Docs', 'AI/Prompt', 'Retrieval-Augmented Generation system for internal docs. 85% answer accuracy with citation tracking.', ['LangChain', 'OpenAI', 'Pinecone'], '#', 'ai')}
                </div>

                <div style="margin-top: 100px;">
                    <div class="reveal">
                        <span class="section-label">Experience</span>
                        <h2 class="section-title">Career Journey</h2>
                    </div>
                    <div class="timeline reveal">
                        ${renderTimelineItem('2024 — Present', 'Senior Systems Developer', 'TechCorp', [
                            'Led migration of C++ monolith to modular Rust services, reducing memory usage by 62%',
                            'Built custom allocator saving $40K/year in cloud compute costs',
                            'Designed AI-powered log analysis pipeline processing 2TB/day'
                        ])}
                        ${renderTimelineItem('2022 — 2024', 'AI & Data Engineer', 'DataScale Inc.', [
                            'Built LLM prompt engineering framework used across 12 production services',
                            'Optimized PostgreSQL queries achieving 10,000x performance improvement on critical reports',
                            'Mentored team on structured output prompting, reducing hallucinations by 73%'
                        ])}
                        ${renderTimelineItem('2021 — 2022', 'Linux Systems Engineer', 'Infrastructure Co.', [
                            'Maintained 500+ GNU/Linux servers with 99.99% uptime',
                            'Automated deployments using systemd, Ansible, and custom tooling',
                            'Wrote internal bash/Python utilities saving team 20 hours/week'
                        ])}
                    </div>
                </div>
            </div>
        </section>
    `;

    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const filter = tab.dataset.filter;
            document.querySelectorAll('.project-card').forEach(card => {
                card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
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
        const rendered = marked.parse(article.content);

        app.innerHTML = `
            <article class="article-detail container page-enter">
                <div class="article-detail-header">
                    <a href="#/" class="nav-link active" data-route="home">Home</a>
                    <a href="#/articles" class="nav-link" data-route="articles">Articles</a>
                    <h1 class="article-detail-title">${escapeHtml(article.title)}</h1>
                    <div class="article-detail-meta">
                        <span>📅 ${formatDate(article.createdAt)}</span>
                        <span>👁️ ${article.views || 0} views</span>
                        <span>⏱️ ${estimateReadTime(article.content)} min read</span>
                        <span>✍️ ${APP.name}</span>
                    </div>
                    <div class="article-tags" style="margin-top: 16px;">
                        ${article.tags.map(t => `<span class="article-tag">${escapeHtml(t)}</span>`).join('')}
                    </div>
                </div>
                <div class="article-content">${rendered}</div>
                <div style="margin-top: 60px; padding-top: 40px; border-top: 1px solid var(--border); text-align: center;">
                    <h3 style="margin-bottom: 8px;">Enjoyed this article?</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 24px;">Share it or explore more content.</p>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <a href="#/articles" class="btn btn-secondary">More Articles</a>
                        <a href="#/contact" class="btn btn-primary">Get in Touch</a>
                        <button class="btn btn-ghost" onclick="shareArticle('${escapeHtml(article.title)}', window.location.href)">Share</button>
                    </div>
                </div>
            </article>
        `;

        // Re-highlight any code blocks that marked didn't catch
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    } catch (e) {
        app.innerHTML = `
            <div class="container" style="text-align: center; padding-top: 200px;">
                <h2>Article Not Found</h2>
                <p style="color: var(--text-secondary); margin: 16px 0 32px;">The article doesn't exist or has been removed.</p>
                <a href="#/articles" class="btn btn-primary">Browse Articles</a>
            </div>
        `;
    }
}

// Add share helper
window.shareArticle = async (title, url) => {
    if (navigator.share) {
        await navigator.share({ title, url });
    } else {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard!', 'success');
    }
};

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
                        <h2 class="section-title">Irshad Ali</h2>
                        <div class="about-text">
                            <p>I'm a systems developer with a passion for writing software that's fast, safe, and elegant. I specialize in <strong>C++</strong> for performance-critical code, <strong>Rust</strong> for memory-safe systems, and <strong>SQL</strong> for data-intensive applications.</p>
                            <p>On the AI side, I'm a <strong>prompt engineer</strong> who treats LLM prompting like compiler design — deterministic, schema-driven, and tested. I've shipped production AI pipelines that reliably extract structured data from unstructured sources.</p>
                            <p>I live in <strong>GNU/Linux</strong> — not because it's trendy, but because it's the right tool. From kernel tuning to systemd services, I've spent years mastering the Unix philosophy of small tools composed together.</p>
                            <p><strong>For Recruiters:</strong> My career timeline is on the Portfolio page. I'm open to roles in systems programming, database engineering, or AI infrastructure. Let's talk about trade-offs, not buzzwords.</p>
                        </div>
                        <div class="about-highlights">
                            <div class="highlight-card"><div class="highlight-number">5+</div><div class="highlight-label">Years Systems</div></div>
                            <div class="highlight-card"><div class="highlight-number">30+</div><div class="highlight-label">Projects</div></div>
                            <div class="highlight-card"><div class="highlight-number">15+</div><div class="highlight-label">Articles</div></div>
                            <div class="highlight-card"><div class="highlight-number">1M+</div><div class="highlight-label">Lines of C++/Rust</div></div>
                        </div>
                        <div style="margin-top: 32px; display: flex; gap: 12px; flex-wrap: wrap;">
                            <button class="btn btn-primary" onclick="showToast('Resume download started!', 'success')">📄 Download Resume</button>
                            <a href="${APP.github}" target="_blank" class="btn btn-secondary">GitHub</a>
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

// ============================================
// TERMINAL UPTIME COUNTER
// ============================================
function initTerminalUptime() {
    const uptimeEl = document.getElementById('uptime-counter');
    if (!uptimeEl) return;

    // Base uptime: 5 years, 14 days, 8 hours, 32 minutes (in minutes)
    let baseMinutes = (5 * 365 * 24 * 60) + (14 * 24 * 60) + (8 * 60) + 32;
    const startTime = Date.now();
    
    setInterval(() => {
        const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);
        const totalMinutes = baseMinutes + elapsedMinutes;
        
        const years = Math.floor(totalMinutes / (365 * 24 * 60));
        const days = Math.floor((totalMinutes % (365 * 24 * 60)) / (24 * 60));
        const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
        const mins = totalMinutes % 60;
        
        uptimeEl.textContent = `${years}y ${days}d ${hours}h ${mins}m`;
    }, 60000); // Update every minute
}

// ============================================================
// PAGE: BOOKS LIBRARY
// ============================================================
async function renderBooks(app) {
    app.innerHTML = `
        <section class="section" style="padding-top: calc(var(--nav-height) + 60px);">
            <div class="container">
                <div class="reveal">
                    <span class="section-label">Library</span>
                    <h2 class="section-title">Books & Deep Dives</h2>
                    <p class="section-subtitle">Comprehensive, multi-chapter guides on systems programming and AI.</p>
                </div>
                <div class="books-grid reveal" id="booksGrid">
                    <div class="loading-spinner"><div class="spinner"></div></div>
                </div>
            </div>
        </section>
    `;

    try {
        const { books } = await api('/books');
        const grid = document.getElementById('booksGrid');
        if (!books.length) {
            grid.innerHTML = '<p style="color: var(--text-tertiary); text-align: center;">No books published yet. Check back soon!</p>';
            return;
        }
        
       // Inside renderBooks(), replace the grid.innerHTML assignment with this:
    grid.innerHTML = books.map(book => {
        const isHtml = book.type === 'html';
        const readAction = isHtml 
            ? `onclick="openHtmlBook('${book.file_path}', '${escapeHtml(book.title)}'); return false;"` 
            : `href="#/book/${book.slug}"`;
    
        return `
            <a ${readAction} class="book-card" style="cursor: pointer;">
                <div class="book-cover">${book.cover_emoji}</div>
                <div class="book-info">
                    <h3>${escapeHtml(book.title)}</h3>
                    <p>${escapeHtml(book.description)}</p>
                    <span class="btn btn-sm btn-primary" style="margin-top: 16px;">
                        ${isHtml ? 'Open HTML Book →' : 'Read Book →'}
                    </span>
                </div>
            </a>
        `;
        }).join('');
    } catch (e) {
        console.error(e);
    }
}

// ============================================================
// PAGE: BOOK TABLE OF CONTENTS
// ============================================================
async function renderBookTOC(app, bookSlug) {
    app.innerHTML = `<div class="loading-spinner" style="min-height: 60vh;"><div class="spinner"></div></div>`;
    
    try {
        const { book, chapters } = await api(`/books/${bookSlug}`);
        app.innerHTML = `
            <section class="section" style="padding-top: calc(var(--nav-height) + 60px);">
                <div class="container book-toc-container">
                    <a href="#/books" class="article-back">← Back to Library</a>
                    <div class="book-header-hero reveal">
                        <span class="book-emoji-large">${book.cover_emoji}</span>
                        <h1 class="section-title">${escapeHtml(book.title)}</h1>
                        <p class="section-subtitle" style="margin-bottom: 32px;">${escapeHtml(book.description)}</p>
                        ${chapters.length > 0 ? `<a href="#/book/${bookSlug}/${chapters[0].slug}" class="btn btn-primary">Start Reading (Chapter 1) →</a>` : ''}
                    </div>
                    
                    <div class="toc-wrapper reveal">
                        <h3>Table of Contents</h3>
                        <ol class="toc-list">
                            ${chapters.map(ch => `
                                <li>
                                    <a href="#/book/${bookSlug}/${ch.slug}">
                                        <span class="toc-index">${String(ch.chapter_index).padStart(2, '0')}.</span>
                                        ${escapeHtml(ch.title)}
                                    </a>
                                </li>
                            `).join('')}
                        </ol>
                    </div>
                </div>
            </section>
        `;
    } catch(e) {
        app.innerHTML = `<div class="container" style="padding-top: 150px; text-align: center;"><h2>Book not found</h2><a href="#/books" class="btn btn-primary">Back to Library</a></div>`;
    }
}

// ============================================================
// PAGE: BOOK CHAPTER READER
// ============================================================
async function renderBookChapter(app, bookSlug, chapterSlug) {
    app.innerHTML = `<div class="loading-spinner" style="min-height: 80vh;"><div class="spinner"></div></div>`;
    
    try {
        const { book, chapter, prev, next } = await api(`/books/${bookSlug}/${chapterSlug}`);
        
        app.innerHTML = `
            <div class="book-reader">
                <div class="reader-top-bar">
                    <div class="container reader-top-inner">
                        <a href="#/book/${bookSlug}" class="reader-book-title">${book.cover_emoji} ${escapeHtml(book.title)}</a>
                        <a href="#/book/${bookSlug}" class="reader-toc-link">Table of Contents</a>
                    </div>
                </div>
                
                <article class="article-detail container page-enter" style="padding-top: 40px;">
                    <div class="article-detail-header">
                        <div class="chapter-meta">Chapter ${chapter.chapter_index}</div>
                        <h1 class="article-detail-title">${escapeHtml(chapter.title)}</h1>
                    </div>
                    <div class="article-content">
                        ${marked.parse(chapter.content)}
                    </div>
                </article>
                
                <div class="chapter-nav container">
                    <div class="nav-btn-wrapper left">
                        ${prev ? `
                            <a href="#/book/${bookSlug}/${prev.slug}" class="chapter-nav-btn">
                                <span class="nav-dir">← Previous</span>
                                <span class="nav-title">${escapeHtml(prev.title)}</span>
                            </a>
                        ` : '<div></div>'}
                    </div>
                    <div class="nav-btn-wrapper right">
                        ${next ? `
                            <a href="#/book/${bookSlug}/${next.slug}" class="chapter-nav-btn">
                                <span class="nav-dir">Next →</span>
                                <span class="nav-title">${escapeHtml(next.title)}</span>
                            </a>
                        ` : '<div></div>'}
                    </div>
                </div>
            </div>
        `;
        
        document.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
    } catch (e) {
        app.innerHTML = `<div class="container" style="padding-top: 150px; text-align: center;"><h2>Chapter not found</h2><a href="#/book/${bookSlug}" class="btn btn-primary">Back to TOC</a></div>`;
    }
}
// ============================================================
// ADMIN CMS SYSTEM
// ============================================================

async function renderAdmin(app) {
    if (!state.token) { navigate('/admin/login'); return; }

    app.innerHTML = `
        <div class="admin-panel container page-enter">
            <div class="admin-header">
                <div>
                    <span class="section-label">CMS Dashboard</span>
                    <h2 class="section-title">Content Manager</h2>
                </div>
                <button class="btn btn-secondary btn-sm" id="logoutBtn">Logout</button>
            </div>
            
            <div class="admin-tabs">
                <button class="admin-tab active" data-tab="articles">Articles</button>
                <button class="admin-tab" data-tab="books">Books</button>
            </div>

            <div id="admin-content-area">
                <div class="loading-spinner"><div class="spinner"></div></div>
            </div>
        </div>
    `;

    document.getElementById('logoutBtn').onclick = () => {
        state.token = null;
        localStorage.removeItem('auth_token');
        showToast('Logged out', 'success');
        navigate('/');
    };

    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (tab.dataset.tab === 'articles') loadAdminArticles();
            if (tab.dataset.tab === 'books') loadAdminBooks();
        };
    });

    loadAdminArticles();
}

async function loadAdminArticles() {
    const area = document.getElementById('admin-content-area');
    try {
        const data = await api('/articles/admin/all'); 
        area.innerHTML = `
            <div class="admin-actions">
                <a href="#/admin/article/new" class="btn btn-primary btn-sm">+ New Article</a>
            </div>
            <table class="admin-table">
                <thead><tr><th>Title</th><th>Status</th><th>Views</th><th>Actions</th></tr></thead>
                <tbody>
                    ${data.articles.map(a => `
                        <tr>
                            <td><strong>${escapeHtml(a.title)}</strong></td>
                            <td><span class="status-badge ${a.published ? 'published' : 'draft'}">${a.published ? 'Published' : 'Draft'}</span></td>
                            <td>${a.views || 0}</td>
                            <td>
                                <a href="#/admin/article/edit/${a.id}" class="btn btn-sm btn-secondary">Edit</a>
                                <button class="btn btn-sm btn-danger" onclick="deleteArticle('${a.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch(e) { area.innerHTML = '<p>Failed to load articles.</p>'; }
}

window.deleteArticle = async (id) => {
    if(!confirm('Delete this article?')) return;
    await api(`/articles/${id}`, { method: 'DELETE' });
    showToast('Deleted', 'success');
    loadAdminArticles();
}

async function loadAdminBooks() {
    const area = document.getElementById('admin-content-area');
    try {
        // Fetch all books (we'll use the public endpoint, but let's fetch admin details if we need drafts. 
        // For simplicity, let's just fetch public books + a trick to get drafts if needed, or just use public for now)
        const { books } = await api('/books'); 
        area.innerHTML = `
            <div class="admin-actions">
                <a href="#/admin/book/new" class="btn btn-primary btn-sm">+ New Book</a>
            </div>
            <table class="admin-table">
                <thead><tr><th>Title</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                    ${books.map(b => `
                        <tr>
                            <td>${b.cover_emoji} <strong>${escapeHtml(b.title)}</strong></td>
                            <td><span class="status-badge ${b.published ? 'published' : 'draft'}">${b.published ? 'Published' : 'Draft'}</span></td>
                            <td>
                                <a href="#/admin/book/${b.id}" class="btn btn-sm btn-secondary">Manage Chapters</a>
                                <button class="btn btn-sm btn-danger" onclick="deleteBook('${b.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('') || '<tr><td colspan="3" style="text-align:center; padding:20px;">No books yet.</td></tr>'}
                </tbody>
            </table>
        `;
    } catch(e) { area.innerHTML = '<p>Failed to load books.</p>'; }
}

window.saveBook = async function(publish) {
    const title = document.getElementById('bookTitle').value;
    const slug = document.getElementById('bookSlug').value;
    const description = document.getElementById('bookDescription').value;
    const cover_emoji = document.getElementById('bookEmoji').value;
    const type = document.getElementById('bookType').value;
    const file_path = document.getElementById('bookFilePath').value;

    if (!title || !slug) {
        showToast('Title and slug are required', 'error');
        return;
    }

    try {
        await api('/books', {
            method: 'POST',
            body: JSON.stringify({
                title, slug, description, cover_emoji,
                type, file_path, published: publish
            })
        });
        showToast('Book created!', 'success');
        navigate('/admin');
    } catch(e) {
        showToast('Failed to save book', 'error');
    }
};

function renderBookEditor(app) {
    if (!state.token) { navigate('/admin/login'); return; }

    app.innerHTML = `
        <div class="admin-panel container page-enter">
            <div class="admin-header">
                <h2 class="section-title">New Book</h2>
                <a href="#/admin" class="btn btn-secondary btn-sm">← Back to Dashboard</a>
            </div>
            <form id="bookForm">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Title *</label>
                        <input type="text" class="form-input" id="bookTitle" required placeholder="Book title">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Slug *</label>
                        <input type="text" class="form-input" id="bookSlug" required placeholder="url-friendly-slug">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <input type="text" class="form-input" id="bookDescription" placeholder="Brief summary">
                </div>
                <div style="display: grid; grid-template-columns: 100px 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Emoji</label>
                        <input type="text" class="form-input" id="bookEmoji" value="📚">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <select class="form-input" id="bookType">
                            <option value="html">HTML (Custom File)</option>
                            <option value="markdown">Markdown (MDX)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">File Path (if HTML/MDX)</label>
                        <input type="text" class="form-input" id="bookFilePath" placeholder="/books/my-book.html">
                    </div>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button type="button" class="btn btn-secondary" onclick="saveBook(false)">Save as Draft</button>
                    <button type="button" class="btn btn-primary" onclick="saveBook(true)">Publish</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('bookTitle')?.addEventListener('input', (e) => {
        const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        document.getElementById('bookSlug').value = slug;
    });
}

window.deleteBook = async (id) => {
    if(!confirm('Delete this book and ALL its chapters?')) return;
    await api(`/books/${id}`, { method: 'DELETE' });
    showToast('Deleted', 'success');
    loadAdminBooks();
}

// BOOK MANAGER (Chapters List)
async function renderBookManager(app, bookId) {
    if (!state.token) { navigate('/admin/login'); return; }
    app.innerHTML = `<div class="loading-spinner" style="min-height: 60vh;"><div class="spinner"></div></div>`;
    
    try {
        const { book, chapters } = await api(`/books/admin/${bookId}`);
        app.innerHTML = `
            <div class="admin-panel container page-enter">
                <div class="admin-header">
                    <div>
                        <a href="#/admin" class="article-back">← Back to Dashboard</a>
                        <h2 class="section-title">${book.cover_emoji} ${escapeHtml(book.title)}</h2>
                        <p style="color: var(--text-secondary);">Manage chapters for this book.</p>
                    </div>
                    <div style="display:flex; gap:12px;">
                         <button class="btn btn-secondary btn-sm" onclick="toggleBookPublish('${book.id}', ${!book.published})">${book.published ? 'Unpublish' : 'Publish Book'}</button>
                         <button class="btn btn-primary btn-sm" onclick="addChapter('${book.id}', ${chapters.length + 1})">+ Add Chapter</button>
                    </div>
                </div>
                
                <table class="admin-table">
                    <thead><tr><th>#</th><th>Chapter Title</th><th>Slug</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${chapters.map(ch => `
                            <tr>
                                <td>${ch.chapter_index}</td>
                                <td><strong>${escapeHtml(ch.title)}</strong></td>
                                <td style="font-family: monospace; color: var(--text-tertiary);">${ch.slug}</td>
                                <td>
                                    <a href="#/admin/book/${bookId}/chapter/${ch.id}" class="btn btn-sm btn-secondary">Edit</a>
                                    <button class="btn btn-sm btn-danger" onclick="deleteChapter('${bookId}', '${ch.id}')">Delete</button>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="4" style="text-align:center; padding: 40px;">No chapters yet. Add your first chapter!</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    } catch (e) {
        app.innerHTML = `<div class="container" style="padding-top: 150px; text-align: center;"><h2>Error loading book</h2><a href="#/admin" class="btn btn-primary">Back</a></div>`;
    }
}

window.toggleBookPublish = async (id, publish) => {
    const { book } = await api(`/books/admin/${id}`);
    await api(`/books/${id}`, { method: 'PUT', body: JSON.stringify({ ...book, published: publish }) });
    showToast(publish ? 'Book Published!' : 'Book Unpublished', 'success');
    renderBookManager(document.getElementById('app'), id);
}

window.addChapter = (bookId, index) => navigate(`/admin/book/${bookId}/chapter/new?index=${index}`);

window.deleteChapter = async (bookId, chapterId) => {
    if(!confirm('Delete this chapter?')) return;
    await api(`/books/${bookId}/chapters/${chapterId}`, { method: 'DELETE' });
    showToast('Chapter deleted', 'success');
    renderBookManager(document.getElementById('app'), bookId);
}

// CHAPTER EDITOR
async function renderChapterEditor(app, bookId, chapterId = null) {
    if (!state.token) { navigate('/admin/login'); return; }
    
    const isNew = chapterId === 'new';
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const defaultIndex = urlParams.get('index') || 1;

    let chapter = { title: '', slug: '', content: '', chapter_index: defaultIndex };
    
    if (!isNew) {
        const { chapters } = await api(`/books/admin/${bookId}`);
        chapter = chapters.find(c => c.id === chapterId);
        if (!chapter) { navigate(`/admin/book/${bookId}`); return; }
    }

    app.innerHTML = `
        <div class="admin-panel container page-enter">
            <div class="admin-header">
                <h2 class="section-title">${isNew ? 'New Chapter' : 'Edit Chapter'}</h2>
                <a href="#/admin/book/${bookId}" class="btn btn-secondary btn-sm">← Back to Book</a>
            </div>
            <form id="chapterForm">
                <div style="display: grid; grid-template-columns: 1fr 1fr 100px; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Title *</label>
                        <input type="text" class="form-input" id="chTitle" value="${escapeHtml(chapter.title)}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Slug *</label>
                        <input type="text" class="form-input" id="chSlug" value="${escapeHtml(chapter.slug)}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Order #</label>
                        <input type="number" class="form-input" id="chIndex" value="${chapter.chapter_index}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Content (Markdown) *</label>
                    <div class="editor-toolbar">
                        <button type="button" onclick="insertMarkdown('**', '**')">Bold</button>
                        <button type="button" onclick="insertMarkdown('## ', '')">H2</button>
                        <button type="button" onclick="insertMarkdown('### ', '')">H3</button>
                        <button type="button" onclick="insertMarkdown('\\n\`\`\`rust\\n', '\\n\`\`\`\\n')">Rust</button>
                        <button type="button" onclick="insertMarkdown('\\n\`\`\`cpp\\n', '\\n\`\`\`\\n')">C++</button>
                    </div>
                    <textarea class="editor-textarea" id="chContent" required>${escapeHtml(chapter.content)}</textarea>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button type="button" class="btn btn-primary" onclick="saveChapter('${bookId}', '${chapterId}')">Save Chapter</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('chTitle').oninput = (e) => {
        if(isNew) document.getElementById('chSlug').value = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    };
}

window.saveChapter = async (bookId, chapterId) => {
    const title = document.getElementById('chTitle').value;
    const slug = document.getElementById('chSlug').value;
    const content = document.getElementById('chContent').value;
    const chapter_index = parseInt(document.getElementById('chIndex').value);

    if(!title || !slug || !content) return showToast('All fields required', 'error');

    try {
        if (chapterId === 'new') {
            await api(`/books/${bookId}/chapters`, { method: 'POST', body: JSON.stringify({ title, slug, content, chapter_index }) });
        } else {
            await api(`/books/${bookId}/chapters/${chapterId}`, { method: 'PUT', body: JSON.stringify({ title, content, chapter_index }) });
        }
        showToast('Chapter saved!', 'success');
        navigate(`/admin/book/${bookId}`);
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// ============================================================
// HTML BOOK MODAL CONTROLS
// ============================================================
window.openHtmlBook = (url, title) => {
    const modal = document.getElementById('book-iframe-modal');
    const iframe = document.getElementById('book-iframe');
    const titleEl = document.getElementById('book-modal-title');
    
    titleEl.textContent = title;
    iframe.src = url;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
};

window.closeHtmlBook = () => {
    const modal = document.getElementById('book-iframe-modal');
    const iframe = document.getElementById('book-iframe');
    
    modal.classList.remove('active');
    iframe.src = ''; // Stop loading/playing media
    document.body.style.overflow = '';
};

document.addEventListener('DOMContentLoaded', initTerminalUptime);


