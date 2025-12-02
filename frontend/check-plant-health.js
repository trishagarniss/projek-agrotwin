// Load gejala ketika halaman dibuka
document.addEventListener("DOMContentLoaded", () => {
    // load gejala
    fetch("http://127.0.0.1:5000/gejala")
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById("gejalaSelect");
            data.forEach(g => {
                const opt = document.createElement("option");
                opt.value = g.id;
                opt.textContent = `${g.id} - ${g.nama}`;
                select.appendChild(opt);
            });
        });

    // pasang listener
    document.getElementById("btnSubmit").addEventListener("click", () => {
        const gejalaID = document.getElementById("gejalaSelect").value;

        if (!gejalaID) {
            alert("Pilih gejala dulu!");
            return;
        }

        fetch("http://127.0.0.1:5000/diagnose", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gejala: gejalaID })
        })
        .then(res => res.json())
        .then(data => renderResult(data))
        .catch(err => console.error(err));
    });
});


function renderResult(data) {
    document.getElementById("result").classList.remove("hidden");

    document.getElementById("penyakit").textContent =
        `${data.kode_penyakit} - ${data.nama_penyakit}`;

    document.getElementById("penanganan").textContent = data.penanganan;

    const ul = document.getElementById("produkList");
    ul.innerHTML = "";
    data.rekomendasi_produk.forEach(p => {
        const li = document.createElement("li");
        li.textContent = `${p.bahan_aktif}: ${p.produk}`;
        ul.appendChild(li);
    });
}
