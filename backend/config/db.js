const mongoose = require('mongoose');

/**
 * connectDB — Connect to MongoDB Atlas using Mongoose
 * ─────────────────────────────────────────────────────
 * This function is called once at startup in server.js (local dev).
 * On Vercel, the connection is managed per-request in api/index.js instead.
 *
 * MONGODB_URI comes from .env and includes:
 *   - Username & password for the Atlas cluster
 *   - The cluster hostname
 *   - The database name (nitMarketplace)
 *   - Connection options (retryWrites, etc.)
 *
 * WHY exit(1) on failure?
 *   If the database is unreachable, the app can't serve any meaningful data.
 *   It's better to crash loudly (process.exit(1)) than to silently run
 *   and return empty results or confusing errors to users.
 */
const connectDB = async () => {
    try {
        // mongoose.connect returns a Connection object
        // conn.connection.host gives us the Atlas shard hostname for the log
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit with error code — signals crash to process managers
    }
};

module.exports = connectDB;
