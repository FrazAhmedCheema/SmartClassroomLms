const Class = require('../models/Class');
const Teacher = require('../models/teacher');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate a unique 6-digit class code
const generateClassCode = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
};

exports.createClass = async (req, res) => {
    try {
        const { className, section } = req.body;
        const teacherId = req.user.id; // Assuming user ID is stored in req.user

        // Generate a unique class code
        const classCode = generateClassCode();

        // Create a new class document
        const newClass = new Class({
            className,
            section,
            classCode,
            teacherId,
            createdAt: new Date()
        });

        // Save the class to the database
        await newClass.save();

        res.status(201).json({
            success: true,
            message: 'Class created successfully',
            data: newClass
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating class',
            error: error.message
        });
    }
};

exports.getClasses = async (req, res) => {
    try {
        const teacherId = req.user.id; // Assuming user ID is stored in req.user

        // Fetch classes for the authenticated teacher
        const classes = await Class.find({ teacherId });

        res.status(200).json({
            success: true,
            classes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching classes',
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find teacher by email
        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const payload = {
            id: teacher._id,
            role: 'teacher'
        };

        // Generate JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set cookie
        res.cookie('teacherToken', token, {
            httpOnly: true, // Prevents JavaScript from accessing it
            secure: process.env.NODE_ENV === 'production', // Sends cookie over HTTPS in production
            sameSite: 'strict', // Prevents CSRF attacks
            maxAge: 60 * 60 * 1000, // Token expiration (1 hour)
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};
