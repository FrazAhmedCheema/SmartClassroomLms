const express = require('express');
const router = express.Router();
const { authorizeStudent } = require('../middleware/auth');
const studentController = require('../controllers/student');
const teacherController = require('../controllers/teacher');
const studentNotificationController = require('../controllers/studentNotificationController');

// Authentication routes
router.post('/login', studentController.login);
router.get('/auth-status', authorizeStudent, studentController.checkAuthStatus);
router.post('/logout', studentController.logout);

// Class management routes
router.get('/enrolled-classes', authorizeStudent, studentController.getEnrolledClasses);
router.post('/join-class', authorizeStudent, studentController.joinClass);
router.get('/stats', authorizeStudent, studentController.getStudentStats);

// Add profile routes
router.get('/profile', authorizeStudent, studentController.getCurrentStudentProfile);
router.get('/profile/:id', studentController.getStudentProfileById);

// Notification routes
router.get('/notifications', authorizeStudent, studentNotificationController.getStudentNotifications);
router.get('/notifications/unread-count', authorizeStudent, studentNotificationController.getUnreadNotificationCount);
router.patch('/notifications/:notificationId/read', authorizeStudent, studentNotificationController.markNotificationAsRead);
router.patch('/notifications/mark-all-read', authorizeStudent, studentNotificationController.markAllNotificationsAsRead);
router.delete('/notifications/:notificationId', authorizeStudent, studentNotificationController.deleteNotification);
router.post('/notifications/test', authorizeStudent, studentNotificationController.createTestNotification);
router.get('/notifications/discussion-debug', authorizeStudent, studentNotificationController.getDiscussionNotificationsDebug);

module.exports = router;
