const AppError = require("./AppError");

/**
 * Олдсонгүй алдаа
 * Нөөц (resource) олдохгүй үед ашиглана
 */
class NotFoundError extends AppError {
  constructor(resourceName, resourceId = null) {
    const message = resourceId
      ? `${resourceName} олдсонгүй: ${resourceId}`
      : `${resourceName} олдсонгүй`;
    super(message, 404, { resourceName, resourceId });
  }
}

module.exports = NotFoundError;
