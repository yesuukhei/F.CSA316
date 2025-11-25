const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const { DatabaseError } = require("../lab9/exceptions");

/**
 * Өгөгдлийн сангийн модуль
 * SQLite мэдээллийн сантай холбогдох, хүснэгтүүдийг үүсгэх
 */
class DatabaseManager {
  constructor(dbPath = null) {
    // Тест эсвэл үйлдвэрийн өгөгдлийн сан
    if (!dbPath) {
      const dbDir = path.join(__dirname, "data");
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      dbPath = path.join(dbDir, "auth.db");
    }
    this.dbPath = dbPath;
    this.db = null;
  }

  /**
   * Өгөгдлийн сантай холбогдох
   */
  connect() {
    try {
      this.db = new Database(this.dbPath);
      this.db.pragma("foreign_keys = ON");
      this.createTables();
      return this.db;
    } catch (error) {
      throw new DatabaseError(
        `Өгөгдлийн сантай холбогдох үед алдаа гарлаа: ${error.message}`,
        { originalError: error.message }
      );
    }
  }

  /**
   * Хүснэгтүүдийг үүсгэх
   */
  createTables() {
    try {
      // Хэрэглэгчдийн хүснэгт
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          email TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `);

      // Нэвтрэх түүхийн хүснэгт
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS login_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          login_time TEXT NOT NULL DEFAULT (datetime('now')),
          success INTEGER NOT NULL DEFAULT 1,
          ip_address TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Гарах түүхийн хүснэгт
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS logout_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          logout_time TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
    } catch (error) {
      throw new DatabaseError(
        `Хүснэгт үүсгэх үед алдаа гарлаа: ${error.message}`,
        { originalError: error.message }
      );
    }
  }

  /**
   * Өгөгдлийн сангийн холболтыг хаах
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Өгөгдлийн сангийн объектыг авах
   */
  getDatabase() {
    if (!this.db) {
      this.connect();
    }
    return this.db;
  }

  /**
   * Өгөгдлийн сангийн файлыг устгах (тест ажиллуулахад ашиглана)
   */
  dropDatabase() {
    this.close();
    if (fs.existsSync(this.dbPath)) {
      fs.unlinkSync(this.dbPath);
    }
  }
}

module.exports = DatabaseManager;
