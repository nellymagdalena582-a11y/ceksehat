// Shared Utility for CekSehat Dashboard
// Handles Mock Data Initialization and Global Shared Actions

document.addEventListener("DOMContentLoaded", () => {
    initMockData();
    updateNotificationsBadge();
    highlightActiveMenu();
    setupMobileSidebar();
});

// Helper functions for localStorage
function getStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function setStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Generate unique ID
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize mock data if empty
function initMockData() {
    // 1. Patients (Pengguna)
    if (!localStorage.getItem("pengguna")) {
        const defaultPengguna = [
            { id: "p1", nama: "Andi Pratama", email: "andi@email.com", telepon: "08123456789", jk: "Laki-laki", umur: 28 },
            { id: "p2", nama: "Siti Nurhaliza", email: "siti@email.com", telepon: "081298765432", jk: "Perempuan", umur: 25 },
            { id: "p3", nama: "Budi Santoso", email: "budi@email.com", telepon: "081333444555", jk: "Laki-laki", umur: 45 }
        ];
        setStorage("pengguna", defaultPengguna);
    }

    // 2. Doctors (Dokter)
    if (!localStorage.getItem("dokter")) {
        const defaultDokter = [
            { id: "d1", nama: "Dr. H. Ahmad Fauzi, Sp.PD", spesialisasi: "Spesialis Penyakit Dalam", telepon: "081122334455", jadwal: "Senin - Jumat (09:00 - 14:00)", status: "Aktif" },
            { id: "d2", nama: "Dr. Rina Amelia, Sp.A", spesialisasi: "Spesialis Anak", telepon: "081223344556", jadwal: "Senin - Sabtu (08:00 - 12:00)", status: "Aktif" },
            { id: "d3", nama: "Dr. Hendra Wijaya, Sp.JP", spesialisasi: "Spesialis Jantung", telepon: "081334455667", jadwal: "Selasa & Kamis (15:00 - 18:00)", status: "Aktif" }
        ];
        setStorage("dokter", defaultDokter);
    }

    // 3. Check Up History
    if (!localStorage.getItem("checkup")) {
        const defaultCheckup = [
            {
                id: "c1",
                pasienId: "p1",
                pasienNama: "Andi Pratama",
                umur: 28,
                jk: "Laki-laki",
                tinggi: 175,
                berat: 70,
                bmi: "22.86",
                bmiStatus: "Normal",
                td: "120/80",
                gula: 95,
                suhu: 36.5,
                dokterId: "d1",
                dokterNama: "Dr. H. Ahmad Fauzi, Sp.PD",
                tanggal: "2026-06-25"
            },
            {
                id: "c2",
                pasienId: "p2",
                pasienNama: "Siti Nurhaliza",
                umur: 25,
                jk: "Perempuan",
                tinggi: 160,
                berat: 65,
                bmi: "25.39",
                bmiStatus: "Kelebihan Berat Badan",
                td: "130/85",
                gula: 110,
                suhu: 36.8,
                dokterId: "d2",
                dokterNama: "Dr. Rina Amelia, Sp.A",
                tanggal: "2026-06-24"
            }
        ];
        setStorage("checkup", defaultCheckup);
    }

    // 4. Articles (Artikel)
    if (!localStorage.getItem("artikel")) {
        const defaultArtikel = [
            {
                id: "a1",
                judul: "Pentingnya Check Up Rutin untuk Mencegah Penyakit",
                konten: "Melakukan check-up kesehatan secara rutin sangat penting dilakukan untuk mendeteksi dini berbagai penyakit serius seperti diabetes, tekanan darah tinggi, hingga kanker sebelum berkembang menjadi parah. Pemeriksaan dini memberikan peluang penyembuhan yang jauh lebih besar bagi pasien.",
                penulis: "Admin CekSehat",
                tanggal: "2026-06-20"
            },
            {
                id: "a2",
                judul: "5 Tips Menjaga Kesehatan Jantung Sejak Dini",
                konten: "Menjaga kesehatan jantung dapat dimulai dengan langkah sederhana, antara lain: 1) Konsumsi makanan berserat dan kurangi lemak jenuh, 2) Berolahraga minimal 30 menit sehari, 3) Jaga berat badan ideal, 4) Hindari rokok dan alkohol, dan 5) Kelola stres dengan meditasi atau rekreasi ringan.",
                penulis: "Dr. Hendra Wijaya, Sp.JP",
                tanggal: "2026-06-22"
            },
            {
                id: "a3",
                judul: "Pola Hidup Sehat di Era Digital bagi Pekerja Kantoran",
                konten: "Duduk di depan layar komputer selama berjam-jam dapat memicu masalah kesehatan otot, tulang belakang, dan mata. Terapkan aturan 20-20-20 (tiap 20 menit tatap layar, lihat objek sejauh 20 kaki selama 20 detik) dan sempatkan berdiri untuk meregangkan tubuh setiap 2 jam.",
                penulis: "Admin CekSehat",
                tanggal: "2026-06-24"
            }
        ];
        setStorage("artikel", defaultArtikel);
    }

    // 5. Notifications (Notifikasi)
    if (!localStorage.getItem("notifikasi")) {
        const defaultNotifikasi = [
            { id: "n1", pesan: "Sistem CekSehat berhasil diinisialisasi.", tanggal: "2026-06-25 18:00", dibaca: false },
            { id: "n2", pesan: "Check Up untuk pasien Andi Pratama berhasil disimpan.", tanggal: "2026-06-25 10:15", dibaca: false },
            { id: "n3", pesan: "Dokter Rina Amelia, Sp.A ditambahkan ke dalam sistem.", tanggal: "2026-06-24 09:30", dibaca: true }
        ];
        setStorage("notifikasi", defaultNotifikasi);
    }
}

// Add a notification dynamically
function addNotification(pesan) {
    const notifications = getStorage("notifikasi");
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    notifications.unshift({
        id: generateId(),
        pesan: pesan,
        tanggal: formattedDate,
        dibaca: false
    });
    
    setStorage("notifikasi", notifications);
    updateNotificationsBadge();
}

// Update notification badge count in Navbar
function updateNotificationsBadge() {
    const notifications = getStorage("notifikasi");
    const unreadCount = notifications.filter(n => !n.dibaca).length;
    
    const badge = document.querySelector(".notif-badge");
    const notifBtn = document.querySelector(".notif-btn");
    
    if (unreadCount > 0) {
        if (!badge) {
            const newBadge = document.createElement("span");
            newBadge.className = "notif-badge";
            newBadge.innerText = unreadCount;
            if (notifBtn) {
                notifBtn.appendChild(newBadge);
            }
        } else {
            badge.innerText = unreadCount;
            badge.style.display = "flex";
        }
    } else {
        if (badge) {
            badge.style.display = "none";
        }
    }
}

// Highlight the active navigation link based on current page
function highlightActiveMenu() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.split("/").pop() || "index.html";
    
    const links = document.querySelectorAll("aside ul li a");
    links.forEach(link => {
        const linkPath = link.getAttribute("href");
        if (linkPath === pageName) {
            link.parentElement.classList.add("active");
        } else {
            link.parentElement.classList.remove("active");
        }
    });
}

// Setup mobile sidebar toggle
function setupMobileSidebar() {
    const sidebar = document.querySelector("aside");
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "menu-toggle";
    toggleBtn.innerHTML = "☰";
    
    const navbar = document.querySelector(".navbar");
    if (navbar && sidebar) {
        const logo = navbar.querySelector(".logo");
        if (logo) {
            navbar.insertBefore(toggleBtn, logo);
        }
        
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("show");
        });
        
        // Close sidebar if clicking outside on mobile
        document.addEventListener("click", (e) => {
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !toggleBtn.contains(e.target) && 
                sidebar.classList.contains("show")) {
                sidebar.classList.remove("show");
            }
        });
    }
}
