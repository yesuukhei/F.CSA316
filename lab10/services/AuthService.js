const crypto = require("crypto");
const DatabaseManager = require("../database");
const {
  ValidationError,
  NotFoundError,
  DatabaseError,
} = require("../../lab9/exceptions");
const logger = require("../../lab9/utils/logger");

/**
 * Нэвтрэх системийн үйлчилгээ
 * Хэрэглэгчийн бүртгэл, нэвтрэх, гарах, нэвтрэх түүх үйлдлүүдийг гүйцэтгэнэ
 */
class AuthService {
  constructor(dbPath = null) {
    this.dbManager = new DatabaseManager(dbPath);
    this.db = null;
  }

  /**
   * Өгөгдлийн сантай холбогдох
   */
  initialize() {
    if (!this.db) {
      this.db = this.dbManager.connect();
    }
    return this.db;
  }

  /**
   * Нууц үгийг hash хийх
   */
  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return `${salt}:${hash}`;
  }

  /**
   * Нууц үгийг шалгах
   */
  verifyPassword(password, hash) {
    const [salt, storedHash] = hash.split(":");
    const hashToVerify = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return hashToVerify === storedHash;
  }

  /**
   * Имэйл хаягийг шалгах
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Хэрэглэгч бүртгүүлэх
   */
  register(username, password, email = null) {
    if (!username || username.trim() === "") {
      throw new ValidationError("Хэрэглэгчийн нэр хоосон байж болохгүй", {
        field: "username",
      });
    }

    if (username.length < 3) {
      throw new ValidationError(
        "Хэрэглэгчийн нэр хамгийн багадаа 3 тэмдэгт байх ёстой",
        { field: "username", value: username }
      );
    }

    if (!password || password.length < 6) {
      throw new ValidationError(
        "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой",
        { field: "password" }
      );
    }

    if (email && !this.validateEmail(email)) {
      throw new ValidationError("Имэйл хаяг буруу байна", {
        field: "email",
        value: email,
      });
    }

    try {
      this.initialize();
      const db = this.dbManager.getDatabase();

      // Хэрэглэгч аль хэдийн бүртгэлтэй эсэхийг шалгах
      const existingUser = db
        .prepare("SELECT id FROM users WHERE username = ?")
        .get(username.trim());

      if (existingUser) {
        throw new ValidationError(
          "Энэ хэрэглэгчийн нэр аль хэдийн бүртгэлтэй",
          {
            field: "username",
            value: username,
          }
        );
      }

      // Нууц үгийг hash хийх
      const passwordHash = this.hashPassword(password);

      // Хэрэглэгчийг өгөгдлийн санд нэмэх
      const result = db
        .prepare(
          "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)"
        )
        .run(username.trim(), passwordHash, email ? email.trim() : null);

      const userId = result.lastInsertRowid;

      logger.info("Хэрэглэгч бүртгэгдлээ", {
        userId,
        username: username.trim(),
      });

      return {
        id: userId,
        username: username.trim(),
        email: email ? email.trim() : null,
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Бүртгэл үүсгэх үед алдаа гарлаа: ${error.message}`,
        { originalError: error.message }
      );
    }
  }

  /**
   * Нэвтрэх
   */
  login(username, password, ipAddress = null) {
    if (!username || username.trim() === "") {
      throw new ValidationError("Хэрэглэгчийн нэр хоосон байж болохгүй", {
        field: "username",
      });
    }

    if (!password) {
      throw new ValidationError("Нууц үг хоосон байж болохгүй", {
        field: "password",
      });
    }

    try {
      this.initialize();
      const db = this.dbManager.getDatabase();

      // Хэрэглэгчийг олох
      const user = db
        .prepare("SELECT * FROM users WHERE username = ?")
        .get(username.trim());

      if (!user) {
        // Нэвтрэх оролдлогыг бүртгэх (амжилтгүй)
        this.recordLoginAttempt(null, false, ipAddress);
        throw new NotFoundError("Хэрэглэгч", username);
      }

      // Нууц үгийг шалгах
      const isValidPassword = this.verifyPassword(password, user.password_hash);

      if (!isValidPassword) {
        // Нэвтрэх оролдлогыг бүртгэх (амжилтгүй)
        this.recordLoginAttempt(user.id, false, ipAddress);
        throw new ValidationError("Нууц үг буруу байна", {
          field: "password",
        });
      }

      // Нэвтрэх оролдлогыг бүртгэх (амжилттай)
      this.recordLoginAttempt(user.id, true, ipAddress);

      logger.info("Хэрэглэгч нэвтэрлээ", {
        userId: user.id,
        username: user.username,
      });

      return {
        id: user.id,
        username: user.username,
        email: user.email,
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof DatabaseError
      ) {
        throw error;
      }
      throw new DatabaseError(`Нэвтрэх үед алдаа гарлаа: ${error.message}`, {
        originalError: error.message,
      });
    }
  }

  /**
   * Нэвтрэх оролдлогыг бүртгэх
   */
  recordLoginAttempt(userId, success, ipAddress = null) {
    try {
      const db = this.dbManager.getDatabase();
      db.prepare(
        "INSERT INTO login_history (user_id, success, ip_address) VALUES (?, ?, ?)"
      ).run(userId, success ? 1 : 0, ipAddress);
    } catch (error) {
      logger.error("Нэвтрэх оролдлогыг бүртгэхэд алдаа гарлаа", error);
    }
  }

  /**
   * Гарах
   */
  logout(userId) {
    if (!userId) {
      throw new ValidationError("Хэрэглэгчийн ID шаардлагатай", {
        field: "userId",
      });
    }

    try {
      this.initialize();
      const db = this.dbManager.getDatabase();

      // Хэрэглэгч байгаа эсэхийг шалгах
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

      if (!user) {
        throw new NotFoundError("Хэрэглэгч", userId);
      }

      // Гарах түүхийг бүртгэх
      db.prepare("INSERT INTO logout_history (user_id) VALUES (?)").run(userId);

      logger.info("Хэрэглэгч гарлаа", { userId, username: user.username });

      return { success: true, userId };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof DatabaseError
      ) {
        throw error;
      }
      throw new DatabaseError(`Гарах үед алдаа гарлаа: ${error.message}`, {
        originalError: error.message,
      });
    }
  }

  /**
   * Нэвтрэх түүхийг авах
   */
  getLoginHistory(userId) {
    if (!userId) {
      throw new ValidationError("Хэрэглэгчийн ID шаардлагатай", {
        field: "userId",
      });
    }

    try {
      this.initialize();
      const db = this.dbManager.getDatabase();

      // Хэрэглэгч байгаа эсэхийг шалгах
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

      if (!user) {
        throw new NotFoundError("Хэрэглэгч", userId);
      }

      // Нэвтрэх түүхийг авах
      const history = db
        .prepare(
          "SELECT * FROM login_history WHERE user_id = ? ORDER BY login_time DESC"
        )
        .all(userId);

      logger.info("Нэвтрэх түүх авагдлаа", {
        userId,
        count: history.length,
      });

      return history.map((entry) => ({
        id: entry.id,
        loginTime: entry.login_time,
        success: entry.success === 1,
        ipAddress: entry.ip_address,
      }));
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof DatabaseError
      ) {
        throw error;
      }
      throw new DatabaseError(
        `Нэвтрэх түүх авах үед алдаа гарлаа: ${error.message}`,
        { originalError: error.message }
      );
    }
  }

  /**
   * Хэрэглэгчийг нэрээр нь олох
   */
  getUserByUsername(username) {
    if (!username || username.trim() === "") {
      throw new ValidationError("Хэрэглэгчийн нэр хоосон байж болохгүй", {
        field: "username",
      });
    }

    try {
      this.initialize();
      const db = this.dbManager.getDatabase();

      const user = db
        .prepare("SELECT * FROM users WHERE username = ?")
        .get(username.trim());

      if (!user) {
        throw new NotFoundError("Хэрэглэгч", username);
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof DatabaseError
      ) {
        throw error;
      }
      throw new DatabaseError(
        `Хэрэглэгч олох үед алдаа гарлаа: ${error.message}`,
        { originalError: error.message }
      );
    }
  }

  /**
   * Өгөгдлийн сангийн холболтыг хаах
   */
  close() {
    this.dbManager.close();
  }
}

module.exports = AuthService;
