// =======================
// MAPPING TAHAP → KEY SOLUSI
// =======================
const tahapKeyMap = {
    tahap0: "benih",
    tahap1: "tunas",
    tahap2: "bibit",
    tahap3: "daun",
    tahap4: "bunga",
    tahap5: "buah_muda",
    tahap6: "buah_matang"
};


// =======================
// KONDISI PER TAHAP
// =======================
const kondisiPerTahap = {
    tahap0: ["Benih kering", "Benih berjamur", "Benih tidak tumbuh"],
    tahap1: ["Tunas layu", "Tunas membusuk", "Serangan cacing kecil"],
    tahap2: ["Bibit layu", "Daun pertama menguning", "Akar membusuk"],
    tahap3: ["Daun keriting", "Bercak hitam", "Serangan ulat daun"],
    tahap4: ["Bunga rontok", "Serangan thrips", "Daun menggulung"],
    tahap5: ["Busuk ujung buah", "Bercak kecoklatan", "Lalat buah"],
    tahap6: ["Buah pecah", "Kulit buah rusak", "Busuk penyimpanan"]
};


// =======================
// IMAGE MAP
// =======================
const imageMap = {
    tahap0: "Plant/prosespertumbuhan0.png",
    tahap1: "Plant/prosespertumbuhan1.png",
    tahap2: "Plant/prosespertumbuhan2.png",
    tahap3: "Plant/prosespertumbuhan3.png",
    tahap4: "Plant/prosespertumbuhan4.png",
    tahap5: "Plant/prosespertumbuhan5.png",
    tahap6: "Plant/prosespertumbuhan6.png"
};


// =======================
// SOLUSI TANAMAN PER KONDISI
// (KEY HARUS SAMA DENGAN KALIMAT KONDISI)
// =======================
const plantSolutions = {
    // =====================
    // TAHAP 0 — BENIH
    // =====================
    "Benih kering": {
        title: "Benih Kering",
        cause: "Penyimpanan tidak lembap atau benih terlalu lama disimpan.",
        impact: "Benih gagal berkecambah.",
        fix: "Rendam benih 8–12 jam, gunakan benih yang lebih baru.",
        image: "Plant/BenihKering.png"
    },
    "Benih berjamur": {
        title: "Benih Berjamur",
        cause: "Media terlalu lembap dan tidak steril.",
        impact: "Benih mati sebelum tumbuh.",
        fix: "Gunakan media steril, kurangi penyiraman, beri ventilasi.",
        image: "Plant/BenihBerjamur.png"
    },
    "Benih tidak tumbuh": {
        title: "Benih Tidak Tumbuh",
        cause: "Benih rusak atau suhu tidak sesuai.",
        impact: "Tidak terjadi perkecambahan.",
        fix: "Gunakan benih berkualitas dan jaga suhu 25–30°C.",
        image: "Plant/BenihTidakTumbuh.png"
    },

    // =====================
    // TAHAP 1 — TUNAS
    // =====================
    "Tunas layu": {
        title: "Tunas Layu",
        cause: "Kurang cahaya atau penyiraman tidak tepat.",
        impact: "Tunas berhenti tumbuh.",
        fix: "Tambahkan cahaya 6–8 jam & atur penyiraman."
    },
    "Tunas membusuk": {
        title: "Tunas Membusuk",
        cause: "Kelembapan berlebih meningkatkan jamur.",
        impact: "Tunas mati tiba-tiba.",
        fix: "Kurangi penyiraman & tingkatkan sirkulasi udara."
    },
    "Serangan cacing kecil": {
        title: "Serangan Cacing",
        cause: "Media kotor atau terlalu lembap.",
        impact: "Akar rusak dan mati.",
        fix: "Ganti media steril, gunakan neem oil."
    },

    // =====================
    // TAHAP 2 — BIBIT
    // =====================
    "Bibit layu": {
        title: "Bibit Layu",
        cause: "Akar kurang oksigen atau kekurangan nutrisi.",
        impact: "Pertumbuhan lambat.",
        fix: "Perbaiki drainase, tambahkan pupuk cair ringan."
    },
    "Daun pertama menguning": {
        title: "Daun Pertama Menguning",
        cause: "Kekurangan nitrogen.",
        impact: "Tanaman kurus dan lemah.",
        fix: "Tambahkan pupuk nitrogen rendah (NPK 15-10-10)."
    },
    "Akar membusuk": {
        title: "Akar Membusuk",
        cause: "Overwatering.",
        impact: "Tanaman mati perlahan.",
        fix: "Kurangi penyiraman dan ganti media yang terlalu basah."
    },

    // =====================
    // TAHAP 3 — PERTUMBUHAN DAUN
    // =====================
    "Daun keriting": {
        title: "Daun Keriting",
        cause: "Serangan kutu daun atau kekurangan kalsium.",
        impact: "Fotosintesis menurun.",
        fix: "Semprot neem oil atau berikan Ca."
    },
    "Bercak hitam": {
        title: "Bercak Hitam",
        cause: "Infeksi jamur Alternaria.",
        impact: "Daun rontok.",
        fix: "Gunakan fungisida organik & ventilasi baik."
    },
    "Serangan ulat daun": {
        title: "Serangan Ulat Daun",
        cause: "Larva memakan daun muda.",
        impact: "Daun habis, pertumbuhan berhenti.",
        fix: "Ambil manual atau semprot BT (Bacillus thuringiensis)."
    },

    // =====================
    // TAHAP 4 — BERBUNGA
    // =====================
    "Bunga rontok": {
        title: "Bunga Rontok",
        cause: "Kurang nutrisi K atau suhu terlalu panas.",
        impact: "Buah tidak terbentuk.",
        fix: "Tambahkan pupuk K tinggi, semprot air area sekitar."
    },
    "Serangan thrips": {
        title: "Serangan Thrips",
        cause: "Hama penghisap bunga.",
        impact: "Bunga berubah warna & rontok.",
        fix: "Gunakan perangkap biru atau neem oil."
    },
    "Daun menggulung": {
        title: "Daun Menggulung",
        cause: "Kekurangan air atau virus.",
        impact: "Pertumbuhan menurun.",
        fix: "Perbaiki penyiraman & kontrol hama penghisap."
    },

    // =====================
    // TAHAP 5 — BUAH MUDA
    // =====================
    "Busuk ujung buah": {
        title: "Busuk Ujung Buah (Blossom End Rot)",
        cause: "Kekurangan kalsium.",
        impact: "Ujung buah hitam dan keras.",
        fix: "Tambahkan Ca + stabilkan penyiraman."
    },
    "Bercak kecoklatan": {
        title: "Bercak Coklat",
        cause: "Jamur pada kulit buah.",
        impact: "Buah cacat.",
        fix: "Semprot fungisida organik dan jaga sirkulasi."
    },
    "Lalat buah": {
        title: "Lalat Buah",
        cause: "Hama bertelur pada kulit buah.",
        impact: "Buah berlubang & busuk.",
        fix: "Gunakan perangkap metil eugenol atau bungkus buah."
    },

    // =====================
    // TAHAP 6 — BUAH MATANG
    // =====================
    "Buah pecah": {
        title: "Buah Pecah",
        cause: "Perubahan penyiraman drastis.",
        impact: "Buah rusak dan mudah busuk.",
        fix: "Jaga penyiraman stabil."
    },
    "Kulit buah rusak": {
        title: "Kulit Buah Rusak",
        cause: "Hama kecil atau gesekan.",
        impact: "Kualitas buah menurun.",
        fix: "Bungkus buah dan kontrol hama."
    },
    "Busuk penyimpanan": {
        title: "Busuk Penyimpanan",
        cause: "Jamur pascapanen.",
        impact: "Buah tidak layak konsumsi.",
        fix: "Panen lebih awal dan jangan menyiram berlebihan menjelang panen."
    }
};



// =======================
// DOM GET
// =======================
const stageSelect = document.getElementById("plantStage");
const conditionSelect = document.getElementById("plantCondition");
const img = document.getElementById("plantImage");
const solutionPanel = document.getElementById("solutionPanel");
const solutionTitle = document.getElementById("solutionTitle");
const solutionDesc = document.getElementById("solutionDesc");


// =======================
// KETIKA TAHAP DIPILIH
// =======================
stageSelect.addEventListener("change", () => {
    const tahap = stageSelect.value;

    // Ganti Gambar
    img.style.opacity = 0;
    setTimeout(() => {
        img.src = imageMap[tahap];
        img.style.opacity = 1;
    }, 200);

    // Update Kondisi
    conditionSelect.innerHTML = `<option disabled selected>Pilih Kondisi</option>`;
    kondisiPerTahap[tahap].forEach(k => {
        const opt = document.createElement("option");
        opt.value = k;
        opt.textContent = k;
        conditionSelect.appendChild(opt);
    });

    solutionPanel.classList.add("hidden");
});


// =======================
// KETIKA KONDISI DIPILIH → TAMPILKAN SOLUSI
// =======================
conditionSelect.addEventListener("change", () => {
    const kondisi = conditionSelect.value;

    const solusi = plantSolutions[kondisi];

if (!solusi) {
    solutionTitle.textContent = kondisi;
    solutionDesc.textContent = "Solusi belum tersedia.";
} else {
    solutionTitle.textContent = solusi.title;
    solutionDesc.innerHTML =
        `<b>Penyebab:</b> ${solusi.cause}<br><br>` +
        `<b>Dampak:</b> ${solusi.impact}<br><br>` +
        `<b>Solusi:</b> ${solusi.fix}`;

    // ==== GANTI GAMBAR KONDISI JIKA ADA ====
    if (solusi.image) {
        img.style.opacity = 0;
        setTimeout(() => {
            img.src = solusi.image;
            img.style.opacity = 1;
        }, 200);
    }
}

solutionPanel.classList.remove("hidden");


});
