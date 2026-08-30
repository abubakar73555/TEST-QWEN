import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const siteUrl = 'https://www.salama.com';

console.log('🚀 بدء بناء الموقع لـ Cloudflare (Pages / Workers)...');

// 1. Generate SEO Sitemap
const rootFiles = fs.readdirSync(__dirname);
const htmlFiles = rootFiles.filter(f => f.endsWith('.html') && f !== '404.html' && f !== 'test-fixes.html');

const getPriorityAndFreq = (file) => {
  if (file === 'index.html') return { priority: '1.0', changefreq: 'daily' };
  if (['services.html', 'contracts.html', 'reports.html', 'blog.html', 'quote.html', 'contact.html', 'about.html', 'projects.html'].includes(file)) {
    return { priority: '0.9', changefreq: 'weekly' };
  }
  if (file.startsWith('service-') || file.startsWith('contract-') || file.startsWith('report-')) {
    return { priority: '0.8', changefreq: 'monthly' };
  }
  if (file.startsWith('blog-')) {
    return { priority: '0.7', changefreq: 'monthly' };
  }
  return { priority: '0.6', changefreq: 'monthly' };
};

const today = new Date().toISOString().split('T')[0];

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${htmlFiles
  .sort((a, b) => {
    if (a === 'index.html') return -1;
    if (b === 'index.html') return 1;
    return a.localeCompare(b);
  })
  .map(file => {
    const loc = file === 'index.html' ? `${siteUrl}/` : `${siteUrl}/${file}`;
    const { priority, changefreq } = getPriorityAndFreq(file);
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapContent, 'utf-8');
console.log(`🗺️ تم إنشاء sitemap.xml يحتوي على ${htmlFiles.length} صفحة.`);

// 2. Clean / Create dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 3. Define allowed extensions and copy files to dist
const allowedExtensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico', '.xml', '.txt', '.json', '.webmanifest'];
const specialFiles = ['_headers', '_redirects', 'robots.txt', 'sitemap.xml', '404.html'];
const excludeFiles = ['package.json', 'package-lock.json', 'bun.lock', 'server.js', 'build.js', 'wrangler.jsonc', 'vercel.json', 'metadata.json'];

const allFiles = fs.readdirSync(__dirname);
let copiedCount = 0;

for (const file of allFiles) {
  const fullPath = path.join(__dirname, file);
  const stat = fs.statSync(fullPath);

  if (stat.isFile()) {
    const ext = path.extname(file).toLowerCase();
    if (excludeFiles.includes(file)) continue;

    if (allowedExtensions.includes(ext) || specialFiles.includes(file)) {
      fs.copyFileSync(fullPath, path.join(distDir, file));
      copiedCount++;
    }
  } else if (stat.isDirectory()) {
    if (file !== 'node_modules' && file !== '.git' && file !== '.wrangler' && file !== 'dist') {
      fs.cpSync(fullPath, path.join(distDir, file), { recursive: true });
      console.log(`📁 تم نسخ المجلد: ${file}`);
    }
  }
}

console.log(`✅ تم نسخ ${copiedCount} ملف بنجاح إلى مجلد dist/ المخصص لـ Cloudflare.`);

