// Worker الرئيسي لموقع SEO مع لوحة التحكم
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // التعامل مع طلبات API
    if (path.startsWith('/api/')) {
      return handleAPI(request, env, path);
    }

    // التعامل مع لوحة التحكم
    if (path.startsWith('/admin')) {
      return handleAdmin(request, env, path);
    }

    // التعامل مع صفحات الموقع الرئيسية
    return handleSite(request, env, path);
  },
};

// معالجة طلبات API
async function handleAPI(request, env, path) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // التحقق من المصادقة للعمليات الحساسة
    if (path !== '/api/pages' && path !== '/api/pages/') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !await verifyAuth(authHeader, env)) {
        return new Response(JSON.stringify({ error: 'غير مصرح' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // جلب جميع الصفحات
    if (path === '/api/pages' || path === '/api/pages/') {
      if (request.method === 'GET') {
        const pages = await getAllPages(env);
        return new Response(JSON.stringify(pages), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (request.method === 'POST') {
        const body = await request.json();
        const page = await createPage(body, env);
        return new Response(JSON.stringify(page), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // التعامل مع صفحة محددة
    const pageMatch = path.match(/^\/api\/pages\/([^\/]+)$/);
    if (pageMatch) {
      const slug = decodeURIComponent(pageMatch[1]);

      if (request.method === 'GET') {
        const page = await getPage(slug, env);
        if (!page) {
          return new Response(JSON.stringify({ error: 'الصفحة غير موجودة' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(page), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (request.method === 'PUT') {
        const body = await request.json();
        const page = await updatePage(slug, body, env);
        return new Response(JSON.stringify(page), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (request.method === 'DELETE') {
        await deletePage(slug, env);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ error: 'المسار غير موجود' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// معالجة لوحة التحكم
async function handleAdmin(request, env, path) {
  // التحقق من المصادقة
  if (path === '/admin/login') {
    if (request.method === 'POST') {
      const body = await request.formData();
      const password = body.get('password');
      
      if (password === env.ADMIN_PASSWORD) {
        const token = btoa(JSON.stringify({ 
          authenticated: true, 
          timestamp: Date.now() 
        }));
        
        const html = getAdminHTML(token, env);
        return new Response(html, {
          headers: { 'Content-Type': 'text/html' }
        });
      } else {
        return new Response(getLoginHTML(false), {
          status: 401,
          headers: { 'Content-Type': 'text/html' }
        });
      }
    }
    
    return new Response(getLoginHTML(), {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  // التحقق من وجود توكن للمناطق المحمية
  const cookie = request.headers.get('Cookie') || '';
  const tokenMatch = cookie.match(/auth_token=([^;]+)/);
  
  if (!tokenMatch && path !== '/admin/login') {
    return new Response(null, {
      status: 302,
      headers: { 'Location': '/admin/login' }
    });
  }

  if (path === '/admin' || path === '/admin/') {
    if (tokenMatch) {
      try {
        const tokenData = JSON.parse(atob(tokenMatch[1]));
        if (tokenData.authenticated) {
          const html = getAdminHTML(tokenMatch[1], env);
          return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      } catch (e) {
        // توكن غير صالح
      }
    }
    return new Response(null, {
      status: 302,
      headers: { 'Location': '/admin/login' }
    });
  }

  return new Response('لوحة التحكم', {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// معالجة صفحات الموقع
async function handleSite(request, env, path) {
  // الصفحة الرئيسية
  if (path === '/' || path === '') {
    const pages = await getAllPages(env);
    const html = getHomeHTML(pages, env);
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // صفحات المحتوى
  const page = await getPage(path.substring(1), env);
  if (page) {
    const html = getPageHTML(page, env);
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // صفحة غير موجودة
  return new Response(get404HTML(), {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// دوال مساعدة للتحقق من المصادقة
async function verifyAuth(authHeader, env) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  try {
    const data = JSON.parse(atob(token));
    return data.authenticated === true;
  } catch (e) {
    return false;
  }
}

// دوال CRUD للصفحات
async function getAllPages(env) {
  try {
    const keys = await env.SEO_CONTENT.list();
    const pages = [];
    
    for (const key of keys.keys) {
      const page = await env.SEO_CONTENT.get(key.name, 'json');
      if (page) {
        pages.push(page);
      }
    }
    
    return pages.sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) {
    return [];
  }
}

async function getPage(slug, env) {
  try {
    const page = await env.SEO_CONTENT.get(slug, 'json');
    return page;
  } catch (e) {
    return null;
  }
}

async function createPage(data, env) {
  const slug = generateSlug(data.title);
  const page = {
    slug,
    title: data.title,
    content: data.content,
    metaDescription: data.metaDescription || data.content.substring(0, 160),
    keywords: data.keywords || [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  await env.SEO_CONTENT.put(slug, JSON.stringify(page));
  return page;
}

async function updatePage(slug, data, env) {
  const existing = await env.SEO_CONTENT.get(slug, 'json');
  if (!existing) {
    throw new Error('الصفحة غير موجودة');
  }
  
  const page = {
    ...existing,
    title: data.title || existing.title,
    content: data.content || existing.content,
    metaDescription: data.metaDescription || existing.metaDescription,
    keywords: data.keywords || existing.keywords,
    updatedAt: Date.now()
  };
  
  await env.SEO_CONTENT.put(slug, JSON.stringify(page));
  return page;
}

async function deletePage(slug, env) {
  await env.SEO_CONTENT.delete(slug);
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// قوالب HTML
function getHomeHTML(pages, env) {
  const pageList = pages.map(page => `
    <article class="page-card">
      <h2><a href="/${page.slug}">${escapeHTML(page.title)}</a></h2>
      <p class="meta-description">${escapeHTML(page.metaDescription)}</p>
      <div class="meta-info">
        <span>📅 ${new Date(page.createdAt).toLocaleDateString('ar-SA')}</span>
        ${page.keywords.length > 0 ? `<span>🏷️ ${page.keywords.join(', ')}</span>` : ''}
      </div>
    </article>
  `).join('');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${env.SITE_TITLE} - دليل تحسين محركات البحث</title>
  <meta name="description" content="${env.SITE_DESCRIPTION}">
  <meta name="keywords" content="SEO, تحسين محركات البحث, سيو, جوجل, ترتيب المواقع">
  <meta name="author" content="${env.SITE_TITLE}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${env.SITE_TITLE}">
  <meta property="og:description" content="${env.SITE_DESCRIPTION}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ar_SA">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${env.SITE_TITLE}">
  <meta name="twitter:description" content="${env.SITE_DESCRIPTION}">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://your-domain.com/">
  
  <!-- Robots -->
  <meta name="robots" content="index, follow">
  
  <style>
    :root {
      --primary: #2563eb;
      --secondary: #1e40af;
      --background: #f8fafc;
      --text: #1e293b;
      --text-light: #64748b;
      --card-bg: #ffffff;
      --border: #e2e8f0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: var(--background);
      color: var(--text);
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    header {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      padding: 3rem 0;
      text-align: center;
    }
    
    header h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    
    header p {
      font-size: 1.2rem;
      opacity: 0.9;
    }
    
    nav {
      background: var(--card-bg);
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    nav .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    nav a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }
    
    main {
      padding: 3rem 0;
    }
    
    .pages-grid {
      display: grid;
      gap: 2rem;
    }
    
    .page-card {
      background: var(--card-bg);
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid var(--border);
    }
    
    .page-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .page-card h2 a {
      color: var(--primary);
      text-decoration: none;
      font-size: 1.5rem;
    }
    
    .page-card h2 a:hover {
      text-decoration: underline;
    }
    
    .meta-description {
      color: var(--text-light);
      margin: 1rem 0;
      line-height: 1.8;
    }
    
    .meta-info {
      display: flex;
      gap: 1.5rem;
      font-size: 0.9rem;
      color: var(--text-light);
      flex-wrap: wrap;
    }
    
    footer {
      background: var(--text);
      color: white;
      text-align: center;
      padding: 2rem 0;
      margin-top: 3rem;
    }
    
    @media (max-width: 768px) {
      header h1 {
        font-size: 2rem;
      }
      
      .page-card {
        padding: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <nav>
    <div class="container">
      <a href="/">🏠 ${env.SITE_TITLE}</a>
      <a href="/admin/login">🔐 لوحة التحكم</a>
    </div>
  </nav>
  
  <header>
    <div class="container">
      <h1>${env.SITE_TITLE}</h1>
      <p>${env.SITE_DESCRIPTION}</p>
    </div>
  </header>
  
  <main>
    <div class="container">
      <div class="pages-grid">
        ${pageList || '<p style="text-align: center; color: var(--text-light);">لا توجد صفحات بعد. قم بإضافة محتوى من لوحة التحكم.</p>'}
      </div>
    </div>
  </main>
  
  <footer>
    <div class="container">
      <p>© ${new Date().getFullYear()} ${env.SITE_TITLE}. جميع الحقوق محفوظة.</p>
      <p>مُحسّن لمحركات البحث وفق معايير Google SEO</p>
    </div>
  </footer>
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "${env.SITE_TITLE}",
    "description": "${env.SITE_DESCRIPTION}",
    "url": "https://your-domain.com/",
    "inLanguage": "ar-SA"
  }
  </script>
</body>
</html>`;
}

function getPageHTML(page, env) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(page.title)} - ${env.SITE_TITLE}</title>
  <meta name="description" content="${escapeHTML(page.metaDescription)}">
  <meta name="keywords" content="${page.keywords.join(', ')}">
  <meta name="author" content="${env.SITE_TITLE}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHTML(page.title)}">
  <meta property="og:description" content="${escapeHTML(page.metaDescription)}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="ar_SA">
  <meta property="article:published_time" content="${new Date(page.createdAt).toISOString()}">
  <meta property="article:modified_time" content="${new Date(page.updatedAt).toISOString()}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHTML(page.title)}">
  <meta name="twitter:description" content="${escapeHTML(page.metaDescription)}">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://your-domain.com/${page.slug}">
  
  <!-- Robots -->
  <meta name="robots" content="index, follow">
  
  <style>
    :root {
      --primary: #2563eb;
      --secondary: #1e40af;
      --background: #f8fafc;
      --text: #1e293b;
      --text-light: #64748b;
      --card-bg: #ffffff;
      --border: #e2e8f0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: var(--background);
      color: var(--text);
      line-height: 1.8;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    nav {
      background: var(--card-bg);
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    nav .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    nav a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }
    
    main {
      padding: 3rem 0;
    }
    
    article {
      background: var(--card-bg);
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border: 1px solid var(--border);
    }
    
    h1 {
      color: var(--primary);
      font-size: 2.5rem;
      margin-bottom: 1rem;
      line-height: 1.3;
    }
    
    .meta-info {
      display: flex;
      gap: 1.5rem;
      font-size: 0.9rem;
      color: var(--text-light);
      margin-bottom: 2rem;
      flex-wrap: wrap;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border);
    }
    
    .content {
      font-size: 1.1rem;
      line-height: 2;
    }
    
    .content p {
      margin-bottom: 1.5rem;
    }
    
    .content h2 {
      color: var(--secondary);
      margin: 2rem 0 1rem;
      font-size: 1.8rem;
    }
    
    .content h3 {
      color: var(--text);
      margin: 1.5rem 0 0.8rem;
      font-size: 1.4rem;
    }
    
    .content ul, .content ol {
      margin: 1rem 0;
      padding-right: 2rem;
    }
    
    .content li {
      margin-bottom: 0.5rem;
    }
    
    .back-link {
      display: inline-block;
      margin-top: 2rem;
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }
    
    .back-link:hover {
      text-decoration: underline;
    }
    
    footer {
      background: var(--text);
      color: white;
      text-align: center;
      padding: 2rem 0;
      margin-top: 3rem;
    }
    
    @media (max-width: 768px) {
      article {
        padding: 2rem;
      }
      
      h1 {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  <nav>
    <div class="container">
      <a href="/">🏠 ${env.SITE_TITLE}</a>
      <a href="/admin/login">🔐 لوحة التحكم</a>
    </div>
  </nav>
  
  <main>
    <div class="container">
      <article>
        <h1>${escapeHTML(page.title)}</h1>
        
        <div class="meta-info">
          <span>📅 تم النشر: ${new Date(page.createdAt).toLocaleDateString('ar-SA', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
          ${page.updatedAt !== page.createdAt ? `<span>✏️ آخر تحديث: ${new Date(page.updatedAt).toLocaleDateString('ar-SA')}</span>` : ''}
          ${page.keywords.length > 0 ? `<span>🏷️ ${page.keywords.join(', ')}</span>` : ''}
        </div>
        
        <div class="content">
          ${formatContent(page.content)}
        </div>
        
        <a href="/" class="back-link">← العودة إلى الصفحة الرئيسية</a>
      </article>
    </div>
  </main>
  
  <footer>
    <div class="container">
      <p>© ${new Date().getFullYear()} ${env.SITE_TITLE}. جميع الحقوق محفوظة.</p>
    </div>
  </footer>
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${escapeHTML(page.title)}",
    "description": "${escapeHTML(page.metaDescription)}",
    "datePublished": "${new Date(page.createdAt).toISOString()}",
    "dateModified": "${new Date(page.updatedAt).toISOString()}",
    "author": {
      "@type": "Organization",
      "name": "${env.SITE_TITLE}"
    },
    "publisher": {
      "@type": "Organization",
      "name": "${env.SITE_TITLE}"
    },
    "inLanguage": "ar-SA",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://your-domain.com/${page.slug}"
    }
  }
  </script>
</body>
</html>`;
}

function getLoginHTML(showError = false) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تسجيل الدخول - لوحة التحكم</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .login-container {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 400px;
    }
    
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
      font-size: 1.8rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 600;
    }
    
    input[type="password"] {
      width: 100%;
      padding: 0.8rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    
    input[type="password"]:focus {
      outline: none;
      border-color: #667eea;
    }
    
    button {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    
    .error {
      background: #fee;
      color: #c00;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    
    .back-link {
      display: block;
      text-align: center;
      margin-top: 1.5rem;
      color: #667eea;
      text-decoration: none;
    }
    
    .back-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <h1>🔐 لوحة التحكم</h1>
    
    ${showError ? '<div class="error">كلمة المرور غير صحيحة</div>' : ''}
    
    <form method="POST" action="/admin/login">
      <div class="form-group">
        <label for="password">كلمة المرور</label>
        <input type="password" id="password" name="password" required autofocus>
      </div>
      
      <button type="submit">دخول</button>
    </form>
    
    <a href="/" class="back-link">← العودة للموقع</a>
  </div>
</body>
</html>`;
}

function getAdminHTML(token, env) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>لوحة التحكم - ${env.SITE_TITLE}</title>
  <style>
    :root {
      --primary: #2563eb;
      --success: #10b981;
      --danger: #ef4444;
      --background: #f8fafc;
      --text: #1e293b;
      --card-bg: #ffffff;
      --border: #e2e8f0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: var(--background);
      color: var(--text);
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    header {
      background: linear-gradient(135deg, var(--primary), #1e40af);
      color: white;
      padding: 2rem 0;
    }
    
    header .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    nav {
      background: var(--card-bg);
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    nav a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
      margin-left: 1.5rem;
    }
    
    main {
      padding: 2rem 0;
    }
    
    .dashboard {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
    }
    
    .card {
      background: var(--card-bg);
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border: 1px solid var(--border);
    }
    
    h2 {
      color: var(--primary);
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #555;
    }
    
    input[type="text"],
    textarea,
    input[type="url"] {
      width: 100%;
      padding: 0.8rem;
      border: 2px solid var(--border);
      border-radius: 6px;
      font-size: 1rem;
      font-family: inherit;
    }
    
    textarea {
      min-height: 200px;
      resize: vertical;
    }
    
    input:focus,
    textarea:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    button {
      padding: 0.8rem 1.5rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    button:hover {
      background: #1d4ed8;
    }
    
    button.danger {
      background: var(--danger);
    }
    
    button.danger:hover {
      background: #dc2626;
    }
    
    .pages-list {
      list-style: none;
    }
    
    .page-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      margin-bottom: 1rem;
      transition: box-shadow 0.2s;
    }
    
    .page-item:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .page-info h3 {
      font-size: 1.1rem;
      margin-bottom: 0.3rem;
    }
    
    .page-info small {
      color: #666;
    }
    
    .page-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }
    
    .message {
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      display: none;
    }
    
    .message.success {
      background: #d1fae5;
      color: #065f46;
      display: block;
    }
    
    .message.error {
      background: #fee2e2;
      color: #991b1b;
      display: block;
    }
    
    @media (max-width: 900px) {
      .dashboard {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>⚙️ لوحة التحكم</h1>
      <a href="/" style="color: white; text-decoration: none;">🏠 زيارة الموقع</a>
    </div>
  </header>
  
  <nav>
    <div class="container">
      <a href="/admin">الرئيسية</a>
      <a href="#" onclick="logout()">تسجيل الخروج</a>
    </div>
  </nav>
  
  <main>
    <div class="container">
      <div class="dashboard">
        <div class="card">
          <h2>➕ إضافة صفحة جديدة</h2>
          
          <div id="formMessage" class="message"></div>
          
          <form id="pageForm">
            <div class="form-group">
              <label for="title">العنوان *</label>
              <input type="text" id="title" name="title" required placeholder="عنوان الصفحة المحسن لـ SEO">
            </div>
            
            <div class="form-group">
              <label for="metaDescription">وصف الميتا (160 حرف كحد أقصى)</label>
              <textarea id="metaDescription" name="metaDescription" rows="3" placeholder="وصف مختصر وجذاب يظهر في نتائج بحث جوجل"></textarea>
            </div>
            
            <div class="form-group">
              <label for="keywords">الكلمات المفتاحية (مفصولة بفواصل)</label>
              <input type="text" id="keywords" name="keywords" placeholder="seo, تحسين محركات البحث, جوجل">
            </div>
            
            <div class="form-group">
              <label for="content">المحتوى *</label>
              <textarea id="content" name="content" required rows="12" placeholder="اكتب محتوى غني ومفيد يركز على الكلمات المفتاحية..."></textarea>
            </div>
            
            <button type="submit">نشر الصفحة</button>
          </form>
        </div>
        
        <div class="card">
          <h2>📄 الصفحات المنشورة</h2>
          <ul id="pagesList" class="pages-list">
            <li style="text-align: center; color: #666; padding: 2rem;">جاري تحميل الصفحات...</li>
          </ul>
        </div>
      </div>
    </div>
  </main>
  
  <script>
    const token = '${token}';
    
    // تحميل الصفحات عند البدء
    loadPages();
    
    // التعامل مع نموذج الإضافة
    document.getElementById('pageForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        title: document.getElementById('title').value,
        metaDescription: document.getElementById('metaDescription').value,
        keywords: document.getElementById('keywords').value.split(',').map(k => k.trim()).filter(k => k),
        content: document.getElementById('content').value
      };
      
      try {
        const response = await fetch('/api/pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
          showMessage('تم نشر الصفحة بنجاح!', 'success');
          document.getElementById('pageForm').reset();
          loadPages();
        } else {
          showMessage('حدث خطأ: ' + result.error, 'error');
        }
      } catch (error) {
        showMessage('حدث خطأ في الاتصال', 'error');
      }
    });
    
    // تحميل قائمة الصفحات
    async function loadPages() {
      try {
        const response = await fetch('/api/pages', {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
        
        const pages = await response.json();
        const list = document.getElementById('pagesList');
        
        if (pages.length === 0) {
          list.innerHTML = '<li style="text-align: center; color: #666; padding: 2rem;">لا توجد صفحات منشورة بعد</li>';
          return;
        }
        
        list.innerHTML = pages.map(page => \`
          <li class="page-item">
            <div class="page-info">
              <h3>\${escapeHTML(page.title)}</h3>
              <small>📅 \${new Date(page.createdAt).toLocaleDateString('ar-SA')} | 🔗 /\${page.slug}</small>
            </div>
            <div class="page-actions">
              <a href="/\${page.slug}" target="_blank" class="btn-sm" style="background: #10b981; color: white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none;">عرض</a>
              <button onclick="deletePage('\${page.slug}')" class="btn-sm danger">حذف</button>
            </div>
          </li>
        \`).join('');
      } catch (error) {
        document.getElementById('pagesList').innerHTML = '<li style="text-align: center; color: #ef4444; padding: 2rem;">خطأ في تحميل الصفحات</li>';
      }
    }
    
    // حذف صفحة
    async function deletePage(slug) {
      if (!confirm('هل أنت متأكد من حذف هذه الصفحة؟')) return;
      
      try {
        const response = await fetch('/api/pages/' + encodeURIComponent(slug), {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
        
        if (response.ok) {
          loadPages();
        } else {
          alert('حدث خطأ في الحذف');
        }
      } catch (error) {
        alert('حدث خطأ في الاتصال');
      }
    }
    
    // إظهار رسالة
    function showMessage(text, type) {
      const msg = document.getElementById('formMessage');
      msg.textContent = text;
      msg.className = 'message ' + type;
      
      setTimeout(() => {
        msg.className = 'message';
      }, 5000);
    }
    
    // تسجيل الخروج
    function logout() {
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/admin/login';
    }
    
    // هروب HTML
    function escapeHTML(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
}

function get404HTML() {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>الصفحة غير موجودة</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-align: center;
    }
    
    .container {
      padding: 2rem;
    }
    
    h1 {
      font-size: 8rem;
      margin: 0;
      opacity: 0.3;
    }
    
    h2 {
      font-size: 2rem;
      margin: 1rem 0;
    }
    
    p {
      font-size: 1.2rem;
      opacity: 0.9;
      margin-bottom: 2rem;
    }
    
    a {
      color: white;
      text-decoration: none;
      padding: 1rem 2rem;
      background: rgba(255,255,255,0.2);
      border-radius: 8px;
      transition: background 0.3s;
    }
    
    a:hover {
      background: rgba(255,255,255,0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <h2>الصفحة غير موجودة</h2>
    <p>عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها</p>
    <a href="/">← العودة للصفحة الرئيسية</a>
  </div>
</body>
</html>`;
}

function formatContent(content) {
  // تحويل السطور الجديدة إلى فقرات
  return content
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${escapeHTML(p)}</p>`)
    .join('');
}

function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
