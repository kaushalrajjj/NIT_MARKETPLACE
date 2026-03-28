/**
 * server.js — Local Development Server Entry Point
 * ──────────────────────────────────────────────────
 * This file is only used when running locally (npm start).
 * On Vercel (production), api/index.js is used instead.
 *
 * What it does:
 *   1. Force DNS to use Google's servers (fixes slow Atlas connection on some networks)
 *   2. Connect to MongoDB Atlas
 *   3. Add global error handlers
 *   4. Start listening on the configured port
 */

const app = require('./app');       // The configured Express application
const dotenv = require('dotenv');   // Loads .env variables into process.env
const connectDB = require('./config/db'); // Function that connects to MongoDB
const dns = require('dns');         // Node built-in for DNS settings

// Use Google's public DNS servers (8.8.8.8, 8.8.4.4) instead of the system default.
// This prevents slow or failed connections to MongoDB Atlas on some networks/ISPs.
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load environment variables from .env file
// silent: true suppresses warnings if the file doesn't exist
dotenv.config({ silent: true });

const PORT = process.env.PORT || 5000; // Use .env PORT, fall back to 5000

async function startServer() {
    // Connect to MongoDB before starting to accept requests.
    // If this fails, the server won't start (caught below).
    await connectDB();

    // Add global error handlers AFTER routes are mounted.
    // These must come last in the Express chain:
    //   - notFound: handles unmatched URLs (returns 404)
    //   - errorHandler: handles any error thrown in a route (returns 500)
    const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
    app.use(notFound);
    app.use(errorHandler);

    // Start listening for HTTP requests
    app.listen(PORT, () => {
        console.log(`\n🚀 Backend API Server running on port ${PORT}`);
        console.log(`   http://localhost:${PORT}\n`);
    });
}

// Start everything. If anything fails (bad DB credentials, port in use, etc.),
// log the error and exit so the problem is obvious
startServer().catch((err) => {
    console.error('[(Fatal)] Failed to start server:', err);
    process.exit(1); // Exit with error code so process managers know it crashed
});
