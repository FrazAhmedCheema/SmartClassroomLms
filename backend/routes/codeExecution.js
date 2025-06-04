const express = require('express');
const router = express.Router();
const codeExecutionController = require('../controllers/codeExecutionController');
const { authorizeTeacher } = require('../middleware/auth');

// Route to execute code
router.post('/execute', authorizeTeacher, codeExecutionController.executeCode);

module.exports = router;
