// Shared Core JavaScript for hamzabellouch.github.io

// 1. Theme (Dark / Light) Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
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
        let translation = translations[lang] && translations[lang][key];
        if (translation) {
            if (key === 'learnMore') {
                translation = translation.replace(/\s*(&rarr;|&larr;|→|←)\s*$/g, '');
            }
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

// 5. Blog Article Share Button (auto-injected on every article page)
function initBlogShareButton() {
    const backSpan = document.querySelector('span[data-i18n="backToBlog"]');
    if (!backSpan) return;
    const backLink = backSpan.closest('a');
    if (!backLink || backLink.closest('[data-share-row]')) return;

    // Wrap "Back to Blog" and place "Share" on the opposite side of the same row
    const row = document.createElement('div');
    row.setAttribute('data-share-row', '');
    row.className = 'mb-8 flex items-center justify-between gap-4';

    backLink.classList.remove('mb-8');
    backLink.parentNode.insertBefore(row, backLink);
    row.appendChild(backLink);

    const shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.className = 'inline-flex items-center gap-2 text-sm font-bold text-adguard hover:text-adguardDark transition-colors shrink-0';
    shareBtn.setAttribute('aria-label', 'Share');
    shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes" aria-hidden="true"></i><span data-i18n="share">Share</span>';
    row.appendChild(shareBtn);

    shareBtn.addEventListener('click', () => {
        const label = shareBtn.querySelector('span');
        const icon = shareBtn.querySelector('i');
        const url = window.location.origin + window.location.pathname;

        copyToClipboard(url).then(() => {
            const copiedText = (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang].shareCopied) || 'Copied!';
            const shareText = (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang].share) || 'Share';
            if (label) label.textContent = copiedText;
            if (icon) icon.className = 'fa-solid fa-check';
            shareBtn.classList.add('text-green-600');

            clearTimeout(shareBtn._resetTimer);
            shareBtn._resetTimer = setTimeout(() => {
                if (label) label.textContent = shareText;
                if (icon) icon.className = 'fa-solid fa-share-nodes';
                shareBtn.classList.remove('text-green-600');
            }, 2000);
        });
    });
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
            document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
        } catch (err) {
            reject(err);
        } finally {
            document.body.removeChild(ta);
        }
    });
}

// 6. Project Card Slime Morph Animation (Projects Page)
function initProjectCardSlimeMorph() {
    if (!window.location.pathname.includes('/projects')) return;
    const grid = document.querySelector('main .grid');
    if (!grid) return;

    grid.classList.add('items-start');
    const cards = grid.querySelectorAll(':scope > div.group');

    cards.forEach(card => {
        const textCol = card.querySelector(':scope > div');
        const mediaLink = card.querySelector(':scope > a');
        if (!textCol || !mediaLink || mediaLink.querySelector('.project-media-box')) return;

        card.classList.add('project-card');
        textCol.classList.add('project-text');

        const bgClasses = Array.from(mediaLink.classList).filter(c =>
            c.startsWith('bg-') || c.startsWith('dark:bg-') || c.startsWith('from-') || c.startsWith('via-') || c.startsWith('to-') ||
            c === 'flex' || c === 'flex-col' || c === 'items-center' || c === 'justify-center' || c === 'p-4' || c === 'shadow-sm' || c === 'relative'
        );

        mediaLink.classList.remove('overflow-hidden', ...bgClasses);
        mediaLink.classList.add('project-media');

        const mediaBox = document.createElement('div');
        mediaBox.className = ['project-media-box', ...bgClasses].join(' ');

        while (mediaLink.firstChild) {
            const child = mediaLink.firstChild;
            if (child.nodeType === 1) {
                child.classList.remove('group-hover:scale-105', 'group-hover:scale-110');
            }
            mediaBox.appendChild(child);
        }
        mediaLink.appendChild(mediaBox);

        mediaLink.addEventListener('mouseenter', () => animateCardMedia(card, true));
        card.addEventListener('mouseleave', () => animateCardMedia(card, false));
    });
}

function animateCardMedia(card, expand) {
    if (window.innerWidth < 640) return;
    const isExpanded = card.classList.contains('is-media-expanded');
    if (isExpanded === expand) return;

    const mediaSlot = card.querySelector('.project-media');
    const mediaBox = card.querySelector('.project-media-box');
    const textCol = card.querySelector('.project-text');
    if (!mediaSlot || !mediaBox || !textCol) return;

    const firstBoxRect = mediaBox.getBoundingClientRect();
    const firstCardHeight = card.getBoundingClientRect().height;

    mediaBox.getAnimations().forEach(a => a.cancel());
    textCol.getAnimations().forEach(a => a.cancel());
    card.getAnimations().forEach(a => a.cancel());
    card.style.height = '';

    card.classList.toggle('is-media-expanded', expand);
    const lastSlotRect = mediaSlot.getBoundingClientRect();
    const lastCardHeight = card.getBoundingClientRect().height;

    const dx = firstBoxRect.left - lastSlotRect.left;
    const dy = firstBoxRect.top - lastSlotRect.top;
    const w0 = firstBoxRect.width;
    const h0 = firstBoxRect.height;
    const w1 = lastSlotRect.width;
    const h1 = lastSlotRect.height;

    card.animate([
        { height: `${firstCardHeight}px` },
        { height: `${lastCardHeight}px` }
    ], {
        duration: 560,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
    });

    textCol.animate([
        { transform: `translate3d(0, ${expand ? '6px' : '-6px'}, 0)`, opacity: 0.92 },
        { transform: 'translate3d(0, 0, 0)', opacity: 1 }
    ], {
        duration: 480,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
    });

    const keyframes = expand ? [
        {
            offset: 0,
            width: `${w0}px`,
            height: `${h0}px`,
            transform: `translate3d(${dx}px, ${dy}px, 0) scale(1, 1) skewX(0deg)`,
            borderRadius: '24px'
        },
        {
            offset: 0.42,
            width: `${w0 + (w1 - w0) * 0.32}px`,
            height: `${h0 + (h1 - h0) * 0.65}px`,
            transform: `translate3d(${dx * 0.58}px, ${dy * 0.16}px, 0) scale(0.95, 1.07) skewX(-4deg)`,
            borderRadius: '36px 20px 38px 22px'
        },
        {
            offset: 0.78,
            width: `${w1}px`,
            height: `${h1}px`,
            transform: `translate3d(${dx * -0.02}px, 3px, 0) scale(1.015, 0.975) skewX(1.2deg)`,
            borderRadius: '20px 30px 22px 28px'
        },
        {
            offset: 1,
            width: `${w1}px`,
            height: `${h1}px`,
            transform: 'translate3d(0, 0, 0) scale(1, 1) skewX(0deg)',
            borderRadius: '24px'
        }
    ] : [
        {
            offset: 0,
            width: `${w0}px`,
            height: `${h0}px`,
            transform: `translate3d(${dx}px, ${dy}px, 0) scale(1, 1) skewX(0deg)`,
            borderRadius: '24px'
        },
        {
            offset: 0.45,
            width: `${w0 + (w1 - w0) * 0.65}px`,
            height: `${h0 + (h1 - h0) * 0.45}px`,
            transform: `translate3d(${dx * 0.25}px, ${dy * 0.42}px, 0) scale(1.04, 0.95) skewX(3.5deg)`,
            borderRadius: '22px 36px 20px 34px'
        },
        {
            offset: 0.8,
            width: `${w1}px`,
            height: `${h1}px`,
            transform: 'translate3d(0, -2px, 0) scale(0.985, 1.02) skewX(-0.8deg)',
            borderRadius: '28px 22px 26px 22px'
        },
        {
            offset: 1,
            width: `${w1}px`,
            height: `${h1}px`,
            transform: 'translate3d(0, 0, 0) scale(1, 1) skewX(0deg)',
            borderRadius: '24px'
        }
    ];

    mediaBox.animate(keyframes, {
        duration: 580,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
    });
}

// 7. Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initBlogShareButton();
    initProjectCardSlimeMorph();
    setLanguage(currentLang);
});

