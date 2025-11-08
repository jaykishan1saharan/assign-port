// generate_assignments.js
const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "assignments");
const assignments = [];
const categoriesBySem = {};

// 🧩 Helper to check if path is a directory
const isDir = p => fs.existsSync(p) && fs.statSync(p).isDirectory();

// 🧩 Helper to infer subject name
function inferSubject(file, folder) {
  if (folder) return folder;
  const clean = file.replace(".pdf", "").trim();
  const parts = clean.split("_");
  return parts.length > 1 ? parts[0] : "General";
}

// 🏫 Traverse all colleges
fs.readdirSync(baseDir).forEach(college => {
  const collegePath = path.join(baseDir, college);
  if (!isDir(collegePath)) return;

  // 🎓 Traverse semesters
  fs.readdirSync(collegePath).forEach(sem => {
    const semPath = path.join(collegePath, sem);
    if (!isDir(semPath)) return;

    const semKey = `${college}_${sem}`;
    categoriesBySem[semKey] = [];

    // 📂 Traverse categories (assignments, reports, etc.)
    fs.readdirSync(semPath).forEach(category => {
      const catPath = path.join(semPath, category);
      if (!isDir(catPath)) return;

      categoriesBySem[semKey].push(category);

      const possibleSubjects = fs.readdirSync(catPath).filter(f => isDir(path.join(catPath, f)));

      // ✅ If category has subject folders (like Assignments → DSA, COA)
      if (possibleSubjects.length > 0) {
        possibleSubjects.forEach(subject => {
          const subjectPath = path.join(catPath, subject);
          fs.readdirSync(subjectPath).forEach(file => {
            if (file.endsWith(".pdf")) {
              assignments.push({
                college,
                semester: parseInt(sem.replace(/\D/g, "")) || sem,
                category,
                subject,
                title: file.replace(".pdf", ""),
                file: path.join("assignments", college, sem, category, subject, file).replace(/\\/g, "/")
              });
            }
          });
        });
      } else {
        // ✅ If category directly contains files (like reports, imp_questions)
        fs.readdirSync(catPath).forEach(file => {
          if (file.endsWith(".pdf")) {
            assignments.push({
              college,
              semester: parseInt(sem.replace(/\D/g, "")) || sem,
              category,
              subject: inferSubject(file),
              title: file.replace(".pdf", ""),
              file: path.join("assignments", college, sem, category, file).replace(/\\/g, "/")
            });
          }
        });
      }
    });
  });
});

// 💾 Write JS file for frontend
fs.writeFileSync(
  path.join(__dirname, "assignments_data.js"),
  `const assignments = ${JSON.stringify(assignments, null, 2)};\n` +
  `const categoriesBySem = ${JSON.stringify(categoriesBySem, null, 2)};`
);

console.log("✅ assignments_data.js generated successfully!");
