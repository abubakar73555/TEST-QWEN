import { Hono } from 'hono';
import { cors } from 'hono/cors';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const app = new Hono();

app.use('/*', cors({
  origin: ['http://localhost:5173', 'https://*.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

const authenticate = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  try {
    const token = authHeader.split(' ')[1];
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    c.set('user', payload);
    await next();
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

app.post('/api/auth/register', async (c) => {
  const { email, password, name } = await c.req.json();
  if (!email || !password || !name) return c.json({ error: 'All fields required' }, 400);
  
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return c.json({ error: 'Email already exists' }, 400);
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await c.env.DB.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').bind(email, hashedPassword, name).run();
  
  const token = await new SignJWT({ userId: result.meta.last_row_id, email })
    .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d')
    .sign(new TextEncoder().encode(c.env.JWT_SECRET));
  
  return c.json({ message: 'Success', token, user: { id: result.meta.last_row_id, email, name } });
});

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: 'Credentials required' }, 400);
  
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user) return c.json({ error: 'Invalid credentials' }, 401);
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return c.json({ error: 'Invalid credentials' }, 401);
  
  const token = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d')
    .sign(new TextEncoder().encode(c.env.JWT_SECRET));
  
  return c.json({ message: 'Success', token, user: { id: user.id, email: user.email, name: user.name } });
});

app.get('/api/customers', authenticate, async (c) => {
  const user = c.get('user');
  const customers = await c.env.DB.prepare('SELECT * FROM customers WHERE user_id = ? ORDER BY created_at DESC').bind(user.userId).all();
  return c.json({ customers: customers.results || [] });
});

app.post('/api/customers', authenticate, async (c) => {
  const user = c.get('user');
  const { name, email, phone, company, status, notes } = await c.req.json();
  if (!name) return c.json({ error: 'Name required' }, 400);
  
  const result = await c.env.DB.prepare(
    'INSERT INTO customers (user_id, name, email, phone, company, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(user.userId, name, email || null, phone || null, company || null, status || 'lead', notes || null).run();
  
  const newCustomer = await c.env.DB.prepare('SELECT * FROM customers WHERE id = ?').bind(result.meta.last_row_id).first();
  return c.json({ message: 'Created', customer: newCustomer }, 201);
});

app.put('/api/customers/:id', authenticate, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const { name, email, phone, company, status, notes } = await c.req.json();
  
  const existing = await c.env.DB.prepare('SELECT * FROM customers WHERE id = ? AND user_id = ?').bind(id, user.userId).first();
  if (!existing) return c.json({ error: 'Not found' }, 404);
  
  await c.env.DB.prepare(
    'UPDATE customers SET name=?, email=?, phone=?, company=?, status=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).bind(name, email, phone, company, status, notes, id).run();
  
  const updated = await c.env.DB.prepare('SELECT * FROM customers WHERE id = ?').bind(id).first();
  return c.json({ message: 'Updated', customer: updated });
});

app.delete('/api/customers/:id', authenticate, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  
  const existing = await c.env.DB.prepare('SELECT * FROM customers WHERE id = ? AND user_id = ?').bind(id, user.userId).first();
  if (!existing) return c.json({ error: 'Not found' }, 404);
  
  await c.env.DB.prepare('DELETE FROM customers WHERE id = ?').bind(id).run();
  return c.json({ message: 'Deleted' });
});

export default app;
