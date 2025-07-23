const axios = require('axios');
const codeExecutionService = require('../services/codeExecution');
const mernExecutionService = require('../services/mernExecution');

exports.executeCode = async (req, res) => {
  try {
    const { files, language, submissionId } = req.body; // language from req.body is assignment.category

    if (!files || !submissionId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const zipFile = files.find(file => 
      file.fileType === 'application/zip' || 
      file.fileType === 'application/x-zip-compressed'
    );

    if (!zipFile) {
      return res.status(400).json({ success: false, message: 'No zip file found in submission' });
    }

    // The 'language' parameter passed to executeCode can be used by the service if needed,
    // but the service primarily relies on its own analysis via analyzeCode.
    const result = await codeExecutionService.executeCode(zipFile.url); // Removed language param, service derives it

    if (result.error) { // Check for top-level general error
      console.error("Code execution failed with general error:", result.error);
      return res.status(500).json({
        success: false,
        message: result.error.message || 'Code execution failed due to a general error.',
        errorDetails: result.error // Contains aiAnalysis, rawBuildOutput, stack
      });
    }
    
    // If no general error, result contains language and fileResults
    res.status(200).json({
      success: true,
      result // Contains { language, fileResults }
    });

  } catch (error) { // Catch unexpected errors in the controller itself
    console.error('Unhandled error in codeExecutionController:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during code execution.',
      error: error.message
    });
  }
};

exports.executeInteractiveCode = async (req, res) => {
  try {
    const { fileUrl, submissionId } = req.body; 

    if (!fileUrl) { // submissionId is good for context but fileUrl is essential
      return res.status(400).json({ success: false, message: 'Missing required field: fileUrl' });
    }
    
    // The service will download and process the zip from fileUrl
    const result = await codeExecutionService.executeInteractiveCode(fileUrl);
    
    // Check if this was a notebook that got automatically redirected to regular execution
    if (result.language === 'jupyter' && result.fileResults) {
      // This was a notebook execution, return as regular execution result
      res.status(200).json({ 
        success: true, 
        isNotebookRedirect: true,
        executionResult: result,
        message: 'Jupyter notebook detected - executed on EC2 instead of interactive mode'
      });
    } else {
      // result should contain { containerId, language } for interactive sessions
      res.status(200).json({ success: true, ...result });
    }

  } catch (error) {
    console.error('Error in executeInteractiveCode controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start interactive code session.',
      // error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.stopInteractiveContainer = async (req, res) => {
  try {
    const { containerId } = req.params;
    if (!containerId) {
      return res.status(400).json({ success: false, message: 'Missing containerId parameter.' });
    }
    const result = await codeExecutionService.stopInteractiveContainer(containerId);
    res.status(200).json(result); // result is { success, message }
  } catch (error) {
    console.error(`Controller error stopping container ${req.params.containerId}:`, error);
    res.status(500).json({ success: false, message: 'Failed to stop container due to server error.', error: error.message });
  }
};

exports.getInteractiveContainerStatus = async (req, res) => {
  try {
    const { containerId } = req.params;
    if (!containerId) {
      return res.status(400).json({ success: false, message: 'Missing containerId parameter.' });
    }
    const result = await codeExecutionService.getInteractiveContainerStatus(containerId);
    if (result.status === 'not_found') {
        return res.status(404).json({ success: false, ...result });
    }
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(`Controller error getting status for container ${req.params.containerId}:`, error);
    res.status(500).json({ success: false, message: 'Failed to get container status due to server error.', error: error.message });
  }
};

exports.analyzeTerminalOutput = async (req, res) => {
  try {
    const { terminalLog, languageHint } = req.body;
    if (!terminalLog) {
      return res.status(400).json({ success: false, message: 'Missing terminalLog field.' });
    }

    const result = await codeExecutionService.analyzeTerminalOutputAndStructure(terminalLog, languageHint || 'unknown');
    // result should be { structuredSummary: [...] }
    res.status(200).json({ success: true, analysis: result.structuredSummary });

  } catch (error) {
    console.error('Error in analyzeTerminalOutput controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze terminal output.',
    });
  }
};

exports.executeMERNStack = async (req, res) => {
  try {
    const { fileUrl, submissionId } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'Missing required field: fileUrl' });
    }

    const sessionId = `mern-${submissionId}-${Date.now()}`;
    const result = await mernExecutionService.executeMERNStack(fileUrl, sessionId);

    res.status(200).json({ success: true, ...result });

  } catch (error) {
    console.error('Error in executeMERNStack controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start MERN stack execution.',
    });
  }
};

exports.stopMERNSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Missing sessionId parameter.' });
    }

    const result = await mernExecutionService.stopMERNSession(sessionId);
    res.status(200).json(result);

  } catch (error) {
    console.error(`Controller error stopping MERN session ${req.params.sessionId}:`, error);
    res.status(500).json({ success: false, message: 'Failed to stop MERN session due to server error.', error: error.message });
  }
};

exports.getMERNSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Missing sessionId parameter.' });
    }

    const result = await mernExecutionService.getMERNSessionStatus(sessionId);
    
    if (result.status === 'not_found') {
      return res.status(404).json({ success: false, ...result });
    }

    res.status(200).json({ success: true, ...result });

  } catch (error) {
    console.error(`Controller error getting MERN session status ${req.params.sessionId}:`, error);
    res.status(500).json({ success: false, message: 'Failed to get MERN session status due to server error.', error: error.message });
  }
};

exports.downloadGeneratedFile = async (req, res) => {
  try {
    const { workDir, fileName } = req.params;
    
    if (!workDir || !fileName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing workDir or fileName parameter.' 
      });
    }

    // Security check - prevent directory traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid file name. File names cannot contain path separators.' 
      });
    }

    // Only allow certain file types for security
    const allowedExtensions = ['.csv', '.txt', '.json', '.xml', '.log'];
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({ 
        success: false, 
        message: `File type ${fileExtension} is not allowed for download.` 
      });
    }

    // Get the file content from EC2
    const fileContent = await codeExecutionService.downloadGeneratedFile(workDir, fileName);
    
    // Set appropriate headers for file download
    const mimeTypes = {
      '.csv': 'text/csv',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.log': 'text/plain'
    };
    
    const mimeType = mimeTypes[fileExtension] || 'application/octet-stream';
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    res.status(200).send(fileContent);

  } catch (error) {
    console.error(`Error downloading generated file ${req.params.fileName}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to download file.', 
      error: error.message 
    });
  }
};
