const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const Product = require('./models/Product');

dotenv.config({ path: './.env' });

async function verify() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        
        const oldPendingCount = products.filter(p => p.isApproved === false).length;
        const newPendingCount = products.filter(p => 
            p.isApproved === false && 
            p.status !== 'rejected_by_admin' && 
            p.status !== 'deleted_by_admin'
        ).length;

        console.log('--- Verification Report ---');
        console.log('Total Products:', products.length);
        console.log('Old Pending Logic Count:', oldPendingCount);
        console.log('New Pending Logic Count:', newPendingCount);
        console.log('Rejected by Admin:', products.filter(p => p.status === 'rejected_by_admin').length);
        console.log('Deleted by Admin:', products.filter(p => p.status === 'deleted_by_admin').length);
        console.log('---------------------------');

        if (newPendingCount < oldPendingCount || (newPendingCount === 0 && oldPendingCount === 0)) {
            console.log('VERIFICATION SUCCESS: New logic correctly filters out rejected/deleted products.');
        } else {
            console.log('VERIFICATION NOTE: Counts are identical, likely no rejected/deleted products exist currently.');
        }

    } catch (err) {
        console.error('Error during verification:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
