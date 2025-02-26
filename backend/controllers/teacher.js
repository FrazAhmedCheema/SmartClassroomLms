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
    console.log('here in ct=reate class controller')
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
            students: [], // Initialize with an empty array
            createdAt: new Date()
        });
        console.log(newClass);

        // Save the class to the database
        await newClass.save();

        // Add the new class to the teacher's classes array
        await Teacher.findByIdAndUpdate(teacherId, { $push: { classes: newClass._id } });

        // Fetch the saved class to get the auto-generated classId
        const savedClass = await Class.findById(newClass._id)
            .populate({
                path: 'teacherId',
                select: 'name email'
            });

        res.status(201).json({
            success: true,
            message: 'Class created successfully',
            data: {
                _id: savedClass._id,
                classId: savedClass.classId,
                className: savedClass.className,
                section: savedClass.section,
                classCode: savedClass.classCode,
                teacher: savedClass.teacherId ? {
                    name: savedClass.teacherId.name,
                    email: savedClass.teacherId.email
                } : null,
                students: savedClass.students,
                createdAt: savedClass.createdAt
            }
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
        const teacherId = req.user.id; 
        console.log('Teacher ID:', teacherId);

        const teacher = await Teacher.findById(teacherId).populate('classes');
        console.log('Teacher:', teacher);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const classes = await Class.find({ _id: { $in: teacher.classes } })
            .populate({
                path: 'teacherId',
                select: 'name email'
            });

        const formattedClasses = classes.map(cls => ({
            _id: cls._id,
            classId: cls.classId,
            className: cls.className,
            section: cls.section,
            classCode: cls.classCode,
            teacher: cls.teacherId ? {
                name: cls.teacherId.name,
                email: cls.teacherId.email
            } : null,
            students: cls.students,
            createdAt: cls.createdAt
        }));

        res.status(200).json({
            success: true,
            classes: formattedClasses
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
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
            token,
            teacherId: teacher._id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

exports.checkAuth = async (req, res) => {
    try {
        const teacherId = req.user.id;
        res.status(200).json({
            success: true,
            teacherId
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Not authenticated',
            error: error.message
        });
    }
};

exports.logout = async (req, res) => {
    try {
        res.clearCookie('teacherToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: error.message
        });
    }
};

exports.authStatus = async (req, res) => {
    try {
        const teacherId = req.user.id;
        res.status(200).json({
            success: true,
            teacherId
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Not authenticated',
            error: error.message
        });
    }
};
