// ============================================
// Theme Toggle (Dark Mode)
// ============================================

// تهيئة الثيم عند تحميل الصفحة
function initTheme() {
    // منع الترانزيشن عند التحميل الأول
    document.body.classList.add('no-transition');

    // الحصول على الثيم المحفوظ أو استخdام النهاري كافتراضي
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // تحديث أيقونة الزر
    updateThemeIcon(savedTheme);

    // إزالة class بعد فترة قصيرة
    setTimeout(() => {
        document.body.classList.remove('no-transition');
    }, 100);
}

// تبديل بين الوضع النهاري والليلي
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // تحديث الثيم
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // تحديث الأيقونة
    updateThemeIcon(newTheme);
}

// تحديث أيقونة زر التبديل
function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initTheme);
