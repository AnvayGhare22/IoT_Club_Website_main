// ============================================================
//  IoT Club – Blogs Page Logic
//  Admin key is checked client-side for simplicity on a
//  static site. Change IOT_ADMIN_KEY if you want a new key.
// ============================================================

const IOT_ADMIN_KEY = 'IOT_ADMIN_2026';
const CUSTOM_BLOGS_KEY = 'iot_club_custom_blogs';

// ── Default (hard-coded) blogs ─────────────────────────────
const DEFAULT_BLOGS = [
    {
        id: 'resume-building-2025',
        title: 'Resume Building Session',
        description: 'Industry-ready resumes for internships and placements with Mr. Dheeraj Rathod.',
        date: '21/09/2025',
        badge: 'Career',
        image: 'images/blogs/resume.jpeg',
        icon: 'fa-file-alt'
    },
    {
        id: 'fy-orientation-2025',
        title: 'FY Orientation 2025',
        description: 'Introducing technical domains to spark innovation in the new batch.',
        date: '3 Months Ago',
        badge: 'Orientation',
        image: 'images/blogs/orientation.jpeg',
        icon: 'fa-users'
    },
    {
        id: 'xen-4-2025',
        title: 'XEN 4.0 National Event',
        description: 'Flagship event featuring Shark Tank IoT and workshops.',
        date: 'Oct 2025',
        badge: 'Technical',
        image: 'images/blogs/xen.jpeg',
        icon: 'fa-trophy'
    }
];

// IDs of default blogs — cannot be deleted
const DEFAULT_BLOG_IDS = new Set(DEFAULT_BLOGS.map((b) => b.id));

// ── Helpers ────────────────────────────────────────────────
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCustomBlogs() {
    try {
        const stored = localStorage.getItem(CUSTOM_BLOGS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveCustomBlogs(blogs) {
    try {
        localStorage.setItem(CUSTOM_BLOGS_KEY, JSON.stringify(blogs));
    } catch { /* silently ignore */ }
}

// ── Blog fetching ──────────────────────────────────────────
async function fetchPublishedBlogs() {
    if (window.location.protocol === 'file:') {
        return DEFAULT_BLOGS;
    }
    try {
        const response = await fetch('data/blogs.json', {
            cache: 'no-store',
            headers: { Accept: 'application/json' }
        });
        if (!response.ok) return DEFAULT_BLOGS;
        const blogs = await response.json();
        return Array.isArray(blogs) && blogs.length ? blogs : DEFAULT_BLOGS;
    } catch {
        return DEFAULT_BLOGS;
    }
}

async function loadAllBlogs() {
    const [published, custom] = await Promise.all([
        fetchPublishedBlogs(),
        Promise.resolve(getCustomBlogs())
    ]);
    const seen = new Set();
    return [...custom, ...published].filter((blog) => {
        const key = blog.id || blog.title;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// ── Delete a custom blog by id ─────────────────────────────
function deleteCustomBlog(id) {
    const customBlogs = getCustomBlogs().filter((b) => b.id !== id);
    saveCustomBlogs(customBlogs);
    renderBlogs();
    showBlogStatus('Blog deleted.', 'success');
}

// ── Card rendering ─────────────────────────────────────────
function createBlogCard(blog, isCustom) {
    const article = document.createElement('article');
    article.className = 'update-card';

    const title       = escapeHtml(blog.title       || 'Untitled');
    const description = escapeHtml(blog.description || blog.content || '');
    const date        = escapeHtml(blog.date        || 'Recently');
    const badge       = escapeHtml(blog.badge       || 'Blog');
    const image       = blog.image || '';
    const icon        = escapeHtml(blog.icon        || 'fa-newspaper');

    // Delete button only on custom (admin-posted) blogs
    const deleteBtnHtml = isCustom ? `
        <button class="blog-delete-btn" title="Delete this blog" aria-label="Delete blog">
            <i class="fas fa-trash-alt"></i>
        </button>` : '';

    article.innerHTML = `
        <div class="update-image" style="position:relative">
            ${image ? `<img src="${escapeHtml(image)}" alt="${title}" loading="lazy" />` : ''}
            <div class="image-placeholder" style="display:${image ? 'none' : 'flex'}">
                <i class="fas ${icon}"></i>
            </div>
            <div class="update-badge">${badge}</div>
            ${deleteBtnHtml}
        </div>
        <div class="update-content">
            <div class="update-meta">
                <span class="update-date"><i class="far fa-calendar"></i> ${date}</span>
            </div>
            <h3 class="update-title" style="font-family:'Bebas Neue';font-size:2.5rem">${title}</h3>
            <p class="update-description" style="font-family:'Montserrat'">${description}</p>
        </div>
    `;

    // Image error fallback
    if (image) {
        const img = article.querySelector('img');
        const placeholder = article.querySelector('.image-placeholder');
        img.addEventListener('error', () => {
            img.style.display = 'none';
            placeholder.style.display = 'flex';
        });
    }

    // Wire up delete button
    if (isCustom) {
        const btn = article.querySelector('.blog-delete-btn');
        btn.addEventListener('click', () => {
            const adminKey = prompt('Enter admin key to delete this blog:');
            if (adminKey === null) return; // cancelled
            if (adminKey.trim() !== IOT_ADMIN_KEY) {
                showBlogStatus('Access denied: incorrect admin key.', 'error');
                return;
            }
            deleteCustomBlog(blog.id);
        });
    }

    return article;
}

function showBlogStatus(message, type) {
    const status = document.getElementById('blog-status');
    if (!status) return;
    status.textContent = message;
    status.className = `blog-status ${type}`;
    status.hidden = false;
    clearTimeout(showBlogStatus._timer);
    showBlogStatus._timer = setTimeout(() => { status.hidden = true; }, 4000);
}

// ── Render grid ────────────────────────────────────────────
async function renderBlogs() {
    const grid = document.getElementById('blogs-grid');
    if (!grid) return;

    grid.innerHTML = '<p class="blogs-loading">Loading blogs…</p>';

    try {
        const blogs = await loadAllBlogs();
        grid.innerHTML = '';

        if (!blogs.length) {
            grid.innerHTML = '<p class="blogs-empty">No blogs published yet.</p>';
            return;
        }

        const customIds = new Set(getCustomBlogs().map((b) => b.id));
        blogs.forEach((blog) => {
            const isCustom = customIds.has(blog.id) && !DEFAULT_BLOG_IDS.has(blog.id);
            grid.appendChild(createBlogCard(blog, isCustom));
        });
    } catch {
        grid.innerHTML = '';
        DEFAULT_BLOGS.forEach((blog) => grid.appendChild(createBlogCard(blog, false)));
    }
}

// ── Form: post a new blog ──────────────────────────────────
function postBlog() {
    const titleInput   = document.getElementById('new-title');
    const contentInput = document.getElementById('new-content');
    const keyInput     = document.getElementById('admin-key');

    if (!titleInput || !contentInput || !keyInput) return;

    const title   = titleInput.value.trim();
    const content = contentInput.value.trim();
    const key     = keyInput.value.trim();

    if (!title || !content) {
        showBlogStatus('Please fill in the blog title and content.', 'error');
        return;
    }
    if (key !== IOT_ADMIN_KEY) {
        showBlogStatus('Access denied: incorrect admin key.', 'error');
        return;
    }

    const newBlog = {
        id: `custom-${Date.now()}`,
        title,
        description: content,
        date: new Date().toLocaleDateString('en-IN'),
        badge: 'Community',
        image: '',
        icon: 'fa-pen-fancy'
    };

    const customBlogs = getCustomBlogs();
    customBlogs.unshift(newBlog);
    saveCustomBlogs(customBlogs);

    titleInput.value   = '';
    contentInput.value = '';
    keyInput.value     = '';

    renderBlogs();
    showBlogStatus('Blog posted successfully!', 'success');
}

// ── Form: clear ALL custom blogs ──────────────────────────
function clearAllCustomBlogs() {
    const keyInput = document.getElementById('admin-key');
    const key = keyInput ? keyInput.value.trim() : prompt('Enter admin key:');

    if (!key) return;
    if (key !== IOT_ADMIN_KEY) {
        showBlogStatus('Access denied: incorrect admin key.', 'error');
        return;
    }

    saveCustomBlogs([]);
    renderBlogs();
    showBlogStatus('All custom blogs cleared.', 'success');
}

// ── Init ───────────────────────────────────────────────────
function initBlogsPage() {
    renderBlogs();

    const form = document.getElementById('blog-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            postBlog();
        });
    }

    const clearBtn = document.getElementById('clear-blogs-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllCustomBlogs);
    }
}

window.postBlog = postBlog;
window.initBlogsPage = initBlogsPage;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogsPage);
} else {
    initBlogsPage();
}
