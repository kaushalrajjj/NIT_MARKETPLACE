/**
 * Main Express Application configuration.
 * Sets up middleware, API routes, and static frontend serving.
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin',    adminRoutes);

// ─── Serve Frontend ───────────────────────────────────────────────────────────
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'pages', 'index.html'));
});

// Clean URLs for main pages
// NOTE: 'wishlist' is NOT here — it's a tab inside dashboard, not its own page.
const pages = ['browse', 'sell', 'dashboard', 'admin', 'auth', 'profile'];
pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(frontendPath, 'pages', `${page}.html`));
    });
});

// Redirect legacy .html URLs to clean URLs
app.get('/:page.html', (req, res) => {
    res.redirect(301, '/' + req.params.page);
});

// ─── Error Middleware ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
