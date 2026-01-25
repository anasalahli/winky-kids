// ============================================
// Authentication Module - Supabase
// ============================================

/**
 * تسجيل دخول المشرف
 */
async function loginAdmin(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        console.log('تم تسجيل الدخول بنجاح:', data.user.email);
        return { success: true, user: data.user };
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        return { success: false, error: getArabicErrorMessage(error.message) };
    }
}

/**
 * تسجيل خروج المشرف
 */
async function logoutAdmin() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        console.log('تم تسجيل الخروج بنجاح');
        window.location.href = 'admin-login.html';
        return { success: true };
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
        return { success: false, error: error.message };
    }
}

/**
 * التحقق من حالة المصادقة
 */
async function checkAuth(redirectUrl = 'admin-login.html') {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            console.log('المستخدم غير مسجل الدخول');
            window.location.href = redirectUrl;
            throw new Error('User not authenticated');
        }

        console.log('المستخدم مسجل الدخول:', user.email);
        return user;
    } catch (error) {
        console.log('المستخدم غير مسجل الدخول');
        window.location.href = redirectUrl;
        throw error;
    }
}

/**
 * الحصول على المستخدم الحالي
 */
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * حماية صفحة المشرف
 */
async function protectAdminPage() {
    try {
        await checkAuth();
    } catch (error) {
        // سيتم إعادة التوجيه تلقائياً
    }
}

/**
 * ترجمة رسائل الخطأ إلى العربية
 */
function getArabicErrorMessage(errorMessage) {
    const errorMessages = {
        'Invalid login credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        'Email not confirmed': 'يرجى تأكيد البريد الإلكتروني أولاً',
        'User not found': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        'Invalid email': 'البريد الإلكتروني غير صالح',
        'Too many requests': 'محاولات كثيرة جداً. يرجى المحاولة لاحقاً',
        'Network error': 'خطأ في الاتصال بالشبكة'
    };

    // البحث عن الرسالة المطابقة
    for (const [key, value] of Object.entries(errorMessages)) {
        if (errorMessage.includes(key)) {
            return value;
        }
    }

    return 'حدث خطأ غير متوقع';
}

/**
 * مراقبة حالة المصادقة
 */
function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(session?.user || null);
    });
}
