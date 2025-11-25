const logger = require("./logger");
const { AppError } = require("../exceptions");

// Express.js алдаа боловсруулагч
function errorMiddleware(error, req, res, next) {
  logger.logError(error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      ...error.toJSON(),
    });
  }

  return res.status(500).json({
    success: false,
    error: "Дотоод серверийн алдаа",
    message: "Алдаа гарлаа. Дараа дахин оролдоно уу.",
    statusCode: 500,
  });
}

module.exports = { errorMiddleware };
