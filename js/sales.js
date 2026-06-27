// ============================================
// Statistics & Sales Functions
// ============================================

/**
 * تحديث بطاقات الإحصائيات
 */
async function updateStatistics() {
    // حساب إجمالي قيمة المخزون
    const inventoryValue = adminProducts.reduce((total, product) => {
        const productTotal = Object.values(product.sizes || {})
            .reduce((sum, qty) => sum + qty, 0) * product.price;
        return total + productTotal;
    }, 0);

    // حساب إجمالي المبيعات من Supabase (العمليات النشطة فقط)
    const salesResult = await getSalesStatistics();
    const salesValue = salesResult.success ? salesResult.stats.activeTotalAmount : 0;
    const totalSoldItems = salesResult.success ? salesResult.stats.activeTotalQty : 0;

    // حساب عدد المنتجات
    const totalProducts = adminProducts.length;

    // حساب عدد القطع
    const totalItems = adminProducts.reduce((total, product) => {
        const productQty = Object.values(product.sizes || {})
            .reduce((sum, qty) => sum + qty, 0);
        return total + productQty;
    }, 0);

    // تحديث العرض
    const inventoryEl = document.getElementById('total-inventory-value');
    const salesEl = document.getElementById('total-sales-value');
    const productsEl = document.getElementById('total-products');
    const itemsEl = document.getElementById('total-items');
    const soldItemsEl = document.getElementById('total-sold-items');

    if (inventoryEl) inventoryEl.textContent = `${inventoryValue.toFixed(2)} دينار`;
    if (salesEl) salesEl.textContent = `${salesValue.toFixed(2)} دينار`;
    if (productsEl) productsEl.textContent = totalProducts;
    if (itemsEl) itemsEl.textContent = totalItems;
    if (soldItemsEl) soldItemsEl.textContent = totalSoldItems;
}

/**
 * فتح نافذة تسجيل البيع
 */
function openSaleModal(productId) {
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;

    const availableSizes = getAvailableSizes(product);
    const sizes = availableSizes
        .map((s) => {
            const size = s.size;
            const qty = s.quantity;
            return `
                <div class="sale-size-item">
                    <label>${size} (متوفر: ${qty})</label>
                    <input type="number" 
                           class="sale-qty-input" 
                           data-size="${size}" 
                           data-max="${qty}"
                           min="0" 
                           max="${qty}"
                           placeholder="0">
                </div>
            `;
        }).join('');

    if (!sizes) {
        showNotification('لا توجد مقاسات متوفرة للبيع', 'error');
        return;
    }

    // إنشاء معرف فريد لهذه النافذة
    const modalId = `sale-modal-${Date.now()}`;

    const modalHTML = `
        <div class="modal-overlay" id="${modalId}" onclick="if(event.target === this) closeSaleModal('${modalId}')">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-cash-register"></i> تسجيل بيع - ${product.name}</h3>
                    <button class="modal-close" onclick="closeSaleModal('${modalId}')">×</button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                        السعر: <strong>${product.price} دينار</strong>
                    </p>
                    <div class="sale-sizes-grid">
                        ${sizes}
                    </div>
                    <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-md);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>المجموع:</span>
                            <strong id="sale-total-${modalId}" style="font-size: 1.5rem; color: var(--primary);">0 دينار</strong>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeSaleModal('${modalId}')">إلغاء</button>
                    <button class="btn btn-primary" onclick="processSale('${productId}', '${modalId}')">
                        <i class="fas fa-check"></i> تأكيد البيع
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Smooth scroll to the modal itself
    setTimeout(() => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, 100);

    // إضافة مستمع لحساب المجموع
    const modalElement = document.getElementById(modalId);
    modalElement.querySelectorAll('.sale-qty-input').forEach(input => {
        input.addEventListener('input', function () {
            const max = parseInt(this.getAttribute('data-max'));
            if (parseInt(this.value) > max) this.value = max;
            calculateSaleTotal(product.price, modalId);
        });
    });
}

/**
 * حساب مجموع البيع
 */
function calculateSaleTotal(price, modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const inputs = modal.querySelectorAll('.sale-qty-input');
    let totalQty = 0;
    inputs.forEach(input => {
        totalQty += parseInt(input.value) || 0;
    });
    const total = totalQty * price;
    const totalEl = document.getElementById(`sale-total-${modalId}`);
    if (totalEl) totalEl.textContent = `${total.toFixed(2)} دينار`;
}

/**
 * إغلاق نافذة البيع
 */
function closeSaleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Add fade out animation
        modal.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Add fadeOut animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

/**
 * معالجة وتسجيل البيع
 */
async function processSale(productId, modalId) {
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById(modalId);
    if (!modal) return;

    // جمع الكميات المباعة
    const soldSizes = {};
    let totalSold = 0;
    modal.querySelectorAll('.sale-qty-input').forEach(input => {
        const size = input.getAttribute('data-size');
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            soldSizes[size] = qty;
            totalSold += qty;
        }
    });

    if (totalSold === 0) {
        showNotification('يرجى إدخال كمية واحدة على الأقل', 'error');
        return;
    }

    // تحديث المخزون
    const updatedSizes = { ...product.sizes };
    Object.entries(soldSizes).forEach(([size, qty]) => {
        updatedSizes[size] = (updatedSizes[size] || 0) - qty;
    });

    // حفظ التحديث في قاعدة البيانات
    const result = await updateProduct(productId, { sizes: updatedSizes });

    if (result.success) {
        // تسجيل عملية البيع في Supabase
        const saleAmount = totalSold * product.price;
        const saleData = {
            // لا نرسل id - سيتم إنشاؤه تلقائياً
            productId: productId,
            productName: product.name,
            soldSizes: soldSizes,
            totalQty: totalSold,
            amount: saleAmount,
            date: new Date().toISOString(),
            status: 'active',
            cancelledAt: null
        };

        // حفظ في Supabase
        const saleResult = await addSale(saleData);

        if (!saleResult.success) {
            showNotification('تم تحديث المخزون ولكن فشل حفظ السجل', 'warning');
        }

        // إغلاق النافذة
        closeSaleModal(modalId);

        // إعادة تحميل المنتجات
        await loadAdminProducts();

        showNotification(`تم تسجيل البيع بنجاح! المبلغ: ${saleAmount.toFixed(2)} دينار`, 'success');
    } else {
        showNotification('حدث خطأ في تسجيل البيع', 'error');
    }
}

// تحديث displayAdminProducts لإضافة زر البيع
const originalDisplayAdminProducts = window.displayAdminProducts;
window.displayAdminProducts = function () {
    if (originalDisplayAdminProducts) originalDisplayAdminProducts();

    // إضافة زر البيع لكل منتج
    const tbody = document.getElementById('products-table-body');
    if (tbody && tbody.innerHTML && !tbody.innerHTML.includes('btn-sell')) {
        tbody.innerHTML = tbody.innerHTML.replace(
            /<div class="action-buttons">/g,
            `<div class="action-buttons">
                <button class="btn btn-sm btn-sell" onclick="openSaleModal(this.closest('tr').dataset.productId)" title="تسجيل بيع">
                    <i class="fas fa-cash-register"></i> بيع
                </button>`
        );
    }

    // تحديث الإحصائيات
    updateStatistics();
};

// تحميل الإحصائيات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('total-inventory-value')) {
        // انتظر تحميل المنتجات أولاً
        setTimeout(() => {
            if (typeof updateStatistics === 'function') {
                updateStatistics();
            }
        }, 1500);
    }
});

// ============================================
// Reset Sales Functions
// ============================================

/**
 * عرض نافذة تأكيد تصفير المبيعات
 */
function confirmResetSales() {
    const confirmHTML = `
        <div class="confirm-modal" id="reset-confirm-modal" onclick="if(event.target === this) closeResetConfirm()">
            <div class="confirm-content">
                <div class="confirm-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="confirm-title">تأكيد تصفير المبيعات</h3>
                <p class="confirm-message">
                    هل أنت متأكد من أنك تريد تصفير سجل المبيعات؟<br>
                    <strong>هذا الإجراء لا يمكن التراجع عنه!</strong>
                </p>
                <div class="confirm-actions">
                    <button class="btn btn-secondary" onclick="closeResetConfirm()">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                    <button class="btn" style="background: #ef4444;" onclick="resetSales()">
                        <i class="fas fa-check"></i> تأكيد التصفير
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', confirmHTML);
}

/**
 * إغلاق نافذة التأكيد
 */
function closeResetConfirm() {
    const modal = document.getElementById('reset-confirm-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => modal.remove(), 300);
    }
}

/**
 * تصفير المبيعات
 */
function resetSales() {
    // حذف سجل المبيعات من localStorage
    localStorage.removeItem('sales');

    // إغلاق النافذة
    closeResetConfirm();

    // تحديث الإحصائيات
    if (typeof updateStatistics === 'function') {
        updateStatistics();
    }

    // إظهار رسالة نجاح
    showNotification('تم تصفير المبيعات بنجاح!', 'success');
}
