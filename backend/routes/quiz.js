const express = require('express');
const router = express.Router();
const multer = require('multer');
const quizController = require('../controllers/quizController');
const { authorizeTeacher } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.use(authorizeTeacher);

// Fetch all quizzes for a class
router.get('/:classId', quizController.getQuizzes);

// Fetch a single quiz by ID
router.get('/item/:id', quizController.getQuiz);

// Create a new quiz
router.post('/:classId/create-quiz', upload.array('files', 10), quizController.createQuiz);

// Update a quiz
router.put('/item/:id', quizController.updateQuiz);

// Delete a quiz
router.delete('/item/:id', quizController.deleteQuiz);

module.exports = router;
