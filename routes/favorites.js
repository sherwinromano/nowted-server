import express from "express";
import Database from "better-sqlite3";

const router = express.Router();
const db = new Database("database.db");

// ?? Get all notes
router.get("/", (req, res) => {
  const stmt = db.prepare("SELECT * FROM favorites");
  const notes = stmt.all();
  res.json(notes);
});

// ?? Retrieve single note
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare("SELECT * FROM favorites WHERE id = ?");
  const note = stmt.get(id);

  if (!note) {
    return res.status(404).json({ error: "Entry not found" });
  }

  res.json(note);
});

// ?? Update single note
router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { title, date, description } = req.body;

  const stmt = db.prepare(
    "UPDATE favorites SET title = ?, date = ?, description = ? WHERE id = ?"
  );
  const info = stmt.run(title, date, description, id);

  if (info.changes === 0) {
    return res
      .status(404)
      .json({ error: "Note not found or nothing to update" });
  }
  res.json({ message: "Note updated" });
});

// ?? Move to archived
router.post("/archived/:id", (req, res) => {
  const { id } = req.params;

  const getStmt = db.prepare("SELECT * FROM favorites WHERE id = ?");
  const record = getStmt.get(id);

  if (!record) {
    return res.status(404).json({ error: "Note not found" });
  }

  const insertStmt = db.prepare(`
    INSERT INTO archived (title, date, description)
    VALUES (?, ?, ?)
  `);

  insertStmt.run(record.title, record.date, record.description);

  const deleteStmt = db.prepare("DELETE FROM favorites WHERE id = ?");
  deleteStmt.run(id);

  res.json({ message: "Note moved to archived notes" });
});

// ?? Move to trash
router.delete("/trash/:id", (req, res) => {
  const { id } = req.params;

  const getStmt = db.prepare("SELECT * FROM favorites WHERE id = ?");
  const record = getStmt.get(id);

  if (!record) {
    return res.status(404).json({ error: "Note not found" });
  }

  const insertStmt = db.prepare(`
    INSERT INTO trash (title, date, description, category)
    VALUES (?, ?, ?, ?)
  `);

  insertStmt.run(record.title, record.date, record.description, "favorites");

  const deleteStmt = db.prepare("DELETE FROM favorites WHERE id = ?");
  deleteStmt.run(id);

  res.json({ message: "Note moved to trash" });
});

export default router;
