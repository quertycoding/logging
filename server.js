const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const entriesFile = path.join(__dirname, "entries.txt");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/save", async (req, res) => {
  const entry = (req.body.entry || "").trim();

  if (!entry) {
    return res.status(400).send("Entry cannot be empty.");
  }

  const timestamp = new Date().toISOString();
  const payload = `[${timestamp}]\n${entry}\n\n`;

  try {
    await fs.appendFile(entriesFile, payload, "utf8");
    return res.redirect("/");
  } catch (error) {
    return res.status(500).send("Failed to save entry.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
