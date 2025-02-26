const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/student');
const Class = require('../models/Class');
const Teacher = require('../models/teacher');

const studentController = {
    // Login controller
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log(email,
                password);
            const student = await Student.findOne({ email });

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
                maxAge: 24 * 60 * 60 * 1000 // 1 day
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
            const student = await Student.findById(req.user.id).select('-password');
            res.json({ student });
        } catch (error) {
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
            const student = await Student.findById(req.user.id)
                .populate('enrolledClasses');

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            const enrolledClasses = await Class.find({ _id: { $in: student.enrolledClasses } })
                .populate('teacherId', 'name email'); // Populate teacher information

            const classesWithTeacher = enrolledClasses.map(cls => ({
                _id: cls._id,
                className: cls.className,
                section: cls.section,
                classCode: cls.classCode,
                teacher: {
                    name: cls.teacherId.name,
                    email: cls.teacherId.email
                },
                students: cls.students,
                createdAt: cls.createdAt
            }));

            console.log('Enrolled classes:', classesWithTeacher);
            res.json({ 
                success: true,
                enrolledClasses: classesWithTeacher 
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Join class
    joinClass: async (req, res) => {
        try {
            const { classCode } = req.body;
            const classToJoin = await Class.findOne({ classCode });

            if (!classToJoin) {
                return res.status(404).json({ message: 'Class not found' });
            }

            const student = await Student.findById(req.user.id);
            
            if (student.enrolledClasses.includes(classToJoin._id)) {
                return res.status(400).json({ message: 'Already enrolled in this class' });
            }

            student.enrolledClasses.push(classToJoin._id);
            classToJoin.students.push(student._id);

            await Promise.all([
                student.save(),
                classToJoin.save()
            ]);

            res.json({ message: 'Successfully joined the class', class: classToJoin });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = studentController;
