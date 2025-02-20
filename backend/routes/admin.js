const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { authorizeAdmin } = require('../middleware/auth');

// Define routes with proper callback functions
router.post('/login', adminController.login);
router.post('/logout', authorizeAdmin, adminController.logout);
router.get('/manage-requests', authorizeAdmin, adminController.manageRequests);
router.post('/approve-institute', authorizeAdmin, adminController.approveInstitute);
router.post('/reject-institute', authorizeAdmin, adminController.rejectInstitute);
router.get('/manage-institutes', authorizeAdmin, adminController.manageInstitutes);
router.put('/update-institute-status/:id', authorizeAdmin, adminController.updateInstituteStatus);
router.delete('/delete-institute/:id', authorizeAdmin, adminController.deleteInstitute);
router.post('/send-email/:id', authorizeAdmin, adminController.sendEmail);
router.get('/notifications', authorizeAdmin, adminController.getNotifications);
router.put('/update-institute/:id', authorizeAdmin, adminController.updateInstitute);
router.get('/dashboard', adminController.getDashboardData);

module.exports = router;