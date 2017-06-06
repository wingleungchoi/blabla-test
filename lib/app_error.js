class AppError extends Error {
  constructor(error) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = 'AppError';
    this.type = error.type;
    this.status = error.status;
    this.message = error.message;
    this.errors = error.errors;
  }
}

module.exports = AppError;
