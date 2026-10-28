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

// ==========================================
// 5. Public Views & Shares Counter Engine (CountAPI)
// ==========================================
const COUNTER_API_BASE = 'https://countapi.mileshilliard.com/api/v1';

// Helper: Format large numbers (e.g. 1,240 or 12.5k)
function formatCounterNumber(num) {
    if (typeof num !== 'number' || isNaN(num) || num < 0) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 10000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return new Intl.NumberFormat().format(num);
}

// Helper: Sanitize keys to be safe for URL and API
function sanitizeCounterKey(str) {
    return String(str || '')
        .toLowerCase()
        .trim()
        .replace(/^\/+|\/+$/g, '')
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 60);
}

// Fetch counter without incrementing
async function fetchCounterValue(key) {
    const safeKey = sanitizeCounterKey(key);
    if (!safeKey) return 0;
    try {
        const res = await fetch(`${COUNTER_API_BASE}/get/${safeKey}`);
        if (!res.ok) return 0;
        const data = await res.json();
        const val = typeof data.value === 'number' ? data.value : 0;
        try { localStorage.setItem('hb_cache_' + safeKey, String(val)); } catch (e) {}
        return val;
    } catch (err) {
        try {
            const cached = localStorage.getItem('hb_cache_' + safeKey);
            if (cached !== null) return parseInt(cached, 10) || 0;
        } catch (e) {}
        return 0;
    }
}

// Increment counter (+1) and return new value
async function incrementCounterValue(key) {
    const safeKey = sanitizeCounterKey(key);
    if (!safeKey) return 1;
    try {
        const res = await fetch(`${COUNTER_API_BASE}/hit/${safeKey}`);
        if (!res.ok) return 1;
        const data = await res.json();
        const val = typeof data.value === 'number' ? data.value : 1;
        try { localStorage.setItem('hb_cache_' + safeKey, String(val)); } catch (e) {}
        return val;
    } catch (err) {
        try {
            const cached = localStorage.getItem('hb_cache_' + safeKey);
            const nextVal = (parseInt(cached, 10) || 0) + 1;
            localStorage.setItem('hb_cache_' + safeKey, String(nextVal));
            return nextVal;
        } catch (e) {}
        return 1;
    }
}

// Track view once per browser session
async function trackCounterView(key, sessionKey) {
    const safeKey = sanitizeCounterKey(key);
    const sKey = 'hb_sess_view_' + (sessionKey || safeKey);
    let hasViewed = false;
    try {
        hasViewed = sessionStorage.getItem(sKey) === '1';
    } catch (e) {}

    if (!hasViewed) {
        const newVal = await incrementCounterValue(safeKey);
        try { sessionStorage.setItem(sKey, '1'); } catch (e) {}
        return newVal;
    } else {
        return await fetchCounterValue(safeKey);
    }
}

// ==========================================
// 6. Blog & Article Share + Realtime Stats
// ==========================================
function initBlogShareAndStats() {
    const backSpan = document.querySelector('span[data-i18n="backToBlog"]');
    if (!backSpan) return;
    const backLink = backSpan.closest('a');
    if (!backLink || backLink.closest('[data-share-row]')) return;

    // Determine article slug from URL
    const path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
    const segments = path.split('/').filter(Boolean);
    const newsIdx = segments.indexOf('news');
    if (newsIdx === -1 || !segments[newsIdx + 1]) return;
    const articleSlug = segments[newsIdx + 1];
    const viewsKey = `hb-news-${articleSlug}-views`;
    const sharesKey = `hb-news-${articleSlug}-shares`;

    // Wrap "Back to News" and place action cluster on the opposite side
    const row = document.createElement('div');
    row.setAttribute('data-share-row', '');
    row.className = 'mb-8 flex items-center justify-between flex-wrap gap-4 w-full';

    backLink.classList.remove('mb-8');
    backLink.parentNode.insertBefore(row, backLink);
    row.appendChild(backLink);

    // Right-side actions cluster (Views Badge + Share Button with Count)
    const actionCluster = document.createElement('div');
    actionCluster.className = 'flex items-center gap-2.5 flex-wrap shrink-0';

    // Views / Reads Capsule
    const viewsBadge = document.createElement('div');
    viewsBadge.className = 'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm';
    viewsBadge.setAttribute('title', 'Article Views / Reads');
    viewsBadge.innerHTML = `
        <i class="fa-solid fa-eye text-adguard text-sm"></i>
        <span id="blog-views-count" class="font-bold text-gray-900 dark:text-white">...</span>
        <span class="text-xs text-gray-500 dark:text-gray-400 font-normal" data-i18n="readsLabel">reads</span>
    `;
    actionCluster.appendChild(viewsBadge);

    // Share Capsule (Button + Counter)
    const shareCapsule = document.createElement('div');
    shareCapsule.className = 'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-gray-800/90 border border-blue-200/80 dark:border-gray-700/80 text-xs sm:text-sm text-adguard font-semibold shadow-sm transition-all';
    
    const shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.className = 'inline-flex items-center gap-1.5 font-bold hover:text-adguardDark transition-colors focus:outline-none';
    shareBtn.setAttribute('aria-label', 'Share');
    shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i><span data-i18n="share">Share</span>';
    
    const divider = document.createElement('span');
    divider.className = 'text-gray-300 dark:text-gray-600 font-normal select-none';
    divider.textContent = '|';

    const sharesCountSpan = document.createElement('span');
    sharesCountSpan.id = 'blog-shares-count';
    sharesCountSpan.className = 'font-bold text-gray-700 dark:text-gray-300';
    sharesCountSpan.setAttribute('title', 'Total Shares');
    sharesCountSpan.textContent = '...';

    shareCapsule.appendChild(shareBtn);
    shareCapsule.appendChild(divider);
    shareCapsule.appendChild(sharesCountSpan);
    actionCluster.appendChild(shareCapsule);

    row.appendChild(actionCluster);

    // Track views once per session
    trackCounterView(viewsKey, `news_${articleSlug}`).then(val => {
        const el = document.getElementById('blog-views-count');
        if (el) el.textContent = formatCounterNumber(val);
    });

    // Fetch existing share count
    fetchCounterValue(sharesKey).then(val => {
        if (sharesCountSpan) sharesCountSpan.textContent = formatCounterNumber(val);
    });

    // Handle Share click
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

            // Increment share count
            incrementCounterValue(sharesKey).then(newCount => {
                if (sharesCountSpan) sharesCountSpan.textContent = formatCounterNumber(newCount);
            });

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

// ==========================================
// 7. Project Views Badge (Project Detail Pages)
// ==========================================
function initProjectViewsBadge() {
    const main = document.querySelector('main');
    if (!main) return;

    // Check if on a project detail page
    const path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
    const segments = path.split('/').filter(Boolean);
    const projIdx = segments.indexOf('projects');
    if (projIdx === -1 || !segments[projIdx + 1]) return;
    const projectSlug = segments[projIdx + 1];
    const apiKey = `hb-proj-${projectSlug}-views`;

    // Find the Back link inside main
    const backLink = main.querySelector('a[href="/projects/"], a[href="/projects"]');
    if (!backLink || backLink.closest('[data-project-topbar]')) return;

    // Wrap backLink in a flex container row
    const topBar = document.createElement('div');
    topBar.setAttribute('data-project-topbar', '');
    topBar.className = 'flex items-center justify-between flex-wrap gap-4 mb-8 w-full';

    backLink.classList.remove('mb-8');
    backLink.parentNode.insertBefore(topBar, backLink);
    topBar.appendChild(backLink);

    // Create Right-aligned Views Badge
    const badge = document.createElement('div');
    badge.className = 'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:border-adguard/50';
    badge.setAttribute('title', 'Project Views');
    badge.innerHTML = `
        <i class="fa-solid fa-eye text-adguard text-sm"></i>
        <span id="project-views-count" class="font-bold text-gray-900 dark:text-white">...</span>
        <span class="text-xs text-gray-500 dark:text-gray-400 font-normal" data-i18n="viewsLabel">views</span>
    `;
    topBar.appendChild(badge);

    // Track or fetch view count
    trackCounterView(apiKey, `proj_${projectSlug}`).then(val => {
        const el = document.getElementById('project-views-count');
        if (el) el.textContent = formatCounterNumber(val);
    });
}

// ==========================================
// 8. Home Page Total Visits Counter
// ==========================================
function initHomeViewsCounter() {
    const totalViewsEl = document.getElementById('site-total-views');
    if (!totalViewsEl) return;

    trackCounterView('hb-site-total-views', 'home_site').then(val => {
        if (totalViewsEl) totalViewsEl.textContent = formatCounterNumber(val);
    });
}

// ==========================================
// 9. News Cards Stats (News Feed / Listing Page)
// ==========================================
function initNewsCardsStats() {
    const articles = document.querySelectorAll('article.group');
    if (!articles.length) return;

    articles.forEach(article => {
        if (article.querySelector('[data-news-card-stats]')) return;

        // Find article link
        const link = article.querySelector('a[href*="/news/"]');
        if (!link) return;

        const href = link.getAttribute('href');
        const cleanHref = href.replace(/\/index\.html$/, '').replace(/\/$/, '');
        const segments = cleanHref.split('/').filter(Boolean);
        const newsIdx = segments.indexOf('news');
        if (newsIdx === -1 || !segments[newsIdx + 1]) return;
        const slug = segments[newsIdx + 1];

        const viewsKey = `hb-news-${slug}-views`;
        const sharesKey = `hb-news-${slug}-shares`;

        // Find author container (or last container)
        const authorBadge = article.querySelector('.mt-auto');
        if (!authorBadge) return;

        const footerRow = document.createElement('div');
        footerRow.setAttribute('data-news-card-stats', '');
        footerRow.className = 'mt-auto pt-4 flex items-center justify-between gap-2 flex-wrap border-t border-gray-100 dark:border-gray-700/60 w-full';

        authorBadge.classList.remove('mt-auto');
        authorBadge.parentNode.insertBefore(footerRow, authorBadge);
        footerRow.appendChild(authorBadge);

        const statsPill = document.createElement('div');
        statsPill.className = 'inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-700/70 text-xs font-medium text-gray-600 dark:text-gray-400 shadow-xs';
        statsPill.innerHTML = `
            <span class="inline-flex items-center gap-1.5" title="Views / Reads">
                <i class="fa-solid fa-eye text-adguard text-[11px]"></i>
                <span class="font-bold text-gray-800 dark:text-gray-200 card-views">...</span>
            </span>
            <span class="text-gray-300 dark:text-gray-600 font-light select-none">·</span>
            <span class="inline-flex items-center gap-1.5" title="Shares">
                <i class="fa-solid fa-share-nodes text-emerald-500 text-[11px]"></i>
                <span class="font-bold text-gray-800 dark:text-gray-200 card-shares">...</span>
            </span>
        `;
        footerRow.appendChild(statsPill);

        const viewsEl = statsPill.querySelector('.card-views');
        const sharesEl = statsPill.querySelector('.card-shares');

        // Fetch counts (from cache or API)
        fetchCounterValue(viewsKey).then(v => {
            if (viewsEl) viewsEl.textContent = formatCounterNumber(v);
        });
        fetchCounterValue(sharesKey).then(s => {
            if (sharesEl) sharesEl.textContent = formatCounterNumber(s);
        });
    });
}

// 10. Overview Counter Animation (Home Page)
function initOverviewCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const card = document.getElementById('overviewCard') || counters[0].closest('.rounded-2xl') || counters[0].parentElement;

    function animateCounters() {
        counters.forEach(counter => {
            const target = Number(counter.dataset.target);
            const prefix = counter.dataset.prefix || '';

            if (!Number.isFinite(target)) return;

            if (reduceMotion) {
                counter.textContent = `${prefix}${target}`;
                return;
            }

            if (counter._counterAnimId) {
                cancelAnimationFrame(counter._counterAnimId);
            }

            const duration = Math.min(1800, Math.max(700, 600 + target * 5));
            const startTime = performance.now();

            const animate = currentTime => {
                const progress = Math.min((currentTime - startTime) / duration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                counter.textContent = `${prefix}${Math.round(target * easedProgress)}`;

                if (progress < 1) {
                    counter._counterAnimId = requestAnimationFrame(animate);
                } else {
                    counter.textContent = `${prefix}${target}`;
                    counter._counterAnimId = null;
                }
            };

            counter.textContent = `${prefix}0`;
            counter._counterAnimId = requestAnimationFrame(animate);
        });
    }

    animateCounters();

    if (card) {
        card.addEventListener('mouseenter', animateCounters);
    }
}

// 11. Maintenance Banner Management
function initMaintenanceBanner() {
    if (document.getElementById('siteMaintenanceBanner')) {
        return;
    }

    const nav = document.querySelector('nav');
    if (!nav) return;

    const banner = document.createElement('aside');
    banner.id = 'siteMaintenanceBanner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.className = 'w-full transition-colors duration-300 bg-[#ceead6]/80 dark:bg-[#134229]/80 backdrop-blur-md border-b border-[#a8dab5]/50 dark:border-[#1e5235]/60 text-[#202124] dark:text-[#e8f5e9]';

    banner.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-3.5">
            <p class="m-0 text-sm sm:text-[15px] font-bold text-[#202124] dark:text-[#e8f5e9] leading-snug" data-i18n="maintenanceBannerTitle">
                ${(typeof translations !== 'undefined' && translations[currentLang]?.maintenanceBannerTitle) || 'The website is currently undergoing scheduled maintenance.'}
            </p>
            <p class="m-0 mt-1 text-xs sm:text-sm text-[#3c4043] dark:text-[#c4eed0] leading-relaxed" data-i18n="maintenanceBannerDesc">
                ${(typeof translations !== 'undefined' && translations[currentLang]?.maintenanceBannerDesc) || 'We are performing periodic updates to enhance performance and features. Please stay tuned and check back soon.'}
            </p>
        </div>
    `;

    const mobileMenu = nav.querySelector('#mobileMenu');
    if (mobileMenu) {
        nav.insertBefore(banner, mobileMenu);
    } else {
        nav.appendChild(banner);
    }

    const updateNavHeaderHeight = () => {
        if (nav.firstElementChild) {
            nav.style.setProperty('--nav-header-height', `${nav.firstElementChild.offsetHeight}px`);
        }
    };
    updateNavHeaderHeight();
    window.addEventListener('resize', updateNavHeaderHeight, { passive: true });
}

// 12. Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initMaintenanceBanner();
    initBlogShareAndStats();
    initProjectViewsBadge();
    initHomeViewsCounter();
    initNewsCardsStats();
    setLanguage(currentLang);
    initOverviewCounters();
});
