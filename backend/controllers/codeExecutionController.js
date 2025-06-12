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
