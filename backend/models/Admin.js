const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    // Admin's display name
    name: { type: String, required: true },
    // Admin's official email (Unique across system)
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please use a valid email address'] 
    },
    // Admin password (min 12 for high security)
    password: { type: String, required: true, minlength: 12 },
    // Admin contact number
    phone: { 
        type: String, 
        required: true, 
        match: [/^\+91 [0-9]{10}$/, 'Phone number must be in format +91 1234567890'] 
    }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
