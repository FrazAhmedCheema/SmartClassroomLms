const express = require('express');
const router = express.Router();
const { authorizeStudent } = require('../middleware/auth');
const studentController = require('../controllers/student');

// Authentication routes
router.post('/login', studentController.login);
router.get('/auth-status', authorizeStudent, studentController.checkAuthStatus);
router.post('/logout', studentController.logout);

// Class management routes
router.get('/enrolled-classes', authorizeStudent, studentController.getEnrolledClasses);
router.post('/join-class', authorizeStudent, studentController.joinClass);

module.exports = router;
