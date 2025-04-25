const express = require('express');
const router = express.Router();
const multer = require('multer');
const submissionController = require('../controllers/submissionController');
const { authorizeTeacher, authorizeTeacherOrStudent, authorizeStudent } = require('../middleware/auth');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});

// Routes for students
router.post('/:assignmentId/submit', 
  authorizeStudent, 
  upload.array('files', 10), 
  submissionController.submitAssignment
);

// New route for private comments
router.post('/:assignmentId/comment',
  authorizeTeacherOrStudent, // Temporarily use this instead of authorizeStudent
  submissionController.addOrUpdatePrivateComment
);

router.get('/student/:assignmentId', 
  authorizeTeacherOrStudent,
  submissionController.getStudentSubmission
);

router.delete('/:submissionId', 
  authorizeTeacherOrStudent,
  submissionController.deleteSubmission
);

// Routes for teachers
router.get('/all/:assignmentId', 
  authorizeTeacher,
  submissionController.getAllSubmissions
);

router.post('/grade/:submissionId', 
  authorizeTeacher,
  submissionController.gradeSubmission
);

module.exports = router;
