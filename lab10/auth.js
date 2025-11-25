const readline = require("readline");
const AuthService = require("./services/AuthService");
const { ValidationError, NotFoundError } = require("../lab9/exceptions");
const logger = require("../lab9/utils/logger");

/**
 * Нэвтрэх системийн үндсэн програм
 * Интеграци тест ажиллуулж, дараа нь цэс гаргана
 */
class AuthApp {
  constructor() {
    this.authService = new AuthService();
    this.currentUser = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Интеграци тест ажиллуулах
   */
  async runIntegrationTests() {
    console.log("\n" + "=".repeat(60));
    console.log("ИНТЕГРАЦИ ТЕСТ АЖИЛЛУУЛАЖ БАЙНА...");
    console.log("=".repeat(60) + "\n");

    try {
      // Тест өгөгдлийн сан ашиглах
      const testDbPath = require("path").join(
        __dirname,
        "data",
        "test-auth.db"
      );
      const testAuthService = new AuthService(testDbPath);
      testAuthService.initialize();

      let testsPassed = 0;
      let testsFailed = 0;

      // Тест 1: Хэрэглэгч бүртгүүлэх
      try {
        const user = testAuthService.register(
          "testuser",
          "password123",
          "test@example.com"
        );
        if (user && user.id) {
          console.log("✓ Тест 1: Хэрэглэгч бүртгүүлэх - АМЖИЛТТАЙ");
          testsPassed++;
        } else {
          throw new Error("Бүртгэл үүсгэхэд алдаа гарлаа");
        }
      } catch (error) {
        console.log("✗ Тест 1: Хэрэглэгч бүртгүүлэх - АМЖИЛТГҮЙ");
        console.log(`  Алдаа: ${error.message}`);
        testsFailed++;
      }

      // Тест 2: Нэвтрэх
      try {
        const loggedInUser = testAuthService.login("testuser", "password123");
        if (loggedInUser && loggedInUser.id) {
          console.log("✓ Тест 2: Нэвтрэх - АМЖИЛТТАЙ");
          testsPassed++;
        } else {
          throw new Error("Нэвтрэхэд алдаа гарлаа");
        }
      } catch (error) {
        console.log("✗ Тест 2: Нэвтрэх - АМЖИЛТГҮЙ");
        console.log(`  Алдаа: ${error.message}`);
        testsFailed++;
      }

      // Тест 3: Буруу нууц үг
      try {
        testAuthService.login("testuser", "wrongpassword");
        console.log("✗ Тест 3: Буруу нууц үг шалгах - АМЖИЛТГҮЙ");
        console.log("  Алдаа: Буруу нууц үгтэй нэвтрэх ёсгүй");
        testsFailed++;
      } catch (error) {
        if (error instanceof ValidationError) {
          console.log("✓ Тест 3: Буруу нууц үг шалгах - АМЖИЛТТАЙ");
          testsPassed++;
        } else {
          console.log("✗ Тест 3: Буруу нууц үг шалгах - АМЖИЛТГҮЙ");
          console.log(`  Алдаа: ${error.message}`);
          testsFailed++;
        }
      }

      // Тест 4: Нэвтрэх түүх
      try {
        const history = testAuthService.getLoginHistory(1);
        if (Array.isArray(history)) {
          console.log("✓ Тест 4: Нэвтрэх түүх авах - АМЖИЛТТАЙ");
          testsPassed++;
        } else {
          throw new Error("Түүх массив биш байна");
        }
      } catch (error) {
        console.log("✗ Тест 4: Нэвтрэх түүх авах - АМЖИЛТГҮЙ");
        console.log(`  Алдаа: ${error.message}`);
        testsFailed++;
      }

      // Тест 5: Гарах
      try {
        const result = testAuthService.logout(1);
        if (result && result.success) {
          console.log("✓ Тест 5: Гарах - АМЖИЛТТАЙ");
          testsPassed++;
        } else {
          throw new Error("Гарах амжилтгүй");
        }
      } catch (error) {
        console.log("✗ Тест 5: Гарах - АМЖИЛТГҮЙ");
        console.log(`  Алдаа: ${error.message}`);
        testsFailed++;
      }

      // Тест 6: Дубликат хэрэглэгч
      try {
        testAuthService.register("testuser", "password123");
        console.log("✗ Тест 6: Дубликат хэрэглэгч шалгах - АМЖИЛТГҮЙ");
        console.log("  Алдаа: Дубликат хэрэглэгч бүртгэх ёсгүй");
        testsFailed++;
      } catch (error) {
        if (error instanceof ValidationError) {
          console.log("✓ Тест 6: Дубликат хэрэглэгч шалгах - АМЖИЛТТАЙ");
          testsPassed++;
        } else {
          console.log("✗ Тест 6: Дубликат хэрэглэгч шалгах - АМЖИЛТГҮЙ");
          console.log(`  Алдаа: ${error.message}`);
          testsFailed++;
        }
      }

      testAuthService.close();

      // Тест өгөгдлийн сангийн файлыг устгах
      const fs = require("fs");
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }

      console.log("\n" + "=".repeat(60));
      console.log(
        `ТЕСТИЙН ДҮН: ${testsPassed} амжилттай, ${testsFailed} амжилтгүй`
      );
      console.log("=".repeat(60) + "\n");
    } catch (error) {
      logger.logError(error);
      console.log(`\nТест ажиллуулах үед алдаа гарлаа: ${error.message}\n`);
    }
  }

  /**
   * Цэс харуулах
   */
  showMenu() {
    console.log("\n" + "=".repeat(60));
    console.log("НЭВТРЭХ СИСТЕМ");
    console.log("=".repeat(60));
    if (this.currentUser) {
      console.log(`Нэвтэрсэн: ${this.currentUser.username}`);
    }
    console.log("\nСонголтууд:");
    console.log("1. Бүртгүүлэх (Register)");
    console.log("2. Нэвтрэх (Login)");
    console.log("3. Нэвтрэх түүх харах (View Login History)");
    console.log("4. Гарах (Logout)");
    console.log("5. Программ дуусгах (Exit)");
    console.log("=".repeat(60));
  }

  /**
   * Хэрэглэгчийн оролтыг авах
   */
  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  /**
   * Бүртгүүлэх
   */
  async handleRegister() {
    try {
      console.log("\n--- БҮРТГҮҮЛЭХ ---");
      const username = await this.question("Хэрэглэгчийн нэр: ");
      const password = await this.question("Нууц үг: ");
      const email = await this.question("Имэйл (сонголттой): ");

      const user = this.authService.register(username, password, email || null);

      console.log(`\n✓ Амжилттай бүртгэгдлээ! ID: ${user.id}`);
      logger.info("Хэрэглэгч бүртгэгдлээ (цэс)", { userId: user.id });
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log(`\n❌ Алдаа: ${error.message}`);
      } else {
        console.log(`\n❌ Алдаа гарлаа: ${error.message}`);
        logger.logError(error);
      }
    }
  }

  /**
   * Нэвтрэх
   */
  async handleLogin() {
    try {
      if (this.currentUser) {
        console.log("\n❌ Та аль хэдийн нэвтэрсэн байна!");
        return;
      }

      console.log("\n--- НЭВТРЭХ ---");
      const username = await this.question("Хэрэглэгчийн нэр: ");
      const password = await this.question("Нууц үг: ");

      const user = this.authService.login(username, password);

      this.currentUser = user;
      console.log(`\n✓ Амжилттай нэвтэрлээ! Сайн байна уу, ${user.username}!`);
      logger.info("Хэрэглэгч нэвтэрлээ (цэс)", { userId: user.id });
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        console.log(`\n❌ Алдаа: ${error.message}`);
      } else {
        console.log(`\n❌ Алдаа гарлаа: ${error.message}`);
        logger.logError(error);
      }
    }
  }

  /**
   * Нэвтрэх түүх харах
   */
  async handleViewHistory() {
    try {
      if (!this.currentUser) {
        console.log("\n❌ Эхлээд нэвтэрнэ үү!");
        return;
      }

      console.log("\n--- НЭВТРЭХ ТҮҮХ ---");
      const history = this.authService.getLoginHistory(this.currentUser.id);

      if (history.length === 0) {
        console.log("Нэвтрэх түүх хоосон байна.");
      } else {
        console.log(`\nНийт ${history.length} нэвтрэх оролдлого:\n`);
        history.forEach((entry, index) => {
          const status = entry.success ? "✓ Амжилттай" : "✗ Амжилтгүй";
          console.log(
            `${index + 1}. ${entry.loginTime} - ${status}${
              entry.ipAddress ? ` (IP: ${entry.ipAddress})` : ""
            }`
          );
        });
      }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        console.log(`\n❌ Алдаа: ${error.message}`);
      } else {
        console.log(`\n❌ Алдаа гарлаа: ${error.message}`);
        logger.logError(error);
      }
    }
  }

  /**
   * Гарах
   */
  async handleLogout() {
    try {
      if (!this.currentUser) {
        console.log("\n❌ Та нэвтэрээгүй байна!");
        return;
      }

      this.authService.logout(this.currentUser.id);
      console.log(
        `\n✓ Амжилттай гарлаа! Сайн байна уу, ${this.currentUser.username}!`
      );
      this.currentUser = null;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        console.log(`\n❌ Алдаа: ${error.message}`);
      } else {
        console.log(`\n❌ Алдаа гарлаа: ${error.message}`);
        logger.logError(error);
      }
    }
  }

  /**
   * Программыг ажиллуулах
   */
  async run() {
    try {
      // Эхлээд интеграци тест ажиллуулах
      await this.runIntegrationTests();

      // Үндсэн цэс
      while (true) {
        this.showMenu();
        const choice = await this.question("\nСонголтоо оруулна уу (1-5): ");

        switch (choice.trim()) {
          case "1":
            await this.handleRegister();
            break;
          case "2":
            await this.handleLogin();
            break;
          case "3":
            await this.handleViewHistory();
            break;
          case "4":
            await this.handleLogout();
            break;
          case "5":
            console.log("\nБаяртай!");
            this.authService.close();
            this.rl.close();
            process.exit(0);
            break;
          default:
            console.log("\n❌ Буруу сонголт! 1-5 хооронд сонгоно уу.");
        }
      }
    } catch (error) {
      logger.logError(error);
      console.error("Программ ажиллуулах үед алдаа гарлаа:", error.message);
      this.authService.close();
      this.rl.close();
      process.exit(1);
    }
  }
}

// Программ ажиллуулах
if (require.main === module) {
  const app = new AuthApp();
  app.run().catch((error) => {
    console.error("Алдаа:", error);
    process.exit(1);
  });
}

module.exports = AuthApp;
