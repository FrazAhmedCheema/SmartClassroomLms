const axios = require('axios');
const codeExecutionService = require('../services/codeExecution');

exports.executeCode = async (req, res) => {
  try {
    const { files, language, submissionId } = req.body;

    // Validate inputs
    if (!files || !submissionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Find the zip file
    const zipFile = files.find(file => 
      file.fileType === 'application/zip' || 
      file.fileType === 'application/x-zip-compressed'
    );

    if (!zipFile) {
      return res.status(400).json({
        success: false,
        message: 'No zip file found in submission'
      });
    }

    const result = await codeExecutionService.executeCode(zipFile.url, language);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.stderr || 'Code execution failed',
        error: result.stderr
      });
    }

    res.status(200).json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error executing code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute code',
      error: error.message
    });
  }
};
