const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const unzipper = require('unzipper');

/**
 * Ensure directory exists, create if it doesn't
 */
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true });
    } else {
      throw error;
    }
  }
};

/**
 * Extract zip file to specified directory
 */
const extractZip = async (zipPath, extractDir) => {
  await ensureDirectoryExists(extractDir);
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .on('close', resolve)
      .on('error', reject);
  });
};

/**
 * Create zip archive from directory
 */
const createZip = async (sourceDir, outputPath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
};

/**
 * Get all files recursively from directory with specific extensions
 */
const getFilesRecursively = async (dir, extensions = []) => {
  const files = [];
  
  const readDir = async (currentDir) => {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await readDir(fullPath);
      } else if (entry.isFile()) {
        if (extensions.length === 0 || extensions.includes(path.extname(entry.name).toLowerCase())) {
          files.push(fullPath);
        }
      }
    }
  };
  
  await readDir(dir);
  return files;
};

/**
 * Clean up temporary directory
 */
const cleanupDirectory = async (dirPath) => {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    console.error(`Error cleaning up directory ${dirPath}:`, error);
  }
};

/**
 * Copy file from source to destination
 */
const copyFile = async (src, dest) => {
  await ensureDirectoryExists(path.dirname(dest));
  await fs.copyFile(src, dest);
};

/**
 * Read file content as text
 */
const readFileContent = async (filePath) => {
  return await fs.readFile(filePath, 'utf8');
};

/**
 * Write content to file
 */
const writeFileContent = async (filePath, content) => {
  await ensureDirectoryExists(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf8');
};

/**
 * Get file stats
 */
const getFileStats = async (filePath) => {
  return await fs.stat(filePath);
};

/**
 * Check if file exists
 */
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  ensureDirectoryExists,
  extractZip,
  createZip,
  getFilesRecursively,
  cleanupDirectory,
  copyFile,
  readFileContent,
  writeFileContent,
  getFileStats,
  fileExists
};
