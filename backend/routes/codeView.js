const express = require('express');
const router = express.Router();
const codeViewController = require('../controllers/codeViewController');
const { authorizeTeacher } = require('../middleware/auth');

router.post('/prepare', authorizeTeacher, codeViewController.prepareCodeForVSCode);

module.exports = router;
