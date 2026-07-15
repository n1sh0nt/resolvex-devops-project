const ApiError = require('../utils/ApiError');

// Converts known error types (Mongoose, JWT, Multer) into ApiError
const normalizeError = (err) => {
  if (err instanceof ApiError) return err;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return new ApiError(400, `Invalid value for field '${err.path}': ${err.value}`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new ApiError(400, 'Validation failed', messages);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return new ApiError(409, `Duplicate value for field '${field}'. Please use another value.`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return new ApiError(401, 'Invalid token. Please log in again.');
  }
  if (err.name === 'TokenExpiredError') {
    return new ApiError(401, 'Your session has expired. Please log in again.');
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return new ApiError(400, `File upload error: ${err.message}`);
  }

  return new ApiError(err.statusCode || 500, err.message || 'Internal server error');
};

// 404 handler for unmatched routes
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Global error handler - must be registered last
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  } else if (!error.isOperational) {
    console.error('UNEXPECTED ERROR:', err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    errors: error.errors && error.errors.length ? error.errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { errorHandler, notFound };
