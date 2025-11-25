/**
 * Бүх алдааны классуудыг нэг газарт экспортлох
 */
const AppError = require("./AppError");
const ValidationError = require("./ValidationError");
const NotFoundError = require("./NotFoundError");
const DatabaseError = require("./DatabaseError");

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  DatabaseError,
};
