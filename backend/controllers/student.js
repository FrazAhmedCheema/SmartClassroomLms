const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/student');
const Class = require('../models/Class');
const Teacher = require('../models/teacher');
const RegisteredInstitute = require('../models/approveInstitute');
const StudentInvitation = require('../models/StudentInvitation');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const studentController = {
    // Login controller
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            // Extract domain from email
            const domain = email.split('@')[1];
            if (!domain) {
                return res.status(400).json({ message: 'Invalid email format' });
            }

            // Find institute by domain
            const institute = await RegisteredInstitute.findOne({ domainName: domain });
            if (!institute) {
                return res.status(404).json({ message: 'No institute found for this email domain' });
            }

            // Find student within the institute
            const student = await Student.findOne({ 
                email: email,
                instituteId: institute._id
            });

            if (!student) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, student.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: student._id, role: 'student' },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.cookie('studentToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 1000 // 1 hr
            });

            res.json({
                message: 'Login successful',
                student: {
                    id: student._id,
                    name: student.name,
                    email: student.email
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Check authentication status
    checkAuthStatus: async (req, res) => {
        try {
            console.log('Auth status check for student:', req.user);
            const student = await Student.findById(req.user.id).select('-password');
            console.log('Found student:', student);
            res.json({ success: true, student });
        } catch (error) {
            console.error('Error in checkAuthStatus:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Logout controller
    logout: (req, res) => {
        res.cookie('studentToken', '', {
            httpOnly: true,
            expires: new Date(0)
        });
        res.json({ message: 'Logged out successfully' });
    },

    // Get enrolled classes
    getEnrolledClasses: async (req, res) => {
        try {
            const student = await Student.findById(req.user.id);

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            const enrolledClasses = await Class.find({ _id: { $in: student.enrolledClasses } })
                .populate({
                    path: 'teacherId',
                    model: 'Teacher',
                    select: 'name email'
                });

            const classesWithTeacher = enrolledClasses.map(cls => ({
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

            res.json({ 
                success: true,
                enrolledClasses: classesWithTeacher 
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Join class - Updated to search only within institute's classes
    joinClass: async (req, res) => {
        try {
            const { classCode } = req.body;
            const studentId = req.user.id; // Get studentId from authenticated user
            
            // Find the student to get their instituteId
            const student = await Student.findById(studentId);
            if (!student) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Student not found' 
                });
            }
            
            // Get the institute document using the student's instituteId and populate its classes
            const institute = await RegisteredInstitute.findById(student.instituteId)
                .populate({
                    path: 'classes',
                    match: { classCode: classCode }, // Only get classes with matching classCode
                    populate: {
                        path: 'teacherId',
                        select: 'name email'
                    }
                });
                
            if (!institute) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Institute not found' 
                });
            }
            
            // Check if any class matches the code within the institute's classes
            if (!institute.classes || institute.classes.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Class not found in your institute' 
                });
            }
            
            // Get the matched class (there should be only one)
            const classToJoin = institute.classes[0];
            
            // Check if student is already enrolled in this class
            if (student.enrolledClasses && student.enrolledClasses.some(
                classId => classId.toString() === classToJoin._id.toString()
            )) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Already enrolled in this class' 
                });
            }

            // Add class to student's enrolled classes (initialize array if it doesn't exist)
            if (!student.enrolledClasses) {
                student.enrolledClasses = [];
            }
            student.enrolledClasses.push(classToJoin._id);
            
            // Add student to class's students array
            await Class.findByIdAndUpdate(
                classToJoin._id,
                { $addToSet: { students: student._id } }
            );

            // Save student document
            await student.save();

            const classWithTeacher = {
                _id: classToJoin._id,
                classId: classToJoin.classId,
                className: classToJoin.className,
                section: classToJoin.section,
                classCode: classToJoin.classCode,
                teacher: classToJoin.teacherId ? {
                    name: classToJoin.teacherId.name,
                    email: classToJoin.teacherId.email
                } : null,
                students: classToJoin.students ? classToJoin.students.length + 1 : 1, // Account for newly added student
                createdAt: classToJoin.createdAt
            };

            res.status(200).json({ 
                success: true,
                message: 'Successfully joined the class', 
                class: classWithTeacher 
            });
        } catch (error) {
            console.error('Error joining class:', error);
            res.status(500).json({ 
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    },

    // Get class by ID with populated data for student
    getClassById: async (req, res) => {
        try {
            const { id } = req.params;
            const studentId = req.user.id;

            // Find the student to verify enrollment
            const student = await Student.findById(studentId);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            // Check if student is enrolled in this class
            if (!student.enrolledClasses || !student.enrolledClasses.includes(id)) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not enrolled in this class'
                });
            }

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
    },

    // Get student stats
    getStudentStats: async (req, res) => {
        try {
            const studentId = req.user.id;
            console.log('Fetching stats for student:', studentId);

            // Import models
            const Assignment = require('../models/Assignment');
            const Quiz = require('../models/Quiz');
            const Submission = require('../models/Submission');
            const Discussion = require('../models/Discussion');

            // Find student and populate enrolled classes
            const student = await Student.findById(studentId)
                .populate('enrolledClasses');

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            // Get enrolled classes count
            const enrolledClasses = student.enrolledClasses ? student.enrolledClasses.length : 0;

            // Get class IDs for the student
            const classIds = student.enrolledClasses.map(classObj => classObj._id);

            // Get all assignments and quizzes in student's classes
            const allAssignments = await Assignment.find({ 
                classId: { $in: classIds } 
            }).select('_id');
            
            const allQuizzes = await Quiz.find({ 
                classId: { $in: classIds } 
            }).select('_id');

            // Get all assignment and quiz IDs
            const assignmentIds = allAssignments.map(a => a._id);
            const quizIds = allQuizzes.map(q => q._id);

            // Count completed submissions by this student for assignments and quizzes
            const completedAssignmentSubmissions = await Submission.countDocuments({
                studentId: studentId,
                assignmentId: { $in: assignmentIds }
            });

            const completedQuizSubmissions = await Submission.countDocuments({
                studentId: studentId,
                quizId: { $in: quizIds }
            });

            const totalTasks = assignmentIds.length + quizIds.length;
            const completedSubmissions = completedAssignmentSubmissions + completedQuizSubmissions;

            // Calculate todos (pending tasks = total tasks - completed submissions)
            const todos = Math.max(0, totalTasks - completedSubmissions);

            // Debug logging for todo calculation
            console.log(`Student ${studentId} todo calculation:`, {
                totalAssignments: assignmentIds.length,
                totalQuizzes: quizIds.length,
                totalTasks,
                completedAssignmentSubmissions,
                completedQuizSubmissions,
                completedSubmissions,
                todos
            });

            // Count active discussions in student's classes (not terminated)
            const discussions = await Discussion.countDocuments({
                classId: { $in: classIds },
                terminated: false
            });

            // Calculate recent activity (submissions in last 7 days)
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            // Count submissions made in the last week
            const recentActivity = await Submission.countDocuments({
                studentId: studentId,
                submittedAt: { $gte: oneWeekAgo }
            });

            // Return stats with real data
            res.status(200).json({
                success: true,
                data: {
                    enrolledClasses,
                    todos,
                    discussions,
                    recentActivity
                }
            });
        } catch (error) {
            console.error('Error fetching student stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching stats',
                error: error.message
            });
        }
    },

    // Get current student profile
    getCurrentStudentProfile: async (req, res) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            const student = await Student.findById(req.user.id)
                .select('name email registrationId');

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            res.status(200).json({
                success: true,
                student
            });
        } catch (error) {
            console.error('Error getting student profile:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    // Get student profile by ID
    getStudentProfileById: async (req, res) => {
        try {
            const { id } = req.params;
            const student = await Student.findById(id)
                .select('name email registrationId');

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            res.status(200).json({
                success: true,
                student
            });
        } catch (error) {
            console.error('Error getting student profile by ID:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    // Join class via invitation (simplified - no signup needed)
    joinClassViaInvitation: async (req, res) => {
        try {
            console.log('joinClassViaInvitation called with body:', req.body);
            const { token } = req.body;
            
            if (!token) {
                console.log('No token provided');
                return res.status(400).json({
                    success: false,
                    message: 'Invitation token is required'
                });
            }
            
            // Verify the invitation token
            console.log('Looking for invitation with token:', token);
            const invitation = await StudentInvitation.findOne({ 
                token, 
                status: 'pending' 
            }).populate('classId');
            
            if (!invitation) {
                console.log('No invitation found for token:', token);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired invitation'
                });
            }
            
            console.log('Found invitation:', {
                email: invitation.email,
                classId: invitation.classId._id,
                className: invitation.classId.className
            });
            
            // Extract domain from email
            const domain = invitation.email.split('@')[1];
            if (!domain) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format in invitation'
                });
            }
            
            // Find institute by domain
            const institute = await RegisteredInstitute.findOne({ domainName: domain });
            if (!institute) {
                return res.status(404).json({
                    success: false,
                    message: 'No institute found for this email domain'
                });
            }
            
            // Find existing student
            console.log('Looking for student with email:', invitation.email, 'and instituteId:', institute._id);
            const student = await Student.findOne({
                email: invitation.email,
                instituteId: institute._id
            });
            
            if (!student) {
                console.log('Student not found with email:', invitation.email);
                return res.status(404).json({
                    success: false,
                    message: 'Student not found. Please contact your administrator.'
                });
            }
            
            console.log('Found student:', {
                id: student._id,
                name: student.name,
                email: student.email,
                enrolledClasses: student.enrolledClasses
            });
            
            // Check if student is already enrolled in this class
            const isAlreadyEnrolled = student.enrolledClasses.some(
                classId => classId.toString() === invitation.classId._id.toString()
            );
            
            if (isAlreadyEnrolled) {
                console.log('Student already enrolled in class');
                // Mark invitation as accepted anyway
                invitation.status = 'accepted';
                await invitation.save();
                
                return res.status(200).json({
                    success: true,
                    message: 'You are already enrolled in this class',
                    student: {
                        id: student._id,
                        name: student.name,
                        email: student.email
                    },
                    className: invitation.classId.className
                });
            }
            
            console.log('Enrolling student in class...');
            // Enroll student in the class
            student.enrolledClasses.push(invitation.classId._id);
            await student.save();
            console.log('Student enrolledClasses updated');
            
            // Add student to class
            const isStudentInClass = invitation.classId.students.some(
                studentId => studentId.toString() === student._id.toString()
            );
            
            if (!isStudentInClass) {
                invitation.classId.students.push(student._id);
                await invitation.classId.save();
                console.log('Student added to class students array');
            } else {
                console.log('Student already in class students array');
            }
            
            // Mark invitation as accepted
            invitation.status = 'accepted';
            await invitation.save();
            console.log('Invitation marked as accepted');
            
            console.log('Student successfully joined class:', invitation.classId.className);
            
            res.status(200).json({
                success: true,
                message: 'Successfully joined the class!',
                student: {
                    id: student._id,
                    name: student.name,
                    email: student.email
                },
                className: invitation.classId.className
            });
            
        } catch (error) {
            console.error('Error joining class via invitation:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while joining class'
            });
        }
    },
    
    // Verify invitation token (for frontend to check validity)
    verifyInvitation: async (req, res) => {
        try {
            const { token } = req.params;
            
            const invitation = await StudentInvitation.findOne({ 
                token, 
                status: 'pending' 
            }).populate('classId', 'className')
              .populate('invitedBy', 'name');
            
            if (!invitation) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired invitation'
                });
            }
            
            res.json({
                success: true,
                invitation: {
                    email: invitation.email,
                    className: invitation.classId.className,
                    invitedBy: invitation.invitedByName,
                    expiresAt: invitation.expiresAt
                }
            });
            
        } catch (error) {
            console.error('Error verifying invitation:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },
};

module.exports = studentController;


