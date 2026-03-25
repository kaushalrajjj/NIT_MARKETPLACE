/**
 * Main Express Application configuration.
 * Sets up middleware, API routes, and serves the React SPA from frontend/dist.
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();

app.use(cors());
app.use(express.json());

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin',    adminRoutes);

// ─── Serve React SPA (production only: built frontend/dist) ─────────────────
// In development, Vite middleware (mounted in devServer.js) serves everything.
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '..', 'frontend', 'dist');

    // Serve static assets (JS, CSS, images, etc.)
    app.use(express.static(distPath));

    // Also serve original frontend assets (product-images, profile-images, etc.)
    const frontendPath = path.join(__dirname, '..', 'frontend');
    app.use(express.static(frontendPath));

    // SPA Catch-all: All non-API routes get the React index.html
    app.use((req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        if (req.accepts('html')) return res.sendFile(path.join(distPath, 'index.html'));
        next();
    });
}

// Error middleware is NOT registered here.
// It is added in devServer.js AFTER Vite middleware,
// so frontend routes reach Vite before hitting the 404 handler.

module.exports = app;
