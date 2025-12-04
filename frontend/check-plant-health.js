const API_BASE = "http://localhost:8000";

let currentStep = 1;
let answers = {
    parameter: {},
    gejala: {}
};

// [PERBAIKAN 1: Menambahkan map label untuk tampilan Review]
const PARAMETER_LABELS = {
    ph: "pH Tanah",
    kelembapan_udara: "Kelembapan Udara",
    suhu: "Suhu Udara",
    kelembapan_tanah: "Kelembapan Tanah"
};
// END PERBAIKAN 1

// STEP CONTROL
function nextStep() {
    document.getElementById(`step-${currentStep}`).classList.remove("active");
    currentStep++;
    document.getElementById(`step-${currentStep}`).classList.add("active");
}

// LOAD GEJALA FROM BACKEND
async function loadGejala() {
    try {
        const res = await fetch(API_BASE + "/gejala");
        if (!res.ok) {
            // Tangani jika server mati atau endpoint tidak ditemukan
            throw new Error(`Gagal mengambil data gejala: ${res.status}`);
        }

        const data = await res.json();

        // Cek apakah data valid dan merupakan array
        if (!Array.isArray(data) || data.length === 0) {
            console.error("Data gejala kosong atau tidak valid.");
            return;
        }

        // HILANGKAN 7 DATA PERTAMA (G01 hingga G07)
        // Kita asumsikan data gejala dari backend sudah terurut (G01, G02, ..., G07, G08, ...)
        // slice(7) akan mengambil elemen mulai dari indeks ke-7 (yaitu elemen ke-8, yang seharusnya G08)
        const gejalaManual = data.slice(7);

        const container = document.getElementById("gejala-container");
        container.innerHTML = ""; // Bersihkan container sebelum mengisi

        // Loop hanya untuk gejala manual (G08 dan seterusnya)
        gejalaManual.forEach(g => {
            container.innerHTML += `
                <div class="gejala-item">
                    <label>
                        <input type="checkbox" id="${g.id}" onchange="toggleGejala('${g.id}')"> 
                        ${g.nama}
                    </label>
                    <div class="slider-container" id="slider-${g.id}">
                        Yakin (%): 
                        <input type="range" min="0" max="100" value="0" 
                            onchange="setConfidence('${g.id}', this.value)">
                    </div>
                </div>
            `;
        });

        // Jika container masih kosong (misal data hanya ada G01-G07)
        if (gejalaManual.length === 0) {
            container.innerHTML = "<p>Tidak ada gejala manual yang tersedia.</p>";
        }

    } catch (error) {
        // Ini mengatasi masalah Gejala tidak keluar.
        console.error("Error saat memuat gejala:", error);
        const container = document.getElementById("gejala-container");
        container.innerHTML = `<p style="color: red;">Gagal memuat gejala dari server (${API_BASE}). Pastikan server berjalan.</p>`;
    }
}

loadGejala();

// TOGGLE SLIDER FOR GEJALA
function toggleGejala(id) {
    const slider = document.getElementById(`slider-${id}`);
    const checkbox = document.getElementById(id);

    if (checkbox.checked) {
        slider.style.display = "block";
        answers.gejala[id] = slider.querySelector("input[type=range]").value;
    } else {
        slider.style.display = "none";
        delete answers.gejala[id];
    }
}

// SET CONFIDENCE FOR GEJALA
function setConfidence(id, value) {
    answers.gejala[id] = value;
}

function getInputValue(id) {
    const element = document.getElementById(id);
    if (element && element.value !== undefined) {
        // Cek apakah ada nilai, jika tidak ada (kosong), kembalikan string kosong
        return element.value || "";
    }
    // Jika elemen tidak ditemukan (null), kembalikan string kosong
    // Ini membantu melewati error fatal
    console.warn(`Elemen dengan ID '${id}' tidak ditemukan (atau null).`);
    return "";
}

// GO TO REVIEW (REVISI LENGKAP DENGAN PENCEGAHAN NULL)
function goToReview() {
    // 1. Simpan semua parameter yang diinput sebelum lanjut ke review
    answers.parameter = {
        ph: {
            value: getInputValue("ph"),
            conf: getInputValue("ph_conf")
        },
        kelembapan_udara: {
            value: getInputValue("hum_air"),
            conf: getInputValue("hum_air_conf")
        },
        suhu: {
            value: getInputValue("suhu"),
            conf: getInputValue("suhu_conf")
        },
        kelembapan_tanah: {
            value: getInputValue("hum_tanah"),
            conf: getInputValue("hum_tanah_conf")
        }
    };

    const reviewDiv = document.getElementById("review");
    reviewDiv.innerHTML = "<h3>Parameter Lingkungan</h3>";

    // 2. Tampilkan Parameter di Review
    Object.entries(answers.parameter).forEach(([k, v]) => {
        // Hanya tampilkan jika nilai atau confidence ada
        if (v.value || parseFloat(v.conf) > 0) {
            // Mengubah nama key agar lebih mudah dibaca
            let displayKey = k.replace(/_/g, ' ').replace('ph', 'pH Tanah').replace('suhu', 'Suhu Udara');
            displayKey = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);

            reviewDiv.innerHTML += `
                <p><strong>${displayKey}</strong>: ${v.value} (Yakin ${v.conf || 0}%)</p>
            `;
        }
    });

    // 3. Tampilkan Gejala Manual di Review (meskipun kosong)
    // Gunakan pengecekan length > 0 agar tidak error jika answers.gejala belum terisi
    if (Object.keys(answers.gejala || {}).length > 0) {
        reviewDiv.innerHTML += "<h3>Gejala Lain (Manual)</h3>";
        Object.entries(answers.gejala).forEach(([k, v]) => {
            reviewDiv.innerHTML += `<p>• ${k} — yakin ${v}%</p>`;
        });
    } else {
        reviewDiv.innerHTML += `<p>Tidak ada gejala manual yang dipilih.</p>`;
    }

    nextStep(); // Lanjut ke STEP 6 (Review)
}


// SEND TO BACKEND (DENGAN LOGIKA PARAMETER & TRY...CATCH)
async function sendToBackend() {
    const kirimButton = document.querySelector("#step-6 button");
    kirimButton.disabled = true;
    kirimButton.textContent = "Memproses...";

    try {
        // ... (Logika penentuan G01-G07 dari parameter yang sudah diperbaiki) ...
        const allGejala = {...answers.gejala };
        const param = answers.parameter;

        const ph = parseFloat(param.ph.value);
        const ph_conf = parseFloat(param.ph.conf);
        const hum_air = parseFloat(param.kelembapan_udara.value);
        const hum_air_conf = parseFloat(param.kelembapan_udara.conf);
        const suhu = parseFloat(param.suhu.value);
        const suhu_conf = parseFloat(param.suhu.conf);
        const hum_tanah = parseFloat(param.kelembapan_tanah.value);
        const hum_tanah_conf = parseFloat(param.kelembapan_tanah.conf);

        if (!isNaN(ph) && ph_conf > 0) {
            if (ph < 5.5) { allGejala["G01"] = ph_conf; } else if (ph > 7.0) { allGejala["G02"] = ph_conf; }
        }
        if (!isNaN(hum_air) && hum_air_conf > 0 && hum_air > 85.0) {
            allGejala["G03"] = hum_air_conf;
        }
        if (!isNaN(suhu) && suhu_conf > 0) {
            if (suhu < 20.0) { allGejala["G04"] = suhu_conf; } else if (suhu > 30.0) { allGejala["G05"] = suhu_conf; }
        }
        if (!isNaN(hum_tanah) && hum_tanah_conf > 0) {
            if (hum_tanah < 40.0) { allGejala["G06"] = hum_tanah_conf; } else if (hum_tanah > 90.0) { allGejala["G07"] = hum_tanah_conf; }
        }
        // ... (End Logika G01-G07) ...

        const scaledGejala = {};
        Object.entries(allGejala).forEach(([k, v]) => {
            scaledGejala[k] = parseFloat(v) / 100.0;
        });

        // if (Object.keys(scaledGejala).length === 0) {
        //     alert("Pilih setidaknya satu gejala (termasuk input parameter) sebelum mengirim.");
        //     kirimButton.disabled = false;
        //     kirimButton.textContent = "Kirim ke Backend";
        //     return;
        // }

        // 4. Kirim ke Backend
        const res = await fetch(API_BASE + "/diagnose", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                gejala: scaledGejala
            }),
        });

        const data = await res.json();
        const hasilDiv = document.getElementById("hasil");

        if (res.ok) {
            if (!Array.isArray(data)) {
                let errorMessage = `Data yang diterima bukan array. Cek log server Python Anda. Data: ${JSON.stringify(data)}`;
                // Jika objeknya punya key 'detail' (error default FastAPI)
                if (data && typeof data === 'object' && data.detail) {
                    errorMessage = `Error dari FastAPI: ${data.detail}`;
                }
                hasilDiv.innerHTML = `<h3>Error Data Server (Backend Crash)</h3><p>${errorMessage}</p>`;
                nextStep();
                return;
            }

            hasilDiv.innerHTML = "";
            data.sort((a, b) => b.confidence - a.confidence);

            let hasResults = false;
            let outputHtml = "";

            data.forEach(d => {
                        if (d.confidence > 0) {
                            hasResults = true;
                            outputHtml += `<div class="result-item"><h5>${d.nama_opt} (${(d.confidence * 100).toFixed(2)}%)</h5><p><strong>Solusi:</strong> ${d.solusi}</p>${d.rekomendasi_produk && d.rekomendasi_produk.length > 0 ? `<h6>Rekomendasi Produk Kimia:</h6><ul>${d.rekomendasi_produk.map(r => `<li>${r.bahan_aktif}: ${r.produk.join(", ")}</li>`).join("")}</ul>` : ''}</div>`;
                }
            });

            if (!hasResults) { hasilDiv.innerHTML = `<p>Tidak ditemukan penyakit/hama berdasarkan gejala yang diberikan.</p>`; } 
            else { hasilDiv.innerHTML = outputHtml; }
            
        } else {
            hasilDiv.innerHTML = `<h3>Error saat Diagnosa</h3><p>Kode Error: ${res.status}. ${data.detail || 'Terjadi kesalahan pada server.'}</p>`;
        }

        nextStep(); 

    } catch (error) {
        const hasilDiv = document.getElementById("hasil");
        hasilDiv.innerHTML = `<h3>Koneksi Gagal</h3><p>Tidak dapat terhubung ke *Backend* (${API_BASE}). Pastikan *server* Anda aktif dan berjalan.</p><p>Detail Error: ${error.message}</p>`;
        console.error("Error saat mengirim ke backend:", error);

        nextStep(); 
    } finally {
        kirimButton.disabled = false;
        kirimButton.textContent = "Kirim ke Backend";
    }
}