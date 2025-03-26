const express = require('express');
const router = express.Router();
const classController = require('../controllers/class');

// Temporarily remove authentication to fix the 401 errors
router.get('/:id', classController.getClassById);
router.get('/:id/basic', classController.getBasicClassInfo);
router.get('/:id/classwork', classController.getClasswork);
router.get('/:id/classwork/:assignmentId', classController.getClassworkById);
router.get('/:id/people', classController.getPeople);
router.get('/:id/discussions', classController.getDiscussions);
router.get('/:id/discussions/:topicId', classController.getDiscussionById);
router.post('/announcement', classController.createAnnouncement);
router.delete('/announcement', classController.deleteAnnouncement);
router.post('/announcement/comment', classController.addComment);
router.delete('/announcement/comment', classController.deleteComment);

module.exports = router;
