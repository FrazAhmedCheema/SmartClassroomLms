const express = require('express');
const router = express.Router();
const multer = require('multer');
const questionController = require('../controllers/questionController');
const { authorizeTeacher, authorizeTeacherOrStudent } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});

// Public routes (accessible by both teachers and students)
router.get('/:classId', authorizeTeacherOrStudent, questionController.getQuestions);
router.get('/item/:id', authorizeTeacherOrStudent, questionController.getQuestion);

// Add new answer routes
router.post('/item/:id/answer', authorizeTeacherOrStudent, questionController.submitAnswer);
router.get('/item/:id/answers', authorizeTeacherOrStudent, questionController.getAnswers);

// Poll specific routes
router.post('/item/:id/vote', authorizeTeacherOrStudent, questionController.submitPollVote);
router.get('/item/:id/results', authorizeTeacherOrStudent, questionController.getPollResults);

// Protected routes (only for teachers)
router.post('/:classId/create-question', authorizeTeacher, upload.array('attachments', 10), questionController.createQuestion);
router.delete('/item/:id', authorizeTeacher, questionController.deleteQuestion);

module.exports = router;
