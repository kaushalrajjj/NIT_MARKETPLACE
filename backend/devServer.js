/**
 * Dev Server Entry Point — Vite running as Express middleware.
 *
 * This replaces the plain `node server.js` startup in development.
 * Vite's HMR WebSocket is handled automatically; when nodemon restarts
 * this process the browser reconnects and reloads.
 *
 * Production: nothing here is used — `npm start` still points here but
 * NODE_ENV=production causes Vite middleware to be skipped and the
 * built dist/ folder is served instead (handled in app.js).
 */

const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const dns = require('dns');
const path = require('path');
const http = require('http');

// Force Google DNS (bypasses campus DNS blocking MongoDB SRV records)
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ silent: true });

const PORT = process.env.PORT || 5000;
const isDev = (process.env.NODE_ENV || 'development') !== 'production';

async function startServer() {
    // ── Connect to database ──────────────────────────────────────────────────
    await connectDB();

    // ── Mount Vite middleware in development ─────────────────────────────────
    if (isDev) {
        const { createServer: createViteServer } = await import('vite');

        const frontendRoot = path.resolve(__dirname, '../frontend');

        // ⚠️ Switch CWD to frontend/ before starting Vite.
        // Tailwind PostCSS resolves content globs relative to process.cwd().
        // Without this, running from /backend means globs like "./src/**/*.jsx"
        // point to /backend/src/ (which doesn't exist) → zero styles generated.
        process.chdir(frontendRoot);

        const vite = await createViteServer({
            root: frontendRoot,
            server: {
                middlewareMode: true,   // Vite runs inside Express, not standalone
                hmr: true,             // Enable Hot Module Replacement
            },
            logLevel: 'warn',          // Only log warnings and errors to reduce noise
            appType: 'spa',            // Let Vite handle the SPA index.html fallback
        });

        // Mount Vite's own connect/middleware stack AFTER API routes.
        // Non-API requests fall through here: Vite serves index.html + assets + HMR WS.
        app.use(vite.middlewares);

        console.log('⚡  Vite middleware mounted (HMR enabled)');
    }

    // ── Error middleware must come LAST — after Vite — so frontend routes  ────
    // ── reach Vite before ever hitting the 404 handler.                    ────
    const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
    app.use(notFound);
    app.use(errorHandler);

    // ── Start HTTP server ────────────────────────────────────────────────────
    const server = http.createServer(app);

    server.listen(PORT, () => {
        const mode = isDev ? 'development (Vite middleware)' : 'production (static dist)';
        console.log(`\n🚀  Server running in ${mode} on port ${PORT}`);
        console.log(`    http://localhost:${PORT}\n`);
    });
}

startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
