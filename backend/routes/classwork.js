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
const authMiddleware = require('../middleware/auth').authorizeTeacher;

// Apply auth middleware to all routes
router.use(authMiddleware);

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
router.post('/topics', createTopic);
router.get('/topics/:classId', topicController.getTopics);
router.put('/topics/:topicId', topicController.updateTopic);
router.delete('/topics/:topicId', topicController.deleteTopic);

// Classwork routes
router.post('/:classId', upload.array('files', 10), classworkController.createClasswork);
router.get('/:classId', classworkController.getClassworks);
router.get('/item/:classworkId', classworkController.getClasswork);
router.put('/item/:classworkId', upload.array('files', 10), classworkController.updateClasswork);
router.delete('/item/:classworkId', classworkController.deleteClasswork);
router.delete('/item/:classworkId/attachment/:attachmentId', classworkController.removeAttachment);

// Assignment routes
router.post('/:classId/create-assignment', upload.array('files', 10), classworkController.createAssignment);

module.exports = router;
