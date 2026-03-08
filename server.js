const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const entriesFile = path.join(__dirname, "entries.txt");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function readEntries() {
  try {
    return await fs.readFile(entriesFile, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

app.get("/entries", async (req, res) => {
  try {
    const content = await readEntries();
    res.json({ text: content });
  } catch (error) {
    res.status(500).json({ error: "Failed to read entries." });
  }
});

app.post("/save", async (req, res) => {
  const mode = req.body.mode === "full" ? "full" : "append";
  const rawEntry = typeof req.body.entry === "string" ? req.body.entry : "";

  try {
    if (mode === "full") {
      await fs.writeFile(entriesFile, rawEntry, "utf8");
    } else {
      const entry = rawEntry.trim();
      if (!entry) {
        return res.status(400).json({ error: "Entry cannot be empty." });
      }
      const timestamp = new Date().toISOString();
      const payload = `[${timestamp}]\n${entry}\n\n`;
      await fs.appendFile(entriesFile, payload, "utf8");
    }

    const updated = await readEntries();
    return res.json({ ok: true, text: updated });
  } catch (error) {
    return res.status(500).json({ error: "Failed to save entry." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
