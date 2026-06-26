// Dokter Management Module for CekSehat
document.addEventListener("DOMContentLoaded", () => {
    // Initial load
    setTimeout(renderDokter, 50);

    // Setup Event Listeners
    setupEventListeners();
});

// Cache DOM Elements
const modal = document.getElementById("dokter-modal");
const form = document.getElementById("dokter-form");
const btnTambah = document.getElementById("btn-tambah-dokter");
const btnBatal = document.getElementById("btn-batal-dokter");
const btnClose = document.getElementById("close-dokter-modal");
const searchInput = document.getElementById("search-dokter-input");
const listContainer = document.getElementById("doctor-list-container");

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
    });

    // Handle Form Submit
    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    }

    // Search Filtering
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            renderDokter(e.target.value);
        });
    }
}

// Open modal for adding/editing
function openModal(dokter = null) {
    if (dokter) {
        document.getElementById("modal-title").innerText = "Edit Data Dokter";
        document.getElementById("edit-dokter-id").value = dokter.id;
        document.getElementById("dokter-nama").value = dokter.nama;
        document.getElementById("dokter-spesialisasi").value = dokter.spesialisasi;
        document.getElementById("dokter-telepon").value = dokter.telepon;
        document.getElementById("dokter-jadwal").value = dokter.jadwal;
        document.getElementById("dokter-status").value = dokter.status;
    } else {
        document.getElementById("modal-title").innerText = "Tambah Data Dokter";
        form.reset();
        document.getElementById("edit-dokter-id").value = "";
    }
    modal.classList.add("show");
}

function closeModal() {
    modal.classList.remove("show");
    form.reset();
}

function renderDokter(filterQuery = "") {
    if (!listContainer) return;
    
    const dokterList = getStorage("dokter");
    listContainer.innerHTML = "";

    const query = filterQuery.toLowerCase().trim();
    const filtered = dokterList.filter(d => 
        d.nama.toLowerCase().includes(query) || 
        d.spesialisasi.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                <h3>Tidak ada data dokter ditemukan</h3>
                <p style="margin-top: 8px;">Silakan tambahkan dokter baru atau ubah kata kunci pencarian Anda.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(dokter => {
        const isAktif = dokter.status === "Aktif";
        const badgeClass = isAktif ? "badge-success" : "badge-danger";
        
        // Doctor avatar letter representation (e.g. "R" for Dr. Rina)
        let initials = "DR";
        const cleanName = dokter.nama.replace(/^(dr\.|Dr\.)\s*/, "");
        if (cleanName.length > 0) {
            initials = cleanName.charAt(0).toUpperCase();
        }

        listContainer.innerHTML += `
            <div class="doctor-card">
                <div class="doctor-avatar-wrapper">
                    <div class="doctor-avatar">
                        ${initials}
                    </div>
                    <div class="doctor-info">
                        <h3>${dokter.nama}</h3>
                        <p>${dokter.spesialisasi}</p>
                    </div>
                </div>
                
                <div class="doctor-details">
                    <div class="doctor-detail-item">
                        <span class="doctor-detail-label">Telepon:</span>
                        <span class="doctor-detail-value">${dokter.telepon}</span>
                    </div>
                    <div class="doctor-detail-item">
                        <span class="doctor-detail-label">Jadwal Praktik:</span>
                        <span class="doctor-detail-value" style="font-size: 11px; max-width: 150px; text-align: right;">${dokter.jadwal}</span>
                    </div>
                    <div class="doctor-detail-item">
                        <span class="doctor-detail-label">Status:</span>
                        <span class="badge ${badgeClass}">${dokter.status}</span>
                    </div>
                </div>
                
                <div class="doctor-actions">
                    <button class="btn-edit" onclick="editDokter('${dokter.id}')">✏️ Edit</button>
                    <button class="btn-hapus" onclick="deleteDokter('${dokter.id}')">🗑️ Hapus</button>
                </div>
            </div>
        `;
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById("edit-dokter-id").value;
    const nama = document.getElementById("dokter-nama").value.trim();
    const spesialisasi = document.getElementById("dokter-spesialisasi").value;
    const telepon = document.getElementById("dokter-telepon").value.trim();
    const jadwal = document.getElementById("dokter-jadwal").value.trim();
    const status = document.getElementById("dokter-status").value;

    const dokterList = getStorage("dokter");

    if (id) {
        // Edit existing
        const index = dokterList.findIndex(d => d.id === id);
        if (index !== -1) {
            dokterList[index] = { id, nama, spesialisasi, telepon, jadwal, status };
            setStorage("dokter", dokterList);
            addNotification(`Data dokter ${nama} berhasil diperbarui.`);
        }
    } else {
        // Add new
        const newDokter = {
            id: generateId(),
            nama,
            spesialisasi,
            telepon,
            jadwal,
            status
        };
        dokterList.push(newDokter);
        setStorage("dokter", dokterList);
        addNotification(`Dokter baru ${nama} berhasil ditambahkan.`);
    }

    closeModal();
    renderDokter(searchInput ? searchInput.value : "");
}

// Exposed to global scope for onclick attributes in html
window.editDokter = function(id) {
    const dokterList = getStorage("dokter");
    const dokter = dokterList.find(d => d.id === id);
    if (dokter) {
        openModal(dokter);
    }
};

window.deleteDokter = function(id) {
    const dokterList = getStorage("dokter");
    const dokter = dokterList.find(d => d.id === id);
    if (!dokter) return;

    if (confirm(`Apakah Anda yakin ingin menghapus data ${dokter.nama}?`)) {
        const updatedList = dokterList.filter(d => d.id !== id);
        setStorage("dokter", updatedList);
        addNotification(`Dokter ${dokter.nama} telah dihapus.`);
        renderDokter(searchInput ? searchInput.value : "");
    }
};
