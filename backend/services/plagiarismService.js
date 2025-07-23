const archiver = require('archiver');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const FormData = require('form-data');
const AdmZip = require('adm-zip');

const CODEQUIRY_API_KEY = process.env.CODE_QUIRY_API_KEY;
const REPORTS_DIR = path.join(__dirname, '../public/reports');
const TEMP_DIR = path.join(__dirname, '../uploads/plagiarism');

// Ensure directories exist
fs.ensureDirSync(REPORTS_DIR);
fs.ensureDirSync(TEMP_DIR);

class PlagiarismService {
  // Helper to map language names to Codequiry language IDs
  getLanguageId(language) {
    const languageMap = {
      'java': 13,
      'python': 14,
      'c': 16,
      'cpp': 17,
      'c++': 17,
      'csharp': 18,
      'c#': 18,
      'perl': 20,
      'php': 21,
      'sql': 22,
      'vb': 23,
      'xml': 24,
      'haskell': 28,
      'pascal': 29,
      'go': 30,
      'golang': 30,
      'matlab': 31,
      'lisp': 32,
      'ruby': 33,
      'assembly': 34,
      'javascript': 39,
      'js': 39,
      'typescript': 55,
      'ts': 55,
      'html': 40,
      'swift': 43,
      'kotlin': 44,
      'shell': 50,
      'bash': 50,
      'rust': 51,
      'scala': 52,
      'r': 53,
      'markdown': 56,
      'julia': 57,
      'groovy': 58,
      'lua': 61,
      'dart': 49
    };

    const normalizedLanguage = language.toLowerCase().trim();
    const languageId = languageMap[normalizedLanguage];
    
    if (!languageId) {
      console.warn(`Unknown language: ${language}, defaulting to Plain text (41)`);
      return 41; // Default to plain text
    }
    
    console.log(`Using language: ${language} (ID: ${languageId})`);
    return languageId;
  }

  // Helper to check if file is source code
  isSourceCodeFile(fileName) {
    const sourceExtensions = [
      // Common programming languages
      '.java', '.cpp', '.c', '.py', '.js', '.jsx', '.ts', '.tsx', '.php', '.cs', '.go', '.rb',
      // Web development
      '.html', '.css', '.scss', '.json', '.xml',
      // Other common formats
      '.txt', '.md'
    ];
    const ext = path.extname(fileName).toLowerCase();
    console.log(`Checking file extension for ${fileName}: ${ext}`);
    return sourceExtensions.includes(ext);
  }

  // Helper to detect language from file extensions
  detectLanguageFromFiles(sourceFiles) {
    const languageMap = {
      '.java': 'java',
      '.py': 'python',
      '.cpp': 'cpp',
      '.c': 'c',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.php': 'php',
      '.cs': 'csharp',
      '.go': 'go',
      '.rb': 'ruby',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'css'
    };

    const extensionCounts = {};
    
    // Count file extensions
    for (const file of sourceFiles) {
      const ext = path.extname(file.name).toLowerCase();
      extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
    }

    // Find the most common extension
    let mostCommonExt = null;
    let maxCount = 0;
    
    for (const [ext, count] of Object.entries(extensionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonExt = ext;
      }
    }

    const detectedLanguage = languageMap[mostCommonExt] || 'java';
    console.log(`Detected language from file extensions:`, {
      extensionCounts,
      mostCommonExt,
      detectedLanguage
    });

    return detectedLanguage;
  }

  async downloadFile(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  async extractZipAndFindSourceFiles(zipBuffer, tempDir) {
    const zip = new AdmZip(zipBuffer);
    const entries = zip.getEntries();
    
    console.log('Extracting ZIP contents...');
    const sourceFiles = [];

    for (const entry of entries) {
      if (!entry.isDirectory) {
        console.log(`Found file in ZIP: ${entry.entryName}`);
        if (this.isSourceCodeFile(entry.entryName)) {
          console.log(`Found source file: ${entry.entryName}`);
          sourceFiles.push({
            name: entry.entryName,
            content: entry.getData()
          });
        }
      }
    }

    return sourceFiles;
  }

  async createZipFromSubmission(submission) {
    try {
      // Debug logging
      console.log('Creating ZIP for submission:', {
        studentId: submission.studentId._id,
        hasFiles: submission.files && submission.files.length > 0,
        fileCount: submission.files?.length || 0
      });

      if (!submission.files || submission.files.length === 0) {
        console.log('No files found in submission');
        return null;
      }

      // Log all files before filtering
      console.log('All submission files:', submission.files.map(f => ({
        fileName: f.fileName,
        fileType: f.fileType,
        url: f.url
      })));

      const sourceFiles = [];

      // Process each submission file
      for (const file of submission.files) {
        console.log(`Processing file: ${file.fileName}`);
        
        if (file.fileType === 'application/zip' || path.extname(file.fileName).toLowerCase() === '.zip') {
          console.log('Found ZIP file, extracting contents...');
          try {
            const zipBuffer = await this.downloadFile(file.url);
            const extractedFiles = await this.extractZipAndFindSourceFiles(zipBuffer, TEMP_DIR);
            sourceFiles.push(...extractedFiles);
          } catch (error) {
            console.error(`Error processing ZIP file ${file.fileName}:`, error);
          }
        } else if (this.isSourceCodeFile(file.fileName)) {
          try {
            const fileContent = await this.downloadFile(file.url);
            sourceFiles.push({
              name: file.fileName,
              content: fileContent
            });
          } catch (error) {
            console.error(`Error downloading file ${file.fileName}:`, error);
          }
        }
      }

      console.log(`Found ${sourceFiles.length} source files in submission`);
      
      if (sourceFiles.length === 0) {
        console.log('No source code files found in submission');
        return null;
      }

      // Create a new ZIP with the source files
      const zipFileName = `submission_${submission.studentId._id}_${Date.now()}.zip`;
      const zipPath = path.join(TEMP_DIR, zipFileName);
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          console.log(`ZIP created at ${zipPath} with ${archive.pointer()} total bytes`);
          resolve(zipPath);
        });
        
        archive.on('error', (err) => {
          console.error('Archive error:', err);
          reject(err);
        });

        archive.pipe(output);

        // Create a folder for the student's files      // Store student info in a map for later use
      this.studentInfoMap = this.studentInfoMap || new Map();
      this.studentInfoMap.set(submission.studentId._id.toString(), {
        name: submission.studentId.name,
        email: submission.studentId.email
      });

      const studentFolder = `student_${submission.studentId._id}_${submission.studentId.name}`.replace(/[^a-zA-Z0-9-_]/g, '_');

      // Add all source files to the archive
      sourceFiles.forEach(file => {
        console.log(`Adding ${file.name} to archive`);
        archive.append(file.content, { 
          name: path.join(studentFolder, file.name)
        });
        });

        archive.finalize();
      });
    } catch (error) {
      console.error('Error in createZipFromSubmission:', error);
      return null;
    }
  }

  async runCodequiryCheck(studentZipUrls, assignmentName, language = 'java') {
    try {
      // Get the correct language ID
      const languageId = this.getLanguageId(language);
      
      // Step 1: Create a new check
      console.log('Creating new check...');
      const formData = new FormData();
      formData.append('name', assignmentName);
      formData.append('language', languageId); // Use the correct language ID

      const createCheckRes = await axios.post(
        'https://codequiry.com/api/v1/check/create',
        formData,
        {
          headers: {
            'Accept': '*/*',
            'apikey': CODEQUIRY_API_KEY
          }
        }
      );

      console.log('Check created:', createCheckRes.data);
      const checkId = createCheckRes.data.id;

      // Step 2: Upload each file to the check
      console.log('Uploading files to check...');
      for (const zipPath of studentZipUrls) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', fs.createReadStream(zipPath.replace('file://', '')));
        uploadFormData.append('check_id', checkId);

        const uploadRes = await axios.post(
          'https://codequiry.com/api/v1/check/upload',
          uploadFormData,
          {
            headers: {
              ...uploadFormData.getHeaders(),
              'Accept': '*/*',
              'apikey': CODEQUIRY_API_KEY
            }
          }
        );
        console.log(`File uploaded:`, uploadRes.data);
      }

      // Step 3: Start the check
      console.log('Starting check...');
      const startFormData = new FormData();
      startFormData.append('check_id', checkId);
      startFormData.append('test_type', 9); // Group Similarity Only
      startFormData.append('webcheck', 0); // Disable web check

      const startRes = await axios.post(
        'https://codequiry.com/api/v1/check/start',
        startFormData,
        {
          headers: {
            ...startFormData.getHeaders(),
            'Accept': '*/*',
            'apikey': CODEQUIRY_API_KEY
          }
        }
      );
      console.log('Check started:', startRes.data);

      // Step 4: Poll for completion
      for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between polls

        const statusRes = await axios.post(
          'https://codequiry.com/api/v1/check/get',
          null,
          {
            params: { check_id: checkId },
            headers: {
              'Accept': '*/*',
              'apikey': CODEQUIRY_API_KEY
            }
          }
        );

        const currentStatus = statusRes.data.status;
        console.log(`[Attempt ${attempt + 1}] Status:`, currentStatus);

        // Check for both "Completed" and "Checks completed" status formats
        if (currentStatus === 'Completed' || currentStatus === 'Checks completed') {
          console.log('Check completed, retrieving results...');
          
          // Step 5: Get results overview
          const overviewRes = await axios.post(
            'https://codequiry.com/api/v1/check/overview',
            null,
            {
              params: { check_id: checkId },
              headers: {
                'Accept': '*/*',
                'apikey': CODEQUIRY_API_KEY
              }
            }
          );

          // Step 6: Get detailed results for each submission
          const detailedResults = [];
          for (const submission of overviewRes.data.submissions) {
            const submissionRes = await axios.post(
              'https://codequiry.com/api/v1/check/results',
              null,
              {
                params: { 
                  check_id: checkId,
                  submission_id: submission.id
                },
                headers: {
                  'Accept': '*/*',
                  'apikey': CODEQUIRY_API_KEY
                }
              }
            );
            detailedResults.push(submissionRes.data);
          }

          return {
            checkId,
            status: 'completed',
            reportId: checkId.toString(), // Using check ID as report ID
            reportUrl: overviewRes.data.overviewURL,
            overviewResults: overviewRes.data,
            detailedResults,
            dashboardUrl: `https://dashboard.codequiry.com/course/${startRes.data.check.course_id}/assignment/${checkId}`
          };
        }

        if (statusRes.data.status === 'Error') {
          throw new Error('Check failed: ' + statusRes.data.message);
        }
      }

      throw new Error('Check timed out after 5 minutes');

    } catch (error) {
      console.error('Codequiry check error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error(`Codequiry check failed: ${error.message}`);
    }
  }

async checkPlagiarism(submissions, assignmentId, language = 'java') {
  try {
    console.log(`Starting plagiarism check for assignment ${assignmentId}`);
    
    // Debug log submissions
    console.log('Processing submissions:', JSON.stringify(submissions.map(s => ({
      studentId: s.studentId._id,
      studentName: s.studentId.name,
      fileCount: s.files?.length || 0
    })), null, 2));

    // Step 1: Create ZIP files and collect all source files for language detection
    const zipPromises = submissions.map(sub => this.createZipFromSubmission(sub));
    const zipPaths = await Promise.all(zipPromises);
    const validZipPaths = zipPaths.filter(Boolean);
    console.log(`Created ${validZipPaths.length} valid ZIP files out of ${submissions.length} submissions`);

    if (validZipPaths.length < 2) {
      throw new Error('At least 2 valid student submissions with source code files required');
    }

    // Step 2: Collect all source files for language detection
    let allSourceFiles = [];
    for (const submission of submissions) {
      if (!submission.files || submission.files.length === 0) continue;
      
      for (const file of submission.files) {
        if (file.fileType === 'application/zip' || path.extname(file.fileName).toLowerCase() === '.zip') {
          try {
            const zipBuffer = await this.downloadFile(file.url);
            const extractedFiles = await this.extractZipAndFindSourceFiles(zipBuffer, TEMP_DIR);
            allSourceFiles.push(...extractedFiles);
          } catch (error) {
            console.error(`Error processing ZIP file ${file.fileName}:`, error);
          }
        } else if (this.isSourceCodeFile(file.fileName)) {
          allSourceFiles.push({ name: file.fileName });
        }
      }
    }

    // Step 3: Auto-detect language from file extensions
    let detectedLanguage = language; // Use provided language as fallback
    if (allSourceFiles.length > 0) {
      detectedLanguage = this.detectLanguageFromFiles(allSourceFiles);
      console.log(`Language detection: provided='${language}', detected='${detectedLanguage}', using='${detectedLanguage}'`);
    }

    const studentZipUrls = validZipPaths.map(zipPath => `file://${zipPath}`);
    const assignmentName = `Assignment_${assignmentId}`;
    
    // Step 4: Run Codequiry with detected language
    const codequiryResult = await this.runCodequiryCheck(studentZipUrls, assignmentName, detectedLanguage);
    console.log(`Codequiry scan complete:`, codequiryResult.checkId);

    // Step 5: Map results
    const resultsMap = {};
    let totalSimilarity = 0;
    let maxSimilarity = 0;
    let distribution = { low: 0, medium: 0, high: 0, critical: 0 };

    for (const result of codequiryResult.detailedResults) {
      const similarity = result.similarity || 0;
      const scanId = result.id || result.scan_id || uuidv4();

      totalSimilarity += similarity;
      maxSimilarity = Math.max(maxSimilarity, similarity);

      if (similarity < 25) distribution.low++;
      else if (similarity < 50) distribution.medium++;
      else if (similarity < 75) distribution.high++;
      else distribution.critical++;

      resultsMap[scanId] = {
        scanId,
        studentName: result.student_name || 'Unknown',
        studentId: null, // Optional: If you want to map back studentId, let me know
        fileName: result.file_name || 'Unknown',
        error: result.error || null,
        similarity,
        results: result,
        pdfUrl: result.pdf_url || null
      };
    }

    const statistics = {
      averageSimilarity: parseFloat((totalSimilarity / codequiryResult.detailedResults.length).toFixed(2)),
      maxSimilarity,
      totalFiles: codequiryResult.detailedResults.length,
      distribution
    };

    // Step 6: Cleanup
    await Promise.all(validZipPaths.map(zipPath => 
      fs.remove(zipPath).catch(err => 
        console.error(`Error removing temporary file ${zipPath}:`, err))
    ));

    // Step 7: Add student names to overview submissions
    if (codequiryResult.overviewResults && codequiryResult.overviewResults.submissions) {
      console.log('Original submissions:', codequiryResult.overviewResults.submissions);
      console.log('Student info map:', Array.from(this.studentInfoMap.entries()));

      codequiryResult.overviewResults.submissions = codequiryResult.overviewResults.submissions.map(submission => {
        // Extract studentId from 'submission_<studentId>_<timestamp>'
        let studentId = null;
        let studentName = null;
        const match = submission.filename.match(/^submission_([a-f0-9]+)_/);
        if (match) {
          studentId = match[1];
        }
        // Prefer mapped name if available
        const studentInfo = this.studentInfoMap.get(studentId);
        studentName = studentInfo?.name || null;
        return {
          ...submission,
          studentId,
          studentName,
          studentEmail: studentInfo?.email || null
        };
      });
      console.log('Updated submissions with student info:', codequiryResult.overviewResults.submissions);
    }

    // Step 8: Return updated format with student information
    const result = {
      codequiry: {
        check_id: codequiryResult.checkId,
        report_url: codequiryResult.reportUrl,
        overview: codequiryResult.overviewResults,
        results: resultsMap,
        statistics,
        studentMap: Object.fromEntries(this.studentInfoMap),
        detectedLanguage // Include the detected language in the response
      }
    };

    // Clear the student info map after use
    this.studentInfoMap = new Map();

    return result;

  } catch (error) {
    console.error('Plagiarism check failed:', error);
    throw error;
  }
}

}

module.exports = new PlagiarismService();