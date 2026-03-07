const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`JSON Data storage initialized in /data folder`);
    console.log(`http://localhost:${PORT}`);
});
