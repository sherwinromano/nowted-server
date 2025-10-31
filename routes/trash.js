import express from "express";
import { db } from "../database.js";

const router = express.Router();

// ?? Middleware for getting email
router.use((req, res, next) => {
  const email = req.headers["x-user-email"];
  if (!email) {
    return res.status(401).json({ error: "Unauthorized: missing email" });
  }
  req.email = email;
  next();
});

// ?? Get all notes
router.get("/", (req, res) => {
  const email = req.email;

  const notesStmt = db.prepare(
    "SELECT * FROM trash WHERE email = ? ORDER BY position ASC"
  );
  const notes = notesStmt.all(email);

  res.json(notes);
});

// ?? For dnd reordering of notes
router.patch("/reorder", (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: "orderedIds must be an array" });
  }

  try {
    const updateStmt = db.prepare("UPDATE trash SET position = ? WHERE id = ?");

    const reorderTransaction = db.transaction((ids) => {
      ids.forEach((id, index) => {
        updateStmt.run(index, id);
      });
    });

    reorderTransaction(orderedIds);

    res.json({ message: "Notes reordered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reorder notes" });
  }
});

// ?? Get a single note
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const email = req.email;

  const stmt = db.prepare("SELECT * FROM trash WHERE id = ? AND email = ?");
  const note = stmt.get(id, email);

  if (!note) {
    return res.status(404).json({ error: "Entry not found" });
  }

  res.json(note);
});

// ?? Recover a note
router.post("/:id", (req, res) => {
  const { id } = req.params;
  const email = req.email;

  const getStmt = db.prepare("SELECT * FROM trash WHERE id = ? AND email = ?");
  const record = getStmt.get(id, email);

  if (!record) {
    return res.status(404).json({ error: "Note not found in trash" });
  }

  const insertStmt = db.prepare(`
    INSERT INTO ${record.category} (title, date, description, email)
    VALUES (?, ?, ?, ?)
  `);

  try {
    insertStmt.run(record.title, record.date, record.description, email);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to recover entry" });
  }

  const deleteStmt = db.prepare("DELETE FROM trash WHERE id = ? AND email = ?");
  deleteStmt.run(id, email);

  res.json({ message: `Note recovered to ${record.category}` });
});

// ?? Delete a note permanently
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const email = req.email;

  const stmt = db.prepare("DELETE FROM trash WHERE id = ? AND email = ?");
  const info = stmt.run(id, email);

  if (info.changes === 0) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.json({ message: "Note permanently deleted" });
});

export default router;
