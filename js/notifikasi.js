// Notifikasi Management Module for CekSehat
document.addEventListener("DOMContentLoaded", () => {
    // Initial load
    setTimeout(renderNotifikasi, 50);

    // Setup Event Listeners
    setupEventListeners();
});

// Cache DOM Elements
const listContainer = document.getElementById("notifikasi-container");
const btnTandaiDibaca = document.getElementById("btn-tandai-dibaca");
const btnHapusSemua = document.getElementById("btn-hapus-semua");

function setupEventListeners() {
    if (btnTandaiDibaca) {
        btnTandaiDibaca.addEventListener("click", markAllAsRead);
    }

    if (btnHapusSemua) {
        btnHapusSemua.addEventListener("click", deleteAllNotifications);
    }
}

function renderNotifikasi() {
    if (!listContainer) return;

    const notifications = getStorage("notifikasi");
    listContainer.innerHTML = "";

    if (notifications.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                <span style="font-size: 48px; display: block; margin-bottom: 16px;">🔔</span>
                <h3>Tidak ada notifikasi sistem</h3>
                <p style="margin-top: 8px;">Aktivitas baru akan muncul di sini sebagai pemberitahuan.</p>
            </div>
        `;
        return;
    }

    notifications.forEach(n => {
        const itemClass = n.dibaca ? "notif-item" : "notif-item unread";
        
        let markReadButton = "";
        if (!n.dibaca) {
            markReadButton = `
                <button class="btn-notif-action" onclick="markReadSingle('${n.id}')" title="Tandai Sudah Dibaca">
                    ✔️
                </button>
            `;
        }

        listContainer.innerHTML += `
            <div class="${itemClass}">
                <div class="notif-content">
                    <div class="notif-text">${n.pesan}</div>
                    <div class="notif-time">⏱️ ${n.tanggal}</div>
                </div>
                <div class="notif-actions">
                    ${markReadButton}
                    <button class="btn-notif-action" onclick="deleteSingle('${n.id}')" title="Hapus Notifikasi" style="color: var(--color-danger);">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    });

    // Update the notification badge across the application
    updateNotificationsBadge();
}

function markReadSingle(id) {
    const notifications = getStorage("notifikasi");
    const index = notifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
        notifications[index].dibaca = true;
        setStorage("notifikasi", notifications);
        renderNotifikasi();
    }
}

function deleteSingle(id) {
    const notifications = getStorage("notifikasi");
    const updated = notifications.filter(n => n.id !== id);
    setStorage("notifikasi", updated);
    renderNotifikasi();
}

function markAllAsRead() {
    const notifications = getStorage("notifikasi");
    
    const updated = notifications.map(n => {
        return { ...n, dibaca: true };
    });
    
    setStorage("notifikasi", updated);
    renderNotifikasi();
}

function deleteAllNotifications() {
    if (confirm("Apakah Anda yakin ingin menghapus seluruh log notifikasi sistem?")) {
        setStorage("notifikasi", []);
        renderNotifikasi();
    }
}

// Expose individual action functions to window scope for HTML onclick events
window.markReadSingle = markReadSingle;
window.deleteSingle = deleteSingle;
