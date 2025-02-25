const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher');
const { authorize, authorizeTeacher } = require('../middleware/auth');

// Route to check authentication status
router.get('/auth-status', authorize, teacherController.authStatus);

router.post('/create-class', authorizeTeacher, teacherController.createClass);
router.get('/classes', authorizeTeacher, teacherController.getClasses);
router.post('/login', teacherController.login);
router.get('/check-auth', authorizeTeacher, teacherController.checkAuth);
router.post('/logout', authorizeTeacher, teacherController.logout);

module.exports = router;
