/**
 * errorHandler — global Express error-handling middleware.
 * Any route that calls next(error) will land here.
 * It must have 4 parameters for Express to recognise it as an error handler.
 */
const errorHandler = (err, req, res, next) => {
  // Use the error's status code if set, otherwise default to 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only show the full stack trace in development — never in production
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
