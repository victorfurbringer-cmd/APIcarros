const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Initialize tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      price REAL NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      carId INTEGER NOT NULL,
      customerId INTEGER NOT NULL,
      date TEXT NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (carId) REFERENCES cars (id),
      FOREIGN KEY (customerId) REFERENCES customers (id)
    )
  `);

  // Insert initial data if tables are empty
  db.get("SELECT COUNT(*) as count FROM cars", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO cars (model, year, price) VALUES (?, ?, ?)");
      stmt.run("Fusca", 1970, 15000);
      stmt.run("Civic", 2020, 80000);
      stmt.finalize();
    }
  });

  db.get("SELECT COUNT(*) as count FROM customers", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO customers (name, email) VALUES (?, ?)");
      stmt.run("João Silva", "joao@email.com");
      stmt.run("Maria Santos", "maria@email.com");
      stmt.finalize();
    }
  });

  db.get("SELECT COUNT(*) as count FROM sales", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO sales (carId, customerId, date, price) VALUES (?, ?, ?, ?)");
      stmt.run(1, 1, "2023-01-01", 15000);
      stmt.finalize();
    }
  });
});

module.exports = db;