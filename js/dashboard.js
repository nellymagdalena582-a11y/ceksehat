// Dashboard Module for CekSehat
document.addEventListener("DOMContentLoaded", () => {
    // Wait slightly to ensure shared.js has initialized mock data if necessary
    setTimeout(renderDashboard, 50);
});

function renderDashboard() {
    // 1. Fetch data from localStorage
    const pengguna = getStorage("pengguna");
    const dokter = getStorage("dokter");
    const checkup = getStorage("checkup");
    const artikel = getStorage("artikel");
    const notifikasi = getStorage("notifikasi");

    // 2. Render Stat Cards
    document.getElementById("stat-pengguna").innerText = pengguna.length;
    document.getElementById("stat-dokter").innerText = dokter.length;
    document.getElementById("stat-checkup").innerText = checkup.length;
    document.getElementById("stat-artikel").innerText = artikel.length;
    document.getElementById("stat-notif").innerText = notifikasi.length;

    // 3. Render Chart (BMI Distribution)
    renderBmiChart(checkup);

    // 4. Render Recent Checkups
    renderRecentCheckups(checkup);

    // 5. Render Latest Articles
    renderLatestArticles(artikel);
}

function renderBmiChart(checkupData) {
    const ctx = document.getElementById('bmiChart');
    if (!ctx) return;

    // Categorize BMI data
    let underweight = 0;
    let normal = 0;
    let overweight = 0;
    let obese = 0;

    checkupData.forEach(item => {
        const bmi = parseFloat(item.bmi);
        if (bmi < 18.5) {
            underweight++;
        } else if (bmi >= 18.5 && bmi < 25) {
            normal++;
        } else if (bmi >= 25 && bmi < 30) {
            overweight++;
        } else {
            obese++;
        }
    });

    // If there is no checkup data, provide some illustrative default category values
    if (checkupData.length === 0) {
        normal = 1; // Just to make chart look okay
    }

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Kurus (<18.5)', 'Normal (18.5-24.9)', 'Kelebihan BB (25-29.9)', 'Obesitas (>=30)'],
            datasets: [{
                data: [underweight, normal, overweight, obese],
                backgroundColor: [
                    '#d6b4c5', // soft light rose-pink
                    '#8a1d4a', // primary deep plum/berry maroon
                    '#c56e90', // medium berry rose
                    '#4a0a25'  // deep dark berry/plum
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 11,
                            weight: '600'
                        },
                        padding: 15
                    }
                }
            },
            cutout: '65%'
        }
    });
}

function renderRecentCheckups(checkupData) {
    const listContainer = document.getElementById("recent-checkups-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";

    // Show latest 3 checkups
    const sorted = [...checkupData].reverse().slice(0, 3);

    if (sorted.length === 0) {
        listContainer.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 20px;">
                    Belum ada data check up.
                </td>
            </tr>
        `;
        return;
    }

    sorted.forEach(item => {
        let badgeClass = "badge-success";
        let displayStatus = "Normal";

        const bmi = parseFloat(item.bmi);
        if (bmi < 18.5) {
            badgeClass = "badge-primary";
            displayStatus = "Kurus";
        } else if (bmi >= 18.5 && bmi < 25) {
            badgeClass = "badge-success";
            displayStatus = "Normal";
        } else if (bmi >= 25 && bmi < 30) {
            badgeClass = "badge-warning";
            displayStatus = "Kelebihan BB";
        } else {
            badgeClass = "badge-danger";
            displayStatus = "Obesitas";
        }

        listContainer.innerHTML += `
            <tr>
                <td style="font-weight: 600;">${item.pasienNama}</td>
                <td><span class="badge ${badgeClass}">${displayStatus} (${item.bmi})</span></td>
                <td><span style="font-weight: 500; font-size: 13px;">${item.td} mmHg</span></td>
            </tr>
        `;
    });
}

function renderLatestArticles(artikelData) {
    const container = document.getElementById("latest-articles");
    if (!container) return;

    container.innerHTML = "";

    // Show latest 2 articles
    const sorted = [...artikelData].reverse().slice(0, 2);

    if (sorted.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); grid-column: span 2; text-align: center; padding: 20px;">Belum ada artikel.</p>`;
        return;
    }

    sorted.forEach(item => {
        // Snippet length
        const maxChar = 120;
        let snippet = item.konten;
        if (snippet.length > maxChar) {
            snippet = snippet.substring(0, maxChar) + "...";
        }

        container.innerHTML += `
            <div class="article-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; background: white;">
                <div class="article-header" style="background: linear-gradient(135deg, var(--color-primary-light) 0%, rgba(138, 29, 74, 0.05) 100%); color: var(--text-main); padding: 18px 20px; border-bottom: 1px solid var(--border-color);">
                    <div class="article-date" style="color: var(--color-primary); font-size: 11px; font-weight: 700; margin-bottom: 6px;">${item.tanggal}</div>
                    <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); line-height: 1.4; margin: 0;">${item.judul}</h3>
                </div>
                <div class="article-body" style="padding: 18px 20px;">
                    <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin: 0 0 12px 0;">${snippet}</p>
                    <div class="article-footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 10px; font-size: 11px; color: var(--text-muted);">
                        <span>Oleh: <strong style="color: var(--text-main);">${item.penulis}</strong></span>
                        <a href="artikel.html" style="color: var(--color-primary); font-weight: 700;">Baca Selengkapnya →</a>
                    </div>
                </div>
            </div>
        `;
    });
}
