const express = require("express");
const path = require("path");
const AuthService = require("../lab10/services/AuthService");
const {
  ValidationError,
  NotFoundError,
  DatabaseError,
} = require("../lab9/exceptions");
const logger = require("../lab9/utils/logger");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// AuthService instance
const authService = new AuthService();
authService.initialize();

// Session storage (in production, use proper session management)
const sessions = new Map();

// Helper function to get client IP
function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

// API Routes

// Register endpoint
app.post("/api/register", (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Хэрэглэгчийн нэр болон нууц үг шаардлагатай",
      });
    }

    const user = authService.register(username, password, email || null);

    logger.info("Хэрэглэгч бүртгэгдлээ (API)", {
      userId: user.id,
      username: user.username,
    });

    res.json({
      success: true,
      message: "Амжилттай бүртгэгдлээ!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    logger.logError(error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        details: error.details,
      });
    }

    if (error instanceof DatabaseError) {
      return res.status(500).json({
        success: false,
        error: "Өгөгдлийн сангийн алдаа",
      });
    }

    res.status(500).json({
      success: false,
      error: "Алдаа гарлаа",
    });
  }
});

// Login endpoint
app.post("/api/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Хэрэглэгчийн нэр болон нууц үг шаардлагатай",
      });
    }

    const ipAddress = getClientIp(req);
    const user = authService.login(username, password, ipAddress);

    // Create session
    const sessionId = require("crypto").randomBytes(32).toString("hex");
    sessions.set(sessionId, {
      userId: user.id,
      username: user.username,
      loginTime: new Date().toISOString(),
    });

    logger.info("Хэрэглэгч нэвтэрлээ (API)", {
      userId: user.id,
      username: user.username,
    });

    res.json({
      success: true,
      message: "Амжилттай нэвтэрлээ!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      sessionId: sessionId,
    });
  } catch (error) {
    logger.logError(error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    if (error instanceof DatabaseError) {
      return res.status(500).json({
        success: false,
        error: "Өгөгдлийн сангийн алдаа",
      });
    }

    res.status(500).json({
      success: false,
      error: "Алдаа гарлаа",
    });
  }
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Session ID шаардлагатай",
      });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(401).json({
        success: false,
        error: "Хүчинтэй бус session",
      });
    }

    authService.logout(session.userId);
    sessions.delete(sessionId);

    logger.info("Хэрэглэгч гарлаа (API)", {
      userId: session.userId,
      username: session.username,
    });

    res.json({
      success: true,
      message: "Амжилттай гарлаа!",
    });
  } catch (error) {
    logger.logError(error);

    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Алдаа гарлаа",
    });
  }
});

// Get login history endpoint
app.get("/api/history/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionId } = req.query;

    // Verify session
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: "Нэвтэрнэ үү",
      });
    }

    const session = sessions.get(sessionId);
    if (!session || session.userId !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        error: "Эрх хүрэхгүй",
      });
    }

    const history = authService.getLoginHistory(parseInt(userId));

    res.json({
      success: true,
      history: history,
    });
  } catch (error) {
    logger.logError(error);

    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Алдаа гарлаа",
    });
  }
});

// Get current user endpoint
app.get("/api/user", (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: "Нэвтэрнэ үү",
      });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(401).json({
        success: false,
        error: "Хүчинтэй бус session",
      });
    }

    res.json({
      success: true,
      user: {
        id: session.userId,
        username: session.username,
      },
    });
  } catch (error) {
    logger.logError(error);
    res.status(500).json({
      success: false,
      error: "Алдаа гарлаа",
    });
  }
});

// Serve index.html for root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log(`НЭВТРЭХ СИСТЕМИЙН ВЕБ СЕРВЕР АЖИЛЛАЖ БАЙНА`);
  console.log("=".repeat(60));
  console.log(`Сервер: http://localhost:${PORT}`);
  console.log("=".repeat(60));
  logger.info("Веб сервер эхэлсэн", { port: PORT });
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nСервер хаагдаж байна...");
  authService.close();
  process.exit(0);
});

module.exports = app;
