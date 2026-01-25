# 🚀 دليل إعداد Supabase خطوة بخطوة

هذا دليل شامل لإعداد Supabase لمشروع Winky Kids.

---

## 📌 الخطوة 1: إنشاء حساب Supabase

1. اذهب إلى: **https://supabase.com**
2. اضغط **"Start your project"**
3. سجل الدخول باستخدام:
   - GitHub (موصى به) أو
   - Email

---

## 📌 الخطوة 2: إنشاء مشروع جديد

1. بعد تسجيل الدخول، اضغط **"New Project"**
2. اختر **Organization** (أو أنشئ واحد جديد باسم "Kids Store")
3. املأ تفاصيل المشروع:
   - **Name**: `kids-store-inventory`
   - **Database Password**: اختر كلمة مرور قوية **واحفظها!** ⚠️
   - **Region**: اختر الأقرب لك (مثلاً: `Europe (Frankfurt)`)
   - **Pricing Plan**: اترك "Free" محددة
4. اضغط **"Create new project"**
5. انتظر 1-2 دقيقة حتى يكتمل إعداد المشروع

---

## 📌 الخطوة 3: إنشاء جدول المنتجات (Products Table)

### 3.1 - إنشاء الجدول

1. من القائمة الجانبية اليسرى → اضغط **"Table Editor"**
2. اضغط **"Create a new table"**
3. املأ المعلومات:
   - **Name**: `products`
   - ✅ تأكد من تفعيل **"Enable Row Level Security (RLS)"**
4. **لا تضغط Save بعد!** - كمل الخطوة التالية أولاً

### 3.2 - إضافة الأعمدة (Columns)

احذف الأعمدة الافتراضية وأضف هذه الأعمدة:

| Column Name | Type | Default Value | Primary |  Nullable | 
|------------|------|---------------|---------|-----------|
| `id` | `uuid` | `gen_random_uuid()` | ✅ Yes | ❌ No |
| `name` | `text` | - | ❌ No | ❌ No |
| `category` | `text` | - | ❌ No | ❌ No |
| `price` | `numeric` | - | ❌ No | ❌ No |
| `image_url` | `text` | - | ❌ No | ✅ Yes |
| `sizes` | `jsonb` | `'{}'::jsonb` | ❌ No | ❌ No |
| `created_at` | `timestamptz` | `now()` | ❌ No | ❌ No |
| `updated_at` | `timestamptz` | `now()` | ❌ No | ❌ No |

5. اضغط **"Save"**

---

## 📌 الخطوة 4: إعداد Row Level Security (RLS) Policies

### 4.1 - الذهاب إلى Policies

1. في صفحة الجدول `products`، اضغط على تبويب **"Policies"** (في الأعلى)
2. أو اذهب من القائمة → **Authentication** → **Policies**
3. اختر جدول `products`

### 4.2 - إضافة Policies

#### Policy 1: القراءة للجميع

اضغط **"New Policy"** → **"Create a policy"**:

```sql
Policy Name: Enable read access for all users
Operation: SELECT
Policy Definition: true
```

أو استخدم SQL مباشرة:
```sql
CREATE POLICY "Enable read access for all users" 
ON products FOR SELECT 
USING (true);
```

#### Policy 2: الإضافة للمستخدمين المسجلين

```sql
CREATE POLICY "Enable insert for authenticated users" 
ON products FOR INSERT 
TO authenticated 
WITH CHECK (true);
```

#### Policy 3: التحديث للمستخدمين المسجلين

```sql
CREATE POLICY "Enable update for authenticated users" 
ON products FOR UPDATE 
TO authenticated 
USING (true);
```

#### Policy 4: الحذف للمستخدمين المسجلين

```sql
CREATE POLICY "Enable delete for authenticated users" 
ON products FOR DELETE 
TO authenticated 
USING (true);
```

---

## 📌 الخطوة 5: إعداد Storage للصور

### 5.1 - إنشاء Bucket

1. من القائمة الجانبية → اضغط **"Storage"**
2. اضغط **"Create a new bucket"**
3. املأ المعلومات:
   - **Name**: `products`
   - **Public bucket**: ✅ نعم (حتى يمكن للجميع رؤية الصور)
   - **File size limit**: اتركها كما هي (50MB)
4. اضغط **"Create bucket"**

### 5.2 - إعداد Storage Policies

1. اضغط على bucket **"products"**
2. اضغط **"Policies"** (في الأعلى)
3. اضغط **"New Policy"**

#### Policy 1: القراءة للجميع

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );
```

#### Policy 2: الرفع للمستخدمين المسجلين

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'products' );
```

#### Policy 3: الحذف للمستخدمين المسجلين

```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'products' );
```

---

## 📌 الخطوة 6: إنشاء مستخدم Admin

1. من القائمة الجانبية → **Authentication** → **Users**
2. اضغط **"Add user"** → **"Create new user"**
3. املأ المعلومات:
   - **Email**: `admin@kids-store.com` (أو أي بريد تريده)
   - **Password**: اختر كلمة مرور قوية **واحفظها!**
   - ✅ **Auto Confirm User**: فعّل هذا الخيار
4. اضغط **"Create user"**

---

## 📌 الخطوة 7: نسخ مفاتيح API

1. اذهب إلى **Settings** → **API** (من القائمة الجانبية)
2. في قسم **"Project API keys"**، ستجد:
   - **Project URL**: انسخه (مثلاً: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key: انسخه (مفتاح طويل جداً)
3. **احفظهم في مكان آمن!**

---

## 📌 الخطوة 8: تحديث الكود

1. افتح ملف: `js/supabase-config.js`
2. استبدل القيم التالية:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // ضع URL الذي نسخته
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ضع المفتاح الذي نسخته
```

3. **مثال**:
```javascript
const SUPABASE_URL = 'https://abcdefghijk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // المفتاح الطويل
```

---

## ✅ اختبار الإعداد

### اختبار محلي

1. افتح `index.html` في المتصفح
2. افتح **Console** (F12)
3. يجب أن ترى: `Supabase initialized successfully ✓`
4. إذا رأيت خطأ، تحقق من:
   - صحةنسخ URL والمفتاح
   - عدم وجود مسافات إضافية
   - التأكد من نسخ المفتاح الكامل

### اختبار تسجيل الدخول

1. اذهب إلى `admin-login.html`
2. سجل الدخول بالبريد وكلمة المرور التي أنشأتها في الخطوة 6
3. يجب أن تنتقل إلى لوحة التحكم

### اختبار إضافة منتج

1. في لوحة التحكم، أضف منتج تجريبي
2. ارفع صورة
3. يجب أن يظهر المنتج في الجدول
4. اذهب إلى `index.html` وتأكد من ظهور المنتج

---

## 🎉 تم الإعداد بنجاح!

الآن أنت جاهز للخطوة التالية: **النشر على Netlify**

---

## ⚠️ ملاحظات مهمة

1. **احفظ كلمة مرور قاعدة البيانات** - ستحتاجها لاحقاً
2. **لا تشارك المفتاح العام (Anon Key)** على GitHub بشكل علني
3. **النظام آمن** - RLS يحمي البيانات حتى لو تم تسريب المفتاح
4. **الخطة المجانية كافية** لآلاف المنتجات والزوار

---

## 🆘 استكشاف الأخطاء

### خطأ: "Invalid API key"
- تأكد من نسخ المفتاح الكامل بدون مسافات
- استخدم مفتاح `anon/public` وليس `service_role`

### خطأ: "Row Level Security"
- تأكد من إضافة جميع الـ Policies الأربعة
- تأكد من تفعيل RLS على الجدول

### الصور لا تظهر
- تأكد أن bucket اسمه `products` بالضبط
- تأكد أن Public bucket مفعّل
- تأكد من إضافة Storage Policies

### لا أستطيع تسجيل الدخول
- تأكد من تفعيل "Auto Confirm User" عند إنشاء المستخدم
- أو اذهب إلى **Authentication** → **Users** وفعّل المستخدم يدوياً
