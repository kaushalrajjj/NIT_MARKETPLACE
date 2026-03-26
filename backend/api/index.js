const app = require('../app');
const mongoose = require('mongoose');
const { notFound, errorHandler } = require('../middlewares/errorMiddleware');

// Mount the error handlers which are originally placed in devServer.js
app.use(notFound);
app.use(errorHandler);

module.exports = async (req, res) => {
    // Vercel Serverless Functions have "cold starts", meaning we need to check
    // if the database connection already exists before trying to connect again.
    if (mongoose.connection.readyState !== 1) {
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('MongoDB Connected via Vercel');
        } catch (error) {
            console.error(`MongoDB Connection Error: ${error.message}`);
            return res.status(500).json({ message: 'Database Connection Error' });
        }
    }
    
    // Hand over the request to the Express app
    return app(req, res);
};
