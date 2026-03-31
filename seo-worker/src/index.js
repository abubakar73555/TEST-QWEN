// SEO Worker - Main Entry Point
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith('/api/')) {
      return handleApi(request, env, path);
    }

    if (path.startsWith('/admin')) {
      return handleAdmin(request, env, path);
    }

    return handlePublicPage(request, env, path);
  }
};

async function handleApi(request, env, path) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!path.includes('/login') && !path.includes('/public')) {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !await verifyAuth(authHeader, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: corsHeaders
        });
      }
    }

    if (path === '/api/login' && request.method === 'POST') {
      const body = await request.json();
      const { username, password } = body;
      
      if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
        const token = btoa(JSON.stringify({ username, exp: Date.now() + 86400000 }));
        return new Response(JSON.stringify({ token, success: true }), { headers: corsHeaders });
      }
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    if (path === '/api/pages' && request.method === 'GET') {
      const keys = await env.SEO_DATA.list({ prefix: 'page:' });
      const pages = [];
      for (const key of keys.keys) {
        const page = await env.SEO_DATA.get(key.name, { type: 'json' });
        if (page) pages.push(page);
      }
      return new Response(JSON.stringify({ pages }), { headers: corsHeaders });
    }

    if (path === '/api/pages' && request.method === 'POST') {
      const page = await request.json();
      const slug = page.slug || generateSlug(page.title);
      const pageData = {
        id: Date.now().toString(),
        slug,
        title: page.title,
        content: page.content,
        metaDescription: page.metaDescription,
        metaKeywords: page.metaKeywords,
        ogImage: page.ogImage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await env.SEO_DATA.put('page:' + slug, JSON.stringify(pageData));
      return new Response(JSON.stringify({ success: true, page: pageData }), { headers: corsHeaders });
    }

    if (path.match(/^\/api\/pages\/[^/]+$/) && request.method === 'PUT') {
      const slug = path.split('/').pop();
      const updates = await request.json();
      const existing = await env.SEO_DATA.get('page:' + slug, { type: 'json' });
      
      if (!existing) {
        return new Response(JSON.stringify({ error: 'Page not found' }), {
          status: 404,
          headers: corsHeaders
        });
      }

      const updatedPage = {
        ...existing,
        ...updates,
        slug: updates.slug || existing.slug,
        updatedAt: new Date().toISOString()
      };

      if (updates.slug && updates.slug !== slug) {
        await env.SEO_DATA.delete('page:' + slug);
      }

      await env.SEO_DATA.put('page:' + updatedPage.slug, JSON.stringify(updatedPage));
      return new Response(JSON.stringify({ success: true, page: updatedPage }), { headers: corsHeaders });
    }

    if (path.match(/^\/api\/pages\/[^/]+$/) && request.method === 'DELETE') {
      const slug = path.split('/').pop();
      await env.SEO_DATA.delete('page:' + slug);
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    if (path.match(/^\/api\/pages\/[^/]+$/) && request.method === 'GET') {
      const slug = path.split('/').pop();
      const page = await env.SEO_DATA.get('page:' + slug, { type: 'json' });
      
      if (!page) {
        return new Response(JSON.stringify({ error: 'Page not found' }), {
          status: 404,
          headers: corsHeaders
        });
      }
      return new Response(JSON.stringify({ page }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: corsHeaders
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

async function verifyAuth(authHeader, env) {
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = JSON.parse(atob(token));
    return decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function generateSlug(title) {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function handleAdmin(request, env, path) {
  if (path === '/admin' || path === '/admin/') {
    return new Response(getAdminHTML(env.SITE_NAME), {
      headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });
  }

  if (path === '/admin/login') {
    return new Response(getLoginHTML(), {
      headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });
  }

  return new Response('Not Found', { status: 404 });
}

async function handlePublicPage(request, env, path) {
  if (path === '/') {
    const keys = await env.SEO_DATA.list({ prefix: 'page:' });
    const pages = [];
    for (const key of keys.keys) {
      const page = await env.SEO_DATA.get(key.name, { type: 'json' });
      if (page) pages.push(page);
    }
    return new Response(getHomeHTML(pages, env.SITE_NAME), {
      headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });
  }

  const slug = path.slice(1);
  if (slug) {
    const page = await env.SEO_DATA.get('page:' + slug, { type: 'json' });
    
    if (page) {
      return new Response(getPageHTML(page, env.SITE_NAME), {
        headers: { 'Content-Type': 'text/html;charset=utf-8' }
      });
    }
  }

  return new Response(get404HTML(env.SITE_NAME), {
    status: 404,
    headers: { 'Content-Type': 'text/html;charset=utf-8' }
  });
}
