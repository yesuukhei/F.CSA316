const AppError = require("./AppError");

/**
 * Баталгаажуулалтын алдаа
 * Хэрэглэгчийн оруулсан өгөгдөл буруу байх үед ашиглана
 */
class ValidationError extends AppError {
  constructor(message = "Баталгаажуулалтын алдаа", details = null) {
    super(message, 400, details);
  }
}

module.exports = ValidationError;
