-- ============================================
-- إنشاء جدول المبيعات في Supabase
-- Sales Table Creation Script
-- ============================================

-- إنشاء جدول المبيعات
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    sold_sizes JSONB NOT NULL,
    total_qty INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active',
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraint (optional - only if you want strict referencing)
    -- FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    
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
-- ملاحظات التنفيذ:
-- ============================================
-- 1. افتح لوحة تحكم Supabase
-- 2. اذهب إلى SQL Editor
-- 3. انسخ والصق هذا الكود كاملاً
-- 4. اضغط "Run" لتنفيذ الأوامر
-- 5. انتظر رسالة "Success" للتأكد من نجاح التنفيذ

-- ============================================
-- بنية البيانات:
-- ============================================
-- id: معرف فريد للبيع (timestamp)
-- product_id: معرف المنتج من جدول products
-- product_name: اسم المنتج (للسرعة)
-- sold_sizes: المقاسات المباعة بصيغة JSON
-- total_qty: إجمالي الكميات
-- amount: المبلغ الإجمالي
-- date: تاريخ ووقت البيع
-- status: حالة البيع (active أو cancelled)
-- cancelled_at: تاريخ الإلغاء (null إذا نشطة)
-- created_at: تاريخ إنشاء السجل

-- ============================================
-- مثال على البيانات:
-- ============================================
-- INSERT INTO sales (id, product_id, product_name, sold_sizes, total_qty, amount, status)
-- VALUES (
--     '1707562800000',
--     'abc123',
--     'بدلة أطفال',
--     '{"2 سنة": 2, "3 سنوات": 1}'::jsonb,
--     3,
--     750.00,
--     'active'
-- );
