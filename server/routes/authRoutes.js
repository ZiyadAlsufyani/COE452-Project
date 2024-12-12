const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Moderator = require('../models/moderator');
const Student = require('../models/student');

const router = express.Router();

// Use environment variable
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    process.exit(1);
}

// Auth Middleware
const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Create Account for Students
router.post('/create-account', async (req, res) => {
    const { name, email, whatsappNumber, major, description, batchYear, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Student({
            name,
            email,
            whatsappNumber,
            major,
            description,
            batchYear,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: 'Account created successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Admin login check
        if (username === "admin" && password === "Admin@1234") {
            // Generate JWT for admin
            const token = jwt.sign(
                { id: 'admin', role: 'admin' },
                JWT_SECRET,
                { expiresIn: '10m' }
            );

            // Set token in cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV,
                sameSite: 'strict'
            });

            return res.status(200).json({
                success: true,
                token,
                role: 'admin',
                redirectUrl: '/admin-view-teams.html'
            });
        }

        // Check if it's a regular student
        const user = await Student.findOne({ email: username });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
            // Generate JWT for student
            const token = jwt.sign(
                { id: user._id, name: user.name, role: 'student' },
                JWT_SECRET,
                { expiresIn: '10m' }
            );

            // Set token in cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV,
                sameSite: 'strict'
            });

            // Send response with token and redirect URL
            return res.status(200).json({
                success: true,
                token,
                role: 'student',
                user_id: user._id,
                redirectUrl: '/student-homepage.html'
            });
        }

        // // Check if it's a moderator
        // const moderator = await Moderator.findOne({ username: username });
        // if (moderator) {
        //     const isMatch = await bcrypt.compare(password, moderator.password);
        //     if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        //     const token = jwt.sign(
        //         { id: moderator._id, name: moderator.username, role: 'moderator' },
        //         JWT_SECRET,
        //         { expiresIn: '30m' }
        //     );
        //     res.cookie('token', token, { httpOnly: true });
        //     return res.status(200).json({ 
        //         message: 'Login successful', 
        //         role: 'moderator', 
        //         token,
        //         redirectUrl: '/moderator-homepage.html'
        //     });
        // }

        return res.status(404).json({ message: 'User not found' });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// // Add new endpoint to create moderator
// router.post('/create-moderator', async (req, res) => {
//     const { username, password, profileImage } = req.body;

//     try {
//         // Check if moderator already exists
//         const existingModerator = await Moderator.findOne({ username });
//         if (existingModerator) {
//             return res.status(400).json({ message: 'Moderator already exists' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newModerator = new Moderator({
//             username,
//             password: hashedPassword,
//             profileImage
//         });

//         await newModerator.save();
//         res.status(201).json({ message: 'Moderator created successfully' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// Get all moderators
router.get('/moderators', async (req, res) => {
    try {
        const moderators = await Moderator.find({}, 'username profileImage');
        res.status(200).json(moderators);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify token endpoint
router.get('/verify', authMiddleware, (req, res) => {
    res.status(200).json({
        valid: true,
        user: req.user
    });
});

module.exports = {
    router,
    authMiddleware,
    JWT_SECRET
};
