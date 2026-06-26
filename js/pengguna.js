// Pengguna (Patient) Management Module for CekSehat
document.addEventListener("DOMContentLoaded", () => {
    // Initial load
    setTimeout(renderPengguna, 50);

    // Setup Event Listeners
    setupEventListeners();
});

// Cache DOM Elements
const modal = document.getElementById("pengguna-modal");
const form = document.getElementById("pengguna-form");
const btnTambah = document.getElementById("btn-tambah-pengguna");
const btnBatal = document.getElementById("btn-batal-pengguna");
const btnClose = document.getElementById("close-pengguna-modal");
const searchInput = document.getElementById("search-pengguna-input");
const tableBody = document.getElementById("pengguna-table-body");

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
            renderPengguna(e.target.value);
        });
    }
}

// Open modal for adding/editing
function openModal(pengguna = null) {
    if (pengguna) {
        document.getElementById("modal-title").innerText = "Edit Data Pengguna";
        document.getElementById("edit-pengguna-id").value = pengguna.id;
        document.getElementById("pengguna-nama").value = pengguna.nama;
        document.getElementById("pengguna-email").value = pengguna.email;
        document.getElementById("pengguna-telepon").value = pengguna.telepon;
        document.getElementById("pengguna-jk").value = pengguna.jk;
        document.getElementById("pengguna-umur").value = pengguna.umur;
    } else {
        document.getElementById("modal-title").innerText = "Tambah Data Pengguna";
        form.reset();
        document.getElementById("edit-pengguna-id").value = "";
    }
    modal.classList.add("show");
}

function closeModal() {
    modal.classList.remove("show");
    form.reset();
}

function renderPengguna(filterQuery = "") {
    if (!tableBody) return;

    const penggunaList = getStorage("pengguna");
    tableBody.innerHTML = "";

    const query = filterQuery.toLowerCase().trim();
    const filtered = penggunaList.filter(p => 
        p.nama.toLowerCase().includes(query) || 
        p.email.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">
                    Tidak ada data pengguna ditemukan.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach((p, index) => {
        tableBody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td style="font-weight: 600;">${p.nama}</td>
                <td>${p.email}</td>
                <td>${p.telepon}</td>
                <td>
                    <span class="badge ${p.jk === 'Laki-laki' ? 'badge-primary' : 'badge-warning'}">
                        ${p.jk}
                    </span>
                </td>
                <td>${p.umur} Tahun</td>
                <td style="text-align: center;">
                    <button class="btn-edit" style="margin-right: 6px;" onclick="editPengguna('${p.id}')">✏️ Edit</button>
                    <button class="btn-hapus" onclick="deletePengguna('${p.id}')">🗑️ Hapus</button>
                </td>
            </tr>
        `;
    });
}

function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById("edit-pengguna-id").value;
    const nama = document.getElementById("pengguna-nama").value.trim();
    const email = document.getElementById("pengguna-email").value.trim();
    const telepon = document.getElementById("pengguna-telepon").value.trim();
    const jk = document.getElementById("pengguna-jk").value;
    const umur = parseInt(document.getElementById("pengguna-umur").value);

    const penggunaList = getStorage("pengguna");

    if (id) {
        // Edit existing
        const index = penggunaList.findIndex(p => p.id === id);
        if (index !== -1) {
            penggunaList[index] = { id, nama, email, telepon, jk, umur };
            setStorage("pengguna", penggunaList);
            addNotification(`Data pengguna ${nama} berhasil diperbarui.`);
        }
    } else {
        // Add new
        const newPengguna = {
            id: generateId(),
            nama,
            email,
            telepon,
            jk,
            umur
        };
        penggunaList.push(newPengguna);
        setStorage("pengguna", penggunaList);
        addNotification(`Pengguna baru ${nama} berhasil ditambahkan.`);
    }

    closeModal();
    renderPengguna(searchInput ? searchInput.value : "");
}

// Exposed to global scope for onclick attributes in html
window.editPengguna = function(id) {
    const penggunaList = getStorage("pengguna");
    const pengguna = penggunaList.find(p => p.id === id);
    if (pengguna) {
        openModal(pengguna);
    }
};

window.deletePengguna = function(id) {
    const penggunaList = getStorage("pengguna");
    const pengguna = penggunaList.find(p => p.id === id);
    if (!pengguna) return;

    if (confirm(`Apakah Anda yakin ingin menghapus pengguna ${pengguna.nama}? Semua data pemeriksaan terkait tidak akan terpengaruh.`)) {
        const updatedList = penggunaList.filter(p => p.id !== id);
        setStorage("pengguna", updatedList);
        addNotification(`Pengguna ${pengguna.nama} telah dihapus dari sistem.`);
        renderPengguna(searchInput ? searchInput.value : "");
    }
};
