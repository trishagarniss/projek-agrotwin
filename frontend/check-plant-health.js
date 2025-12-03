const API_BASE = "http://localhost:8000";

let currentStep = 1;
let answers = {
    parameter: {},
    gejala: {}
};

// STEP CONTROL
function nextStep() {
    document.getElementById(`step-${currentStep}`).classList.remove("active");
    currentStep++;
    document.getElementById(`step-${currentStep}`).classList.add("active");
}

// LOAD GEJALA FROM BACKEND
async function loadGejala() {
    const res = await fetch(API_BASE + "/gejala");
    const data = await res.json();

    const container = document.getElementById("gejala-container");
    data.forEach(g => {
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
}

loadGejala();

// TOGGLE SLIDER FOR GEJALA
function toggleGejala(id) {
    const slider = document.getElementById(`slider-${id}`);
    const checked = document.getElementById(id).checked;

    slider.style.display = checked ? "block" : "none";

    if (!checked) delete answers.gejala[id];
}

// SAVE CONFIDENCE
function setConfidence(id, value) {
    answers.gejala[id] = parseInt(value);
}

// REVIEW PAGE
function goToReview() {
    answers.parameter = {
        ph: {
            value: document.getElementById("ph").value,
            conf: document.getElementById("ph_conf").value
        },
        kelembapan_udara: {
            value: document.getElementById("hum_air").value,
            conf: document.getElementById("hum_air_conf").value
        },
        suhu: {
            value: document.getElementById("suhu").value,
            conf: document.getElementById("suhu_conf").value
        },
        kelembapan_tanah: {
            value: document.getElementById("hum_tanah").value,
            conf: document.getElementById("hum_tanah_conf").value
        }
    };

    const reviewDiv = document.getElementById("review");
    reviewDiv.innerHTML = "";

    // Parameter
    Object.entries(answers.parameter).forEach(([k, v]) => {
        reviewDiv.innerHTML += `
            <p><strong>${k}</strong>: ${v.value} (Yakin ${v.conf}%)</p>
        `;
    });

    // Gejala
    Object.entries(answers.gejala).forEach(([k, v]) => {
        reviewDiv.innerHTML += `<p>• ${k} — yakin ${v}%</p>`;
    });

    nextStep();
}

// SEND TO BACKEND
async function sendToBackend() {
    const res = await fetch(API_BASE + "/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers)
    });

    const data = await res.json();
    document.getElementById("hasil").innerHTML =
        `<pre>${JSON.stringify(data, null, 2)}</pre>`;

    nextStep();
}
