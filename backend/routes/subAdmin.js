const express = require('express');
const router = express.Router();
const subAdminController = require('../controllers/subAdmin');
const { authorizeSubAdmin } = require('../middleware/auth');

router.get('/dashboard', authorizeSubAdmin, (req, res) => {
    console.log('Dashboard route accessed'); 
    res.status(200).json({ message: "Authorized", stats: { teachers: 10, students: 50, assignedCourses: 5, totalCourses: 20 } });
});


router.post('/registerInstitute', subAdminController.registerInstitute);
router.get('/verify-email/:token', subAdminController.verifyEmail);
router.post('/add-student', authorizeSubAdmin, subAdminController.addStudent);
router.get('/students', authorizeSubAdmin, subAdminController.getStudents);
router.put('/edit-student/:id', authorizeSubAdmin, subAdminController.editStudent);
router.delete('/delete-student/:id', authorizeSubAdmin, subAdminController.deleteStudent);

// Teacher routes
router.post('/add-teacher', authorizeSubAdmin, subAdminController.addTeacher);
router.get('/teachers', authorizeSubAdmin, subAdminController.getTeachers);
router.put('/edit-teacher/:id', authorizeSubAdmin, subAdminController.editTeacher);
router.delete('/delete-teacher/:id', authorizeSubAdmin, subAdminController.deleteTeacher);

// Classes route
router.get('/classes', authorizeSubAdmin, subAdminController.getAllClasses);

// Class details route
router.get('/classes/:id', authorizeSubAdmin, subAdminController.getClassDetails);

// Login route
router.post('/login', subAdminController.login);
router.post('/logout', authorizeSubAdmin, subAdminController.logout);

// Import students route
router.post('/import-students', authorizeSubAdmin, subAdminController.importStudents);

router.get('/check-verification-status', subAdminController.checkVerificationStatus);

// Authentication check route
router.get('/check-auth', authorizeSubAdmin, (req, res) => {
  res.status(200).json({ authenticated: true });
});

module.exports = router;