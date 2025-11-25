const fs = require("fs");
const path = require("path");

// Энгийн логгер
class Logger {
  constructor() {
    this.logDir = path.join(__dirname, "../logs");
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getLogFile() {
    const today = new Date().toISOString().split("T")[0];
    return path.join(this.logDir, `app-${today}.log`);
  }

  info(message, details = {}) {
    const time = new Date().toISOString();
    const msg = `[${time}] [INFO] ${message} ${JSON.stringify(details)}\n`;
    console.log(msg.trim());
    fs.appendFileSync(this.getLogFile(), msg);
  }

  error(message, error = null) {
    const time = new Date().toISOString();
    const details = error ? { name: error.name, message: error.message } : {};
    const msg = `[${time}] [ERROR] ${message} ${JSON.stringify(details)}\n`;
    console.error(msg.trim());
    fs.appendFileSync(this.getLogFile(), msg);
  }

  logError(error, context = {}) {
    this.error(error.message || "Алдаа гарлаа", error);
  }
}

module.exports = new Logger();
