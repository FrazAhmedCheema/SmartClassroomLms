const axios = require('axios');
const codeExecutionService = require('../services/codeExecution');

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
    // result should contain { containerId, language }
    res.status(200).json({ success: true, ...result });

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
