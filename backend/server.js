/**
 * Final Server Entry Point.
 * Handles DNS adjustments, database connection, and port listening.
 */
const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const dns = require('dns');

// Force use of Google DNS to bypass campus/local DNS blocking SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
