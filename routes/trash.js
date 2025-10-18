import express from "express";
import Database from "better-sqlite3";

const router = express.Router();
const db = new Database("database.db");

// ?? Get all notes
router.get("/", (req, res) => {
  const stmt = db.prepare("SELECT * FROM trash");
  const notes = stmt.all();
  res.json(notes);
});

// ?? Recover a note
router.post("/:id", (req, res) => {
  const { id } = req.params;

  const getStmt = db.prepare("SELECT * FROM trash WHERE id = ?");
  const record = getStmt.get(id);

  if (!record) {
    return res.status(404).json({ error: "Note not found in trash" });
  }

  const insertStmt = db.prepare(`
    INSERT INTO ${record.category} (title, date, description)
    VALUES (?, ?, ?)
  `);

  try {
    insertStmt.run(record.title, record.date, record.description);
  } catch (error) {
    return res.status(500).json({ error: "Failed to recover entry" });
  }

  const deleteStmt = db.prepare("DELETE FROM trash WHERE id = ?");
  deleteStmt.run(id);

  res.json({ message: `Note recovered to ${record.category}` });
});

// ?? Delete a note
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare("DELETE FROM trash WHERE id = ?");
  const info = stmt.run(id);

  if (info.changes === 0) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.json({ message: "Note permanently deleted" });
});

export default router;
