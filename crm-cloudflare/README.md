# منصة CRM على Cloudflare

منصة إدارة عملاء متكاملة مبنية على Cloudflare Workers + D1 + Pages.

## البنية التقنية
- **Backend**: Cloudflare Workers + Hono + D1 Database
- **Frontend**: React 18 + Vite + Cloudflare Pages
- **Auth**: JWT + bcrypt

## التثبيت والتشغيل

### 1. تثبيت الاعتماديات
```bash
cd crm-cloudflare/backend && npm install
cd ../frontend && npm install
```

### 2. تسجيل الدخول لـ Cloudflare
```bash
npx wrangler login
```

### 3. إنشاء قاعدة البيانات
```bash
cd backend
npx wrangler d1 create crm-db
```
انسخ `database_id` وضعه في `backend/wrangler.toml`.

### 4. تهيئة قاعدة البيانات
```bash
npx wrangler d1 execute crm-db --file=./src/schema.sql
```

### 5. تحديث JWT_SECRET في `wrangler.toml`

### 6. التشغيل المحلي
**Terminal 1 (Backend):**
```bash
cd backend && npm run dev
```
يعمل على: http://localhost:8787

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev
```
يعمل على: http://localhost:5173

## النشر على Cloudflare

### نشر الباك إند
```bash
cd backend && npm run deploy
```
سيظهر رابط: `https://crm-api.YOUR_SUBDOMAIN.workers.dev`

### تحديث رابط API في الفرونت إند
في الملفات:
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`  
- `frontend/src/pages/Dashboard.jsx`

غيّر:
```javascript
const API_URL = import.meta.env.PROD 
  ? 'https://crm-api.YOUR_SUBDOMAIN.workers.dev' 
  : '/api';
```

### نشر الفرونت إند
```bash
cd frontend && npm run deploy
```
سيظهر رابط: `https://YOUR_PROJECT.pages.dev`

## المميزات
✅ مصادقة كاملة (تسجيل/دخول)
✅ إدارة العملاء (إضافة/تعديل/حذف)
✅ تصنيف العملاء
✅ واجهة عربية RTL
✅ تصميم متجاوب
✅ Serverless - بدون سيرفرات
✅ مجاني للخطة الأساسية

## الحدود المجانية
- Workers: 100K طلب/يوم
- D1: 5M قراءة/يوم، 100K كتابة/يوم
- Pages: 500GB bandwidth/شهر
