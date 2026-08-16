# منصة SaaS لإدارة العملاء (CRM)

منصة متكاملة لإدارة العملاء مبنية بتقنيات MERN Stack (MongoDB, Express, React, Node.js)

## المميزات

- ✅ تسجيل الدخول والتسجيل
- ✅ إدارة العملاء (إضافة، تعديل، حذف، عرض)
- ✅ تصنيف العملاء حسب الحالة (عميل محتمل، مرشح، عميل، غير نشط)
- ✅ واجهة عربية كاملة
- ✅ تصميم متجاوب وجذاب
- ✅ حماية المسارات الخاصة

## هيكل المشروع

```
/workspace
├── client/          # واجهة المستخدم (React + Vite)
│   └── src/
│       ├── pages/   # صفحات التطبيق
│       ├── services/# خدمات API
│       └── components/
└── server/          # الخادم الخلفي (Node.js + Express)
    ├── models/      # نماذج قاعدة البيانات
    ├── routes/      # مسارات API
    ├── middleware/  # وسائط التحقق
    └── config/      # إعدادات قاعدة البيانات
```

## التشغيل

### تشغيل الخادم الخلفي

```bash
cd server
npm run dev
```

الخادم سيعمل على: `http://localhost:5000`

### تشغيل واجهة المستخدم

```bash
cd client
npm run dev
```

الواجهة ستعمل على: `http://localhost:5173`

## متطلبات النظام

- Node.js (v18 أو أحدث)
- MongoDB (محلي أو Atlas)

## الإعداد

1. قم بتثبيت MongoDB أو استخدم MongoDB Atlas
2. عدل ملف `server/.env` وأضف رابط MongoDB الخاص بك
3. شغل الخادم والواجهة

## API Endpoints

### المستخدمين
- `POST /api/users/register` - تسجيل مستخدم جديد
- `POST /api/users/login` - تسجيل الدخول
- `GET /api/users/profile` - الحصول على الملف الشخصي

### العملاء
- `GET /api/customers` - الحصول على جميع العملاء
- `GET /api/customers/:id` - الحصول على عميل محدد
- `POST /api/customers` - إضافة عميل جديد
- `PUT /api/customers/:id` - تحديث عميل
- `DELETE /api/customers/:id` - حذف عميل

## التقنيات المستخدمة

### الواجهة الأمامية
- React 19
- Vite
- React Router DOM
- Axios

### الواجهة الخلفية
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT للمصادقة
- Bcrypt لتشفير كلمات المرور

## الترخيص

MIT
