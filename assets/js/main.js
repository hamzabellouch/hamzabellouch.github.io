// Shared Core JavaScript for hamzabellouch.github.io

// 1. Theme (Dark / Light) Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Execute theme check immediately to prevent flash
initTheme();

// 2. Language & Internationalization (i18n)
let currentLang = localStorage.getItem('lang') || 'en';

function setLanguage(lang) {
    if (typeof translations === 'undefined' || !translations[lang]) {
        console.warn('Translations not loaded or language not found:', lang);
        return;
    }
    
    currentLang = lang;
    localStorage.setItem('lang', lang);
    
    const htmlTag = document.documentElement;
    const dropdownMenu = document.getElementById('langDropdownMenu');
    const currentLangText = document.getElementById('currentLangText');
    
    // Set Direction and Lang Attribute
    if (lang === 'ar') {
        htmlTag.dir = 'rtl';
        htmlTag.lang = 'ar';
        if (dropdownMenu) dropdownMenu.classList.replace('right-0', 'left-0');
    } else {
        htmlTag.dir = 'ltr';
        htmlTag.lang = lang;
        if (dropdownMenu) dropdownMenu.classList.replace('left-0', 'right-0');
    }
    
    // Update all elements with data-i18n
    const i18nElements = document.querySelectorAll('[data-i18n]');
    i18nElements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = translations[lang] && translations[lang][key];
        if (translation) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else {
                el.innerHTML = translation;
            }
        }
    });
    
    // Update dropdown label text
    if (currentLangText && translations[lang] && translations[lang].langBtn) {
        currentLangText.innerText = translations[lang].langBtn;
    }
    
    // Update interactive protection status if on home page
    updateStatusText();
}

// 3. Mobile Navigation Menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('mobileMenuIcon');
    if (!menu) return;
    
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
        menu.classList.remove('hidden');
        if (icon) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        }
    } else {
        closeMobileMenu();
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('mobileMenuIcon');
    if (menu && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
        if (icon) {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    }
}

// Close mobile menu on desktop resize
window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
        closeMobileMenu();
    }
});

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
    const menu = document.getElementById('mobileMenu');
    const btn = document.getElementById('mobileMenuBtn');
    if (menu && !menu.classList.contains('hidden')) {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            closeMobileMenu();
        }
    }
});

// 4. Interactive Protection Card Toggle (Home Page)
let isProtectionActive = true;

function toggleProtection() {
    const track = document.getElementById('protectionTrack');
    const circle = document.getElementById('protectionCircle');
    const statusIcon = document.getElementById('statusIcon');
    const statusContainer = document.getElementById('statusContainer');
    const statusText = document.getElementById('statusText');
    
    if (!track || !circle) return;
    isProtectionActive = !isProtectionActive;

    if (isProtectionActive) {
        track.className = 'w-12 h-6 bg-adguard rounded-full relative cursor-pointer transition-colors duration-300 ease-in-out focus:outline-none';
        circle.className = 'w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm transition-transform duration-300 ease-in-out translate-x-6';
        if (statusIcon) statusIcon.className = 'fa-solid fa-circle-check text-adguard text-2xl transition-colors duration-300';
        if (statusContainer) statusContainer.className = 'mt-8 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl flex items-center justify-center gap-3 transition-colors duration-300';
        if (statusText) statusText.className = 'font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-300';
    } else {
        track.className = 'w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative cursor-pointer transition-colors duration-300 ease-in-out focus:outline-none';
        circle.className = 'w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm transition-transform duration-300 ease-in-out translate-x-0';
        if (statusIcon) statusIcon.className = 'fa-solid fa-circle-pause text-gray-400 text-2xl transition-colors duration-300';
        if (statusContainer) statusContainer.className = 'mt-8 bg-gray-100 dark:bg-gray-900/50 p-4 rounded-xl flex items-center justify-center gap-3 transition-colors duration-300';
        if (statusText) statusText.className = 'font-semibold text-gray-500 dark:text-gray-400 transition-colors duration-300';
    }
    
    updateStatusText();
}

function updateStatusText() {
    const statusText = document.getElementById('statusText');
    if (statusText && typeof translations !== 'undefined' && translations[currentLang]) {
        statusText.innerText = isProtectionActive 
            ? (translations[currentLang].statusActive || 'Active Developer & Contributor')
            : (translations[currentLang].statusDisabled || 'Status: Offline / Away');
    }
}

// 5. Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
});
