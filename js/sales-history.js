// ============================================
// Sales History Module
// ============================================

let allSales = [];
let filteredSales = [];

/**
 * تهيئة صفحة سجل المبيعات
 */
async function initSalesHistory() {
    // حماية الصفحة
    await protectAdminPage();

    // تحميل المبيعات
    loadSalesHistory();

    // إضافة مستمعات للفلاتر
    document.getElementById('filter-status').addEventListener('change', applyFilters);
    document.getElementById('filter-date').addEventListener('change', applyFilters);
    document.getElementById('filter-search').addEventListener('input', applyFilters);
}

/**
 * تحميل سجل المبيعات من Supabase
 */
async function loadSalesHistory() {
    // جلب المبيعات من Supabase
    const result = await getAllSales();

    if (result.success) {
        allSales = result.sales;
    } else {
        allSales = [];
        showNotification('خطأ في تحميل سجل المبيعات', 'error');
    }

    // تطبيق الفلاتر
    applyFilters();

    // تحديث الإحصائيات
    updateSalesStatistics();
}

/**
 * تطبيق الفلاتر
 */
function applyFilters() {
    const statusFilter = document.getElementById('filter-status').value;
    const dateFilter = document.getElementById('filter-date').value;
    const searchFilter = document.getElementById('filter-search').value.toLowerCase();

    filteredSales = allSales.filter(sale => {
        // فلتر الحالة
        if (statusFilter !== 'all') {
            const saleStatus = sale.status || 'active';
            if (statusFilter !== saleStatus) return false;
        }

        // فلتر التاريخ
        if (dateFilter !== 'all') {
            const saleDate = new Date(sale.date);
            const now = new Date();
            const dayMs = 24 * 60 * 60 * 1000;

            if (dateFilter === 'today') {
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                if (saleDate < todayStart) return false;
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * dayMs);
                if (saleDate < weekAgo) return false;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * dayMs);
                if (saleDate < monthAgo) return false;
            }
        }

        // فلتر البحث
        if (searchFilter) {
            const productName = (sale.productName || '').toLowerCase();
            if (!productName.includes(searchFilter)) return false;
        }

        return true;
    });

    // عرض النتائج
    displaySalesTable();
}

/**
 * عرض جدول المبيعات
 */
function displaySalesTable() {
    const tbody = document.getElementById('sales-table-body');
    const emptyState = document.getElementById('empty-state');

    if (filteredSales.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // ترتيب المبيعات من الأحدث للأقدم
    const sortedSales = [...filteredSales].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    tbody.innerHTML = sortedSales.map(sale => {
        const status = sale.status || 'active';
        const isCancelled = status === 'cancelled';

        // تنسيق المقاسات
        const sizesHtml = Object.entries(sale.soldSizes || {})
            .map(([size, qty]) => `<span class="size-badge-small">${size}: ${qty}</span>`)
            .join(' ');

        // تنسيق التاريخ
        const saleDate = new Date(sale.date);
        const dateStr = saleDate.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const timeStr = saleDate.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <tr class="${isCancelled ? 'cancelled' : ''}">
                <td data-label="رقم العملية">
                    <span class="sale-id">#${sale.id}</span>
                </td>
                <td data-label="المنتج">
                    <span class="product-name-cell">${sale.productName}</span>
                </td>
                <td data-label="المقاسات">
                    <div class="sizes-list">${sizesHtml}</div>
                </td>
                <td data-label="الكمية">
                    <span class="qty-badge">${sale.totalQty} قطعة</span>
                </td>
                <td data-label="المبلغ">
                    <span class="amount-cell">${sale.amount.toFixed(2)} دينار</span>
                </td>
                <td data-label="التاريخ">
                    <div class="date-cell">
                        <span class="date-text">${dateStr}</span>
                        <span class="time-text">${timeStr}</span>
                    </div>
                </td>
                <td data-label="الحالة">
                    <span class="status-badge ${status}">
                        <i class="fas ${isCancelled ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                        ${isCancelled ? 'ملغاة' : 'نشطة'}
                    </span>
                </td>
                <td data-label="الإجراءات">
                    <div class="action-buttons-history">
                        ${!isCancelled ? `
                            <button class="btn-cancel-order" 
                                    onclick="confirmCancelOrder('${sale.id}')" 
                                    title="إلغاء الطلبية">
                                <i class="fas fa-times"></i> إلغاء
                            </button>
                        ` : `
                            <span style="color: var(--text-secondary); font-size: 0.9rem;">
                                ${sale.cancelledAt ? 'ألغيت في: ' + new Date(sale.cancelledAt).toLocaleDateString('ar-EG') : 'ملغاة'}
                            </span>
                        `}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * تحديث إحصائيات المبيعات
 */
function updateSalesStatistics() {
    const totalCount = allSales.length;
    const activeSales = allSales.filter(s => (s.status || 'active') === 'active');
    const cancelledSales = allSales.filter(s => s.status === 'cancelled');

    const activeTotal = activeSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);

    document.getElementById('total-sales-count').textContent = totalCount;
    document.getElementById('active-sales-count').textContent = activeSales.length;
    document.getElementById('cancelled-sales-count').textContent = cancelledSales.length;
    document.getElementById('active-sales-total').textContent = `${activeTotal.toFixed(2)} دينار`;
}

/**
 * عرض نافذة تأكيد إلغاء الطلبية
 */
function confirmCancelOrder(saleId) {
    // تحويل saleId لرقم (لأن ID الآن SERIAL)
    const numericId = typeof saleId === 'string' ? parseInt(saleId) : saleId;
    const sale = allSales.find(s => s.id === numericId);
    if (!sale) return;

    // التحقق من أن الطلبية لم تُلغَ مسبقاً
    if (sale.status === 'cancelled') {
        showNotification('هذه الطلبية ملغاة مسبقاً', 'error');
        return;
    }

    // تنسيق المقاسات للعرض
    const sizesText = Object.entries(sale.soldSizes || {})
        .map(([size, qty]) => `${size}: ${qty} قطعة`)
        .join(', ');

    const confirmHTML = `
        <div class="confirm-modal" id="cancel-confirm-modal" onclick="if(event.target === this) closeCancelConfirm()">
            <div class="confirm-content">
                <div class="confirm-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="confirm-title">تأكيد إلغاء الطلبية</h3>
                <p class="confirm-message">
                    هل أنت متأكد من إلغاء هذه الطلبية؟<br>
                    <strong>سيتم إعادة الكميات للمخزون وتحديث إجمالي المبيعات</strong>
                </p>
                
                <div class="confirm-details">
                    <div class="confirm-details-item">
                        <span class="confirm-details-label">المنتج:</span>
                        <span class="confirm-details-value">${sale.productName}</span>
                    </div>
                    <div class="confirm-details-item">
                        <span class="confirm-details-label">المقاسات:</span>
                        <span class="confirm-details-value">${sizesText}</span>
                    </div>
                    <div class="confirm-details-item">
                        <span class="confirm-details-label">الكمية الإجمالية:</span>
                        <span class="confirm-details-value">${sale.totalQty} قطعة</span>
                    </div>
                    <div class="confirm-details-item">
                        <span class="confirm-details-label">المبلغ:</span>
                        <span class="confirm-details-value">${sale.amount.toFixed(2)} دينار</span>
                    </div>
                </div>
                
                <div class="confirm-actions">
                    <button class="btn btn-secondary" onclick="closeCancelConfirm()">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                    <button class="btn" style="background: #ef4444;" onclick="cancelOrder('${saleId}')">
                        <i class="fas fa-check"></i> تأكيد الإلغاء
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
function closeCancelConfirm() {
    const modal = document.getElementById('cancel-confirm-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => modal.remove(), 300);
    }
}

/**
 * إلغاء طلبية وتحديث Supabase
 */
async function cancelOrder(saleId) {
    showLoading(true);

    try {
        // تحويل saleId لرقم
        const numericId = typeof saleId === 'string' ? parseInt(saleId) : saleId;

        // العثور على البيع
        const sale = allSales.find(s => s.id === numericId);
        if (!sale) {
            showNotification('لم يتم العثور على الطلبية', 'error');
            return;
        }

        // التحقق من أنها لم تُلغَ مسبقاً
        if (sale.status === 'cancelled') {
            showNotification('هذه الطلبية ملغاة مسبقاً', 'error');
            return;
        }

        // جلب المنتج من قاعدة البيانات
        const productResult = await getProductById(sale.productId);
        if (!productResult.success) {
            showNotification('خطأ في جلب بيانات المنتج', 'error');
            return;
        }

        const product = productResult.product;

        // إعادة الكميات للمخزون
        const updatedSizes = { ...product.sizes };
        Object.entries(sale.soldSizes || {}).forEach(([size, qty]) => {
            updatedSizes[size] = (updatedSizes[size] || 0) + qty;
        });

        // تحديث المنتج في قاعدة البيانات
        const updateResult = await updateProduct(sale.productId, { sizes: updatedSizes });
        if (!updateResult.success) {
            showNotification('خطأ في تحديث المخزون', 'error');
            return;
        }

        // تحديث حالة البيع في Supabase
        const cancelResult = await updateSaleStatus(numericId, 'cancelled', new Date().toISOString());
        if (!cancelResult.success) {
            showNotification('خطأ في تحديث حالة البيع', 'error');
            return;
        }

        // إغلاق النافذة
        closeCancelConfirm();

        // إعادة تحميل وعرض البيانات
        await loadSalesHistory();

        showNotification('تم إلغاء الطلبية بنجاح وإعادة الكميات للمخزون', 'success');

    } catch (error) {
        console.error('خطأ في إلغاء الطلبية:', error);
        showNotification('حدث خطأ غير متوقع', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * إعادة تعيين الفلاتر
 */
function resetFilters() {
    document.getElementById('filter-status').value = 'active';
    document.getElementById('filter-date').value = 'all';
    document.getElementById('filter-search').value = '';
    applyFilters();
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
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// تهيئة عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSalesHistory);
} else {
    initSalesHistory();
}
