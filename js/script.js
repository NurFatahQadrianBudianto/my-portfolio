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
    
    // Alamat endpoint REST API Supabase untuk tabel 'projects'
    const apiURL = `${supabaseUrl}/rest/v1/projects?select=*`;

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
            throw new Error("Gagal merespons API Supabase. Periksa RLS atau Kunci Anda.");
        }

        const dataProyek = await response.json();
        const container = document.getElementById("project-container");

        if (!container) return;

        // Jika database di cloud kosong
        if (dataProyek.length === 0) {
            container.innerHTML = `<p class="text-center text-slate-500 col-span-3 py-10">Database kosong. Silakan isi row di Supabase.</p>`;
            return;
        }

        // Looping data dari cloud dan menyulapnya menjadi komponen HTML kartu proyek (Rata Kanan-Kiri)
        container.innerHTML = dataProyek.map(proj => {
            // Memisahkan tag teks (misal: "AI, IoT") menjadi potongan label kecil
            const listTag = proj.tags ? proj.tags.split(',') : [];
            
            return `
                <div class="bg-card p-8 rounded-xl border border-slate-700/50 hover:border-primary/50 hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full">
                    <div class="flex justify-between items-center mb-6">
                        <svg class="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                        </svg>
                    </div>
                    <h4 class="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">${proj.title}</h4>
                    <p class="text-slate-400 text-sm mb-6 flex-grow text-left">${proj.description}</p>
                    <div class="flex flex-wrap gap-2 font-mono text-xs text-primary mt-auto">
                        ${listTag.map(tag => `<span>${tag.trim()}</span>`).join('')}
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Gagal memuat database cloud:", error);
        const container = document.getElementById("project-container");
        if (container) {
            container.innerHTML = `<p class="text-center text-red-500 col-span-3 py-10">Koneksi Database Gagal. Pastikan URL & Anon Key Benar.</p>`;
        }
    }
}

// 3. Gabungkan semua komponen saat halaman web dibuka
document.addEventListener("DOMContentLoaded", async () => {
    // Muat komponen HTML lokal dulu
    await includeComponent("about", "components/about.html");
    await includeComponent("projects", "components/projects.html"); 
    await includeComponent("experience", "components/experience.html");
    
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