// ===============================
// GEJALA LIST
// ===============================
const symptomsList = {
    "daun_menguning": {
        label: "Daun Menguning",
        sliders: [
            { id: "luas", label: "Luas daun yang terdampak", default: 50 },
            { id: "penyebaran", label: "Kecepatan penyebaran", default: 20 }
        ]
    },
    "daun_keriting": {
        label: "Daun Keriting",
        sliders: [
            { id: "intensitas", label: "Intensitas keriting", default: 40 }
        ]
    },
    "bercak_coklat": {
        label: "Bercak Coklat",
        sliders: [
            { id: "intensitas", label: "Intensitas bercak", default: 60 },
            { id: "ukuran", label: "Ukuran bercak", default: 30 }
        ]
    },
    "buah_busuk": {
        label: "Buah Busuk",
        sliders: [
            { id: "tingkat", label: "Tingkat kebusukan", default: 50 }
        ]
    },
    "batang_menghitam": {
        label: "Batang Menghitam",
        sliders: [
            { id: "panjang", label: "Panjang batang terdampak", default: 40 }
        ]
    },
    "serangga": {
        label: "Adanya Serangga",
        sliders: [
            { id: "jumlah", label: "Jumlah serangga", default: 30 }
        ]
    },
    "tanaman_layu": {
        label: "Tanaman Layu",
        sliders: [
            { id: "tingkat", label: "Tingkat kelayuan", default: 50 }
        ]
    }
};


// ===============================
// GENERATE SLIDERS
// ===============================
function generateSliders() {
    const container = document.getElementById("sliderContainer");
    container.innerHTML = "";

    const checked = document.querySelectorAll(".symptom-checkbox:checked");

    checked.forEach(cb => {
        const key = cb.value;
        const symptom = symptomsList[key];

        let block = `
            <div class="slider-block">
                <h3>Detail Gejala: ${symptom.label}</h3>
                <hr />
        `;

        symptom.sliders.forEach(s => {
            block += `
                <label>${s.label}</label>
                <input type="range" 
                    id="${key}_${s.id}" 
                    min="0" max="100" 
                    value="${s.default}"
                    oninput="updateSliderText('${key}_${s.id}')"
                >
                <span id="${key}_${s.id}_value">${s.default}%</span>
            `;
        });

        block += `</div>`;
        container.innerHTML += block;
    });
}

function updateSliderText(id) {
    document.getElementById(id + "_value").innerText =
        document.getElementById(id).value + "%";
}


// ===============================
// ANALISA
// ===============================
function analyze() {
    const selectedSymptoms = [];
    const detail = {};
    
    // gejala yg dicentang
    document.querySelectorAll(".symptom-checkbox:checked").forEach(cb => {
        selectedSymptoms.push(cb.value);
        detail[cb.value] = {};

        // ambil slider tiap gejala
        const sliders = symptomsList[cb.value].sliders;
        sliders.forEach(s => {
            const sliderId = `${cb.value}_${s.id}`;
            detail[cb.value][s.id] = document.getElementById(sliderId).value;
        });
    });

    // kondisi lingkungan
    const environment = {
        penyiraman: document.getElementById("penyiraman").value,
        cahaya: document.getElementById("cahaya").value,
        nutrisi: document.getElementById("nutrisi").value
    };

    // prepare payload ke backend
    const payload = {
        symptoms: selectedSymptoms,
        details: detail,
        environment: environment
    };

    console.log("KIRIM KE BACKEND:", payload);

    // 🔵 SIMULASI HASIL UNTUK UI
    showResult({
        disease: "Early Blight (Alternaria solani)",
        probability: 78,
        reason: [
            "Daun menguning dengan intensitas 60%",
            "Bercak coklat ukuran sedang",
            "Kondisi lingkungan mendukung jamur"
        ],
        solution: [
            "Gunakan fungisida mankozeb / klorotalonil",
            "Pangkas daun bagian bawah",
            "Kurangi penyiraman berlebih"
        ]
    });

    saveHistory("Daun menguning + Bercak coklat", "Early Blight", 78);
}


// ===============================
// TAMPILKAN HASIL ANALISA
// ===============================
function showResult(result) {
    const box = document.getElementById("resultBox");
    box.style.display = "block";

    document.getElementById("resultDisease").innerText = result.disease;
    document.getElementById("resultProbability").innerText = result.probability + "%";

    document.getElementById("resultReason").innerHTML =
        result.reason.map(r => `<li>${r}</li>`).join("");

    document.getElementById("resultSolution").innerHTML =
        result.solution.map(s => `<li>${s}</li>`).join("");

    box.scrollIntoView({ behavior: "smooth" });
}


// ===============================
// ANALISA BARU (RESET)
// ===============================
function newAnalysis() {
    // hilangkan checkbox
    document.querySelectorAll(".symptom-checkbox").forEach(cb => cb.checked = false);

    // kosongkan slider
    document.getElementById("sliderContainer").innerHTML = "";

    // sembunyikan result
    document.getElementById("resultBox").style.display = "none";

    window.scrollTo({ top: 0, behavior: "smooth" });
}


// ===============================
// HISTORY LOCAL STORAGE
// ===============================
function saveHistory(symptomText, disease, prob) {
    let h = JSON.parse(localStorage.getItem("history")) || [];

    h.unshift({
        date: new Date().toLocaleDateString(),
        symptom: symptomText,
        disease,
        prob
    });

    h = h.slice(0, 3); // hanya simpan 3 terbaru

    localStorage.setItem("history", JSON.stringify(h));

    loadHistory();
}

function loadHistory() {
    const list = document.getElementById("historyList");
    let h = JSON.parse(localStorage.getItem("history")) || [];

    list.innerHTML = h.map(item =>
        `<li>${item.date} – ${item.symptom} → ${item.disease} (${item.prob}%)</li>`
    ).join("");
}

window.onload = loadHistory;

document.querySelectorAll(".symptom-checkbox").forEach(cb => {
    cb.addEventListener("change", generateSliders);
});
