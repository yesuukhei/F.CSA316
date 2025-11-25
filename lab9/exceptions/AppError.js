// Үндсэн алдааны класс
class AppError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }

  toJSON() {
    return {
      error: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

module.exports = AppError;
