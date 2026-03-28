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

// Production Environment Handling
// The backend is now deployed independently, so it no longer serves frontend static files.

// ------------------------------------------------------------------
// Important Note regarding Error Middleware
// ------------------------------------------------------------------
// The global error handling middlewares (notFound, errorHandler) are intentionally NOT 
// registered here in app.js. Instead, they are added in devServer.js (for dev) 
// or api/index.js (for Vercel). This allows frontend routing middleware (like Vite) 
// to intercept the request before an Express 404 handler can incorrectly terminate it.

// Export the configured application instance so other files can require it (like server.js or index.js)
module.exports = app;
