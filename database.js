import Database from "better-sqlite3";
const db = new Database("database.db");

const tableNames = ["personal", "work", "favorites", "archived"];
const stmt = db.prepare(
  "INSERT INTO personal (title, date, description) VALUES (?, ?, ?)"
);

tableNames.forEach((table) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${table} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL
    )
  `);
});

db.exec(`
    CREATE TABLE IF NOT EXISTS trash (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL
    )
  `);

stmt.run(
  "Welcome to Nowted App",
  "2025-10-17",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
);

/* db.exec(`
  DROP TABLE IF EXISTS personal;
  DROP TABLE IF EXISTS work;
  DROP TABLE IF EXISTS favorites;
  DROP TABLE IF EXISTS archived;
  DROP TABLE IF EXISTS trash;
`); */

export { db };
