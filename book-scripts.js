// ============================================================
// LOGICA DEL LETTORE
// ============================================================

const STORAGE_KEY = 'rivoluzione_quando_progress';

// Stato
let state = {
    currentChapter: 1,
    readChapters: [],
};

// Elementi DOM
const els = {
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('overlay'),
    menuToggle: document.getElementById('menuToggle'),
    sidebarClose: document.getElementById('sidebarClose'),
    chapterList: document.getElementById('chapterList'),
    chapterArticle: document.getElementById('chapterArticle'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    markReadBtn: document.getElementById('markReadBtn'),
    resetBtn: document.getElementById('resetProgress'),
    globalProgress: document.getElementById('globalProgress'),
    globalPercent: document.getElementById('globalPercent'),
};

// ===== STORAGE =====
function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) state = JSON.parse(saved);
    } catch (e) {
        console.warn('Errore caricamento stato:', e);
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Errore salvataggio stato:', e);
    }
}

// ===== SIDEBAR =====
function openSidebar() {
    els.sidebar.classList.add('open');
    els.overlay.classList.add('active');
}
function closeSidebar() {
    els.sidebar.classList.remove('open');
    els.overlay.classList.remove('active');
}

els.menuToggle.addEventListener('click', openSidebar);
els.sidebarClose.addEventListener('click', closeSidebar);
els.overlay.addEventListener('click', closeSidebar);

// ===== RENDER INDICE =====
function renderChapterList() {
    els.chapterList.innerHTML = '';
    CHAPTERS.forEach(ch => {
        const item = document.createElement('div');
        item.className = 'chapter-item';
        if (ch.id === state.currentChapter) item.classList.add('active');
        if (state.readChapters.includes(ch.id)) item.classList.add('read');
        
        item.innerHTML = `
            <div class="chapter-check">${state.readChapters.includes(ch.id) ? '✓' : ''}</div>
            <div class="chapter-title">${ch.number}: ${ch.title}</div>
        `;
        item.addEventListener('click', () => {
            navigateToChapter(ch.id);
            if (window.innerWidth < 1024) closeSidebar();
        });
        els.chapterList.appendChild(item);
    });
}

// ===== RENDER CAPITOLO =====
function renderChapter() {
    const chapter = CHAPTERS.find(c => c.id === state.currentChapter);
    if (!chapter) {
        els.chapterArticle.innerHTML = '<h1>Capitolo non trovato</h1>';
        return;
    }
    
    els.chapterArticle.innerHTML = `
        <div class="chapter-number">${chapter.number}</div>
        <h1>${chapter.title}</h1>
        <p class="chapter-subtitle">${chapter.subtitle}</p>
        ${chapter.content}
    `;
    
    // Aggiorna pulsanti navigazione
    const isFirst = state.currentChapter === CHAPTERS[0].id;
    const isLast = state.currentChapter === CHAPTERS[CHAPTERS.length - 1].id;
    els.prevBtn.disabled = isFirst;
    els.nextBtn.disabled = isLast;
    
    // Aggiorna pulsante "segna come letto"
    const isRead = state.readChapters.includes(chapter.id);
    els.markReadBtn.textContent = isRead ? '✓ Letto' : '✓ Segna come letto';
    els.markReadBtn.classList.toggle('is-read', isRead);
    
    // Scroll in alto
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== PROGRESSO GLOBALE =====
function updateGlobalProgress() {
    const total = CHAPTERS.length;
    const read = state.readChapters.filter(id => CHAPTERS.some(c => c.id === id)).length;
    const percent = total > 0 ? Math.round((read / total) * 100) : 0;
    els.globalProgress.style.width = percent + '%';
    els.globalPercent.textContent = percent + '%';
}

// ===== NAVIGAZIONE =====
function navigateToChapter(id) {
    state.currentChapter = id;
    saveState();
    renderChapterList();
    renderChapter();
    updateGlobalProgress();
}

els.prevBtn.addEventListener('click', () => {
    const idx = CHAPTERS.findIndex(c => c.id === state.currentChapter);
    if (idx > 0) navigateToChapter(CHAPTERS[idx - 1].id);
});

els.nextBtn.addEventListener('click', () => {
    const idx = CHAPTERS.findIndex(c => c.id === state.currentChapter);
    if (idx < CHAPTERS.length - 1) navigateToChapter(CHAPTERS[idx + 1].id);
});

els.markReadBtn.addEventListener('click', () => {
    const id = state.currentChapter;
    const idx = state.readChapters.indexOf(id);
    if (idx > -1) {
        state.readChapters.splice(idx, 1);
    } else {
        state.readChapters.push(id);
    }
    saveState();
    renderChapterList();
    renderChapter();
    updateGlobalProgress();
});

els.resetBtn.addEventListener('click', () => {
    if (confirm('Sei sicuro di voler resettare tutti i progressi?')) {
        state.readChapters = [];
        state.currentChapter = CHAPTERS[0]?.id || 1;
        saveState();
        renderChapterList();
        renderChapter();
        updateGlobalProgress();
    }
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') els.prevBtn.click();
    if (e.key === 'ArrowRight') els.nextBtn.click();
});

// ===== INIT =====
function init() {
    loadState();
    if (!CHAPTERS.some(c => c.id === state.currentChapter)) {
        state.currentChapter = CHAPTERS[0]?.id || 1;
    }
    renderChapterList();
    renderChapter();
    updateGlobalProgress();
}

init();
// Gestione pulsante reset nella topbar
document.getElementById('topbarReset').addEventListener('click', () => {
    if (confirm('Sei sicuro di voler resettare tutti i progressi di lettura?')) {
        state.readChapters = [];
        state.currentChapter = CHAPTERS[0]?.id || 1;
        saveState();
        renderChapterList();
        renderChapter();
        updateGlobalProgress();
    }
});