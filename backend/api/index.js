/**
 * api/index.js — Vercel Serverless Entry Point
 * ──────────────────────────────────────────────
 * This file is ONLY used when deployed on Vercel (production).
 * Locally, server.js is used instead.
 *
 * WHY a separate file for Vercel?
 * ─────────────────────────────────
 * Normal Node.js servers run as a continuous process:
 *   Start → Connect DB → Listen forever
 *
 * Vercel uses "Serverless Functions":
 *   - Each incoming request triggers this function fresh
 *   - The function "spins up", handles the request, then goes idle
 *   - A "cold start" = the function wakes up from idle (first request after inactivity)
 *   - There is NO persistent process to connect DB once on startup
 *
 * So we must check and connect to MongoDB on EVERY cold start.
 * But we avoid reconnecting if a connection already exists (from a recent request).
 */

// The configured Express application (routes, middleware, etc.)
const app = require('../app');

// Mongoose manages the MongoDB connection state
const mongoose = require('mongoose');

// Global error handlers — must be added after all routes
const { notFound, errorHandler } = require('../middlewares/errorMiddleware');

// Add error handlers to the Express app right away
// (unlike server.js, there's no Vite middleware here to worry about ordering)
app.use(notFound);
app.use(errorHandler);

/**
 * The Serverless Handler
 * ━━━━━━━━━━━━━━━━━━━━━━
 * Vercel calls this function for every incoming HTTP request.
 * It receives the request (req) and a way to send a response (res).
 */
module.exports = async (req, res) => {
    // Check if MongoDB is already connected (readyState 1 = connected)
    // This avoids opening a new connection on every warm (non-cold-start) request,
    // which would quickly exhaust the MongoDB Atlas free-tier connection limit.
    if (mongoose.connection.readyState !== 1) {
        try {
            // Connect to MongoDB using the URI from environment variables
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('[(Serverless)] MongoDB Connected via Vercel');
        } catch (error) {
            // If we can't reach the database, there's no point passing the request
            // to Express — return a 500 error immediately
            console.error(`[(Serverless Error)] MongoDB Connection Failed: ${error.message}`);
            return res.status(500).json({ 
                message: 'Database Connection Error. Please try again later.' 
            });
        }
    }

    // Pass the request to the Express app for normal route handling
    return app(req, res);
};
