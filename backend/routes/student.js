const express = require('express');
const router = express.Router();
const { authorizeStudent } = require('../middleware/auth');
const studentController = require('../controllers/student');
const teacherController = require('../controllers/teacher');

// Authentication routes
router.post('/login', studentController.login);
router.get('/auth-status', authorizeStudent, studentController.checkAuthStatus);
router.post('/logout', studentController.logout);

// Class management routes
router.get('/enrolled-classes', authorizeStudent, studentController.getEnrolledClasses);
router.post('/join-class', authorizeStudent, studentController.joinClass);
router.get('/class/:id', authorizeStudent, studentController.getClassById);

module.exports = router;
