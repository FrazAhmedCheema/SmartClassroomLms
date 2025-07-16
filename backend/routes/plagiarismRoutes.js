const express = require('express');
const router = express.Router();
const {authorizeTeacher} = require('../middleware/auth');
// Import plagiarism controller methods
const plagiarismController = require('../controllers/plagiarismController');

// Import auth middleware
const { protect } = require('../middleware/auth');

// Destructure methods from controller
const {
  checkPlagiarism,
  getPlagiarismResults,
  getPlagiarismHistory,
  deletePlagiarismResults
} = plagiarismController;

// Log to ensure correct import (optional for debugging)
console.log('PlagiarismController methods:', {
  checkPlagiarism,
  getPlagiarismResults,
  getPlagiarismHistory,
  deletePlagiarismResults
});

// Define routes
router.post('/check/:assignmentId', authorizeTeacher, checkPlagiarism);
router.get('/results/:assignmentId', authorizeTeacher, getPlagiarismResults);
router.get('/history/:assignmentId', authorizeTeacher, getPlagiarismHistory);
router.delete('/results/:reportId', authorizeTeacher, deletePlagiarismResults);

// Export the router
module.exports = router;
