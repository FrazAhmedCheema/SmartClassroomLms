const express = require('express');
const router = express.Router();
const multer = require('multer');
const assignmentController = require('../controllers/assignmentController');
const { authorizeTeacher } = require('../middleware/auth');

// Configure multer for memory storage instead of disk
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});

router.use(authorizeTeacher);
router.get('/:classId', assignmentController.getAssignments);
router.post('/:classId/create-assignment', upload.array('files', 10), assignmentController.createAssignment);
router.get('/:id', assignmentController.getAssignment);

module.exports = router;
