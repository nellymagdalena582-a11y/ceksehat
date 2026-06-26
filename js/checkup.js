// Check Up Management Module for CekSehat
document.addEventListener("DOMContentLoaded", () => {
    // Initial load
    setTimeout(() => {
        populateDropdowns();
        renderCheckup();
    }, 50);

    // Setup Event Listeners
    setupEventListeners();
});

// Cache DOM Elements
const modal = document.getElementById("checkup-modal");
const form = document.getElementById("checkup-form");
const btnTambah = document.getElementById("btn-tambah-checkup");
const btnBatal = document.getElementById("btn-batal-checkup");
const btnClose = document.getElementById("close-checkup-modal");
const searchInput = document.getElementById("search-checkup-input");
const tableBody = document.getElementById("tabelData");

const selectPasien = document.getElementById("checkup-pasien");
const selectDokter = document.getElementById("checkup-dokter");

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
            renderCheckup(e.target.value);
        });
    }
}

// Populate Patient and Doctor Dropdowns
function populateDropdowns() {
    const patients = getStorage("pengguna");
    const doctors = getStorage("dokter");

    // Clear and reset dropdowns
    if (selectPasien) {
        selectPasien.innerHTML = '<option value="">-- Pilih Pasien --</option>';
        patients.forEach(p => {
            selectPasien.innerHTML += `<option value="${p.id}">${p.nama}</option>`;
        });
    }

    if (selectDokter) {
        selectDokter.innerHTML = '<option value="">-- Pilih Dokter --</option>';
        // Only active doctors or all doctors
        doctors.forEach(d => {
            const statusSuffix = d.status === "Tidak Aktif" ? " (Tidak Aktif)" : "";
            selectDokter.innerHTML += `<option value="${d.id}">${d.nama}${statusSuffix}</option>`;
        });
    }
}

// Automatically fill gender and age fields when patient is selected
window.fillPasienSpecs = function() {
    const patientId = selectPasien.value;
    const inputUmur = document.getElementById("checkup-umur");
    const inputJk = document.getElementById("checkup-jk");

    if (!patientId) {
        inputUmur.value = "";
        inputJk.value = "";
        return;
    }

    const patients = getStorage("pengguna");
    const selected = patients.find(p => p.id === patientId);

    if (selected) {
        inputUmur.value = selected.umur;
        inputJk.value = selected.jk;
    } else {
        inputUmur.value = "";
        inputJk.value = "";
    }
};

// Open modal for adding/editing
function openModal(checkup = null) {
    populateDropdowns(); // Ensure latest data is loaded
    
    if (checkup) {
        document.getElementById("modal-title").innerText = "Edit Rekam Check Up";
        document.getElementById("edit-checkup-id").value = checkup.id;
        
        selectPasien.value = checkup.pasienId;
        fillPasienSpecs(); // Auto-populate age/gender
        
        selectDokter.value = checkup.dokterId;
        document.getElementById("checkup-tinggi").value = checkup.tinggi;
        document.getElementById("checkup-berat").value = checkup.berat;
        document.getElementById("checkup-td").value = checkup.td;
        document.getElementById("checkup-gula").value = checkup.gula;
        document.getElementById("checkup-suhu").value = checkup.suhu;
    } else {
        document.getElementById("modal-title").innerText = "Pemeriksaan Check Up Kesehatan";
        form.reset();
        document.getElementById("edit-checkup-id").value = "";
        document.getElementById("checkup-umur").value = "";
        document.getElementById("checkup-jk").value = "";
    }
    modal.classList.add("show");
}

function closeModal() {
    modal.classList.remove("show");
    form.reset();
}

function renderCheckup(filterQuery = "") {
    if (!tableBody) return;

    const checkupList = getStorage("checkup");
    tableBody.innerHTML = "";

    const query = filterQuery.toLowerCase().trim();
    const filtered = checkupList.filter(c => 
        c.pasienNama.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; color: var(--text-muted); padding: 30px;">
                    Tidak ada riwayat check up ditemukan.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(c => {
        let badgeClass = "badge-success";
        const bmi = parseFloat(c.bmi);
        
        if (bmi < 18.5) {
            badgeClass = "badge-primary";
        } else if (bmi >= 18.5 && bmi < 25) {
            badgeClass = "badge-success";
        } else if (bmi >= 25 && bmi < 30) {
            badgeClass = "badge-warning";
        } else {
            badgeClass = "badge-danger";
        }

        tableBody.innerHTML += `
            <tr>
                <td style="font-weight: 600;">${c.pasienNama}</td>
                <td>${c.umur} Th / ${c.jk}</td>
                <td>${c.tinggi} cm / ${c.berat} kg</td>
                <td>
                    <span class="badge ${badgeClass}">
                        ${c.bmiStatus} (${c.bmi})
                    </span>
                </td>
                <td style="font-weight: 500;">${c.td} mmHg</td>
                <td>${c.gula} mg/dL</td>
                <td>${c.suhu} °C</td>
                <td style="font-size: 13px; font-weight: 500;">${c.dokterNama}</td>
                <td>${c.tanggal}</td>
                <td style="text-align: center;">
                    <button class="btn-edit" style="margin-right: 4px;" onclick="editCheckup('${c.id}')">✏️ Edit</button>
                    <button class="btn-hapus" onclick="deleteCheckup('${c.id}')">🗑️ Hapus</button>
                </td>
            </tr>
        `;
    });
}

function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById("edit-checkup-id").value;
    const pasienId = selectPasien.value;
    const dokterId = selectDokter.value;
    const tinggi = parseFloat(document.getElementById("checkup-tinggi").value);
    const berat = parseFloat(document.getElementById("checkup-berat").value);
    const td = document.getElementById("checkup-td").value.trim();
    const gula = parseInt(document.getElementById("checkup-gula").value);
    const suhu = parseFloat(document.getElementById("checkup-suhu").value);

    // Retrieve Patient & Doctor detailed properties
    const patients = getStorage("pengguna");
    const doctors = getStorage("dokter");

    const patient = patients.find(p => p.id === pasienId);
    const doctor = doctors.find(d => d.id === dokterId);

    if (!patient || !doctor) {
        alert("Pilih pasien dan dokter yang valid!");
        return;
    }

    // Calculate BMI status
    const bmiVal = (berat / ((tinggi / 100) * (tinggi / 100))).toFixed(2);
    let bmiStatus = "Normal";
    const bmiNum = parseFloat(bmiVal);
    if (bmiNum < 18.5) {
        bmiStatus = "Kurus";
    } else if (bmiNum >= 18.5 && bmiNum < 25) {
        bmiStatus = "Normal";
    } else if (bmiNum >= 25 && bmiNum < 30) {
        bmiStatus = "Kelebihan Berat Badan";
    } else {
        bmiStatus = "Obesitas";
    }

    // Date
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const checkupList = getStorage("checkup");

    if (id) {
        // Edit existing
        const index = checkupList.findIndex(c => c.id === id);
        if (index !== -1) {
            checkupList[index] = {
                id,
                pasienId,
                pasienNama: patient.nama,
                umur: patient.umur,
                jk: patient.jk,
                tinggi,
                berat,
                bmi: bmiVal,
                bmiStatus,
                td,
                gula,
                suhu,
                dokterId,
                dokterNama: doctor.nama,
                tanggal: checkupList[index].tanggal // Retain original checkup date
            };
            setStorage("checkup", checkupList);
            addNotification(`Pemeriksaan check up untuk ${patient.nama} berhasil diperbarui.`);
        }
    } else {
        // Add new
        const newCheckup = {
            id: generateId(),
            pasienId,
            pasienNama: patient.nama,
            umur: patient.umur,
            jk: patient.jk,
            tinggi,
            berat,
            bmi: bmiVal,
            bmiStatus,
            td,
            gula,
            suhu,
            dokterId,
            dokterNama: doctor.nama,
            tanggal: formattedDate
        };
        checkupList.push(newCheckup);
        setStorage("checkup", checkupList);
        addNotification(`Pemeriksaan check up untuk ${patient.nama} berhasil disimpan.`);
    }

    closeModal();
    renderCheckup(searchInput ? searchInput.value : "");
}

// Exposed to global scope
window.editCheckup = function(id) {
    const checkupList = getStorage("checkup");
    const checkup = checkupList.find(c => c.id === id);
    if (checkup) {
        openModal(checkup);
    }
};

window.deleteCheckup = function(id) {
    const checkupList = getStorage("checkup");
    const checkup = checkupList.find(c => c.id === id);
    if (!checkup) return;

    if (confirm(`Apakah Anda yakin ingin menghapus rekam medis untuk ${checkup.pasienNama} pada tanggal ${checkup.tanggal}?`)) {
        const updatedList = checkupList.filter(c => c.id !== id);
        setStorage("checkup", updatedList);
        addNotification(`Rekam medis ${checkup.pasienNama} telah dihapus.`);
        renderCheckup(searchInput ? searchInput.value : "");
    }
};
