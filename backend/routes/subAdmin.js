const express = require('express');
const router = express.Router();
const subAdminController = require('../controllers/subAdmin');

router.post('/registerInstitute', subAdminController.registerInstitute);

module.exports = router;