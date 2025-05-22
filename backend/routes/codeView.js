const express = require('express');
const router = express.Router();
const codeViewController = require('../controllers/codeViewController');
const { authorizeTeacher } = require('../middleware/auth');

router.post('/extract', authorizeTeacher, codeViewController.extractAndViewCode);

module.exports = router;
