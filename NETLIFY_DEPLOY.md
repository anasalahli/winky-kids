# 🚀 نشر الموقع على Netlify

دليل شامل لنشر مشروع Winky Kids على Netlify.

---

## المتطلبات

- ✅ حساب GitHub
- ✅ الكود محدّث على GitHub repository
- ✅ Supabase معدّ وجاهز

---

## الخطوة 1: رفع الكود إلى GitHub

### 1.1 - إنشاء Repository

1. اذهب إلى: **https://github.com**
2. اضغط **"New repository"** (أو **"+"** في الأعلى → **"New repository"**)
3. املأ المعلومات:
   - **Repository name**: `kids-store-inventory`
   - **Description**: `نظام إدارة مخزون متجر ملابس الأطفال`
   - **Public** أو **Private** (حسب رغبتك)
   - **لا** تفعّل "Add README" أو `.gitignore`
4. اضغط **"Create repository"**

### 1.2 - رفع الملفات

افتح Terminal/Command Prompt في مجلد المشروع ونفذ:

```bash
# تهيئة Git
git init

# إضافة جميع الملفات
git add .

# أول commit
git commit -m "Migrate to Supabase + Netlify ready"

# تغيير اسم الفرع لـ main
git branch -M main

# ربط بـ GitHub (استبدل YOUR_USERNAME باسم المستخدم)
git remote add origin https://github.com/YOUR_USERNAME/kids-store-inventory.git

# رفع الكود
git push -u origin main
```

**ملاحظة**: إذا طُلب منك تسجيل الدخول، استخدم حساب GitHub.

---

## الخطوة 2: إنشاء حساب Netlify

1. اذهب إلى: **https://netlify.com**
2. اضغط **"Sign up"**
3. اختر **"Sign up with GitHub"** (موصى به)
4. وافق على الأذونات

---

## الخطوة 3: نشر الموقع

### 3.1 - استيراد المشروع

1. من لوحة تحكم Netlify، اضغط **"Add new site"** → **"Import an existing project"**
2. اختر **"Deploy with GitHub"**
3. وافق على الأذونات إذا طُلب منك
4. اختر repository: **`kids-store-inventory`**

### 3.2 - تكوين Build Settings

في صفحة "Site settings for deploy":

- **Branch to deploy**: `main`
- **Build command**: اتركه **فارغاً** (موقع static)
- **Publish directory**: `.` أو `/` أو اتركه فارغاً

اضغط **"Deploy site"**

---

## الخطوة 4: انتظار النشر

1. سترى شاشة "Site deploy in progress"
2. انتظر 30-60 ثانية
3. عند الانتهاء، سترى "![](public)" بجانب رابط الموقع
4. اضغط على الرابط لفتح الموقع (مثلاً: `https://random-name-123.netlify.app`)

---

## الخطوة 5: تخصيص اسم الموقع (اختياري)

### 5.1 - تغيير Subdomain

1. من لوحة تحكم Netlify → **"Site settings"**
2. اضغط **"Change site name"**
3. أدخل اسم جديد (مثلاً: `winky-kids-store`)
4. الآن الموقع سيكون: `https://winky-kids-store.netlify.app`

### 5.2 - إضافة Custom Domain (اختياري)

إذا كان لديك domain خاص:

1. **Domain settings** → **"Add custom domain"**
2. أدخل الـ domain (مثلاً: `winkykids.com`)
3. اتبع التعليمات لتوجيه DNS

---

## الخطوة 6: استخدام Environment Variables (للأمان)

### لماذا؟
حالياً، مفاتيح Supabase موجودة في `supabase-config.js` وهذا يعني أي شخص يمكنه رؤيتها. لكن لا تقلق! **Supabase آمن** بفضل RLS.

### للأمان الإضافي (اختياري):

1. في Netlify → **Site settings** → **Environment variables**
2. أضف:
   - `SUPABASE_URL` = `https://xxxxx.supabase.co`
   - `SUPABASE_ANON_KEY` = `المفتاح الطويل`
3. في `supabase-config.js`:
```javascript
const SUPABASE_URL = window.location.hostname === 'localhost' 
    ? 'https://xxxxx.supabase.co' 
    : import.meta.env.SUPABASE_URL || 'https://xxxxx.supabase.co';
```

**ملاحظة**: لمواقع Static، Environment Variables ليست ضرورية جداً لأن Supabase Row Level Security يحمي البيانات.

---

## الخطوة 7: التحديثات التلقائية

الآن، **كل مرة** تعمل `git push` إلى GitHub:
- Netlify سينشر التحديثات **تلقائياً**
- ستكون التحديثات جاهزة خلال دقيقة

### كيفية التحديث:

```bash
git add .
git commit -m "وصف التحديث"
git push
```

---

## ✅ اختبار الموقع المنشور

### 1. اختبر الصفحة الرئيسية
- افتح الرابط: `https://your-site-name.netlify.app`
- يجب أن تظهر المنتجات (إذا أضفت منتجات في Supabase)

### 2. اختبر تسجيل الدخول
- اذهب إلى `/admin-login.html`
- سجل الدخول بحساب Admin
- يجب أن تدخل لوحة التحكم

### 3. اختبر إضافة منتج
- أضف منتج مع صورة
- تحقق من ظهوره في الموقع

---

## 🎉 تم النشر بنجاح!

موقعك الآن جاهز ومتاح على الإنترنت! 🚀

---

## 📊 ميزات Netlify الإضافية

### 1. Analytics (اختياري - مدفوع)
- تتبع الزوار والتحليلات

### 2. Forms (مجاني)
- يمكنك إضافة نماذج اتصال

### 3. SSL Certificate
- HTTPS ممكّن تلقائياً ✅

### 4. Continuous Deployment
- التحديثات التلقائية من GitHub ✅

---

## 🆘 استكشاف الأخطاء

### الموقع لا يعمل بعد النشر
- افتح Console (F12) → تحقق من الأخطاء
- تأكد من تحديث `supabase-config.js` بمفاتيح صحيحة

### الصور لا تظهر
- تحقق من paths النسبية في الكود
- تأكد من وجود مجلد `assets/images`

### "404 Not Found" عند التنقل
- هذا طبيعي لمواقع static
- في Netlify → **Site settings** → **Redirects and rewrites**
- أضف rewrite rule إذا كنت تستخدم routing

---

## 🔒 نصائح الأمان

1. ✅ استخدم RLS في Supabase (موجود بالفعل)
2. ✅ لا تشارك `service_role` key أبداً
3. ✅ `anon key` آمن للاستخدام في Frontend
4. ✅ راجع Policies بانتظام
5. ✅ فعّل Email Confirmations في Supabase Auth (للإنتاج)

---

## 📞 الدعم

إذا واجهتك أي مشكلة:
- تحقق من Netlify Deploy logs
- تحقق من Supabase logs
- تحقق من Browser Console (F12)
