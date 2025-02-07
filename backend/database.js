// backend/database.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const dbPath = path.resolve(__dirname, config.databaseFile || 'bookings.db');
const dbExists = fs.existsSync(dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database", err);
  } else {
    console.log("Connected to SQLite database.");
  }
});

if (!dbExists) {
  db.serialize(() => {
    // Bookings table now stores a time frame: startTime and endTime.
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      room TEXT,
      date TEXT,
      startTime TEXT,
      endTime TEXT,
      status TEXT DEFAULT 'pending'
    )`);

    // Users table: stores approved users (created only by admin)
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`);

    console.log("Database tables created.");
  });
}

module.exports = db;
