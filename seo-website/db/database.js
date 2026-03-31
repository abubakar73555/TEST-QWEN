const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'seo.db');
const db = new Database(dbPath);

// Initialize database tables
db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        meta_description TEXT,
        keywords TEXT,
        content TEXT NOT NULL,
        og_title TEXT,
        og_description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Insert sample SEO page if not exists
const checkPage = db.prepare('SELECT id FROM pages WHERE slug = ?');
const existingPage = checkPage.get('seo-guide-2025');

if (!existingPage) {
    const insertPage = db.prepare(`
        INSERT INTO pages (title, slug, meta_description, keywords, content, og_title, og_description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertPage.run(
        'دليل تحسين محركات البحث 2025',
        'seo-guide-2025',
        'دليل شامل لتحسين محركات البحث (SEO) لعام 2025. تعلم أفضل الممارسات لزيادة ترتيب موقعك في جوجل.',
        'SEO, تحسين محركات البحث, جوجل, ترتيب المواقع, محتوى متوافق مع SEO',
        '<h1>دليل تحسين محركات البحث الشامل</h1><p>تحسين محركات البحث (SEO) هو مجموعة من الممارسات التي تهدف إلى تحسين ظهور موقعك الإلكتروني في نتائج محركات البحث...</p>',
        'دليل SEO 2025 - تحسين محركات البحث',
        'تعلم كيفية تحسين موقعك لمحركات البحث وزيادة الزيارات العضوية'
    );
}

// Database functions
const getAllPages = () => {
    const stmt = db.prepare('SELECT * FROM pages ORDER BY created_at DESC');
    return stmt.all();
};

const getPageBySlug = (slug) => {
    const stmt = db.prepare('SELECT * FROM pages WHERE slug = ?');
    return stmt.get(slug);
};

const getPageById = (id) => {
    const stmt = db.prepare('SELECT * FROM pages WHERE id = ?');
    return stmt.get(id);
};

const createPage = (pageData) => {
    const { title, slug, meta_description, keywords, content, og_title, og_description } = pageData;
    const stmt = db.prepare(`
        INSERT INTO pages (title, slug, meta_description, keywords, content, og_title, og_description) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(title, slug, meta_description, keywords, content, og_title, og_description);
    return result.lastInsertRowid;
};

const updatePage = (id, pageData) => {
    const { title, slug, meta_description, keywords, content, og_title, og_description } = pageData;
    const stmt = db.prepare(`
        UPDATE pages SET 
            title = ?, 
            slug = ?, 
            meta_description = ?, 
            keywords = ?, 
            content = ?, 
            og_title = ?, 
            og_description = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `);
    const result = stmt.run(title, slug, meta_description, keywords, content, og_title, og_description, id);
    return result.changes;
};

const deletePage = (id) => {
    const stmt = db.prepare('DELETE FROM pages WHERE id = ?');
    const result = stmt.run(id);
    return result.changes;
};

module.exports = {
    getAllPages,
    getPageBySlug,
    getPageById,
    createPage,
    updatePage,
    deletePage
};
