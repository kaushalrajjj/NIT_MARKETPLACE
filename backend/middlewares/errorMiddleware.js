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
const fs = require('fs');
const errorHandler = (err, req, res, next) => {
    fs.appendFileSync('backend_errors.log', `[${new Date().toISOString()}] ${err.message}\n${err.stack}\n\n`);
    console.error('[errorHandler]', err); // Keep terminal log too

    // Mongoose validation errors → 400 Bad Request
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message).join(', ');
        return res.status(400).json({ message: messages });
    }

    // Mongoose bad ObjectId → 400 Bad Request
    if (err.name === 'CastError') {
        return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };
