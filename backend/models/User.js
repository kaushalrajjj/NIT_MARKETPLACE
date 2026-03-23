const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: [/^[a-zA-Z0-9._%+-]+@nitkkr\.ac\.in$/, 'Please use a valid NIT KKR email address']
    },
    branch: { 
        type: String, 
        required: true, 
        enum: ["CSE", "IT", "ECE", "EE", "ME", "CE", "SET", "ADS", "MNC", "AIML", "PIE", "VLSI", "RA", "IIOT", "BArch"] 
    },
    rollNo: { 
        type: String, 
        required: true, 
        match: [/^[0-9]{5,9}$/, 'Roll number must be between 5 and 9 digits'] 
    },
    password: { type: String, required: true, minlength: 6 },
    mobileNo: { 
        type: String, 
        required: true, 
        match: [/^[0-9]{10}$/, 'Mobile number must be 10 digits'] 
    },
    year: { type: Number, required: true, min: 1, max: 5 },
    hostel: { 
        type: String, 
        required: true, 
        enum: ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "H11", "KALPANA CHAWLA", "BHAGIRATHI", "CAUVERY", "ALAKNANDA"] 
    },
    whatsappNo: { 
        type: String, 
        required: true, 
        match: [/^[0-9]{10}$/, 'WhatsApp number must be 10 digits'] 
    },
    secondaryEmail: {
        type: String,
        required: false,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please use a valid secondary email address']
    },
    role: { type: String, default: 'student', enum: ['student', 'admin'] }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
