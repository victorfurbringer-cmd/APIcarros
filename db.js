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
      price REAL NOT NULL,
      image TEXT
    )
  `);

  db.all("PRAGMA table_info(cars)", [], (err, columns) => {
    if (!err && !columns.some(column => column.name === 'image')) {
      db.run('ALTER TABLE cars ADD COLUMN image TEXT');
    }
  });

  db.run(`
    UPDATE cars
    SET image = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80'
    WHERE image IS NULL
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
      const stmt = db.prepare("INSERT INTO cars (model, year, price, image) VALUES (?, ?, ?, ?)");
      stmt.run("Fusca", 1970, 15000, "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=400&q=80");
      stmt.run("Civic", 2020, 80000, "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80");
      stmt.run("Corolla", 2022, 95000, "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=400&q=80");
      stmt.run("Jeep Renegade", 2021, 120000, "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80");
      stmt.run("BMW X3", 2023, 250000, "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=400&q=80");
      stmt.run("Mercedes C-Class", 2022, 300000, "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80");
      stmt.run("Audi A4", 2021, 220000, "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=400&q=80");
      stmt.run("Ford Mustang", 2019, 180000, "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=400&q=80");
      stmt.run("Chevrolet Camaro", 2020, 200000, "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80");
      stmt.run("Volkswagen Golf", 2022, 85000, "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=400&q=80");
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