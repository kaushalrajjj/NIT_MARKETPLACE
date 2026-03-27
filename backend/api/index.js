/**
 * ------------------------------------------------------------------
 * Vercel Serverless Function Entry Point
 * ------------------------------------------------------------------
 * This file serves as the main entry point for the backend API when 
 * deployed to Vercel as a Serverless Function. It connects to the 
 * database on-demand and passes requests to the centralized Express app.
 */

// Import the main Express application logic
const app = require('../app');

// Import mongoose to manage the connection state with MongoDB
const mongoose = require('mongoose');

// Import universal error handling middlewares
const { notFound, errorHandler } = require('../middlewares/errorMiddleware');

// Mount the error handlers to the Express app.
// In a typical Node.js long-running server (like devServer.js), these are 
// mounted after Vite middleware. For Vercel, we mount them right away.
app.use(notFound);
app.use(errorHandler);

/**
 * Serverless Handler Export
 * Vercel expects an async function that accepts standard HTTP (req, res) objects.
 * This function will be invoked on every incoming API request.
 *
 * @param {Object} req - The incoming HTTP request payload
 * @param {Object} res - The outgoing HTTP response dispatcher
 */
module.exports = async (req, res) => {
    // Vercel Serverless Functions suffer from "cold starts", meaning the function
    // environment spins down when idle. We need to check if a database connection 
    // already exists (readyState === 1) before trying to connect again to prevent 
    // exhausting our max connection limit with MongoDB.
    if (mongoose.connection.readyState !== 1) {
        try {
            // Establish a new connection to the database
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('[(Serverless)] MongoDB Connected via Vercel');
        } catch (error) {
            // If connection fails, immediately return an error back to the user
            console.error(`[(Serverless Error)] MongoDB Connection Failed: ${error.message}`);
            return res.status(500).json({ message: 'Database Connection Error. Please try again later.' });
        }
    }
    
    // Hand over the request to the populated Express app for standard routing
    return app(req, res);
};
