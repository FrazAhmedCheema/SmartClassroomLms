const express = require('express');
const router = express.Router();
const multer = require('multer');
const assignmentController = require('../controllers/assignmentController');
const { authorizeTeacher, authorizeTeacherOrStudent, authorizeStudent } = require('../middleware/auth');

// Configure multer for memory storage instead of disk
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});

// Class-specific assignment routes
router.post('/:classId/create-assignment', authorizeTeacher, upload.array('attachments', 10), assignmentController.createAssignment);
router.get('/single/:id', authorizeTeacherOrStudent, assignmentController.getAssignment);
router.delete('/:id', authorizeTeacher, assignmentController.deleteAssignment);
router.get('/:classId', authorizeTeacherOrStudent, assignmentController.getAssignments);

// User-specific assignment routes (for todo list and dashboard)
router.get('/student-assignments', authorizeStudent, assignmentController.getStudentAssignments);
router.get('/teacher-assignments', authorizeTeacher, assignmentController.getTeacherAssignments);

module.exports = router;
