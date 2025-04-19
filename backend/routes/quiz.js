const express = require('express');
const router = express.Router();
const multer = require('multer');
const quizController = require('../controllers/quizController');
const { authorizeTeacher,authorizeTeacherOrStudent } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});


// Fetch all quizzes for a class
router.get('/:classId',authorizeTeacherOrStudent ,quizController.getQuizzes);

// Fetch a single quiz by ID
router.get('/item/:id', authorizeTeacherOrStudent,quizController.getQuiz);

// Create a new quiz
router.post('/:classId/create-quiz', authorizeTeacher,upload.array('attachments', 10), quizController.createQuiz);

// Update a quiz
router.put('/item/:id',authorizeTeacher, quizController.updateQuiz);

// Delete a quiz
router.delete('/item/:id',authorizeTeacher ,quizController.deleteQuiz);

module.exports = router;
