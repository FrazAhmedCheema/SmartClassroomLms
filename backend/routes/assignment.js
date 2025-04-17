const express = require('express');
const router = express.Router();
const multer = require('multer');
const assignmentController = require('../controllers/assignmentController');
const { authorizeTeacher,authorizeTeacherOrStudent } = require('../middleware/auth');

// Configure multer for memory storage instead of disk
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});

router.get('/:classId', authorizeTeacherOrStudent,assignmentController.getAssignments);
router.post('/:classId/create-assignment', authorizeTeacher,upload.array('attachments', 10), assignmentController.createAssignment);
router.get('/:id', authorizeTeacherOrStudent,assignmentController.getAssignment);
router.delete('/:id', authorizeTeacher,assignmentController.deleteAssignment);

module.exports = router;
