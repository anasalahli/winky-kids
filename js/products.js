// ============================================
// Products Management Module - Supabase
// ============================================

/**
 * إضافة منتج جديد
 */
async function addProduct(productData) {
    try {
        const product = {
            name: productData.name,
            category: productData.category,
            gender: productData.gender,
            price: parseFloat(productData.price),
            image_url: productData.imageUrl || '',
            sizes: productData.sizes || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(collections.products)
            .insert([product])
            .select();

        if (error) throw error;

        console.log('تم إضافة المنتج بنجاح:', data[0].id);

        // إلغاء الـ Cache لضمان تحديث البيانات
        if (typeof invalidateProductCache === 'function') {
            invalidateProductCache();
        }

        return { success: true, id: data[0].id };
    } catch (error) {
        console.error('خطأ في إضافة المنتج:', error);
        return { success: false, error: error.message };
    }
}

/**
 * تعديل منتج موجود
 */
async function updateProduct(id, productData) {
    try {
        const updateData = {
            ...productData,
            updated_at: new Date().toISOString()
        };

        // تحويل السعر إلى رقم إذا كان موجوداً
        if (updateData.price) {
            updateData.price = parseFloat(updateData.price);
        }

        // تحويل imageUrl إلى image_url (snake_case)
        if (updateData.imageUrl) {
            updateData.image_url = updateData.imageUrl;
            delete updateData.imageUrl;
        }

        const { data, error } = await supabase
            .from(collections.products)
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;

        console.log('تم تحديث المنتج بنجاح:', id);

        // إلغاء الـ Cache لضمان تحديث البيانات
        if (typeof invalidateProductCache === 'function') {
            invalidateProductCache();
        }

        return { success: true };
    } catch (error) {
        console.error('خطأ في تحديث المنتج:', error);
        return { success: false, error: error.message };
    }
}

/**
 * حذف منتج
 */
async function deleteProduct(id) {
    try {
        const { error } = await supabase
            .from(collections.products)
            .delete()
            .eq('id', id);

        if (error) throw error;

        console.log('تم حذف المنتج بنجاح:', id);

        // إلغاء الـ Cache لضمان تحديث البيانات
        if (typeof invalidateProductCache === 'function') {
            invalidateProductCache();
        }

        return { success: true };
    } catch (error) {
        console.error('خطأ في حذف المنتج:', error);
        return { success: false, error: error.message };
    }
}

/**
 * جلب جميع المنتجات (نسخة محسنة مع Cache)
 * @param {boolean} useCache - استخدام الـ Cache إذا كان متاحاً
 * @param {boolean} forceRefresh - فرض تحديث البيانات حتى لو كان الـ Cache صالحاً
 * @returns {Object} نتيجة العملية مع المنتجات
 */
async function getAllProductsOptimized(useCache = true, forceRefresh = false) {
    try {
        // التحقق من الـ cache أولاً (إذا لم يكن forceRefresh)
        if (useCache && !forceRefresh) {
            const cached = getCachedProducts();
            if (cached) {
                console.log(`✓ Loaded ${cached.length} products from cache`);
                return { success: true, products: cached, fromCache: true };
            }
        }

        console.log('⏳ Fetching products from Supabase...');
        const startTime = performance.now();

        // جلب البيانات مع تحديد الحقول المطلوبة فقط
        const { data, error } = await supabase
            .from(collections.products)
            .select('id, name, category, gender, price, image_url, sizes, created_at')
            .order('created_at', { ascending: false })
            .limit(500); // حد أقصى معقول

        if (error) throw error;

        // تحويل image_url إلى imageUrl (camelCase) للتوافق مع الكود القديم
        const products = data.map(product => ({
            ...product,
            imageUrl: product.image_url
        }));

        const endTime = performance.now();
        console.log(`✓ Fetched ${products.length} products in ${(endTime - startTime).toFixed(2)}ms`);

        // حفظ في الـ cache
        setCachedProducts(products);

        return { success: true, products, fromCache: false };
    } catch (error) {
        console.error('خطأ في جلب المنتجات:', error);
        return { success: false, error: error.message, products: [] };
    }
}

/**
 * جلب جميع المنتجات (النسخة الأصلية - للتوافق مع الكود القديم)
 */
async function getAllProducts() {
    // استخدام النسخة المحسنة
    return await getAllProductsOptimized(true, false);
}

/**
 * جلب منتج واحد بواسطة ID
 */
async function getProductById(id) {
    try {
        const { data, error } = await supabase
            .from(collections.products)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        if (data) {
            // تحويل image_url إلى imageUrl
            const product = {
                ...data,
                imageUrl: data.image_url
            };

            return {
                success: true,
                product: product
            };
        } else {
            return { success: false, error: 'المنتج غير موجود' };
        }
    } catch (error) {
        console.error('خطأ في جلب المنتج:', error);
        return { success: false, error: error.message };
    }
}

/**
 * رفع صورة إلى Supabase Storage
 */
async function uploadImage(file, productId = null) {
    try {
        // تنظيف اسم الملف: إزالة المسافات والأحرف العربية والخاصة
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);

        // الحصول على امتداد الملف فقط
        const fileExt = file.name.split('.').pop().toLowerCase();

        // إنشاء اسم ملف آمن: timestamp + random + extension
        const safeName = `${timestamp}_${randomStr}.${fileExt}`;
        const filePath = safeName;

        // رفع الملف
        const { data, error } = await supabase.storage
            .from(buckets.products)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // الحصول على رابط التحميل العام
        const { data: urlData } = supabase.storage
            .from(buckets.products)
            .getPublicUrl(filePath);

        const downloadURL = urlData.publicUrl;

        console.log('تم رفع الصورة بنجاح:', downloadURL);
        return { success: true, url: downloadURL };
    } catch (error) {
        console.error('خطأ في رفع الصورة:', error);
        return { success: false, error: error.message };
    }
}

/**
 * جلب المنتجات مع الاستماع للتحديثات الفورية (Real-time)
 */
function listenToProducts(callback) {
    // جلب البيانات الأولية
    getAllProducts().then(result => {
        if (result.success) {
            callback(result.products);
        }
    });

    // الاستماع للتغييرات في الوقت الفعلي
    const subscription = supabase
        .channel('products-changes')
        .on(
            'postgres_changes',
            {
                event: '*', // INSERT, UPDATE, DELETE
                schema: 'public',
                table: collections.products
            },
            async (payload) => {
                console.log('تغيير في المنتجات:', payload);
                // إعادة جلب جميع المنتجات عند أي تغيير
                const result = await getAllProducts();
                if (result.success) {
                    callback(result.products);
                }
            }
        )
        .subscribe();

    // إرجاع دالة لإلغاء الاشتراك
    return () => {
        supabase.removeChannel(subscription);
    };
}

/**
 * فلترة المنتجات حسب الفئة
 */
async function getProductsByCategory(category) {
    try {
        const { data, error } = await supabase
            .from(collections.products)
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // تحويل image_url إلى imageUrl
        const products = data.map(product => ({
            ...product,
            imageUrl: product.image_url
        }));

        return { success: true, products };
    } catch (error) {
        console.error('خطأ في فلترة المنتجات:', error);
        return { success: false, error: error.message, products: [] };
    }
}

/**
 * التحقق من توفر منتج (أي مقاس متوفر)
 */
function isProductAvailable(product) {
    if (!product.sizes) return false;

    const allowedSizes = product.category === 'مواليد' 
        ? ['0-3 أشهر', '3-6 أشهر', '6-9 أشهر', '9-12 أشهر']
        : ['1 سنة', '2 سنة', '3 سنوات', '4 سنوات', '5 سنوات', '6 سنوات'];

    // التحقق من وجود أي مقاس مسموح بكمية أكبر من 0
    return Object.entries(product.sizes)
        .filter(([size, _]) => allowedSizes.includes(size))
        .some(([_, quantity]) => quantity > 0);
}

/**
 * جلب المقاسات المتوفرة لمنتج
 */
function getAvailableSizes(product) {
    if (!product.sizes) return [];

    const allowedSizes = product.category === 'مواليد' 
        ? ['0-3 أشهر', '3-6 أشهر', '6-9 أشهر', '9-12 أشهر']
        : ['1 سنة', '2 سنة', '3 سنوات', '4 سنوات', '5 سنوات', '6 سنوات'];

    return Object.entries(product.sizes)
        .filter(([size, quantity]) => quantity > 0 && allowedSizes.includes(size))
        .map(([size, quantity]) => ({ size, quantity }));
}

/**
 * الحصول على إجمالي الكمية لجميع المقاسات
 */
function getTotalQuantity(product) {
    if (!product.sizes) return 0;

    return Object.values(product.sizes).reduce((total, quantity) => {
        return total + (quantity || 0);
    }, 0);
}
