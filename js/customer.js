// ============================================
// Customer View Module
// ============================================

let allProducts = [];
let filteredProducts = [];
let currentFilters = {
    category: 'all',
    size: 'all',
    search: ''
};

/**
 * تحميل وعرض المنتجات للزبائن
 */
async function loadCustomerProducts() {
    try {
        // عرض حالة التحميل
        showLoadingState();

        // استخدام الدالة المحسنة مع الـ Cache
        const result = await getAllProductsOptimized(true, false);

        if (result.success) {
            // عرض رسالة في Console للتتبع
            if (result.fromCache) {
                console.log('⚡ Products loaded from cache (instant)');
            } else {
                console.log('🔄 Products loaded from database');
            }

            // ترتيب المنتجات: المتوفرة أولاً، ثم غير المتوفرة
            allProducts = result.products.sort((a, b) => {
                const aAvailable = isProductAvailable(a);
                const bAvailable = isProductAvailable(b);

                // المنتجات المتوفرة أولاً
                if (aAvailable && !bAvailable) return -1;
                if (!aAvailable && bAvailable) return 1;
                return 0;
            });

            filteredProducts = [...allProducts];
            displayProducts();
            populateFilters();
            updateResultsCount();
        } else {
            showError('حدث خطأ في تحميل المنتجات');
        }
    } catch (error) {
        console.error('خطأ في تحميل المنتجات:', error);
        showError('حدث خطأ في تحميل المنتجات');
    }
}

/**
 * عرض حالة التحميل
 */
function showLoadingState() {
    const container = document.getElementById('products-grid');
    if (container) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <div class="spinner"></div>
                <p style="margin-top: 1rem; color: var(--text-secondary);">جاري تحميل المنتجات...</p>
            </div>
        `;
    }

    const countElement = document.getElementById('results-count');
    if (countElement) {
        countElement.textContent = 'جاري التحميل...';
    }
}

/**
 * عرض المنتجات في الشبكة
 */
function displayProducts(products = filteredProducts) {
    const container = document.getElementById('products-grid');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <i class="icon">📦</i>
                <h3>لا توجد منتجات متوفرة</h3>
                <p>لا توجد منتجات تطابق معايير البحث</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => createProductCard(product)).join('');
}

/**
 * إنشاء بطاقة منتج
 */
function createProductCard(product) {
    const availableSizes = getAvailableSizes(product);
    const isAvailable = availableSizes.length > 0;
    const sizesText = availableSizes.map(s => s.size).join(', ') || 'غير متوفر';

    return `
        <div class="product-card ${!isAvailable ? 'out-of-stock' : ''}" onclick="viewProductDetails('${product.id}')">
            <div class="product-image">
                <img src="${product.imageUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f4a582%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2220%22 font-family=%22Cairo%22%3E📷%3C/text%3E%3C/svg%3E'}" 
                     alt="${product.name}"
                     loading="lazy"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f4a582%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E'">
                ${isAvailable ? '<span class="badge-available">متوفر</span>' : '<span class="badge-unavailable">غير متوفر</span>'}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <div class="product-sizes">
                    <span class="sizes-label">المقاسات المتوفرة:</span>
                    <span class="sizes-list">${sizesText}</span>
                </div>
                <div class="product-footer">
                    <span class="product-price">${product.price} دينار</span>
                    <button class="btn-view" onclick="event.stopPropagation(); viewProductDetails('${product.id}')">
                        عرض التفاصيل
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * عرض تفاصيل منتج
 */
function viewProductDetails(productId) {
    window.location.href = `product.html?id=${productId}`;
}

/**
 * تطبيق الفلاتر
 */
function applyFilters() {
    filteredProducts = allProducts.filter(product => {
        // فلتر الفئة
        if (currentFilters.category !== 'all' && product.category !== currentFilters.category) {
            return false;
        }

        // فلتر المقاس
        if (currentFilters.size !== 'all') {
            const availableSizes = getAvailableSizes(product);
            if (!availableSizes.some(s => s.size === currentFilters.size)) {
                return false;
            }
        }

        // فلتر البحث
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            return product.name.toLowerCase().includes(searchLower);
        }

        return true;
    });

    displayProducts();
    updateResultsCount();
}

/**
 * فلترة حسب الفئة
 */
function filterByCategory(category) {
    currentFilters.category = category;
    applyFilters();

    // تحديث UI الفلاتر
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
}

/**
 * فلترة حسب المقاس
 */
function filterBySize(size) {
    currentFilters.size = size;
    applyFilters();

    // تحديث UI الفلاتر
    document.querySelectorAll('.size-filter').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === size);
    });
}

/**
 * البحث بالاسم
 */
function searchProducts(query) {
    currentFilters.search = query;
    applyFilters();
}

/**
 * إعادة تعيين الفلاتر
 */
function resetFilters() {
    currentFilters = {
        category: 'all',
        size: 'all',
        search: ''
    };

    // إعادة تعيين UI
    document.querySelectorAll('.category-filter, .size-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('[data-category="all"], [data-size="all"]').forEach(btn => {
        btn.classList.add('active');
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    applyFilters();
}

/**
 * ملء خيارات الفلاتر من المنتجات المتاحة
 */
function populateFilters() {
    // جمع جميع الفئات الفريدة
    const categories = [...new Set(allProducts.map(p => p.category))];

    // جمع جميع المقاسات الفريدة
    const sizes = new Set();
    allProducts.forEach(product => {
        if (product.sizes) {
            Object.keys(product.sizes).forEach(size => sizes.add(size));
        }
    });

    // تحديث UI الفئات
    const categoryContainer = document.getElementById('category-filters');
    if (categoryContainer) {
        categoryContainer.innerHTML = `
            <button class="category-filter active" data-category="all" onclick="filterByCategory('all')">
                الكل
            </button>
            ${categories.map(cat => `
                <button class="category-filter" data-category="${cat}" onclick="filterByCategory('${cat}')">
                    ${cat}
                </button>
            `).join('')}
        `;
    }

    // تحديث UI المقاسات
    const sizeContainer = document.getElementById('size-filters');
    if (sizeContainer) {
        sizeContainer.innerHTML = `
            <button class="size-filter active" data-size="all" onclick="filterBySize('all')">
                الكل
            </button>
            ${Array.from(sizes).map(size => `
                <button class="size-filter" data-size="${size}" onclick="filterBySize('${size}')">
                    ${size}
                </button>
            `).join('')}
        `;
    }
}

/**
 * تحديث عدد النتائج
 */
function updateResultsCount() {
    const countElement = document.getElementById('results-count');
    if (countElement) {
        countElement.textContent = `عرض ${filteredProducts.length} من ${allProducts.length} منتج`;
    }
}

/**
 * عرض رسالة خطأ
 */
function showError(message) {
    const container = document.getElementById('products-grid');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="icon">⚠️</i>
                <h3>خطأ</h3>
                <p>${message}</p>
            </div>
        `;
    }
}
