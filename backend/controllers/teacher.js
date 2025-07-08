const Class = require('../models/Class');
const Teacher = require('../models/teacher');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose'); // Add this import
const RegisteredInstitute = require('../models/approveInstitute'); // Add this import
const { validateDomain } = require('../utils/domainValidator'); // Add the validator import

// Generate a unique 6-digit class code
const generateClassCode = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
};

exports.createClass = async (req, res) => {
    console.log('here in create class controller')
    try {
        const { className, section } = req.body;
        const teacherId = req.user.id;

        // Get teacher to find their institute
        const teacher = await Teacher.findById(teacherId);
        if (!teacher || !teacher.instituteId) {
            return res.status(404).json({
                success: false,
                message: 'Teacher or Institute not found'
            });
        }

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
        
        // Add the new class to the institute's classes array
        await RegisteredInstitute.findByIdAndUpdate(teacher.instituteId, { 
            $push: { classes: newClass._id } 
        });

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
        console.log('Login attempt for:', email); // Add logging

        // Extract domain from email
        const domain = email.split('@')[1];
        if (!domain) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
        console.log('Domain extracted:', domain);

        // Find institute by domain
        const institute = await RegisteredInstitute.findOne({ domainName: domain });
        if (!institute) {
            console.log('No institute found for domain:', domain);
            return res.status(404).json({
                success: false,
                message: 'No institute found for this email domain'
            });
        }
        console.log('Institute found:', institute.instituteName);

        // Find teacher within the institute
        const teacher = await Teacher.findOne({ 
            email: email,
            instituteId: institute._id
        });

        if (!teacher) {
            console.log('Teacher not found for email:', email);
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }
        console.log('Teacher found:', teacher.name);

        // Check password
        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            console.log('Invalid password for teacher:', email);
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        console.log('Password matched for teacher:', email);

        const payload = {
            id: teacher._id,
            role: 'teacher'  // Add role to payload
        };

        // Generate JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Clear any existing auth tokens to prevent conflicts
        res.clearCookie('adminToken');
        res.clearCookie('subAdminToken');
        res.clearCookie('studentToken');

        // Set teacher token cookie
        res.cookie('teacherToken', token, {
            httpOnly: true, // Prevents JavaScript from accessing it
            secure: process.env.NODE_ENV === 'production', // Sends cookie over HTTPS in production
            sameSite: 'strict', // Prevents CSRF attacks
            maxAge: 60 * 60 * 1000, // Token expiration (1 hour),
        });

        console.log('Login successful for teacher:', email);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            teacherId: teacher._id,
            role: 'teacher'  // Add role to response
        });
    } catch (error) {
        console.error('Login error:', error);
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
        // req.user should be populated by the authorizeTeacher middleware
        if (!req.user || !req.user.id) {
            console.log('Auth status failed: No user in request');
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const teacherId = req.user.id;
        console.log('Auth status success for teacher:', teacherId);
        
        // Fetch teacher data (optional - for additional validation)
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            console.log('Teacher not found with ID:', teacherId);
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            teacherId,
            name: teacher.name,
            email: teacher.email,
            role: 'teacher'  // Add role to auth status response
        });
    } catch (error) {
        console.error('Auth status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking authentication status',
            error: error.message
        });
    }
};

// Get class by ID with populated data
exports.getClassById = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = req.user.id;

        // Find the class by ID and populate students and teacher
        const classData = await Class.findById(id)
            .populate({
                path: 'students',
                select: 'name email registrationId'
            })
            .populate({
                path: 'teacherId',
                select: 'name email'
            });

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Verify that the requesting teacher is the one who owns this class
        if (classData.teacherId._id.toString() !== teacherId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this class'
            });
        }

        // Format students array
        const formattedStudents = classData.students.map(student => ({
            id: student._id,
            name: student.name,
            email: student.email,
            registrationId: student.registrationId
        }));

        // Add dummy data
        const formattedResponse = {
            _id: classData._id,
            className: classData.className,
            section: classData.section,
            classCode: classData.classCode,
            teacherId: classData.teacherId._id,
            students: formattedStudents,
            // Adding dummy teacher array as requested
            teachers: [
                {
                    id: classData.teacherId._id,
                    name: classData.teacherId.name,
                    email: classData.teacherId.email
                }
            ],
            // Dummy cover image
            coverImage: 'https://gstatic.com/classroom/themes/img_code.jpg',
            // Dummy announcements
            announcements: [
                {
                    id: 1,
                    author: classData.teacherId.name,
                    authorRole: 'Teacher',
                    content: 'Welcome to our class! Please review the syllabus and let me know if you have any questions.',
                    createdAt: new Date().toISOString(),
                    attachments: [],
                }
            ],
            createdAt: classData.createdAt
        };

        res.status(200).json({
            success: true,
            class: formattedResponse
        });
    } catch (error) {
        console.error('Error fetching class details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching class details',
            error: error.message
        });
    }
};

exports.getTeacherStats = async (req, res) => {
    try {
        const teacherId = req.user.id;
        console.log('Fetching stats for teacher:', teacherId);

        // Import models
        const Assignment = require('../models/Assignment');
        const Quiz = require('../models/Quiz');
        const Submission = require('../models/Submission');

        // Find teacher and populate classes with their students
        const teacher = await Teacher.findById(teacherId)
            .populate({
                path: 'classes',
                populate: {
                    path: 'students'
                }
            });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Get active classes count from teacher's classes array
        const activeClasses = teacher.classes.length;

        // Calculate total students across all classes
        const totalStudents = teacher.classes.reduce((total, classObj) => {
            return total + (classObj.students ? classObj.students.length : 0);
        }, 0);

        // Get class IDs for the teacher
        const classIds = teacher.classes.map(classObj => classObj._id);

        // Count assignments created by this teacher
        const assignmentCount = await Assignment.countDocuments({ 
            createdBy: teacherId 
        });

        // Count quizzes created by this teacher
        const quizCount = await Quiz.countDocuments({ 
            createdBy: teacherId 
        });

        // Count pending submissions that need grading (assignments only, as quizzes are auto-graded)
        const pendingSubmissions = await Submission.countDocuments({
            assignmentId: { $ne: null },
            grade: null,
            $or: [
                { assignmentId: { $in: await Assignment.find({ createdBy: teacherId }).distinct('_id') } }
            ]
        });

        // Total assignments to review (pending submissions)
        const assignments = pendingSubmissions;

        // Count upcoming assignments and quizzes (due in next 24 hours)
        const now = new Date();
        const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const upcomingAssignments = await Assignment.countDocuments({
            createdBy: teacherId,
            dueDate: { $gte: now, $lte: next24Hours }
        });

        const upcomingQuizzes = await Quiz.countDocuments({
            createdBy: teacherId,
            dueDate: { $gte: now, $lte: next24Hours }
        });

        const upcoming = upcomingAssignments + upcomingQuizzes;

        res.status(200).json({
            success: true,
            data: {
                activeClasses,
                totalStudents,
                assignments,
                upcoming
            }
        });
    } catch (error) {
        console.error('Error fetching teacher stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
};
