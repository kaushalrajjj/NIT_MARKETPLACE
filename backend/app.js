const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Serve Frontend
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'html', 'index.html'));
});

// Clean URLs for main pages
const pages = ['browse', 'sell', 'dashboard', 'admin', 'auth', 'profile', 'wishlist'];
pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(frontendPath, 'html', `${page}.html`));
    });
});

// Redirection for .html legacy URLs to clean URLs
app.get('/:page.html', (req, res) => {
    res.redirect(301, '/' + req.params.page);
});

// Middleware for errors
app.use(notFound);
app.use(errorHandler);

module.exports = app;
