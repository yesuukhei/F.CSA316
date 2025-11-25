const AppError = require("./AppError");

/**
 * Өгөгдлийн сангийн алдаа
 * Өгөгдлийн сантай холбоотой алдаа гарвал ашиглана
 */
class DatabaseError extends AppError {
  constructor(message = "Өгөгдлийн сангийн алдаа", details = null) {
    super(message, 500, details);
  }
}

module.exports = DatabaseError;
