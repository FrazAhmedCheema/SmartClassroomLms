const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const axios = require('axios');
const AdmZip = require('adm-zip');

exports.prepareCodeForVSCode = async (req, res) => {
  try {
    const { fileUrl } = req.body;
    
    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'No file URL provided'
      });
    }

    // Extract the original filename from the URL and clean it
    const urlParts = fileUrl.split('/');
    const originalZipName = urlParts[urlParts.length - 1];
    // Remove any timestamp prefix (e.g., "1234567890-") and .zip extension
    const folderName = originalZipName.replace(/^\d+-/, '').replace(/\.zip$/i, '');

    // Create temp directory with cleaned folder name
    const tempDir = path.join(os.tmpdir(), folderName);
    
    // Ensure directory is empty/new
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.mkdir(tempDir, { recursive: true });

    // Download zip file
    const response = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'arraybuffer'
    });

    // Save and extract zip
    const zipPath = path.join(tempDir, originalZipName);
    await fs.writeFile(zipPath, response.data);

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(tempDir, true);

    // Clean up zip file
    await fs.unlink(zipPath);

    // Format path for VS Code
    let formattedPath;
    if (process.platform === 'win32') {
      // For Windows, ensure correct format with drive letter
      formattedPath = tempDir.split(path.sep).join('/');
      if (formattedPath.match(/^[A-Z]:/)) {
        formattedPath = formattedPath.charAt(0).toLowerCase() + formattedPath.slice(1);
      }
    } else {
      // For Unix-like systems
      formattedPath = tempDir;
    }

    res.status(200).json({
      success: true,
      localPath: formattedPath,
      message: 'Code ready for VS Code'
    });

  } catch (error) {
    console.error('Error preparing code for VS Code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to prepare code for VS Code',
      error: error.message
    });
  }
};
