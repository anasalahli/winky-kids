# 👶 Winky Kids - نظام إدارة المخزون

موقع ويب حديث وسريع لإدارة مخزون متجر ملابس الأطفال باستخدام **Supabase** و **Netlify**.

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site)

---

## ✨ المميزات

### للزبائن (واجهة العملاء)
- 🛍️ عرض جميع المنتجات المتوفرة بتصميم عصري وجذاب
- 🔍 بحث ذكي بالاسم
- 📂 فلترة حسب الفئة (بدل، فساتين، قمصان، إلخ)
- 📏 فلترة حسب المقاس (XS, S, M, L, XL, XXL)
- 📱 تصميم responsive يعمل على جميع الأجهزة
- ⚡ سرعة فائقة وتجربة مستخدم سلسة
- 🚫 إخفاء تلقائي للمنتجات غير المتوفرة

### للمشرف (لوحة التحكم)
- ➕ إضافة منتجات جديدة بسهولة
- ✏️ تعديل المنتجات الموجودة
- 🗑️ حذف المنتجات
- 📷 رفع الصور مباشرة إلى Supabase Storage
- 📊 تتبع المقاسات بشكل منفصل لكل منتج
- 🔐 حماية كاملة بنظام المصادقة
- 🔄 تحديثات فورية (Real-time)

---

## 🛠️ التقنيات المستخدمة

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: [Supabase](https://supabase.com) (PostgreSQL + Storage + Auth) 
- **Hosting**: [Netlify](https://netlify.com)
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth

---

## 🚀 البدء السريع

### المتطلبات

- متصفح ويب حديث (Chrome, Firefox, Safari, Edge)
- حساب [Supabase](https://supabase.com) مجاني - **لا يحتاج بطاقة ائتمان!**
- حساب [GitHub](https://github.com) (للنشر على Netlify)

### خطوات الإعداد

#### 1️⃣ استنساخ المشروع

```bash
git clone https://github.com/YOUR_USERNAME/kids-store-inventory.git
cd kids-store-inventory
```

#### 2️⃣ إعداد Supabase

اتبع الدليل الشامل في: **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)**

الخطوات الرئيسية:
1. إنشاء حساب ومشروع Supabase
2. إنشاء جدول `products`
3. إعداد Row Level Security (RLS) Policies
4. إنشاء Storage bucket للصور
5. إنشاء مستخدم Admin
6. نسخ مفاتيح API

#### 3️⃣ تحديث المفاتيح

افتح `js/supabase-config.js` وحدّث:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';
```

#### 4️⃣ تشغيل محلياً

استخدم أي من الطرق التالية:

**VS Code Live Server** (موصى به):
```
1. ثبت إضافة "Live Server"
2. اضغط بزر الماوس الأيمن على index.html
3. اختر "Open with Live Server"
```

**Python**:
```bash
python -m http.server 8000
# ثم افتح http://localhost:8000
```

**Node.js**:
```bash
npx http-server -p 8000
# ثم افتح http://localhost:8000
```

#### 5️⃣ النشر على Netlify

اتبع الدليل الشامل في: **[NETLIFY_DEPLOY.md](NETLIFY_DEPLOY.md)**

---

## 📁 هيكل المشروع

```
kids-store-inventory/
├── index.html                # الصفحة الرئيسية (واجهة الزبائن)
├── product.html              # صفحة تفاصيل المنتج
├── admin-login.html          # صفحة تسجيل دخول المشرف
├── admin-dashboard.html      # لوحة تحكم المشرف
├── css/
│   ├── main.css             # الأنماط الأساسية
│   ├── customer.css         # أنماط واجهة الزبائن
│   └── admin.css            # أنماط لوحة التحكم
├── js/
│   ├── supabase-config.js   # إعدادات Supabase
│   ├── auth.js              # نظام المصادقة
│   ├── products.js          # إدارة المنتجات والصور
│   ├── customer.js          # واجهة العملاء
│   └── admin.js             # لوحة التحكم
├── assets/
│   └── images/
│       └── placeholder.jpg  # صورة افتراضية
├── SUPABASE_SETUP.md        # دليل إعداد Supabase
├── NETLIFY_DEPLOY.md        # دليل النشر على Netlify
└── README.md
```

---

## 💡 كيفية الاستخدام

### كمشرف (Admin)

1. اذهب إلى: `https://your-site.netlify.app/admin-login.html`
2. سجل الدخول بالحساب الذي أنشأته في Supabase
3. من لوحة التحكم:
   - ➕ **إضافة منتج**: املأ النموذج على اليسار
   - 📷 **صورة**: اضغط على منطقة رفع الصورة
   - ✏️ **تعديل**: اضغط أيقونة القلم في الجدول
   - 🗑️ **حذف**: اضغط أيقونة سلة المهملات

### كزبون (Customer)

1. اذهب إلى: `https://your-site.netlify.app`
2. تصفح المنتجات المتوفرة
3. استخدم الفلاتر:
   - 🔍 **البحث**: للبحث بالاسم
   - 📂 **الفئة**: لعرض فئة معينة
   - 📏 **المقاس**: لعرض المنتجات بمقاس معين
4. اضغط على "عرض التفاصيل" لرؤية المقاسات المتوفرة

---

## 🎨 هيكل بيانات المنتج

كل منتج في Supabase يحتوي على:

```javascript
{
  id: "uuid",                    // معرّف فريد
  name: "بدلة رسمية للأطفال",
  category: "بدل",
  price: 250,
  image_url: "https://...",
  sizes: {
    "XS": 5,   // 5 قطع متوفرة
    "S": 10,
    "M": 15,
    "L": 0,    // غير متوفر
    "XL": 2
  },
  created_at: "2026-01-24T...",
  updated_at: "2026-01-24T..."
}
```

---

## 🔒 الأمان

- ✅ **Row Level Security (RLS)** مفعّل على جميع الجداول
- ✅ القراءة مسموحة للجميع، الكتابة للمسجلين فقط
- ✅ المفتاح العام (`anon key`) آمن للاستخدام في Frontend
- ✅ Supabase يحمي البيانات تلقائياً
- ✅ HTTPS ممكّن تلقائياً على Netlify

---

## 📊 الحدود المجانية

### Supabase (Free Plan)
- ✅ قاعدة بيانات PostgreSQL (500 MB)
- ✅ Storage (1 GB)
- ✅ Bandwidth (2 GB شهرياً)
- ✅ **كافٍ لآلاف المنتجات والزوار**

### Netlify (Free Plan)
- ✅ 100 GB Bandwidth شهرياً
- ✅ Continuous Deployment من GitHub
- ✅ SSL Certificate تلقائي
- ✅ **كافٍ لمعظم المتاجر الصغيرة والمتوسطة**

---

## 🆘 استكشاف الأخطاء

### المنتجات لا تظهر
- تحقق من إعدادات Supabase في `supabase-config.js`
- افتح Console (F12) → تحقق من الأخطاء
- تأكد من RLS Policies صحيحة

### لا أستطيع تسجيل الدخول
- تأكد من إنشاء مستخدم في Supabase Auth
- تأكد من تفعيل "Auto Confirm User"

### الصور لا تُرفع
- تأكد من إنشاء Storage bucket باسم `products`
- تحقق من Storage Policies
- تأكد أن الـ bucket عام (Public)

**لمزيد من الحلول**: راجع [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

---

## 🔄 التحديثات

### تحديث الكود

```bash
git add .
git commit -m "وصف التحديث"
git push
```

Netlify سينشر التحديثات **تلقائياً** خلال دقيقة!

---

## 📞 المساهمة

المساهمات مرحب بها! لا تتردد في:
- فتح Issue للإبلاغ عن أخطاء
- عمل Pull Request لإضافة ميزات جديدة

---

## 📄 الترخيص

هذا المشروع مجاني للاستخدام الشخصي والتجاري.

---

## 🙏 شكر خاص

- [Supabase](https://supabase.com) - Backend-as-a-Service رائع ومجاني
- [Netlify](https://netlify.com) - استضافة سريعة ومجانية
- المجتمع المفتوح المصدر ❤️

---

**تم البناء بـ ❤️ باستخدام HTML, CSS, JavaScript, Supabase & Netlify**

---

## 🔗 روابط مفيدة

- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
