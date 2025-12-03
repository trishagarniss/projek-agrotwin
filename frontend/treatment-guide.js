/* treatment-guide.js */

/* -------------------------
   Helper: robust CSV parser (handles quoted fields)
   ------------------------- */
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter(l => l.trim() !== "");
  const rows = [];
  for (let i = 0; i < lines.length; ) {
    // parse a CSV row that may contain quoted commas
    let line = lines[i];
    if ((line.match(/"/g) || []).length % 2 !== 0) {
      // odd number of quotes -> multi-line field
      let j = i + 1;
      while (j < lines.length) {
        line += "\n" + lines[j];
        if ((line.match(/"/g) || []).length % 2 === 0) break;
        j++;
      }
      i = j + 1;
    } else {
      i++;
    }

    const row = [];
    let cur = "";
    let inQuotes = false;
    for (let k = 0; k < line.length; k++) {
      const ch = line[k];
      if (ch === '"' ) {
        if (inQuotes && line[k+1] === '"') {
          cur += '"'; // escaped quote
          k++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        row.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    row.push(cur);
    rows.push(row);
  }

  const headers = rows.shift().map(h => h.trim());
  return rows.map(r => {
    const obj = {};
    headers.forEach((h, idx) => obj[h] = (r[idx] || "").trim());
    return obj;
  });
}

/* -------------------------
   Load chapter JSON (Bab1 & 4)
   ------------------------- */
async function loadChaptersAndRender() {
  try {
    const res = await fetch("chapter-data.json");
    const data = await res.json();

    // BAB 1: Render slides
    const track = document.getElementById("book-track");
    const slides = data.chapter1 || [];
    const totalSlides = slides.length;
    slides.forEach((s, idx) => {
      const el = document.createElement("div");
      el.className = "book-slide";
      el.innerHTML = `
        <aside class="slide-aside">
          <h4>Step ${idx + 1}</h4>
          <div style="font-weight:700;color:var(--dark);font-size:15px">${s.title}</div>
          <div style="margin-top:10px;color:#2f4f2f;font-size:13px">${s.meta || ""}</div>
        </aside>
        <div class="slide-body">
          <h3>${s.title}</h3>
          <div class="slide-text">${s.content}</div>
        </div>
      `;
      track.appendChild(el);
    });

    // book initial state
    BookCarousel.init(totalSlides);
    
    // BAB 4: tips grid
    const tips = data.chapter4 || [];
    const tipsGrid = document.getElementById("tips-grid");
    tips.forEach(t => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `<h3>${t.title}</h3><p>${t.desc}</p>`;
      tipsGrid.appendChild(div);
    });

  } catch (err) {
    console.error("Error loading chapter JSON:", err);
  }
}

/* -------------------------
   Book Carousel Controller (horizontal)
   ------------------------- */
const BookCarousel = (function(){
  let idx = 0;
  let total = 1;
  const track = () => document.getElementById("book-track");
  const indicator = () => document.getElementById("book-indicator");
  const prevBtn = () => document.getElementById("book-prev");
  const nextBtn = () => document.getElementById("book-next");

  function update() {
    const t = track();
    t.style.transform = `translateX(-${idx * 100}%)`;
    indicator().innerText = `${idx + 1} / ${total}`;
    // disable buttons at ends
    prevBtn().disabled = idx === 0;
    nextBtn().disabled = idx === total - 1;
    prevBtn().style.opacity = idx === 0 ? 0.45 : 1;
    nextBtn().style.opacity = idx === total - 1 ? 0.45 : 1;
  }

  function next() { if (idx < total - 1) { idx++; update(); } }
  function prev() { if (idx > 0) { idx--; update(); } }
  function go(i) { if (i >=0 && i < total) { idx = i; update(); } }

  function init(totalSlides) {
    total = Math.max(1, totalSlides);
    // attach events
    const p = prevBtn(), n = nextBtn();
    p.addEventListener("click", prev);
    n.addEventListener("click", next);

    // keyboard nav
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    });

    // touch swipes for mobile
    let startX = null;
    const view = document.querySelector(".book-view");
    view.addEventListener("touchstart", e => startX = e.touches[0].clientX);
    view.addEventListener("touchend", e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (dx > 40) prev();
      else if (dx < -40) next();
      startX = null;
    });

    // initial update
    update();
  }

  return { init, go };
})();

/* -------------------------
   CSV load + table render + pagination (generic)
   ------------------------- */
async function loadCSVFile(path) {
  const res = await fetch(path);
  const txt = await res.text();
  return parseCSV(txt);
}

/* render table: data array of objects, container table element id, page, perPage */
function renderTableGeneric(data, tableId, page=1, perPage=5) {
  const table = document.getElementById(tableId);
  if (!data || data.length === 0) {
    table.innerHTML = "<thead><tr><th>No data</th></tr></thead><tbody></tbody>";
    return;
  }
  const headers = Object.keys(data[0]);
  const start = (page - 1) * perPage;
  const slice = data.slice(start, start + perPage);

  // header
  let thead = "<thead><tr>";
  headers.forEach(h => thead += `<th>${h}</th>`);
  thead += "</tr></thead>";

  // body
  let tbody = "<tbody>";
  slice.forEach(row => {
    tbody += "<tr>";
    headers.forEach(h => {
      tbody += `<td>${row[h] || ""}</td>`;
    });
    tbody += "</tr>";
  });
  tbody += "</tbody>";

  table.innerHTML = thead + tbody;
}

/* pagination render */
function renderPaginationGeneric(data, containerId, tableId, perPage=5) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  const totalPages = Math.max(1, Math.ceil(data.length / perPage));
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = "page-btn" + (i === 1 ? " active" : "");
    btn.innerText = i;
    btn.addEventListener("click", () => {
      // deactivate siblings
      container.querySelectorAll(".page-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderTableGeneric(data, tableId, i, perPage);
      // scroll into view of the table for UX
      document.getElementById(tableId).scrollIntoView({ behavior: "smooth", block: "center" });
    });
    container.appendChild(btn);
  }
}

/* -------------------------
   Init everything on DOMContentLoaded
   ------------------------- */
document.addEventListener("DOMContentLoaded", async function(){
  // load JSON (bab 1 & 4)
  await loadChaptersAndRender();

  // load penyakit CSV
  try {
    const penyakit = await loadCSVFile("penyakit.csv");
    renderTableGeneric(penyakit, "penyakit-table", 1, 5);
    renderPaginationGeneric(penyakit, "penyakit-pagination", "penyakit-table", 5);
  } catch (e) {
    console.error("Error loading penyakit.csv", e);
  }

  // load hama CSV
  try {
    const hama = await loadCSVFile("hama.csv");
    renderTableGeneric(hama, "hama-table", 1, 5);
    renderPaginationGeneric(hama, "hama-pagination", "hama-table", 5);
  } catch (e) {
    console.error("Error loading hama.csv", e);
  }
});
