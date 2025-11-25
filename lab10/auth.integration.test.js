const AuthService = require("./services/AuthService");
const {
  ValidationError,
  NotFoundError,
  DatabaseError,
} = require("../lab9/exceptions");
const path = require("path");
const fs = require("fs");

describe("Authentication System Integration Tests (Lab 10)", () => {
  let authService;
  let testDbPath;

  beforeEach(() => {
    // Тест өгөгдлийн сангийн зам үүсгэх
    const testDbDir = path.join(__dirname, "data");
    if (!fs.existsSync(testDbDir)) {
      fs.mkdirSync(testDbDir, { recursive: true });
    }
    testDbPath = path.join(testDbDir, `test-auth-${Date.now()}.db`);
    authService = new AuthService(testDbPath);
    authService.initialize();
  });

  afterEach(() => {
    // Тест өгөгдлийн сангийн холболтыг хаах
    if (authService) {
      authService.close();
    }
    // Тест өгөгдлийн сангийн файлыг устгах
    if (testDbPath && fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe("Complete User Flow", () => {
    test("should complete full user flow: register → login → view history → logout", async () => {
      // 1. Бүртгүүлэх
      const registeredUser = authService.register(
        "integrationuser",
        "password123",
        "integration@test.com"
      );

      expect(registeredUser).toHaveProperty("id");
      expect(registeredUser.username).toBe("integrationuser");
      expect(registeredUser.email).toBe("integration@test.com");

      // 2. Нэвтрэх
      const loggedInUser = authService.login("integrationuser", "password123");

      expect(loggedInUser).toHaveProperty("id");
      expect(loggedInUser.id).toBe(registeredUser.id);
      expect(loggedInUser.username).toBe("integrationuser");

      // 3. Нэвтрэх түүх харах
      const history = authService.getLoginHistory(loggedInUser.id);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0]).toHaveProperty("loginTime");
      expect(history[0]).toHaveProperty("success");
      expect(history[0].success).toBe(true);

      // 4. Гарах
      const logoutResult = authService.logout(loggedInUser.id);

      expect(logoutResult).toHaveProperty("success");
      expect(logoutResult.success).toBe(true);
    });
  });

  describe("User Registration", () => {
    test("should register user with valid data", () => {
      const user = authService.register(
        "testuser1",
        "password123",
        "test1@example.com"
      );

      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("username", "testuser1");
      expect(user).toHaveProperty("email", "test1@example.com");
    });

    test("should register user without email", () => {
      const user = authService.register("testuser2", "password123");

      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("username", "testuser2");
      expect(user.email).toBeNull();
    });

    test("should throw ValidationError for empty username", () => {
      expect(() => {
        authService.register("", "password123");
      }).toThrow(ValidationError);

      try {
        authService.register("", "password123");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.statusCode).toBe(400);
      }
    });

    test("should throw ValidationError for short username", () => {
      expect(() => {
        authService.register("ab", "password123");
      }).toThrow(ValidationError);

      try {
        authService.register("ab", "password123");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details).toHaveProperty("field", "username");
      }
    });

    test("should throw ValidationError for short password", () => {
      expect(() => {
        authService.register("testuser3", "12345");
      }).toThrow(ValidationError);

      try {
        authService.register("testuser3", "12345");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details).toHaveProperty("field", "password");
      }
    });

    test("should throw ValidationError for invalid email", () => {
      expect(() => {
        authService.register("testuser4", "password123", "invalid-email");
      }).toThrow(ValidationError);

      try {
        authService.register("testuser4", "password123", "invalid-email");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details).toHaveProperty("field", "email");
      }
    });

    test("should throw ValidationError for duplicate username", () => {
      authService.register("duplicateuser", "password123");

      expect(() => {
        authService.register("duplicateuser", "password123");
      }).toThrow(ValidationError);

      try {
        authService.register("duplicateuser", "password123");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details).toHaveProperty("field", "username");
      }
    });
  });

  describe("User Login", () => {
    beforeEach(() => {
      // Тест хэрэглэгч үүсгэх
      authService.register("logintest", "password123", "login@test.com");
    });

    test("should login with correct credentials", () => {
      const user = authService.login("logintest", "password123");

      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("username", "logintest");
      expect(user).toHaveProperty("email", "login@test.com");
    });

    test("should throw NotFoundError for non-existent user", () => {
      expect(() => {
        authService.login("nonexistent", "password123");
      }).toThrow(NotFoundError);

      try {
        authService.login("nonexistent", "password123");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.statusCode).toBe(404);
      }
    });

    test("should throw ValidationError for wrong password", () => {
      expect(() => {
        authService.login("logintest", "wrongpassword");
      }).toThrow(ValidationError);

      try {
        authService.login("logintest", "wrongpassword");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details).toHaveProperty("field", "password");
      }
    });

    test("should throw ValidationError for empty username", () => {
      expect(() => {
        authService.login("", "password123");
      }).toThrow(ValidationError);
    });

    test("should throw ValidationError for empty password", () => {
      expect(() => {
        authService.login("logintest", "");
      }).toThrow(ValidationError);
    });

    test("should record login attempt in history", () => {
      const user = authService.login("logintest", "password123");
      const history = authService.getLoginHistory(user.id);

      expect(history.length).toBeGreaterThan(0);
      const lastAttempt = history[0];
      expect(lastAttempt.success).toBe(true);
    });

    test("should record failed login attempt in history", () => {
      const user = authService.getUserByUsername("logintest");

      try {
        authService.login("logintest", "wrongpassword");
      } catch (error) {
        // Алдаа гарна
      }

      const history = authService.getLoginHistory(user.id);
      const failedAttempts = history.filter((h) => !h.success);
      expect(failedAttempts.length).toBeGreaterThan(0);
    });
  });

  describe("Login History", () => {
    let testUser;

    beforeEach(() => {
      testUser = authService.register(
        "historytest",
        "password123",
        "history@test.com"
      );
    });

    test("should retrieve login history for user", () => {
      // Нэвтрэх оролдлого хийх
      authService.login("historytest", "password123");
      authService.login("historytest", "password123");

      const history = authService.getLoginHistory(testUser.id);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThanOrEqual(2);
    });

    test("should return empty array for user with no login history", () => {
      const history = authService.getLoginHistory(testUser.id);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });

    test("should throw ValidationError for invalid userId", () => {
      expect(() => {
        authService.getLoginHistory(null);
      }).toThrow(ValidationError);
    });

    test("should throw NotFoundError for non-existent user", () => {
      expect(() => {
        authService.getLoginHistory(99999);
      }).toThrow(NotFoundError);
    });

    test("should include success status in history", () => {
      authService.login("historytest", "password123");

      const history = authService.getLoginHistory(testUser.id);
      expect(history[0]).toHaveProperty("success");
      expect(typeof history[0].success).toBe("boolean");
    });
  });

  describe("Logout", () => {
    let testUser;

    beforeEach(() => {
      testUser = authService.register(
        "logouttest",
        "password123",
        "logout@test.com"
      );
    });

    test("should logout successfully", () => {
      authService.login("logouttest", "password123");
      const result = authService.logout(testUser.id);

      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
      expect(result).toHaveProperty("userId", testUser.id);
    });

    test("should throw ValidationError for invalid userId", () => {
      expect(() => {
        authService.logout(null);
      }).toThrow(ValidationError);
    });

    test("should throw NotFoundError for non-existent user", () => {
      expect(() => {
        authService.logout(99999);
      }).toThrow(NotFoundError);
    });
  });

  describe("Database Operations", () => {
    test("should create user in database", () => {
      const user = authService.register("dbtest", "password123", "db@test.com");

      const foundUser = authService.getUserByUsername("dbtest");
      expect(foundUser).toHaveProperty("id", user.id);
      expect(foundUser.username).toBe("dbtest");
    });

    test("should persist login history in database", () => {
      const user = authService.register("persisttest", "password123");
      authService.login("persisttest", "password123");

      // Шинэ сервис үүсгэж, өгөгдлийн сангийн мэдээллийг шалгах
      const newAuthService = new AuthService(testDbPath);
      newAuthService.initialize();

      const history = newAuthService.getLoginHistory(user.id);
      expect(history.length).toBeGreaterThan(0);

      newAuthService.close();
    });

    test("should handle database errors gracefully", () => {
      // Буруу замтай өгөгдлийн сан үүсгэх
      const invalidPath = "/invalid/path/to/database.db";
      const invalidService = new AuthService(invalidPath);

      // Холбогдох үед алдаа гарна
      expect(() => {
        invalidService.initialize();
      }).toThrow();
    });
  });

  describe("Error Handling", () => {
    test("should handle ValidationError correctly", () => {
      try {
        authService.register("", "password123");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.toJSON()).toHaveProperty("error");
        expect(error.toJSON()).toHaveProperty("statusCode", 400);
        expect(error.toJSON()).toHaveProperty("details");
      }
    });

    test("should handle NotFoundError correctly", () => {
      try {
        authService.login("nonexistent", "password123");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.toJSON()).toHaveProperty("error");
        expect(error.toJSON()).toHaveProperty("statusCode", 404);
      }
    });
  });

  describe("Password Security", () => {
    test("should hash passwords correctly", () => {
      const user1 = authService.register("hashuser1", "password123");
      const user2 = authService.register("hashuser2", "password123");

      // Ижил нууц үгтэй хэрэглэгчдийн hash өөр байх ёстой
      const db = authService.dbManager.getDatabase();
      const user1Data = db
        .prepare("SELECT password_hash FROM users WHERE id = ?")
        .get(user1.id);
      const user2Data = db
        .prepare("SELECT password_hash FROM users WHERE id = ?")
        .get(user2.id);

      expect(user1Data.password_hash).not.toBe(user2Data.password_hash);
    });

    test("should verify passwords correctly", () => {
      authService.register("verifyuser", "password123");

      // Зөв нууц үг
      expect(() => {
        authService.login("verifyuser", "password123");
      }).not.toThrow();

      // Буруу нууц үг
      expect(() => {
        authService.login("verifyuser", "wrongpassword");
      }).toThrow(ValidationError);
    });
  });
});
