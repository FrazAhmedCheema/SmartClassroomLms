const express = require('express');
const router = express.Router();
const { authorizeTeacherOrStudent } = require('../middleware/auth');
const discussionController = require('../controllers/discussion');

const logRequest = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Body:', req.body);
  console.log('User:', req.user);
  next();
};

router.use(logRequest);

router.use(authorizeTeacherOrStudent);

router.get('/class/:classId', discussionController.getDiscussions);
router.post('/create', discussionController.createDiscussion);
router.post('/message/:discussionId', discussionController.addMessage);
router.delete('/message/:discussionId/:messageId', discussionController.deleteMessage);
router.post('/terminate/:discussionId', discussionController.terminateDiscussion);

module.exports = router;
