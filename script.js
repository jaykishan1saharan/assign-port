// 🔐 Firebase Auth Logic
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const assignmentContainer = document.getElementById("container");

// Hide assignments until login
assignmentContainer.style.display = "none";

// 🧠 Login button
loginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      const email = result.user.email;
      if (email.endsWith("@pcu.edu.in")) {
        localStorage.setItem("authorizedUser", email);
        alert(`✅ Welcome ${result.user.displayName}!`);
        assignmentContainer.style.display = "grid";
        loginBtn.classList.add("hidden");
        logoutBtn.classList.remove("hidden");
      } else {
        alert("❌ Access denied. Please use your @pcu.edu.in college email.");
        auth.signOut();
      }
    })
    .catch(err => {
      console.error("Firebase Login Error:", err);
      alert("⚠️ Sign-in failed. Please try again.\n" + err.message);
    });
});

// 🚪 Logout button
logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    alert("👋 Logged out successfully!");
    assignmentContainer.style.display = "none";
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
  });
});

// 🔁 Check login state on reload
auth.onAuthStateChanged(user => {
  const welcomeUser = document.getElementById("welcomeUser");
  if (user) {
    welcomeUser.textContent = `Welcome, ${user.displayName} 👋`;
  } else {
    welcomeUser.textContent = "";
  }

  if (user && user.email.endsWith("@pcu.edu.in")) {
    assignmentContainer.style.display = "grid";
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
  } else {
    assignmentContainer.style.display = "none";
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
  }
});



// ============================
// Assignment Data (auto or manual)
// ============================

// ============================
// DOM Elements
// ============================

const collegeButtons = document.getElementById("collegeButtons");
const semesterButtons = document.getElementById("semesterButtons");
const body = document.getElementById("body");
const themeToggle = document.getElementById("themeToggle");
const searchBox = document.getElementById("searchBox");
const subjectFilter = document.getElementById("subjectFilter");
const container = document.getElementById("container");
const pdfModal = document.getElementById("pdfModal");
const pdfViewer = document.getElementById("pdfViewer");
const pdfTitle = document.getElementById("pdfTitle");
const downloadLink = document.getElementById("downloadLink");
const closeModal = document.getElementById("closeModal");
const homeTitle = document.getElementById("homeTitle");


// Sections
const landing = document.getElementById("landing");
const collegeSection = document.getElementById("collegeSection");
const semesterSection = document.getElementById("semesterSection");
const assignmentSection = document.getElementById("assignmentSection");
const backButton = document.getElementById("backButton");


// ============================
// State Variables
// ============================
let selectedCollege = null;
let selectedSemester = null;
let selectedCategory = null;
let selectedSubject = null;

let darkMode = JSON.parse(localStorage.getItem("darkMode")) || false;

// ============================
// Utility Functions
// ============================
function showSection(id) {
  document.querySelectorAll("section").forEach((sec) => sec.classList.add("hidden"));
  const target = document.getElementById(id);
  target.classList.remove("hidden");
  target.classList.add("fadeIn");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================
// Navigation Flow
// ============================
function goToCollege() {
  showSection("collegeSection");
  generateCollegeButtons();
  updateBackButton();
}

// 🏠 Home navigation
document.getElementById("homeTitle").addEventListener("click", () => {
  // Hide all deep pages and show the main college selection again
  if (auth.currentUser && auth.currentUser.email.endsWith("@pcu.edu.in")) {
    // If user is logged in, show main assignment section (home)
    showCollegeSelection();  // <-- this is your existing function to show college cards
  } else {
    // If not logged in, maybe prompt them
    alert("🔒 Please log in first to access assignments!");
  }

  // Optional: scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function generateCollegeButtons() {
  const colleges = [...new Set(assignments.map(a => a.college))];
  const collegeButtons = document.getElementById("collegeButtons");
  collegeButtons.innerHTML = "";

  colleges.forEach(college => {
    const displayName = college.replace(/_/g, " ");
    const imgPath = `assets/${college.toLowerCase()}.jpg`;

    // Create card container
    const card = document.createElement("div");
    card.className =
      "w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition hover:-translate-y-1 hover:shadow-2xl cursor-pointer";

    // Inner card structure
    card.innerHTML = `
      <div class="rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        <img 
          src="${imgPath}" 
          alt="${displayName}" 
          class="w-full h-36 object-contain bg-gray-100 p-2 rounded-t-xl"
          onerror="this.onerror=null;this.src='assets/default.jpg';"
        >
        <div class="p-4 text-center">
          <h3 class="text-lg font-semibold text-blue-600 dark:text-blue-300">
            ${displayName}
          </h3>
        </div>
      </div>
    `;

    // Click event
    card.onclick = () => selectCollege(college);

    // Add card to page
    collegeButtons.appendChild(card);
  });
}




function selectCollege(college) {
  selectedCollege = college;
  generateSemesterButtons(college);
  showSection("semesterSection");
  updateBackButton();
}


function selectSemester(sem) {
  console.log("Selected Semester:", sem, "for", selectedCollege);
  selectedSemester = sem;
  generateCategoryButtons();   // 👈 show categories dynamically
  showSection("categorySection");
  updateBackButton();
}



function generateSemesterButtons(college) {
  const semesters = [...new Set(assignments
    .filter(a => a.college === college)
    .map(a => a.semester))].sort((a, b) => a - b);

  semesterButtons.innerHTML = "";
  semesters.forEach(sem => {
    const btn = document.createElement("button");
    btn.textContent = `Semester ${sem}`;
    btn.className = "btn";
    btn.onclick = () => selectSemester(sem);
    semesterButtons.appendChild(btn);
  });

  console.log("🧠 College:", college, "Semesters found:", semesters);
  console.log("🧩 semesterButtons DOM:", semesterButtons);
}

function selectCategory(cat) {
  selectedCategory = cat;

  // Get subjects for this category
  const filtered = assignments.filter(
    a => a.college === selectedCollege && a.semester === selectedSemester && a.category === cat
  );
  const subjects = [...new Set(filtered.map(a => a.subject))];

  if (subjects.length > 1) {
    // Show subject cards
    generateSubjectButtons(subjects);
    showSection("subjectSection");
  } else {
    // Directly show assignments (like reports)
    showSection("assignmentSection");
    populateSubjects();
    renderAssignments();
  }

  updateAssignmentLabel();
  updateBackButton();
}


function generateCategoryButtons() {
  const key = `${selectedCollege}_Sem${selectedSemester}`;
  const availableCategories = categoriesBySem[key] || [];

  const categoryButtons = document.getElementById("categoryButtons");
  categoryButtons.innerHTML = "";

  if (availableCategories.length === 0) {
    categoryButtons.innerHTML = `<p class="text-gray-500">No categories found for this semester.</p>`;
    return;
  }

  availableCategories.forEach(cat => {
    const display = cat.replace(/_/g, " ");
    const card = document.createElement("div");
    card.className =
      "w-60 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-2xl cursor-pointer";

    card.innerHTML = `
      <div class="text-5xl mt-6">📁</div>
      <div class="p-4 text-center">
        <h3 class="text-lg font-semibold text-blue-600 dark:text-blue-300">${display}</h3>
      </div>
    `;

    card.onclick = () => selectCategory(cat);
    categoryButtons.appendChild(card);
  });
}


function selectSubject(sub) {
  selectedSubject = sub;
  showSection("assignmentSection");
  populateSubjects();
  renderAssignments();
  updateAssignmentLabel();
  updateBackButton();
}


function generateSubjectButtons(subjects) {
  const subjectButtons = document.getElementById("subjectButtons");
  subjectButtons.innerHTML = "";

  subjects.forEach(sub => {
    const card = document.createElement("div");
    card.className =
      "w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-2xl cursor-pointer";
    card.innerHTML = `
      <div class="text-5xl mt-6">📘</div>
      <div class="p-4 text-center">
        <h3 class="text-lg font-semibold text-blue-600 dark:text-blue-300">${sub}</h3>
      </div>
    `;
    card.onclick = () => selectSubject(sub);
    subjectButtons.appendChild(card);
  });
}


// ============================
// Back Button Navigation Logic
// ============================
function updateBackButton() {
  if (!selectedCollege && !selectedSemester) {
    backButton.classList.add("hidden");
  } else {
    backButton.classList.remove("hidden");
  }
}

function updateAssignmentLabel() {
  const label = document.getElementById("assignmentLabel");
  if (selectedCollege && selectedSemester) {
    label.textContent = `📚 Showing: ${selectedCollege.replace(/_/g, " ")} → Semester ${selectedSemester}`;
  } else {
    label.textContent = "";
  }
}

backButton.addEventListener("click", () => {
  if (selectedSemester) {
    selectedSemester = null;
    showSection("semesterSection");
  } else if (selectedCollege) {
    selectedCollege = null;
    showSection("collegeSection");
  } else {
    showSection("landing");
  }
  updateBackButton();
});

homeTitle.addEventListener("click", () => {
  // Reset navigation state
  selectedCollege = null;
  selectedSemester = null;
  // Show landing section
  showSection("landing");
  updateBackButton();
});


// ============================
// Theme (Dark / Light)
// ============================
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
applyTheme();

// ============================
// Populate Subjects Filter
// ============================
function populateSubjects() {
  // Ensure dropdown exists
  const subjectFilter = document.getElementById("subjectFilter");
  if (!subjectFilter) {
    console.warn("⚠️ subjectFilter not found in DOM");
    return;
  }

  // Reset the dropdown
  subjectFilter.innerHTML = '<option value="all">All Subjects</option>';

  // Filter assignments by current selection
  const filtered = assignments.filter(
    a => a.college === selectedCollege && a.semester === selectedSemester
  );

  // Extract subjects
  const subjects = [...new Set(filtered.map(a => a.subject))];
  if (subjects.length === 0) {
    console.warn("⚠️ No subjects found for:", selectedCollege, "Semester:", selectedSemester);
  }

  // Add options
  subjects.forEach(sub => {
    const opt = document.createElement("option");
    opt.value = sub;
    opt.textContent = sub;
    subjectFilter.appendChild(opt);
  });

  // Reset to 'all'
  subjectFilter.value = "all";
}


// ============================
// Render Assignments
// ============================
function renderAssignments() {
  console.log("Rendering:", selectedCollege, "Sem:", selectedSemester);
  const search = searchBox ? searchBox.value.toLowerCase() : "";
  const subject = subjectFilter ? subjectFilter.value : "all";
  container.innerHTML = "";

  const filtered = assignments.filter(a =>
    a.college === selectedCollege &&
    a.semester === selectedSemester &&
    a.category === selectedCategory &&
    (!selectedSubject || a.subject === selectedSubject) &&
    (subject === "all" || a.subject === subject) &&
    (a.title.toLowerCase().includes(search) || a.subject.toLowerCase().includes(search))
  );


  if (filtered.length === 0) {
    container.innerHTML = `<p class='col-span-full text-center text-gray-500 text-lg'>No assignments found 😕</p>`;
    return;
  }

  filtered.forEach(a => {
    const card = document.createElement("div");
    card.className =
      "bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 text-center transition transform hover:scale-105 hover:shadow-xl";
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



// ============================
// PDF Modal Logic
// ============================
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

// ============================
// Event Listeners
// ============================
searchBox?.addEventListener("input", renderAssignments);
subjectFilter?.addEventListener("change", renderAssignments);

// Initial Load
showSection("landing");

document.addEventListener("DOMContentLoaded", () => {
  subjectFilter?.addEventListener("change", renderAssignments);
  searchBox?.addEventListener("input", renderAssignments);
});

// 📱 Mobile Menu Toggle
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}

// 📧 Email form success alert
const contactForm = document.querySelector('form[action*="formspree.io"]');
if (contactForm) {
  contactForm.addEventListener("submit", () => {
    setTimeout(() => {
      alert("✅ Your request has been sent! Jaikishan will contact you soon.");
    }, 500);
  });
}

// 🧭 Smooth scroll + show main sections
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const targetId = link.getAttribute("href").substring(1);
    const section = document.getElementById(targetId);
    if (section) {
      e.preventDefault();
      // Show all main UI sections again
      document.querySelectorAll("section").forEach(sec => sec.classList.remove("hidden"));
      // Scroll smoothly
      section.scrollIntoView({ behavior: "smooth" });
      // Hide dropdown menu on mobile if open
      const mobileMenu = document.getElementById("mobileMenu");
      if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.add("hidden");
      }
    }
  });
});


updateBackButton();



