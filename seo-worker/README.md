# موقع SEO مع لوحة تحكم - Cloudflare Workers

موقع إلكتروني متكامل يركز على تحسين محركات البحث (SEO) مع لوحة تحكم خاصة لإدارة المحتوى، مصمم للعمل على منصة Cloudflare Workers.

## المميزات

- ✅ **واجهة عربية متجاوبة** - تصميم عصري يدعم اللغة العربية
- ✅ **لوحة تحكم آمنة** - إدارة كاملة للمحتوى
- ✅ **تحسينات SEO متقدمة** - وسوم Meta و Open Graph مخصصة لكل صفحة
- ✅ **نظام إدارة محتوى** - إضافة/تعديل/حذف الصفحات بسهولة
- ✅ **أداء فائق السرعة** - يعمل على شبكة Cloudflare العالمية
- ✅ **مجاني بالكامل** - لا يحتاج لقواعد بيانات خارجية

## المتطلبات

1. حساب Cloudflare (مجاني)
2. Node.js مثبت على جهازك

## خطوات الإعداد والنشر

### 1. تثبيت المشروع

```bash
cd seo-worker
npm install
```

### 2. إنشاء KV Namespace

قم بتسجيل الدخول إلى Cloudflare:

```bash
npx wrangler login
```

أنشئ مساحة تخزين KV:

```bash
npx wrangler kv namespace create "SEO_DATA"
```

سيظهر لك ناتج يشبه:
```
✨ Success! Created namespace "SEO_DATA" with id "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 3. تحديث ملف wrangler.toml

افتح ملف `wrangler.toml` واستبدل القيم التالية:

```toml
[[kv_namespaces]]
binding = "SEO_DATA"
id = "YOUR_KV_NAMESPACE_ID"              # ضع هنا ID من الخطوة السابقة
preview_id = "YOUR_PREVIEW_KV_NAMESPACE_ID"  # ضع نفس ID للتجربة
```

### 4. تغيير بيانات الدخول (مهم!)

في ملف `wrangler.toml`، غيّر كلمة المرور الافتراضية:

```toml
[vars]
ADMIN_USERNAME = "admin"           # غيّر اسم المستخدم
ADMIN_PASSWORD = "كلمة_مرور_قوية"   # غيّر كلمة المرور فوراً!
SITE_NAME = "اسم موقعك"
```

### 5. تشغيل الموقع محلياً (للتجربة)

```bash
npm run dev
```

افتح المتصفح على: http://localhost:8787

### 6. نشر الموقع على Cloudflare

```bash
npm run deploy
```

سيظهر لك رابط الموقع المنشور، مثلاً:
```
https://seo-worker.your-subdomain.workers.dev
```

## استخدام لوحة التحكم

1. اذهب إلى: `https://your-domain.workers.dev/admin`
2. سجّل الدخول باستخدام البيانات التي حددتها في `wrangler.toml`
3. من لوحة التحكم يمكنك:
   - 📊 عرض إحصائيات الموقع
   - ➕ إضافة صفحات جديدة محسّنة لـ SEO
   - 📝 تعديل الصفحات الموجودة
   - 🗑️ حذف الصفحات غير المرغوبة

## هيكل الصفحات المحسّنة لـ SEO

كل صفحة تحتوي على:
- **عنوان الصفحة** (Title Tag)
- **وصف الميتا** (Meta Description) - يظهر في نتائج بحث جوجل
- **الكلمات المفتاحية** (Meta Keywords)
- **رابط مخصص** (Slug) - URL صديق لمحركات البحث
- **صورة Open Graph** - للمشاركة على وسائل التواصل
- **المحتوى الرئيسي** - منسق بشكل مناسب

## أمثلة على استخدام API

يمكنك أيضاً استخدام API مباشرة:

```bash
# الحصول على جميع الصفحات
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-domain.workers.dev/api/pages

# إضافة صفحة جديدة
curl -X POST https://your-domain.workers.dev/api/pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "دليل SEO 2024",
    "slug": "seo-guide-2024",
    "metaDescription": "دليل شامل لتحسين محركات البحث",
    "metaKeywords": "SEO, جوجل, ترتيب",
    "content": "محتوى الصفحة..."
  }'
```

## نصائح لتحسين SEO

1. **استخدم كلمات مفتاحية ذات صلة** في العنوان والوصف
2. **اجعل وصف الميتا بين 150-160 حرفاً**
3. **اكتب محتوى أصلياً وقيّماً** للقراء
4. **استخدم عناوين فرعية** (H1, H2, H3)
5. **أضف صوراً مع نصوص بديلة** (Alt Text)
6. **أنشئ روابط داخلية** بين صفحات موقعك

## الأمان

- 🔐 توثيق باستخدام الرموز (Token-based authentication)
- 🔒 جلسات تنتهي بعد 24 ساعة
- ⚠️ **مهم**: غيّر كلمة المرور الافتراضية قبل النشر!

## الترخيص

MIT License - حر للاستخدام الشخصي والتجاري

## الدعم

إذا واجهت أي مشكلة، افتح Issue على GitHub أو تواصل مع فريق الدعم.

---

**صنع بحب ❤️ لتحسين محركات البحث**
