دليل الربط مع Cloudflare - خطوات مفصلة
=====================================

## المتطلبات المسبقة:
1. حساب Cloudflare (مجاني)
2. Node.js مثبت على جهازك

## الخطوة 1: تسجيل الدخول لـ Cloudflare من الجهاز

افتح Terminal على جهازك (ليس هنا) ونفذ:
```bash
npm install -g wrangler
npx wrangler login
```
سيفتح متصفح لتسجيل الدخول بحساب Cloudflare الخاص بك.

## الخطوة 2: إنشاء قاعدة بيانات D1

في Terminal على جهازك:
```bash
cd crm-cloudflare/backend
npx wrangler d1 create crm-db
```
ستحصل على output يحتوي على `database_id`. انسخه.

## الخطوة 3: تحديث ملف wrangler.toml

افتح الملف `backend/wrangler.toml` واستبدل:
- `database_id = "PLACEHOLDER_ID"` بـ ID الذي نسخته
- `JWT_SECRET` بسري قوي (32 حرف على الأقل)

مثال:
```toml
name = "crm-api"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "crm-db"
database_id = "abc123xyz-your-actual-id-here"

[vars]
JWT_SECRET = "my-super-secret-key-min-32-characters-long"
```

## الخطوة 4: تهيئة قاعدة البيانات

```bash
npx wrangler d1 execute crm-db --file=./src/schema.sql
```

## الخطوة 5: اختبار محلياً

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```
يعمل على http://localhost:8787

Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
```
يعمل على http://localhost:5173

افتح المتصفح: http://localhost:5173

## الخطوة 6: نشر الباك إند

```bash
cd backend
npm run deploy
```
سيظهر لك رابط مثل: `https://crm-api.your-subdomain.workers.dev`

## الخطوة 7: تحديث رابط API في الفرونت إند

عدّل الملفات التالية في `frontend/src/pages/`:
- Login.jsx
- Register.jsx
- Dashboard.jsx

غيّر السطر:
```javascript
const API_URL = import.meta.env.PROD ? 'https://crm-api.YOUR_SUBDOMAIN.workers.dev' : '/api';
```
استبدل `YOUR_SUBDOMAIN` باسم الـ subdomain الخاص بك من الخطوة السابقة.

## الخطوة 8: نشر الفرونت إند

```bash
cd frontend
npm run deploy
```
سيظهر رابط مثل: `https://your-project.pages.dev`

## مبروك! منصتك تعمل الآن على Cloudflare 🎉

## روابط مهمة:
- لوحة تحكم Cloudflare: https://dash.cloudflare.com
- Workers: https://dash.cloudflare.com/?to=/:account/workers
- D1 Database: https://dash.cloudflare.com/?to=/:account/d1
- Pages: https://dash.cloudflare.com/?to=/:account/pages

## الخطة المجانية تشمل:
- 100,000 طلب/يوم للـ Workers
- 5 مليون قراءة / 100,000 كتابة يومياً لـ D1
- 500GB bandwidth للشهر لـ Pages
