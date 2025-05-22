const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

exports.extractAndViewCode = async (req, res) => {
  try {
    const { files } = req.body;
    
    const zipFile = files[0];
    if (!zipFile) {
      return res.status(400).json({
        success: false,
        message: 'No zip file provided'
      });
    }

    // Create a temporary directory for this submission
    const tempDir = path.join(os.tmpdir(), `submission-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Download and extract the zip file
    const response = await axios.get(zipFile.url, {
      responseType: 'arraybuffer'
    });

    const zipPath = path.join(tempDir, zipFile.fileName);
    await fs.writeFile(zipPath, response.data);

    // Return the path that VS Code can open
    res.status(200).json({
      success: true,
      path: `vscode://file/${zipPath}`
    });

  } catch (error) {
    console.error('Error handling code view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to prepare code for viewing',
      error: error.message
    });
  }
};
