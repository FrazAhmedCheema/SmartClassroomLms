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

    // If there's an error but we have analyzed it
    if (result.error && result.stderr) {
      try {
        // Check if stderr is a JSON string (analyzed error)
        const errorAnalysis = JSON.parse(result.stderr);
        return res.status(200).json({
          success: true,
          result: {
            ...result,
            buildLogs: result.buildLogs  // Ensure buildLogs are passed through
          }
        });
      } catch {
        // If stderr is not JSON, return as error
        return res.status(500).json({
          success: false,
          message: result.stderr,
          error: result.stderr
        });
      }
    }

    res.status(200).json({
      success: true,
      result: {
        ...result,
        buildLogs: result.buildLogs  // Ensure buildLogs are passed through
      }
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
