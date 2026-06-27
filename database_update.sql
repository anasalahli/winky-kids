-- ============================================
-- تحديث قاعدة بيانات Winky Kids
-- Database Update Script: Category & Sales Fix
-- ============================================

-- 1. إضافة عمود الجنس لجدول المنتجات (إذا لم يكن موجوداً)
ALTER TABLE products ADD COLUMN IF NOT EXISTS gender TEXT;

-- 2. تمكين RLS لجدول المبيعات
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- 3. حذف السياسات القديمة لجدول المبيعات لتجنب التكرار
DROP POLICY IF EXISTS "Enable read access for all users" ON sales;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON sales;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON sales;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON sales;

-- 4. إنشاء سياسات الوصول لجدول المبيعات
-- السماح لجميع المستخدمين بقراءة المبيعات (أو المترجمين، ولكن لجعلها سهلة ومتوافقة مع قراءة الإحصائيات)
CREATE POLICY "Enable read access for all users" 
ON sales FOR SELECT 
USING (true);

-- السماح للمشرفين المسجلين فقط بتسجيل بيع جديد
CREATE POLICY "Enable insert for authenticated users" 
ON sales FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- السماح للمشرفين المسجلين فقط بتعديل المبيعات (مثل إلغاء الطلبية وتغيير حالتها)
CREATE POLICY "Enable update for authenticated users" 
ON sales FOR UPDATE 
TO authenticated 
USING (true);

-- السماح للمشرفين المسجلين فقط بحذف المبيعات
CREATE POLICY "Enable delete for authenticated users" 
ON sales FOR DELETE 
TO authenticated 
USING (true);

-- تحليل الجداول لتحديث الأداء
ANALYZE products;
ANALYZE sales;

-- ============================================
-- 3. Data Migration (تنظيف البيانات السابقة)
-- ============================================

-- نقل قيم "أولاد" و "بنات" من عمود الفئة القديم إلى عمود الجنس الجديد
UPDATE products 
SET gender = category 
WHERE category IN ('أولاد', 'بنات') AND (gender IS NULL OR gender = '');

-- تحويل الفئة لجميع المنتجات القديمة إلى "أطفال"
UPDATE products 
SET category = 'أطفال' 
WHERE category IN ('أولاد', 'بنات');
