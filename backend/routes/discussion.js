const express = require('express');
const router = express.Router();
const { authorizeTeacherOrStudent } = require('../middleware/auth');
const discussionController = require('../controllers/discussion');

// Simple request logger middleware
const logRequest = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Body:', req.body);
  console.log('User:', req.user);
  next();
};

router.use(logRequest);

// Apply auth middleware to all routes
router.use(authorizeTeacherOrStudent);

// Remove individual auth middleware from routes since we're using router.use
router.get('/class/:classId', discussionController.getDiscussions);
router.post('/create', discussionController.createDiscussion);
router.post('/message/:discussionId', discussionController.addMessage);
router.delete('/message/:discussionId/:messageId', discussionController.deleteMessage);

module.exports = router;
