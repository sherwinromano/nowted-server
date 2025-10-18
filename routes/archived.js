import express from "express";
import Database from "better-sqlite3";

const router = express.Router();
const db = new Database("database.db");

// ?? Get all notes
router.get("/", (req, res) => {
  const stmt = db.prepare("SELECT * FROM archived");
  const notes = stmt.all();
  res.json(notes);
});

// ?? Retrieve single note
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare("SELECT * FROM archived WHERE id = ?");
  const note = stmt.get(id);

  if (!note) {
    return res.status(404).json({ error: "Entry not found" });
  }

  res.json(note);
});

// ?? Move to trash
router.delete("/trash/:id", (req, res) => {
  const { id } = req.params;

  const getStmt = db.prepare("SELECT * FROM archived WHERE id = ?");
  const record = getStmt.get(id);

  if (!record) {
    return res.status(404).json({ error: "Note not found" });
  }

  const insertStmt = db.prepare(`
    INSERT INTO trash (title, date, description, category)
    VALUES (?, ?, ?, ?)
  `);

  insertStmt.run(record.title, record.date, record.description, "archived");

  const deleteStmt = db.prepare("DELETE FROM archived WHERE id = ?");
  deleteStmt.run(id);

  res.json({ message: "Note moved to trash" });
});

export default router;
