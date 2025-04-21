const express = require('express');
const router = express.Router();
const multer = require('multer');
const materialController = require('../controllers/materialController');
const { authorizeTeacher, authorizeTeacherOrStudent } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});

// Public routes (accessible by both teachers and students)
router.get('/:classId', authorizeTeacherOrStudent, materialController.getMaterials);
router.get('/item/:id', authorizeTeacherOrStudent, materialController.getMaterial);

// Comment routes
router.post('/item/:id/comment', authorizeTeacherOrStudent, materialController.addComment);
router.delete('/item/:id/comment/:commentId', authorizeTeacherOrStudent, materialController.deleteComment);

// Protected routes (only for teachers)
router.post('/:classId/create-material', authorizeTeacher, upload.array('attachments', 10), materialController.createMaterial);
router.delete('/item/:id', authorizeTeacher, materialController.deleteMaterial);

module.exports = router;
