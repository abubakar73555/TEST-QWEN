const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('./db/database');

const app = express();
const PORT = 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'seo-secret-key-2025',
    resave: false,
    saveUninitialized: true
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

// Routes - Public Website
app.get('/', async (req, res) => {
    const pages = await db.getAllPages();
    res.render('index', { pages });
});

app.get('/page/:slug', async (req, res) => {
    const page = await db.getPageBySlug(req.params.slug);
    if (page) {
        res.render('page', { page });
    } else {
        res.status(404).render('404');
    }
});

// Routes - Admin Login
app.get('/admin/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    // Simple authentication (in production, use proper password hashing)
    if (username === 'admin' && password === 'admin123') {
        req.session.loggedIn = true;
        res.redirect('/admin/dashboard');
    } else {
        res.render('login', { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Routes - Admin Dashboard
app.get('/admin/dashboard', requireAuth, async (req, res) => {
    const pages = await db.getAllPages();
    res.render('dashboard', { pages });
});

app.get('/admin/add-page', requireAuth, (req, res) => {
    res.render('edit-page', { page: null, action: '/admin/add-page' });
});

app.post('/admin/add-page', requireAuth, async (req, res) => {
    const { title, slug, metaDescription, keywords, content, ogTitle, ogDescription } = req.body;
    await db.createPage({
        title,
        slug,
        meta_description: metaDescription,
        keywords,
        content,
        og_title: ogTitle,
        og_description: ogDescription
    });
    res.redirect('/admin/dashboard');
});

app.get('/admin/edit-page/:id', requireAuth, async (req, res) => {
    const page = await db.getPageById(req.params.id);
    res.render('edit-page', { page, action: `/admin/edit-page/${req.params.id}` });
});

app.post('/admin/edit-page/:id', requireAuth, async (req, res) => {
    const { title, slug, metaDescription, keywords, content, ogTitle, ogDescription } = req.body;
    await db.updatePage(req.params.id, {
        title,
        slug,
        meta_description: metaDescription,
        keywords,
        content,
        og_title: ogTitle,
        og_description: ogDescription
    });
    res.redirect('/admin/dashboard');
});

app.get('/admin/delete-page/:id', requireAuth, async (req, res) => {
    await db.deletePage(req.params.id);
    res.redirect('/admin/dashboard');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin/login`);
    console.log(`Login with: admin / admin123`);
});
