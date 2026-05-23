// --- 1. VARIABEL GLOBAL & DICTIONARY UNTUK MULTI-LANGUAGE ---
let currentLanguage = localStorage.getItem('portfolio_lang') || 'id';

const uiTranslations = {
    id: {
        loading: "Menghubungkan ke Cloud Database...",
        empty: "Database kosong. Silakan isi row di Supabase.",
        fail: "Koneksi Database Gagal. Cek console log.",
        projectTitle: `<span class="text-primary font-mono text-xl mr-2">02.</span> Proyek & Riset` // Tambahan judul ID
    },
    en: {
        loading: "Connecting to Cloud Database...",
        empty: "Database is empty. Please add rows in Supabase.",
        fail: "Database Connection Failed. Check console log.",
        projectTitle: `<span class="text-primary font-mono text-xl mr-2">02.</span> Projects & Research` // Tambahan judul EN
    }
};
// ---------------------------------------------------------------------

// 1. Fungsi Umum untuk memuat komponen HTML lokal
async function includeComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Gagal memuat file: ${filePath}`);
        }
        const textData = await response.text();
        document.getElementById(elementId).innerHTML = textData;
    } catch (error) {
        console.error(error);
        document.getElementById(elementId).innerHTML = `<p class="text-center text-red-500 py-10">Gagal memuat konten.</p>`;
    }
}

// 2. Fungsi Utama: Menarik data proyek dari Supabase dan menggambarnya di layar
async function loadSupabaseProjects() {
    // === MASUKKAN KUNCI AKSES DI SINI ===
    const supabaseUrl = "https://oxikwrfniasbqkeiuzjl.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94aWt3cmZuaWFzYnFrZWl1empsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTE5MzgsImV4cCI6MjA5NDU4NzkzOH0.AYnQX8X65gT65BjvCycWp59xnYGnzRXk2QrIJQbKp1E";

    // Alamat endpoint REST API Supabase untuk tabel 'projects' (Diurutkan berdasarkan tahun terbaru)
    const apiURL = `${supabaseUrl}/rest/v1/projects?select=*&order=year.desc`;

    // --- PENAMBAHAN: Ambil elemen h3 di dalam section #projects ---
    const sectionHeader = document.querySelector("#projects h3");
    if (sectionHeader) {
        sectionHeader.innerHTML = uiTranslations[currentLanguage].projectTitle;
    }
    // --------------------------------------------------------------

    const container = document.getElementById("project-container");
    if (!container) return;

    // Gunakan teks loading sesuai bahasa aktif
    container.innerHTML = `<p class="text-center text-slate-500 col-span-3 py-10 font-mono text-sm">${uiTranslations[currentLanguage].loading}</p>`;

    try {
        const response = await fetch(apiURL, {
            method: "GET",
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Gagal merespons API Supabase.");
        }

        const dataProyek = await response.json();

        // Jika database di cloud kosong
        if (dataProyek.length === 0) {
            container.innerHTML = `<p class="text-center text-slate-500 col-span-3 py-10">${uiTranslations[currentLanguage].empty}</p>`;
            return;
        }

        // --- PENAMBAHAN UNTUK IKON DINAMIS ---
        const iconMap = {
            'pole': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8"><path d="M12 2v20"/><path d="M2 5h20"/><path d="M3 3v2"/><path d="M7 3v2"/><path d="M17 3v2"/><path d="M21 3v2"/><path d="m19 5-7 7-7-7"/></svg>',
            'electrical': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"></path></svg>',
            'pesticide': `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11l-3.5-3.5m-3.5 3.5l3.5 3.5M19 11v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8m14 0h-4m-4 0a2 2 0 110-4 2 2 0 010 4z"></path></svg>`,
            'robot': `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 4.5l-2.22 2.22m3.61-.41l2.22-2.22M11 4.5V2m3.61 2.09V2M11 4.5l3.61 0M9 7.5L4 12.5M15 7.5l5 5.0M4 12.5a1 1 0 001 1h2.5M20 12.5a1 1 0 01-1 1h-2.5M4 12.5L2 20h20l-2-7.5M4 12.5h16M7.5 13.5v3m9 0v-3"></path></svg>`,
            'agriculture': `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.318l-1.318-1.318a4.5 4.5 0 00-6.364 0l1.318 1.318M12 4.318l1.318-1.318a4.5 4.5 0 016.364 0l-1.318 1.318M12 4.318v8.636M12 12.954H9M12 12.954h3"></path></svg>`,
            'code': `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>`
        };
        // -------------------------------------

        // Looping data dari cloud dan menyulapnya menjadi komponen HTML kartu proyek
        container.innerHTML = dataProyek.map(proj => {
            // Memisahkan tag teks menjadi potongan label kecil
            const listTag = proj.tags ? proj.tags.split(',') : [];

            // --- LOGIKA IKON DINAMIS ---
            const iconKey = proj.icon_name || 'code';
            const projectIcon = iconMap[iconKey] || iconMap['code'];
            // ---------------------------

            // --- SELEKSI BAHASA DINAMIS DARI SUPABASE ---
            const displayTitle = currentLanguage === 'en' ? (proj.title_en || proj.title) : proj.title;
            const displayDescription = currentLanguage === 'en' ? (proj.description_en || proj.description) : proj.description;
            const displayRole = currentLanguage === 'en' ? (proj.role_en || proj.role) : proj.role;
            // --------------------------------------------

            // --- LOGIKA DATA BARU (Hanya 3 Kolom) ---

            // 1. Render Tahun (Jika ada)
            const yearBadge = proj.year
                ? `<span class="bg-slate-800 border border-slate-700 text-slate-300 text-xs py-1 px-3 rounded-full font-mono mb-4 inline-block">${proj.year}</span>`
                : '';

            // 2. Render Role (Jika ada)
            const roleText = displayRole
                ? `<p class="text-sm text-primary font-medium mb-3">${displayRole}</p>`
                : '';

            // 3. Render Ikon Link Demo (Jika ada)
            const demoIcon = proj.demo_link
                ? `<a href="${proj.demo_link}" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-primary transition-colors" title="Live Demo">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                   </a>`
                : '';
            // ------------------------

            return `
                <div class="bg-card p-8 rounded-xl border border-slate-700/50 hover:border-primary/50 hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full">
                    
                    <div class="flex justify-between items-start mb-6">
                        <div class="bg-slate-800/50 p-3 rounded-lg text-primary">
                            ${projectIcon}
                        </div>
                        <div class="flex gap-4 items-center mt-1">
                            ${demoIcon}
                        </div>
                    </div>
                    
                    <h4 class="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">${displayTitle}</h4>
                    ${roleText}
                    ${yearBadge}
                    
                    <p class="text-slate-400 text-sm mb-6 flex-grow text-left leading-relaxed">${displayDescription}</p>
                    
                    <div class="flex flex-wrap gap-2 font-mono text-xs text-primary mt-auto">
                        ${listTag.map(tag => `<span class="bg-primary/10 px-2 py-1 rounded">${tag.trim()}</span>`).join('')}
                    </div>
                    
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Gagal memuat database cloud:", error);
        container.innerHTML = `<p class="text-center text-red-500 col-span-3 py-10">${uiTranslations[currentLanguage].fail}</p>`;
    }
}

// --- FUNGSI UNTUK MENGATUR TOMBOL AKTIF SECARA VISUAL ---
function updateLanguageButtons() {
    const btnId = document.getElementById('btn-id');
    const btnEn = document.getElementById('btn-en');

    if (!btnId || !btnEn) return;

    if (currentLanguage === 'id') {
        btnId.className = "text-primary font-bold focus:outline-none transition-colors";
        btnEn.className = "text-slate-400 hover:text-white focus:outline-none transition-colors";
    } else {
        btnEn.className = "text-primary font-bold focus:outline-none transition-colors";
        btnId.className = "text-slate-400 hover:text-white focus:outline-none transition-colors";
    }
}

// --- FUNGSI LOGIKA MENGUBAH BAHASA ---
function setupLanguageToggle() {
    const btnId = document.getElementById('btn-id');
    const btnEn = document.getElementById('btn-en');

    if (btnId && btnEn) {
        btnId.addEventListener('click', () => {
            if (currentLanguage === 'id') return;
            currentLanguage = 'id';
            localStorage.setItem('portfolio_lang', 'id');
            updateLanguageButtons();
            loadSupabaseProjects();
        });

        btnEn.addEventListener('click', () => {
            if (currentLanguage === 'en') return;
            currentLanguage = 'en';
            localStorage.setItem('portfolio_lang', 'en');
            updateLanguageButtons();
            loadSupabaseProjects();
        });
    }
}

// 3. Gabungkan semua components saat halaman web dibuka
document.addEventListener("DOMContentLoaded", async () => {
    // Muat komponen HTML lokal dulu
    await includeComponent("about", "components/about.html");
    await includeComponent("projects", "components/projects.html");
    await includeComponent("experience", "components/experience.html");

    // Inisialisasi logika switch bahasa
    setupLanguageToggle();
    updateLanguageButtons();

    // Setelah cangkang proyek siap di layar, tembak API Supabase untuk mengisi datanya
    await loadSupabaseProjects();

    console.log("%cWeb Dinamis Serverless Nur Fatah Berhasil Berjalan!", "color: #14b8a6; font-weight: bold;");
});

// 4. Logika Efek Scroll Navbar
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('glass-nav');
        navbar.classList.remove('nav-transparent', 'py-6');
        navbar.classList.add('py-4');
    } else {
        navbar.classList.add('nav-transparent', 'py-6');
        navbar.classList.remove('glass-nav', 'py-4');
    }
});