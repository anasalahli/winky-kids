-- ============================================
-- تحديث جدول المبيعات - أرقام تسلسلية
-- Update Sales Table - Sequential Numbers
-- ============================================

-- حذف الجدول القديم إذا كان فارغاً
-- (إذا كان فيه بيانات، لا تنفذ هذا!)
DROP TABLE IF EXISTS sales;

-- إنشاء جدول المبيعات مع أرقام تسلسلية
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    sold_sizes JSONB NOT NULL,
    total_qty INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active',
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT status_check CHECK (status IN ('active', 'cancelled'))
);

-- إنشاء Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);

-- Composite index للاستعلامات المتقدمة
CREATE INDEX IF NOT EXISTS idx_sales_status_date ON sales(status, date DESC);

-- تحليل الجدول
ANALYZE sales;

-- ============================================
-- ملاحظات مهمة:
-- ============================================
-- 1. إذا كان جدول sales فارغاً، نفذ هذا الكود كاملاً
-- 2. إذا كان فيه بيانات، أخبرني وسأعطيك كود مختلف
-- 3. SERIAL يبدأ تلقائياً من 1 ويزيد تلقائياً
-- 4. الأرقام ستكون: 1, 2, 3, 4, 5...

-- ============================================
-- كيفية التنفيذ:
-- ============================================
-- 1. افتح Supabase SQL Editor
-- 2. انسخ والصق هذا الكود
-- 3. اضغط RUN
-- 4. انتظر Success
