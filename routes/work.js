import express from "express";
import Database from "better-sqlite3";

const router = express.Router();
const db = new Database("database.db");

// ?? Get all data
router.get("/", (req, res) => {
  const stmt = db.prepare("SELECT * FROM work");
  const notes = stmt.all();
  res.json(notes);
});

// ?? Retrieve single data
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare("SELECT * FROM work WHERE id = ?");
  const note = stmt.get(id);

  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.json(note);
});

// ?? Add new data
router.post("/", (req, res) => {
  const { title, date, description } = req.body;

  if (!title || !date || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const stmt = db.prepare(
    "INSERT INTO work (title, date, description) VALUES (?, ?, ?)"
  );

  stmt.run(title, date, description);

  res.status(201).json({ message: "New note added" });
});

// ?? Update single data
router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { title, date, description } = req.body;

  const stmt = db.prepare(
    "UPDATE work SET title = ?, date = ?, description = ? WHERE id = ?"
  );
  const info = stmt.run(title, date, description, id);

  if (info.changes === 0) {
    return res
      .status(404)
      .json({ error: "Note not found or nothing to update" });
  }
  res.json({ message: "Note updated" });
});

// ?? Move to favorites
router.post("/favorites/:id", (req, res) => {
  const { id } = req.params;

  const getStmt = db.prepare("SELECT * FROM work WHERE id = ?");
  const record = getStmt.get(id);

  if (!record) {
    return res.status(404).json({ error: "Note not found" });
  }

  const insertStmt = db.prepare(`
    INSERT INTO favorites (title, date, description)
    VALUES (?, ?, ?)
  `);

  insertStmt.run(record.title, record.date, record.description);

  const deleteStmt = db.prepare("DELETE FROM work WHERE id = ?");
  deleteStmt.run(id);

  res.json({ message: "Note moved to favorites" });
});

// ?? Move to archived
router.post("/archived/:id", (req, res) => {
  const { id } = req.params;

  const getStmt = db.prepare("SELECT * FROM work WHERE id = ?");
  const record = getStmt.get(id);

  if (!record) {
    return res.status(404).json({ error: "Note not found" });
  }

  const insertStmt = db.prepare(`
    INSERT INTO archived (title, date, description)
    VALUES (?, ?, ?)
  `);

  insertStmt.run(record.title, record.date, record.description);

  const deleteStmt = db.prepare("DELETE FROM work WHERE id = ?");
  deleteStmt.run(id);

  res.json({ message: "Note moved to archived notes" });
});

// ?? Move to trash
router.delete("/trash/:id", (req, res) => {
  const { id } = req.params;

  const getStmt = db.prepare("SELECT * FROM work WHERE id = ?");
  const record = getStmt.get(id);

  if (!record) {
    return res.status(404).json({ error: "Note not found" });
  }

  const insertStmt = db.prepare(`
    INSERT INTO trash (title, date, description, category)
    VALUES (?, ?, ?, ?)
  `);

  insertStmt.run(record.title, record.date, record.description, "work");

  const deleteStmt = db.prepare("DELETE FROM work WHERE id = ?");
  deleteStmt.run(id);

  res.json({ message: "Note moved to trash" });
});

export default router;
