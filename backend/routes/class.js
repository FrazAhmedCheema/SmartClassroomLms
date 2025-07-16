const express = require('express');
const router = express.Router();
const classController = require('../controllers/class');
const { getClassBasicInfo } = require('../controllers/classController');
const { authorizeTeacher, authorize } = require('../middleware/auth');

// Temporarily remove authentication to fix the 401 errors
router.get('/:id', classController.getClassById);
router.get('/:id/basic', classController.getBasicClassInfo);
router.get('/:id/classwork', classController.getClasswork);
router.get('/:id/classwork/:assignmentId', classController.getClassworkById);
router.get('/:id/people', classController.getPeople);
router.put('/:id/update', authorize, classController.updateClass);
router.post('/:id/add-teacher', authorizeTeacher, classController.addTeacher);
router.get('/:id/discussions', classController.getDiscussions);
router.get('/:id/discussions/:topicId', classController.getDiscussionById);
router.post('/announcement', authorize, classController.createAnnouncement);
router.delete('/announcement', authorize, classController.deleteAnnouncement);
router.post('/announcement/comment', authorize, classController.addComment);
router.delete('/announcement/comment', authorize, classController.deleteComment);
router.post('/:id/invite-student', authorize, classController.inviteStudent);

// Route to fetch basic class info
router.get('/:classId/basic', getClassBasicInfo);

module.exports = router;
