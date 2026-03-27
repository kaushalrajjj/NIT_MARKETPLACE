/**
 * ------------------------------------------------------------------
 * Separate Backend Development Server Entry Point
 * ------------------------------------------------------------------
 */

const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ silent: true });

const PORT = process.env.PORT || 5000;

async function startServer() {
    await connectDB();

    const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
    app.use(notFound);
    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`\n🚀 Backend API Server running on port ${PORT}`);
        console.log(`   http://localhost:${PORT}\n`);
    });
}

startServer().catch((err) => {
    console.error('[(Fatal)] Failed to start server:', err);
    process.exit(1);
});
