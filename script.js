const container = document.getElementById("container");
const searchBox = document.getElementById("searchBox");
const subjectFilter = document.getElementById("subjectFilter");
const themeToggle = document.getElementById("themeToggle");
const body = document.getElementById("body");

let assignments = [];

async function fetchAssignments() {
  try {
    const res = await fetch("/api/assignments");
    assignments = await res.json();
    populateSubjects();
    renderAssignments();
  } catch (err) {
    console.error("Error fetching files:", err);
  }
}

function populateSubjects() {
  const subjects = [...new Set(assignments.map(a => a.subject))];
  subjects.forEach(sub => {
    const opt = document.createElement("option");
    opt.value = sub;
    opt.textContent = sub;
    subjectFilter.appendChild(opt);
  });
}

function renderAssignments() {
  const search = searchBox.value.toLowerCase();
  const subject = subjectFilter.value;
  container.innerHTML = "";

  const filtered = assignments.filter(a =>
    (subject === "all" || a.subject === subject) &&
    (a.title.toLowerCase().includes(search) || a.subject.toLowerCase().includes(search))
  );

  if (filtered.length === 0) {
    container.innerHTML = `<p class='col-span-full text-center text-gray-500 text-lg'>No assignments found 😕</p>`;
    return;
  }

  filtered.forEach(a => {
    const card = document.createElement("div");
    card.className = "bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 text-center transition transform hover:scale-105 hover:shadow-xl";
    card.innerHTML = `
      <div class="text-5xl mb-3">📄</div>
      <h3 class="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-1">${a.title}</h3>
      <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">${a.subject}</p>
      <button onclick="openPDF('${a.file}', '${a.title}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
        📂 Open
      </button>
    `;
    container.appendChild(card);
  });
}

// PDF Modal logic
const pdfModal = document.getElementById("pdfModal");
const pdfViewer = document.getElementById("pdfViewer");
const pdfTitle = document.getElementById("pdfTitle");
const downloadLink = document.getElementById("downloadLink");
const closeModal = document.getElementById("closeModal");

function openPDF(url, title) {
  pdfViewer.src = url;
  pdfTitle.textContent = title;
  downloadLink.href = url;
  pdfModal.classList.remove("hidden");
  pdfModal.classList.add("flex");
}

closeModal.addEventListener("click", () => {
  pdfModal.classList.add("hidden");
  pdfModal.classList.remove("flex");
  pdfViewer.src = "";
});

pdfModal.addEventListener("click", (e) => {
  if (e.target === pdfModal) {
    pdfModal.classList.add("hidden");
    pdfModal.classList.remove("flex");
    pdfViewer.src = "";
  }
});

// Dark Mode
let darkMode = JSON.parse(localStorage.getItem("darkMode")) || false;
function applyTheme() {
  if (darkMode) {
    body.classList.add("dark", "bg-gray-900", "text-white");
    themeToggle.textContent = "☀️ Light Mode";
  } else {
    body.classList.remove("dark", "bg-gray-900", "text-white");
    themeToggle.textContent = "🌙 Dark Mode";
  }
  localStorage.setItem("darkMode", JSON.stringify(darkMode));
}
themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  applyTheme();
});

searchBox.addEventListener("input", renderAssignments);
subjectFilter.addEventListener("change", renderAssignments);

// Init
fetchAssignments();
applyTheme();
