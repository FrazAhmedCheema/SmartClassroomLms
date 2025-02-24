const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher');
const { authorize, authorizeTeacher } = require('../middleware/auth');

router.post('/create-class', authorizeTeacher, teacherController.createClass);
router.get('/classes', authorizeTeacher, teacherController.getClasses);
router.post('/login', teacherController.login);

module.exports = router;
