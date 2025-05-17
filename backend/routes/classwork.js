const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Topic = require('../models/Topic');
const { createTopic } = require('../controllers/classworkController');

// Controllers
const classworkController = require('../controllers/classworkController');
const topicController = require('../controllers/topicController');

// Authentication middleware - use whatever auth middleware is available
const { authorizeTeacher,authorizeTeacherOrStudent } = require('../middleware/auth');

// Apply auth middleware to all routes

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});

// Topic routes
router.post('/topics', authorizeTeacher,createTopic);
router.get('/topics/:classId',authorizeTeacherOrStudent, topicController.getTopics);
router.put('/topics/:topicId', authorizeTeacher,topicController.updateTopic);
router.delete('/topics/:topicId',authorizeTeacher ,topicController.deleteTopic);

// Classwork routes
router.post('/:classId',authorizeTeacher, upload.array('files', 10), classworkController.createClasswork);
router.get('/:classId', authorizeTeacherOrStudent,classworkController.getClassworks);
router.get('/item/:classworkId', authorizeTeacherOrStudent,classworkController.getClasswork);
router.put('/item/:classworkId',authorizeTeacher ,upload.array('files', 10), classworkController.updateClasswork);
router.delete('/item/:classworkId', authorizeTeacher,classworkController.deleteClasswork);
router.delete('/item/:classworkId/attachment/:attachmentId',authorizeTeacher, classworkController.removeAttachment);

// Assignment routes
router.post('/:classId/create-assignment', authorizeTeacher,upload.array('files', 10), classworkController.createAssignment);

module.exports = router;
