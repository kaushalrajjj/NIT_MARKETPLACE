/**
 * ------------------------------------------------------------------
 * Main Express Application Configuration File
 * ------------------------------------------------------------------
 * This file is responsible for initializing the Express app, setting up 
 * essential middleware (like CORS and JSON parsing), and defining 
 * the core API routing architecture. It also configures static file 
 * serving when the application runs in a production environment.
 */

const express = require('express');   // Import the Express framework
const path = require('path');         // Node path module for cross-platform file paths
const cors = require('cors');         // Middleware to enable Cross-Origin Resource Sharing
const dotenv = require('dotenv');     // Module to load environment variables from a .env file

// Import specific route modules for different domain features
const authRoutes = require('./routes/authRoutes');     // Handles user authentication (login, register)
const productRoutes = require('./routes/productRoutes'); // Handles marketplace product CRUD operations
const adminRoutes = require('./routes/adminRoutes');   // Handles administrative functions and approvals
const userRoutes = require('./routes/userRoutes');     // Handles user profile and activity management

// Initialize the Express application instance
const app = express();

// ------------------------------------------------------------------
// Global Middleware Configuration
// ------------------------------------------------------------------
// Enable CORS to allow the frontend application to make requests to this backend API
app.use(cors());

// Enable built-in body parser to automatically parse incoming JSON payloads into req.body
app.use(express.json());

// ------------------------------------------------------------------
// API Route Mapping
// ------------------------------------------------------------------
// Mount feature-specific routes to standard /api paths.
// Doing it this way keeps the app.js file clean and delegates logic to route files.
app.use('/api/auth',     authRoutes);      // e.g. /api/auth/login
app.use('/api/users',    userRoutes);      // e.g. /api/users/profile
app.use('/api/products', productRoutes);   // e.g. /api/products/:id
app.use('/api/admin',    adminRoutes);     // e.g. /api/admin/dashboard

// ------------------------------------------------------------------
// Production Environment Handling & Frontend Serving
// ------------------------------------------------------------------
// When the app runs in production mode, it needs to serve the compiled frontend code.
// In development, a bundler like Vite runs its own middleware handles frontend updates.
if (process.env.NODE_ENV === 'production') {
    // Define the absolute path to the compiled frontend files
    const distPath = path.join(__dirname, '..', 'frontend', 'dist');

    // Serve static files from the React frontend build directory
    app.use(express.static(distPath));

    // Also serve original frontend asset directories (like static images) if needed directly
    const frontendPath = path.join(__dirname, '..', 'frontend');
    app.use(express.static(frontendPath));

    // Single Page Application (SPA) Routing Catch-all
    // Since React Router handles paths on the client side, if a user navigates to a 
    // page direct URL (e.g., /dashboard) and refreshes, Express will receive that request.
    app.use((req, res, next) => {
        // If the request was meant for an API route but failed to match one prior to this, pass it onward
        if (req.path.startsWith('/api')) return next();
        
        // If the request expects HTML (like a browser navigating to a URL), send back the React index.html
        if (req.accepts('html')) return res.sendFile(path.join(distPath, 'index.html'));
        
        // If neither, just pass it along
        next();
    });
}

// ------------------------------------------------------------------
// Important Note regarding Error Middleware
// ------------------------------------------------------------------
// The global error handling middlewares (notFound, errorHandler) are intentionally NOT 
// registered here in app.js. Instead, they are added in devServer.js (for dev) 
// or api/index.js (for Vercel). This allows frontend routing middleware (like Vite) 
// to intercept the request before an Express 404 handler can incorrectly terminate it.

// Export the configured application instance so other files can require it (like server.js or index.js)
module.exports = app;
