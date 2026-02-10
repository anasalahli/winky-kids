// ============================================
// Sales Management Module - Supabase
// ============================================

/**
 * إضافة عملية بيع جديدة إلى Supabase
 */
async function addSale(saleData) {
    try {
        const sale = {
            // لا نرسل id - سيتم إنشاؤه تلقائياً من SERIAL
            product_id: saleData.productId,
            product_name: saleData.productName,
            sold_sizes: saleData.soldSizes || {},
            total_qty: saleData.totalQty,
            amount: parseFloat(saleData.amount),
            date: saleData.date || new Date().toISOString(),
            status: saleData.status || 'active',
            cancelled_at: saleData.cancelledAt || null
        };

        const { data, error } = await supabase
            .from('sales')
            .insert([sale])
            .select();

        if (error) throw error;

        console.log('تم تسجيل البيع بنجاح - رقم العملية:', data[0].id);
        return { success: true, sale: data[0] };
    } catch (error) {
        console.error('خطأ في تسجيل البيع:', error);
        return { success: false, error: error.message };
    }
}

/**
 * تحديث حالة عملية بيع (للإلغاء)
 */
async function updateSaleStatus(saleId, status, cancelledAt = null) {
    try {
        const updateData = {
            status: status
        };

        if (cancelledAt) {
            updateData.cancelled_at = cancelledAt;
        }

        const { data, error } = await supabase
            .from('sales')
            .update(updateData)
            .eq('id', saleId)
            .select();

        if (error) throw error;

        console.log('تم تحديث حالة البيع بنجاح:', saleId);
        return { success: true };
    } catch (error) {
        console.error('خطأ في تحديث حالة البيع:', error);
        return { success: false, error: error.message };
    }
}

/**
 * جلب جميع المبيعات من Supabase
 */
async function getAllSales() {
    try {
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;

        // تحويل أسماء الأعمدة من snake_case إلى camelCase للتوافق
        const sales = data.map(sale => ({
            id: sale.id,
            productId: sale.product_id,
            productName: sale.product_name,
            soldSizes: sale.sold_sizes,
            totalQty: sale.total_qty,
            amount: parseFloat(sale.amount),
            date: sale.date,
            status: sale.status,
            cancelledAt: sale.cancelled_at
        }));

        console.log(`✓ تم جلب ${sales.length} عملية بيع من قاعدة البيانات`);
        return { success: true, sales };
    } catch (error) {
        console.error('خطأ في جلب المبيعات:', error);
        return { success: false, error: error.message, sales: [] };
    }
}

/**
 * جلب المبيعات النشطة فقط
 */
async function getActiveSales() {
    try {
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .eq('status', 'active')
            .order('date', { ascending: false });

        if (error) throw error;

        const sales = data.map(sale => ({
            id: sale.id,
            productId: sale.product_id,
            productName: sale.product_name,
            soldSizes: sale.sold_sizes,
            totalQty: sale.total_qty,
            amount: parseFloat(sale.amount),
            date: sale.date,
            status: sale.status,
            cancelledAt: sale.cancelled_at
        }));

        return { success: true, sales };
    } catch (error) {
        console.error('خطأ في جلب المبيعات النشطة:', error);
        return { success: false, error: error.message, sales: [] };
    }
}

/**
 * جلب عملية بيع واحدة بواسطة ID
 */
async function getSaleById(saleId) {
    try {
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .eq('id', saleId)
            .single();

        if (error) throw error;

        if (data) {
            const sale = {
                id: data.id,
                productId: data.product_id,
                productName: data.product_name,
                soldSizes: data.sold_sizes,
                totalQty: data.total_qty,
                amount: parseFloat(data.amount),
                date: data.date,
                status: data.status,
                cancelledAt: data.cancelled_at
            };

            return { success: true, sale };
        } else {
            return { success: false, error: 'عملية البيع غير موجودة' };
        }
    } catch (error) {
        console.error('خطأ في جلب عملية البيع:', error);
        return { success: false, error: error.message };
    }
}

/**
 * حساب إحصائيات المبيعات من Supabase
 */
async function getSalesStatistics() {
    try {
        // جلب جميع المبيعات
        const { data: allSales, error: allError } = await supabase
            .from('sales')
            .select('status, amount, total_qty');

        if (allError) throw allError;

        // جلب المبيعات النشطة فقط
        const activeSales = allSales.filter(s => s.status === 'active');
        const cancelledSales = allSales.filter(s => s.status === 'cancelled');

        const stats = {
            totalCount: allSales.length,
            activeCount: activeSales.length,
            cancelledCount: cancelledSales.length,
            activeTotalAmount: activeSales.reduce((sum, s) => sum + parseFloat(s.amount), 0),
            activeTotalQty: activeSales.reduce((sum, s) => sum + parseInt(s.total_qty), 0)
        };

        return { success: true, stats };
    } catch (error) {
        console.error('خطأ في حساب إحصائيات المبيعات:', error);
        return { success: false, error: error.message };
    }
}

/**
 * حذف عملية بيع (استخدم بحذر!)
 */
async function deleteSale(saleId) {
    try {
        const { error } = await supabase
            .from('sales')
            .delete()
            .eq('id', saleId);

        if (error) throw error;

        console.log('تم حذف عملية البيع:', saleId);
        return { success: true };
    } catch (error) {
        console.error('خطأ في حذف البيع:', error);
        return { success: false, error: error.message };
    }
}
