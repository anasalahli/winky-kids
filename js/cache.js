// ============================================
// Cache Management Module - OPTIMIZED
// ============================================

const CACHE_KEY = 'winky_products_cache';
const CACHE_TIMESTAMP_KEY = 'winky_products_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

/**
 * جلب المنتجات من الـ Cache
 * @returns {Array|null} المنتجات المحفوظة أو null إذا انتهت صلاحية الـ Cache
 */
function getCachedProducts() {
    try {
        const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        const now = Date.now();

        // التحقق من صلاحية الـ cache
        if (timestamp && (now - parseInt(timestamp)) < CACHE_DURATION) {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                console.log('✓ Loading products from cache');

                // قياس وقت فك التشفير
                const parseStart = performance.now();
                const products = JSON.parse(cached);
                const parseTime = (performance.now() - parseStart).toFixed(2);

                console.log(`  Cache parse time: ${parseTime}ms for ${products.length} products`);

                // تحذير إذا كان البطء بسبب الـ parsing
                if (parseTime > 500) {
                    console.warn(`⚠ Slow cache parsing (${parseTime}ms) - consider clearing cache`);
                }

                return products;
            }
        }

        // الـ Cache منتهي الصلاحية أو غير موجود
        return null;
    } catch (error) {
        console.warn('Cache read error:', error);
        // في حالة خطأ، مسح الـ Cache الفاسد
        clearProductCache();
        return null;
    }
}

/**
 * حفظ المنتجات في الـ Cache (مع تحسين حجم البيانات)
 * @param {Array} products المنتجات المراد حفظها
 */
function setCachedProducts(products) {
    try {
        // حفظ الحقول الأساسية فقط لتقليل الحجم
        const optimizedProducts = products.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            imageUrl: p.imageUrl || p.image_url,
            sizes: p.sizes
            // ملاحظة: created_at محذوف لتقليل الحجم
        }));

        const saveStart = performance.now();
        const jsonString = JSON.stringify(optimizedProducts);
        const sizeKB = (jsonString.length / 1024).toFixed(2);

        // التحقق من حجم البيانات قبل الحفظ
        if (jsonString.length > 4.5 * 1024 * 1024) { // 4.5 MB limit
            console.warn(`⚠ Cache too large (${sizeKB}KB), skipping cache`);
            return;
        }

        localStorage.setItem(CACHE_KEY, jsonString);
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

        const saveTime = (performance.now() - saveStart).toFixed(2);
        console.log(`✓ Cached ${products.length} products (${sizeKB}KB) in ${saveTime}ms`);

        if (saveTime > 1000) {
            console.warn(`⚠ Slow cache save (${saveTime}ms) - cache might be too large`);
        }
    } catch (error) {
        console.warn('Cache write error:', error.message);
        // في حالة امتلاء الـ localStorage، مسح الـ Cache القديم
        if (error.name === 'QuotaExceededError') {
            console.warn('⚠ localStorage full, clearing cache');
            clearProductCache();
        }
    }
}

/**
 * مسح الـ Cache يدوياً
 */
function clearProductCache() {
    try {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        console.log('✓ Cache cleared');
    } catch (error) {
        console.warn('Cache clear error:', error);
    }
}

/**
 * تحديث الـ Cache بعد إضافة أو تعديل منتج
 * هذه الدالة تُستخدم لتحديث الـ Cache فوراً دون انتظار انتهاء صلاحيته
 */
function invalidateProductCache() {
    clearProductCache();
    console.log('✓ Cache invalidated - will refresh on next load');
}

/**
 * الحصول على معلومات الـ Cache
 */
function getCacheInfo() {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (cached && timestamp) {
        const sizeKB = (cached.length / 1024).toFixed(2);
        const age = Date.now() - parseInt(timestamp);
        const ageMinutes = (age / 60000).toFixed(1);

        return {
            exists: true,
            sizeKB,
            ageMinutes,
            valid: age < CACHE_DURATION
        };
    }

    return { exists: false };
}
