import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend files
app.use(express.static(__dirname));

// Serve assignment files statically
app.use("/assignments", express.static(path.join(__dirname, "assignments")));

// API to fetch all assignments dynamically
app.get("/api/assignments", (req, res) => {
  const assignmentsDir = path.join(__dirname, "assignments");
  const subjects = fs.readdirSync(assignmentsDir).filter((f) =>
    fs.statSync(path.join(assignmentsDir, f)).isDirectory()
  );

  const result = [];

  subjects.forEach((subject) => {
    const subjectDir = path.join(assignmentsDir, subject);
    const files = fs.readdirSync(subjectDir);
    files.forEach((file) => {
      const filePath = `/assignments/${subject}/${file}`;
      const stats = fs.statSync(path.join(subjectDir, file));
      result.push({
        title: file,
        subject,
        file: filePath,
        date: stats.mtime,
      });
    });
  });

  res.json(result);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
