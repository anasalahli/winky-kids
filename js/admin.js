// ============================================
// Admin Dashboard Module
// ============================================

let adminProducts = [];
let editingProductId = null;

/**
 * تهيئة لوحة التحكم
 */
async function initAdminDashboard() {
    // حماية الصفحة
    await protectAdminPage();

    // تحميل المنتجات
    loadAdminProducts();

    // عناصر واجهة المستخدم للصور
    const uploadArea = document.getElementById('upload-area');
    const imageInput = document.getElementById('product-image');

    // إضافة مستمع للنموذج
    const form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', handleProductSubmit);
    }

    // استماع لتغيير الفئة لتحديث المقاسات
    const categorySelect = document.getElementById('product-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            updateSizesDisplay(e.target.value);
        });
    }

    // إعداد منطقة الرفع (Drag & Drop + Click)
    if (uploadArea && imageInput) {
        uploadArea.addEventListener('click', () => imageInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                imageInput.files = files;
                handleImagePreview({ target: imageInput });
            }
        });

        imageInput.addEventListener('change', handleImagePreview);
    }
}

/**
 * تحديث حقول المقاسات بناءً على الفئة
 */
function updateSizesDisplay(category) {
    const container = document.querySelector('.sizes-input-group');
    if (!container) return;

    let sizes = [];
    if (category === 'مواليد') {
        sizes = ['0-3 أشهر', '3-6 أشهر', '6-9 أشهر', '9-12 أشهر'];
    } else {
        // الفئة الافتراضية هي الأطفال
        sizes = ['1 سنة', '2 سنة', '3 سنوات', '4 سنوات', '5 سنوات', '6 سنوات'];
    }

    container.innerHTML = sizes.map(size => `
        <div class="size-input-wrapper">
            <label class="size-input-label">${size}</label>
            <input type="number" class="size-input" data-size="${size}" placeholder="0" min="0">
        </div>
    `).join('');
}

/**
 * تحميل المنتجات في لوحة التحكم
 */
async function loadAdminProducts() {
    showLoading(true);

    try {
        // استخدام forceRefresh=false للسماح بالـ Cache
        // يمكن تغييره إلى true لتحديث البيانات دائماً
        const result = await getAllProductsOptimized(true, false);

        if (result.success) {
            adminProducts = result.products;
            displayAdminProducts();

            // عرض رسالة توضيحية إذا كان من الـ Cache
            if (result.fromCache) {
                console.log('⚡ Products loaded from cache');
            }
        } else {
            showNotification('خطأ في تحميل المنتجات', 'error');
        }
    } catch (error) {
        console.error('خطأ في تحميل المنتجات:', error);
        showNotification('حدث خطأ غير متوقع', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * عرض المنتجات في جدول المشرف
 */
function displayAdminProducts() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    if (adminProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem;">
                    <p style="color: var(--text-secondary); font-size: 1.1rem;">
                        لا توجد منتجات بعد. ابدأ بإضافة منتج جديد!
                    </p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = adminProducts.map(product => {
        const totalQty = getTotalQuantity(product);
        const isAvailable = isProductAvailable(product);
        const sizesHtml = product.sizes ?
            Object.entries(product.sizes)
                .map(([size, qty]) => `<span class="size-badge ${qty > 0 ? 'available' : 'unavailable'}">${size}: ${qty}</span>`)
                .join('') :
            'لا يوجد';

        return `
            <tr>
                <td data-label="المنتج">
                    <div class="product-cell">
                        <img src="${product.imageUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23f4a582%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2240%22%3E📷%3C/text%3E%3C/svg%3E'}" 
                             alt="${product.name}" 
                             class="product-thumb"
                             onerror="this.style.opacity='0.5'">
                        <span>${product.name}</span>
                    </div>
                </td>
                <td data-label="الفئة">${product.category}</td>
                <td data-label="الجنس">${product.gender || 'غير محدد'}</td>
                <td data-label="السعر">${product.price} دينار</td>
                <td data-label="المقاسات">
                    <div class="sizes-container">
                        ${sizesHtml}
                    </div>
                </td>
                <td data-label="الإجمالي">
                    <span class="total-qty ${isAvailable ? 'available' : 'unavailable'}">
                        ${totalQty}
                    </span>
                </td>
                <td data-label="الإجراءات">
                    <div class="action-buttons">
                        <button class="btn-icon btn-sell" onclick="openSaleModal('${product.id}')" title="بيع">
                            <i class="fas fa-cash-register"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editProduct('${product.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="confirmDeleteProduct('${product.id}')" title="حذف">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // تحديث الإحصائيات
    if (typeof updateStatistics === 'function') {
        updateStatistics();
    }
}

/**
 * معالجة إرسال نموذج المنتج
 */
async function handleProductSubmit(e) {
    e.preventDefault();
    console.log('🚀 Starting product submission...');

    const formData = new FormData(e.target);
    const imageFile = formData.get('image');
    let imageUrl = formData.get('imageUrl') || '';

    console.log('--- Debug Info ---');
    console.log('Initial imageUrl from form:', imageUrl ? (imageUrl.substring(0, 50) + '...') : 'empty');
    if (imageFile) {
        console.log('File selected:', imageFile.name, 'Size:', imageFile.size, 'Type:', imageFile.type);
    } else {
        console.log('No file found in formData');
    }

    showLoading(true);

    try {
        // رفع الصورة إذا تم اختيارها
        if (imageFile && imageFile.size > 0) {
            console.log('⏳ Uploading file to Storage...');
            const uploadResult = await uploadImage(imageFile);

            if (uploadResult.success) {
                imageUrl = uploadResult.url;
                console.log('✅ Upload successful! New URL:', imageUrl);
            } else {
                console.error('❌ Upload failed:', uploadResult.error);
                showNotification('فشل رفع الصورة: ' + uploadResult.error, 'error');
                showLoading(false);
                return;
            }
        } else {
            console.log('ℹ️ No new file to upload, using existing URL');
        }

        // منع إرسال الـ Base64 عمداً
        if (imageUrl.startsWith('data:')) {
            console.error('⚠️ Critical: Attempting to save Base64 data!');
            // لا تمنعه الآن، فقط سجل الخطأ لنعرف إذا كان هذا هو المصدر
        }

        // جمع المقاسات
        const sizes = {};
        const sizeInputs = document.querySelectorAll('.size-input');
        sizeInputs.forEach(input => {
            const size = input.dataset.size;
            const quantity = parseInt(input.value) || 0;
            sizes[size] = quantity;
        });

        const productData = {
            name: formData.get('name'),
            category: document.getElementById('product-category').value,
            gender: document.getElementById('product-gender').value,
            price: formData.get('price'),
            imageUrl: imageUrl,
            sizes: sizes
        };

        let result;
        if (editingProductId) {
            result = await updateProduct(editingProductId, productData);
            if (result.success) {
                showNotification('تم تحديث المنتج بنجاح', 'success');
            }
        } else {
            result = await addProduct(productData);
            if (result.success) {
                showNotification('تم إضافة المنتج بنجاح', 'success');
            }
        }

        if (result.success) {
            resetForm();
            loadAdminProducts();
        } else {
            showNotification(result.error || 'حدث خطأ', 'error');
        }
    } catch (error) {
        console.error('خطأ في حفظ المنتج:', error);
        showNotification('حدث خطأ غير متوقع', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * تعديل منتج
 */
async function editProduct(productId) {
    const result = await getProductById(productId);
    if (!result.success) {
        showNotification('فشل تحميل المنتج', 'error');
        return;
    }

    const product = result.product;
    editingProductId = productId;

    // ملء النموذج
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-gender').value = product.gender || '';
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image-url-hidden').value = product.imageUrl || '';

    // تحديث المقاسات قبل ملئها
    updateSizesDisplay(product.category);

    // عرض الصورة الحالية
    const uploadArea = document.getElementById('upload-area');
    const previewArea = document.getElementById('preview-area');
    const imagePreview = document.getElementById('image-preview');

    if (imagePreview && product.imageUrl) {
        imagePreview.src = product.imageUrl;
        if (uploadArea) uploadArea.style.display = 'none';
        if (previewArea) previewArea.style.display = 'block';
    }

    // ملء المقاسات
    if (product.sizes) {
        Object.entries(product.sizes).forEach(([size, quantity]) => {
            const input = document.querySelector(`[data-size="${size}"]`);
            if (input) {
                input.value = quantity;
            }
        });
    }

    // تغيير نص الزر
    document.getElementById('submit-btn').textContent = 'تحديث المنتج';

    // التمرير إلى النموذج
    document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
}

/**
 * تأكيد حذف منتج
 */
function confirmDeleteProduct(productId) {
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;

    if (confirm(`هل أنت متأكد من حذف "${product.name}"؟`)) {
        deleteProductConfirmed(productId);
    }
}

/**
 * حذف منتج بعد التأكيد
 */
async function deleteProductConfirmed(productId) {
    showLoading(true);

    try {
        const result = await deleteProduct(productId);
        if (result.success) {
            showNotification('تم حذف المنتج بنجاح', 'success');
            loadAdminProducts();
        } else {
            showNotification(result.error || 'فشل حذف المنتج', 'error');
        }
    } catch (error) {
        console.error('خطأ في حذف المنتج:', error);
        showNotification('حدث خطأ غير متوقع', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * معاينة الصورة قبل الرفع
 */
function handleImagePreview(e) {
    const file = e.target ? e.target.files[0] : (e.files ? e.files[0] : e);
    if (!file) {
        console.log('No file selected in handleImagePreview');
        return;
    }

    console.log('Selected file for preview:', file.name, file.size);

    if (file.size > 10 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت');
        if (e.target) e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const previewImage = document.getElementById('image-preview');
        const uploadArea = document.getElementById('upload-area');
        const previewArea = document.getElementById('preview-area');

        if (previewImage) {
            previewImage.src = event.target.result;
            console.log('Preview image updated');
        }

        if (uploadArea) uploadArea.style.display = 'none';
        if (previewArea) previewArea.style.display = 'block';
    };
    reader.readAsDataURL(file);
}



/**
 * إعادة تعيين النموذج
 */
function resetForm() {
    editingProductId = null;
    document.getElementById('product-form').reset();
    document.getElementById('submit-btn').textContent = 'إضافة منتج';

    const uploadArea = document.getElementById('upload-area');
    const previewArea = document.getElementById('preview-area');
    const imagePreview = document.getElementById('image-preview');
    const imageUrlInput = document.getElementById('product-image-url-hidden');

    if (imagePreview) imagePreview.src = '';
    if (imageUrlInput) imageUrlInput.value = '';
    if (uploadArea) uploadArea.style.display = 'block';
    if (previewArea) previewArea.style.display = 'none';

    // إعادة تعيين المقاسات للوضع الافتراضي
    updateSizesDisplay('أطفال');
}

/**
 * عرض حالة التحميل
 */
function showLoading(isLoading) {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.style.display = isLoading ? 'flex' : 'none';
    }
}

/**
 * عرض إشعار
 */
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // إضافة إلى الصفحة
    document.body.appendChild(notification);

    // إظهار الإشعار
    setTimeout(() => notification.classList.add('show'), 100);

    // إخفاء وحذف الإشعار
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// تهيئة عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminDashboard);
} else {
    initAdminDashboard();
}
