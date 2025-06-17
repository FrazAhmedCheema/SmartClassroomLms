const express = require('express');
const router = express.Router();
const codeExecutionController = require('../controllers/codeExecutionController');
const { authorizeTeacher } = require('../middleware/auth');

// Route to execute code (non-interactive batch mode)
router.post('/execute', authorizeTeacher, codeExecutionController.executeCode);

// Routes for interactive code execution
router.post('/execute-interactive', authorizeTeacher, codeExecutionController.executeInteractiveCode);
router.post('/stop/:containerId', authorizeTeacher, codeExecutionController.stopInteractiveContainer);
router.get('/status/:containerId', authorizeTeacher, codeExecutionController.getInteractiveContainerStatus);
// A DELETE route for /cleanup/:containerId could also point to stopInteractiveContainer if semantics are identical.
router.post('/analyze-output', authorizeTeacher, codeExecutionController.analyzeTerminalOutput);

module.exports = router;
