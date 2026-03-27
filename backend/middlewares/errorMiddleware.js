/**
 * Catch 404: 
 * If a request reaches this point, no route handled it. 
 * Generate a 'Not Found' error and pass to errorHandler.
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * Universal Error Handler:
 * Catches all errors and returns as JSON.
 * Hides stack traces in production environment.
 */
/**
 * Universal Error Handler Middleware.
 * This function intercepts any errors thrown during the request-response cycle.
 * It ensures the client receives a structured JSON error response instead of an HTML stack trace.
 * Stack traces are hidden in production to prevent leaking sensitive application details.
 *
 * @param {Error} err - The error object caught by Express
 * @param {Object} req - The standard Express request object
 * @param {Object} res - The standard Express response object
 * @param {Function} next - The next middleware function in the stack
 */
const errorHandler = (err, req, res, next) => {
    // Log the error to the server console for debugging purposes
    console.error('[(ErrorHandler Middleware)]', err.message);

    // Handle specific cases: Mongoose Validation Errors (e.g., missing required fields)
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message).join(', ');
        return res.status(400).json({ message: `Validation Error: ${messages}` });
    }

    // Handle specific cases: Invalid Mongoose Object IDs (e.g., malformed URL params)
    if (err.name === 'CastError') {
        return res.status(400).json({ message: `Invalid reference provided for ${err.path}: ${err.value}` });
    }

    // Determine the status code. If it's still 200 (OK), force it to 500 (Internal Server Error)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    
    // Return standard JSON error structure
    res.json({
        message: err.message || 'An unexpected server error occurred.',
        // Only include the stack trace if the application is NOT in production mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };
