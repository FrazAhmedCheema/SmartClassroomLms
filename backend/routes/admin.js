const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { check } = require('express-validator');
const auth = require('../middleware/auth');


router.post('/login', adminController.login);

router.get('/dashboard', auth, (req, res) => {
    console.log('Dashboard route accessed'); // Add this line to verify the route is accessed
    res.status(200).send('Authorized');
});

router.get('/manage-requests', auth, adminController.manageRequests);
router.post('/approve-institute', auth,adminController.approveInstitute);
router.post('/reject-institute', auth, adminController.rejectInstitute);

router.post('/logout', adminController.logout);

module.exports = router;