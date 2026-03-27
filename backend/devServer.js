/**
 * ------------------------------------------------------------------
 * Development Server Entry Point
 * ------------------------------------------------------------------
 * Dev Server Entry Point — Vite running as Express middleware.
 *
 * This file replaces the traditional `node server.js` startup during development.
 * It integrates Vite directly into the Express server.
 * Vite's HMR (Hot Module Replacement) WebSocket is handled automatically; 
 * when the developer saves a React file, the browser reconnects and reloads instantly.
 *
 * NOTE FOR PRODUCTION: 
 * This file is completely ignored when deployed. `npm start` still points here, 
 * but NODE_ENV=production causes Vite middleware to be entirely skipped, and the
 * statically built dist/ folder is served instead (handled in app.js).
 */

// Import the main configured Express application (app.js)
const app = require('./app');

// Import dotenv to automatically load `.env` variables into `process.env`
const dotenv = require('dotenv');

// Import the Mongoose database connection utility
const connectDB = require('./config/db');

// Import Node's built-in modules
const dns = require('dns');     // For overriding DNS resolution
const path = require('path');   // For handling file & directory path resolution
const http = require('http');   // For creating the raw HTTP engine required by Express

// ------------------------------------------------------------------
// DNS Override Configuration
// ------------------------------------------------------------------
// Force Google DNS servers (8.8.8.8) to bypass restrictive campus DNS servers 
// that might block MongoDB SRV record resolution during development.
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load environment variables without echoing info to the console (silent: true)
dotenv.config({ silent: true });

// Define the port the server will run on (Default: 5000)
const PORT = process.env.PORT || 5000;

// Boolean flag to determine if the server is running in development mode
const isDev = (process.env.NODE_ENV || 'development') !== 'production';

/**
 * Core asynchronous function to bootstrap the application components
 */
async function startServer() {
    // ------------------------------------------------------------------
    // Phase 1: Database Connection
    // ------------------------------------------------------------------
    // Establish connection to MongoDB Atlas before initializing middlewares
    await connectDB();

    // ------------------------------------------------------------------
    // Phase 2: Vite Dev Server Middleware (DEVELOPMENT ONLY)
    // ------------------------------------------------------------------
    if (isDev) {
        // Dynamically import Vite engine (avoids loading it in production environments)
        const { createServer: createViteServer } = await import('vite');

        // Resolve absolute absolute path to the frontend folder
        const frontendRoot = path.resolve(__dirname, '../frontend');

        // ⚠️ CRITICAL PATH FIX FOR TAILWINDCSS
        // Switch the Current Working Directory (CWD) to frontend/ before starting Vite.
        // Tailwind PostCSS resolves content globs relative to `process.cwd()`.
        // Without this, running from /backend means globs like "./src/**/*.jsx"
        // point to /backend/src/ (which doesn't exist) → resulting in zero styles being generated.
        process.chdir(frontendRoot);

        // Initialize the Vite server engine in middleware mode
        const vite = await createViteServer({
            root: frontendRoot,
            server: {
                middlewareMode: true,   // Vite runs INSIDE Express routing, not standalone
                hmr: true,              // Enable Hot Module Replacement WebSocket
            },
            logLevel: 'warn',           // Suppress standard logs, only show warnings/errors
            appType: 'spa',             // Define application behavior as Single Page Application (index.html fallback)
        });

        // ------------------------------------------------------------------
        // Phase 3: Mount Vite Connect/Middleware Stack
        // ------------------------------------------------------------------
        // Mount Vite's routing middlewares AFTER API routes defined in `app.use('/api', ...)` (in app.js).
        // If a request URL doesn't match an API route, it falls through here where Vite 
        // will serve the frontend's index.html + processed assets + HMR WebSocket.
        app.use(vite.middlewares);

        console.log('[(Vite)] ⚡ Vite middleware mounted (HMR enabled)');
    }

    // ------------------------------------------------------------------
    // Phase 4: Error Handling Middleware
    // ------------------------------------------------------------------
    // ⚠️ CRITICAL ORDER INSTRUCTION:
    // The Error middlewares MUST come absolutely LAST (specifically AFTER Vite).
    // This guarantees that valid frontend routes hit Vite's SPA handler 
    // instead of instantly failing and triggering the Express 404 handler.
    const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
    
    // Catch-all route to generate a 404 Error object for unhandled paths
    app.use(notFound);
    // Centralized error processor that formats standard JSON error responses
    app.use(errorHandler);

    // ------------------------------------------------------------------
    // Phase 5: Server Instantiation
    // ------------------------------------------------------------------
    // Wrap the Express app in a raw Node HTTP server (required for WebSockets/Vite integration)
    const server = http.createServer(app);

    // Listen on the chosen port and log the environment status
    server.listen(PORT, () => {
        const mode = isDev ? 'development (Vite middleware)' : 'production (static dist)';
        console.log(`\n🚀 Server running in ${mode} on port ${PORT}`);
        console.log(`   http://localhost:${PORT}\n`);
    });
}

// ------------------------------------------------------------------
// Bootstrap Execution
// ------------------------------------------------------------------
// Execute the main startup function and catch unhandled startup crashes
startServer().catch((err) => {
    console.error('[(Fatal)] Failed to start server:', err);
    process.exit(1); // Force process shutdown if bootstrap fails
});
