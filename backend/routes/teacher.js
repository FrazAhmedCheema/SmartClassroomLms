const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher');
const teacherNotificationController = require('../controllers/teacherNotificationController');
const { authorizeTeacher } = require('../middleware/auth');
const { changeTeacherPassword } = require('../controllers/changePasswordController');
// Change password route
router.post('/change-password', authorizeTeacher, changeTeacherPassword);

// Route to check authentication status
router.get('/auth-status', authorizeTeacher, teacherController.authStatus);

router.post('/create-class', authorizeTeacher, teacherController.createClass);
router.get('/classes', authorizeTeacher, teacherController.getClasses);
router.post('/login', teacherController.login);
router.get('/check-auth', authorizeTeacher, teacherController.checkAuth);
router.post('/logout', authorizeTeacher, teacherController.logout);

// Add this new route before module.exports
router.get('/stats', authorizeTeacher, teacherController.getTeacherStats);

// Notification routes
router.get('/notifications', authorizeTeacher, teacherNotificationController.getTeacherNotifications);
router.get('/notifications/unread-count', authorizeTeacher, teacherNotificationController.getUnreadNotificationCount);
router.patch('/notifications/:notificationId/read', authorizeTeacher, teacherNotificationController.markNotificationAsRead);
router.patch('/notifications/mark-all-read', authorizeTeacher, teacherNotificationController.markAllNotificationsAsRead);
router.delete('/notifications/:notificationId', authorizeTeacher, teacherNotificationController.deleteNotification);
router.post('/notifications/test', authorizeTeacher, teacherNotificationController.createTestNotification);
router.get('/notifications/discussion-debug', authorizeTeacher, teacherNotificationController.getDiscussionDebugInfo);

module.exports = router;
