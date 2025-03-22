const express = require('express');
const router = express.Router();
const classController = require('../controllers/class');
const { authorizeTeacherOrStudent } = require('../middleware/auth');

// Basic routes with proper auth middleware
router.get('/:id', authorizeTeacherOrStudent, classController.getClassById);
router.get('/:id/basic', authorizeTeacherOrStudent, (req, res, next) => {
  console.log('Auth check - User:', req.user); // Add this line for debugging
  next();
}, classController.getBasicClassInfo);

// Classwork routes
router.get('/:id/classwork', authorizeTeacherOrStudent, classController.getClasswork);
router.get('/:id/classwork/:assignmentId', authorizeTeacherOrStudent, classController.getClassworkById);

// People route
router.get('/:id/people', authorizeTeacherOrStudent, classController.getPeople);

// Discussion routes
router.get('/:id/discussions', authorizeTeacherOrStudent, classController.getDiscussions);
router.get('/:id/discussions/:topicId', authorizeTeacherOrStudent, classController.getDiscussionById);

module.exports = router;
