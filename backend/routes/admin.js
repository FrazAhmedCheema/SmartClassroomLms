const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { check } = require('express-validator');
const auth = require('../middleware/auth');


router.post('/login', adminController.login);

router.get('/dashboard', auth, (req, res) => {
    console.log('Dashboard route accessed'); 
    res.status(200).send('Authorized');
});

router.get('/manage-institutes', auth, adminController.manageInstitutes);
router.patch('/manage-institutes/:id/status', auth, adminController.updateInstituteStatus);

router.delete('/manage-institutes/:id', auth, adminController.deleteInstitute);
router.post('/manage-institutes/:id/email', auth, adminController.sendEmail);

router.get('/notifications', adminController.getNotifications);

router.get('/manage-requests', auth, adminController.manageRequests);
router.post('/approve-institute', auth,adminController.approveInstitute);
router.post('/reject-institute', auth, adminController.rejectInstitute);

router.post('/logout',auth, adminController.logout);

module.exports = router;