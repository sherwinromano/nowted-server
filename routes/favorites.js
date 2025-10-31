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
    "SELECT * FROM favorites WHERE email = ? ORDER BY position ASC"
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
    const updateStmt = db.prepare(
      "UPDATE favorites SET position = ? WHERE id = ?"
    );

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

  const stmt = db.prepare("SELECT * FROM favorites WHERE id = ? AND email = ?");
  const note = stmt.get(id, email);

  if (!note) {
    return res.status(404).json({ error: "Entry not found" });
  }

  res.json(note);
});

// ?? Update a note
router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  const email = req.email;

  const stmt = db.prepare(
    "UPDATE favorites SET description = ? WHERE id = ? AND email = ?"
  );
  const info = stmt.run(description, id, email);

  if (info.changes === 0) {
    return res
      .status(404)
      .json({ error: "Note not found or nothing to update" });
  }

  res.json({ message: "Note updated" });
});

// ?? Move note to archived
router.post("/archived/:id", (req, res) => {
  const { id } = req.params;
  const email = req.email;

  const getStmt = db.prepare(
    "SELECT * FROM favorites WHERE id = ? AND email = ?"
  );
  const record = getStmt.get(id, email);

  if (!record) {
    return res.status(404).json({ error: "Note not found" });
  }

  const insertStmt = db.prepare(`
    INSERT INTO archived (email, title, date, description)
    VALUES (?, ?, ?, ?)
  `);
  insertStmt.run(email, record.title, record.date, record.description);

  const deleteStmt = db.prepare(
    "DELETE FROM favorites WHERE id = ? AND email = ?"
  );
  deleteStmt.run(id, email);

  res.json({ message: "Note moved to archived notes" });
});

// ?? Move note to trash
router.delete("/trash/:id", (req, res) => {
  const { id } = req.params;
  const email = req.email;

  const getStmt = db.prepare(
    "SELECT * FROM favorites WHERE id = ? AND email = ?"
  );
  const record = getStmt.get(id, email);

  if (!record) {
    return res.status(404).json({ error: "Note not found" });
  }

  const insertStmt = db.prepare(`
    INSERT INTO trash (email, title, date, description, category)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertStmt.run(
    email,
    record.title,
    record.date,
    record.description,
    "favorites"
  );

  const deleteStmt = db.prepare(
    "DELETE FROM favorites WHERE id = ? AND email = ?"
  );
  deleteStmt.run(id, email);

  res.json({ message: "Note moved to trash" });
});

export default router;
