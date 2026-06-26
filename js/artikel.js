// Artikel (Health Articles) Management Module for CekSehat
document.addEventListener("DOMContentLoaded", () => {
    // Initial load
    setTimeout(renderArtikel, 50);

    // Setup Event Listeners
    setupEventListeners();
});

// Cache DOM Elements
const modal = document.getElementById("artikel-modal");
const form = document.getElementById("artikel-form");
const btnTambah = document.getElementById("btn-tambah-artikel");
const btnBatal = document.getElementById("btn-batal-artikel");
const btnClose = document.getElementById("close-artikel-modal");
const searchInput = document.getElementById("search-artikel-input");
const listContainer = document.getElementById("articles-container");

// Detail Modal Elements
const detailModal = document.getElementById("detail-artikel-modal");
const btnCloseDetail = document.getElementById("close-detail-modal");
const btnTutupDetail = document.getElementById("btn-tutup-detail");

function setupEventListeners() {
    // Open Modal to Add
    if (btnTambah) {
        btnTambah.addEventListener("click", () => {
            openModal();
        });
    }

    // Close Modal
    if (btnBatal) btnBatal.addEventListener("click", closeModal);
    if (btnClose) btnClose.addEventListener("click", closeModal);
    window.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
        if (e.target === detailModal) closeDetailModal();
    });

    // Close Detail Modal
    if (btnCloseDetail) btnCloseDetail.addEventListener("click", closeDetailModal);
    if (btnTutupDetail) btnTutupDetail.addEventListener("click", closeDetailModal);

    // Handle Form Submit
    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    }

    // Search Filtering
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            renderArtikel(e.target.value);
        });
    }
}

// Open modal for adding/editing
function openModal(artikel = null) {
    if (artikel) {
        document.getElementById("modal-title").innerText = "Edit Artikel Kesehatan";
        document.getElementById("edit-artikel-id").value = artikel.id;
        document.getElementById("artikel-judul").value = artikel.judul;
        document.getElementById("artikel-konten").value = artikel.konten;
        document.getElementById("artikel-penulis").value = artikel.penulis;
    } else {
        document.getElementById("modal-title").innerText = "Buat Artikel Kesehatan Baru";
        form.reset();
        document.getElementById("edit-artikel-id").value = "";
    }
    modal.classList.add("show");
}

function closeModal() {
    modal.classList.remove("show");
    form.reset();
}

// Open Detail View Modal
window.viewDetailArtikel = function(id) {
    const articles = getStorage("artikel");
    const article = articles.find(a => a.id === id);
    if (!article) return;

    document.getElementById("detail-title").innerText = article.judul;
    document.getElementById("detail-author").innerText = `✍️ Penulis: ${article.penulis}`;
    document.getElementById("detail-date").innerText = `📅 Tanggal: ${article.tanggal}`;
    document.getElementById("detail-content").innerText = article.konten;

    detailModal.classList.add("show");
};

function closeDetailModal() {
    detailModal.classList.remove("show");
}

function renderArtikel(filterQuery = "") {
    if (!listContainer) return;

    const articles = getStorage("artikel");
    listContainer.innerHTML = "";

    const query = filterQuery.toLowerCase().trim();
    const filtered = articles.filter(a => 
        a.judul.toLowerCase().includes(query) || 
        a.penulis.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                <h3>Belum ada artikel kesehatan</h3>
                <p style="margin-top: 8px;">Silakan buat artikel baru atau ubah kata kunci pencarian Anda.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(article => {
        // Snippet length
        const maxChar = 180;
        let snippet = article.konten;
        if (snippet.length > maxChar) {
            snippet = snippet.substring(0, maxChar) + "...";
        }

        listContainer.innerHTML += `
            <div class="article-card">
                <div class="article-header">
                    <div class="article-date">${article.tanggal}</div>
                    <h3>${article.judul}</h3>
                </div>
                
                <div class="article-body">
                    <p>${snippet}</p>
                    <div class="article-footer">
                        <span>Penulis: <strong class="article-author">${article.penulis}</strong></span>
                        <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;" onclick="viewDetailArtikel('${article.id}')">Baca Selengkapnya</button>
                    </div>
                </div>
                
                <div class="doctor-actions" style="padding: 12px 24px; background-color: var(--bg-primary); border-top: 1px solid var(--border-color);">
                    <button class="btn-edit" onclick="editArtikel('${article.id}')">✏️ Edit</button>
                    <button class="btn-hapus" onclick="deleteArtikel('${article.id}')">🗑️ Hapus</button>
                </div>
            </div>
        `;
    });
}

function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById("edit-artikel-id").value;
    const judul = document.getElementById("artikel-judul").value.trim();
    const konten = document.getElementById("artikel-konten").value.trim();
    const penulis = document.getElementById("artikel-penulis").value.trim();

    const articles = getStorage("artikel");

    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (id) {
        // Edit existing
        const index = articles.findIndex(a => a.id === id);
        if (index !== -1) {
            articles[index] = {
                id,
                judul,
                konten,
                penulis,
                tanggal: articles[index].tanggal // Retain original publish date
            };
            setStorage("artikel", articles);
            addNotification(`Artikel "${judul}" berhasil diperbarui.`);
        }
    } else {
        // Add new
        const newArticle = {
            id: generateId(),
            judul,
            konten,
            penulis,
            tanggal: formattedDate
        };
        articles.push(newArticle);
        setStorage("artikel", articles);
        addNotification(`Artikel "${judul}" telah dipublikasikan.`);
    }

    closeModal();
    renderArtikel(searchInput ? searchInput.value : "");
}

// Exposed to global scope
window.editArtikel = function(id) {
    const articles = getStorage("artikel");
    const article = articles.find(a => a.id === id);
    if (article) {
        openModal(article);
    }
};

window.deleteArtikel = function(id) {
    const articles = getStorage("artikel");
    const article = articles.find(a => a.id === id);
    if (!article) return;

    if (confirm(`Apakah Anda yakin ingin menghapus artikel "${article.judul}"?`)) {
        const updatedList = articles.filter(a => a.id !== id);
        setStorage("artikel", updatedList);
        addNotification(`Artikel "${article.judul}" telah dihapus.`);
        renderArtikel(searchInput ? searchInput.value : "");
    }
};
