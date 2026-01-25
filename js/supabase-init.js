// ============================================
// Supabase Configuration & Initialization
// ============================================

const SUPABASE_URL = 'https://inuloqvftdxhpfajkxjb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludWxvcXZmdGR4aHBmYWpreGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNTUxMDYsImV4cCI6MjA4NDgzMTEwNn0.dfWaoAlrZZ9EuVH02jr5IPLYLrnAhNhSij4QGG8fw-E';

// تهيئة Supabase Client - استخدام var لتجنب مشاكل التعريف المكرر
// var يسمح بإعادة التعريف دون أخطاء
var supabase;

if (!window.supabaseClient) {
    // التحقق من تحميل مكتبة Supabase
    if (typeof window.supabase === 'undefined') {
        console.error('❌ مكتبة Supabase غير محملة! تأكد من تحميل السكريبت أولاً');
    } else {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        supabase = window.supabaseClient;
        console.log('✓ Supabase initialized successfully');
    }
} else {
    supabase = window.supabaseClient;
}

// مجموعات (Tables)
const collections = {
    products: 'products'
};

// Storage buckets
const buckets = {
    products: 'products'
};
