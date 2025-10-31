import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const isRender = !!process.env.RENDER;

const dataDir =
  process.env.DATA_DIR || (isRender ? "/tmp" : path.resolve("data"));

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`📁 Created data directory at: ${dataDir}`);
}

const dbPath = path.join(dataDir, "database.db");
const db = new Database(dbPath);

const tableNames = ["personal", "work", "favorites", "archived"];

tableNames.forEach((table) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${table} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      email TEXT NOT NULL,
      position INTEGER
    )
  `);
});

db.exec(`
  CREATE TABLE IF NOT EXISTS trash (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    email TEXT NOT NULL,
    position INTEGER
  )
`);

export { db };
