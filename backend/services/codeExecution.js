const Docker = require('dockerode');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const axios = require('axios');
const { OpenAI } = require('openai');

// Configure Docker
const docker = new Docker({
  host: '13.61.185.212',
  port: 2375,
  protocol: 'http'
});

// Configure OpenAI API
const openai = new OpenAI(process.env.OPENAI_API_KEY);

class CodeExecutionService {
  async analyzeCode(files) {
    if (!files || files.length === 0) {
      throw new Error('No files found to analyze');
    }
    const codeContent = files.map(f => `File: ${f.name}\nContent:\n${f.content}`).join('\n\n');
    const prompt = `Analyze these code files and provide information in this exact format:
{
  "mainFile": "name of the main file that should be executed first (if applicable, else pick one)",
  "fileType": "language type (cpp, java, python)",
  "executionOrder": ["file1.ext", "file2.ext"],
  "buildCommand": "build command if needed (e.g., javac *.java or g++ *.cpp -o main)",
  "runCommand": "command to run the code (e.g., java MainClass or ./main)",
  "outputFormat": {
    "title": "descriptive title of what the code does",
    "type": "output type (numeric, text, mixed)"
  }
}
Code files:
${codeContent}`;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      });
      const analysis = JSON.parse(response.choices[0].message.content);
      const mainExt = analysis.mainFile.split('.').pop().toLowerCase();
      analysis.baseImage = this.getBaseImage(mainExt, analysis.fileType); // Pass fileType too
      return analysis;
    } catch (error) {
      console.error('GPT Analysis error:', error);
      throw new Error('Failed to analyze code files with GPT');
    }
  }

  getBaseImage(extension, fileType) { // Added fileType for robustness
    const lang = fileType || extension; // Prefer fileType from analysis
    const imageMap = {
      'cpp': 'gcc:latest',
      'java': 'openjdk:11-jdk-slim', // Using a common version
      'python': 'python:3.9-slim'
    };
    return imageMap[lang] || 'ubuntu:latest'; // Fallback, though analysis should give fileType
  }

  generateRunScript(language, executionOrder) {
    let scriptContent = '#!/bin/sh\n\n';
    scriptContent += executionOrder.map(file => {
      let execCmd = '';
      const safeFileName = file.replace(/[^a-zA-Z0-9_.-]/g, '_'); // Sanitize for temp file names

      switch (language) {
        case 'java':
          const className = file.replace('.java', '');
          execCmd = `java ${className}`;
          break;
        case 'python':
          execCmd = `python ${file}`;
          break;
        case 'cpp':
          const executableName = `./bin/${file.replace('.cpp', '')}`;
          execCmd = `if [ -f "${executableName}" ]; then ${executableName}; else echo "Executable ${executableName} not found."; exit 127; fi`;
          break;
        default:
          return `# Unsupported language for file: ${file}`;
      }

      return `
echo "---EXEC_START---${file}---"
${execCmd} > "${safeFileName}.stdout" 2> "${safeFileName}.stderr"
exit_code=$?
echo "---STDOUT_CONTENT_START---${file}---"
cat "${safeFileName}.stdout"
echo "---STDOUT_CONTENT_END---${file}---"
if [ -s "${safeFileName}.stderr" ] || [ $exit_code -ne 0 ]; then
    echo "---STDERR_CONTENT_START---${file}---"
    cat "${safeFileName}.stderr"
    echo "---STDERR_CONTENT_END---${file}---"
fi
rm -f "${safeFileName}.stdout" "${safeFileName}.stderr"
echo "---EXEC_END---${file}---EXIT_CODE=$exit_code---"
`;
    }).join('\n\n');
    return scriptContent;
  }

  generateDockerfile(analysis) {
    let dockerfile = `FROM ${analysis.baseImage}\nWORKDIR /app\nCOPY . .\n`;

    switch (analysis.fileType) {
      case 'cpp':
        dockerfile += `RUN mkdir -p ./bin && find . -maxdepth 1 -name "*.cpp" -exec sh -c 'echo "Compiling {}..." && g++ -std=c++17 -o ./bin/$(basename {} .cpp) {}' \\; 2>&1 || true\n`;
        break;
      case 'java':
        dockerfile += `RUN find . -maxdepth 1 -name "*.java" -exec sh -c 'echo "Compiling {}..." && javac {}' \\; 2>&1 || true\n`;
        break;
      case 'python':
        // No explicit compile step needed in Dockerfile for Python
        break;
      default:
        throw new Error(`Unsupported file type for Dockerfile generation: ${analysis.fileType}`);
    }

    dockerfile += `COPY run_script.sh .\nRUN chmod +x run_script.sh\nCMD ["./run_script.sh"]`;
    return dockerfile;
  }

  async executeCode(fileUrl) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `code-${Date.now()}`));
    const containerName = `code-exec-${Date.now()}`;
    let container = null;
    let analysisResult = null;
    let buildLogStrings = [];

    try {
      const zipPath = path.join(tempDir, 'submission.zip');
      const zipResponse = await axios({ method: 'get', url: fileUrl, responseType: 'arraybuffer' });
      await fs.writeFile(zipPath, zipResponse.data);
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(tempDir, true);
      await fs.unlink(zipPath);

      const files = await this.readFiles(tempDir);
      if (files.length === 0) throw new Error("No files found in submission zip.");
      
      analysisResult = await this.analyzeCode(files);
      console.log('Code analysis by GPT:', analysisResult);

      const runScriptContent = this.generateRunScript(analysisResult.fileType, analysisResult.executionOrder);
      await fs.writeFile(path.join(tempDir, 'run_script.sh'), runScriptContent);

      const dockerfileContent = this.generateDockerfile(analysisResult);
      await fs.writeFile(path.join(tempDir, 'Dockerfile'), dockerfileContent);
      console.log('Generated Dockerfile content:\n', dockerfileContent);
      console.log('Generated run_script.sh content:\n', runScriptContent);


      const buildStream = await docker.buildImage(
        { context: tempDir, src: await this.getContextFiles(tempDir) }, // getContextFiles needs to be async or use sync fs methods
        { t: containerName, nocache: true, forcerm: true, q: false } // q:false for verbose build output
      );
      
      buildLogStrings = await new Promise((resolve, reject) => {
        let logs = [];
        buildStream.on('data', chunk => {
          const newLogs = chunk.toString('utf-8').split('\n').filter(Boolean);
          logs.push(...newLogs);
          newLogs.forEach(logLine => {
            try {
              const parsedLog = JSON.parse(logLine);
              console.log('Build Event (JSON):', parsedLog.stream ? parsedLog.stream.trim() : parsedLog);
            } catch (e) {
              console.log('Build Event (Raw):', logLine.trim());
            }
          });
        });
        buildStream.on('end', () => resolve(logs));
        buildStream.on('error', err => reject(err));
        // Using docker.modem.followProgress for better error handling from build
        docker.modem.followProgress(buildStream, (err, res) => {
            if (err) return reject(err);
            // res contains the final status, logs are collected via 'data' event
            // Check for build errors in 'res' if it's structured that way
            const lastResponse = res && res.length > 0 ? res[res.length -1] : null;
            if (lastResponse && lastResponse.errorDetail) {
                return reject(new Error(lastResponse.errorDetail.message));
            }
            resolve(logs); // Resolve with collected logs
        });
      });
      console.log('Combined Build Output String:', buildLogStrings.join('\n'));


      const images = await docker.listImages({ filters: { reference: [`${containerName}:latest`] } });
      if (images.length === 0) {
        const errorDetail = buildLogStrings.filter(s => s.toLowerCase().includes('error')).join('\n');
        throw new Error(`Docker image ${containerName} not found after build. Build errors: ${errorDetail || 'Unknown, check build logs.'}`);
      }
      
      container = await docker.createContainer({
        Image: containerName, name: containerName,
        HostConfig: { AutoRemove: true, Memory: 512 * 1024 * 1024, NanoCpus: 1 * 1000000000 },
        AttachStdout: true, AttachStderr: true, Tty: false
      });
      
      await container.start();
      
      const containerLogStream = await container.logs({ stdout: true, stderr: true, follow: true, timestamps: false });
      const rawContainerOutput = await new Promise((resolve, reject) => {
        let output = '';
        containerLogStream.on('data', chunk => output += chunk.toString('utf8'));
        containerLogStream.on('end', () => resolve(output));
        containerLogStream.on('error', reject);
         // Wait for container to finish, otherwise logs might be incomplete
        container.wait().catch(err => {
            // If container.wait() errors, it might be because it already exited.
            // We still want to try to resolve with whatever logs we got.
            console.warn("Container.wait error, proceeding with log collection:", err.message);
        });
      });
      console.log('Raw Container Output from script:\n', rawContainerOutput);

      const fileResults = [];
      const processedForCompileError = new Set();

      for (const fileName of analysisResult.executionOrder) {
        const fileSpecificCompileErrors = buildLogStrings
          .map(logLine => { // Try to parse JSON, fallback to raw string
              try { return JSON.parse(logLine).stream || logLine; } catch { return logLine; }
          })
          .filter(logContent => 
              typeof logContent === 'string' &&
              logContent.includes(fileName) && 
              (logContent.toLowerCase().includes('error:') || logContent.toLowerCase().includes('compilation terminated.') || logContent.toLowerCase().includes("compilation failed"))
          )
          .join('\n');

        if (fileSpecificCompileErrors) {
          console.log(`Identified compile errors for ${fileName}:\n${fileSpecificCompileErrors}`);
          const aiAnalysis = await this.analyzeError(fileSpecificCompileErrors, analysisResult.fileType);
          fileResults.push({
            fileName, status: 'compile_error', stdout: null, stderr: null,
            compileErrorAnalysis: { ...(aiAnalysis || {}), rawErrors: fileSpecificCompileErrors },
          });
          processedForCompileError.add(fileName);
        }
      }
      
      for (const fileName of analysisResult.executionOrder) {
        if (processedForCompileError.has(fileName)) continue;

        const execStartMarker = `---EXEC_START---${fileName}---`;
        const stdoutStartMarker = `---STDOUT_CONTENT_START---${fileName}---`;
        const stdoutEndMarker = `---STDOUT_CONTENT_END---${fileName}---`;
        const stderrStartMarker = `---STDERR_CONTENT_START---${fileName}---`;
        const stderrEndMarker = `---STDERR_CONTENT_END---${fileName}---`;
        const execEndPattern = new RegExp(`---EXEC_END---${Pattern.escape(fileName)}---EXIT_CODE=(\\d+)---`);


        const fileOutputSectionMatch = rawContainerOutput.match(new RegExp(Pattern.escape(execStartMarker) + "([\\s\\S]*?)" + Pattern.escape(stdoutStartMarker)));
        if (!fileOutputSectionMatch) {
            console.warn(`Could not find execution start for ${fileName}. Skipping runtime processing.`);
            fileResults.push({ fileName, status: 'script_error', stdout: null, stderr: `Execution markers not found for ${fileName}.`, compileErrorAnalysis: null });
            continue;
        }
        
        const fromExecStart = rawContainerOutput.substring(rawContainerOutput.indexOf(execStartMarker));
        
        let fileStdout = "";
        const stdoutStartIndexFull = fromExecStart.indexOf(stdoutStartMarker);
        const stdoutEndIndexFull = fromExecStart.indexOf(stdoutEndMarker);
        if (stdoutStartIndexFull !== -1 && stdoutEndIndexFull !== -1) {
            fileStdout = fromExecStart.substring(stdoutStartIndexFull + stdoutStartMarker.length, stdoutEndIndexFull).trim();
        }

        let fileStderr = "";
        const stderrStartIndexFull = fromExecStart.indexOf(stderrStartMarker);
        const stderrEndIndexFull = fromExecStart.indexOf(stderrEndMarker);
        if (stderrStartIndexFull !== -1 && stderrEndIndexFull !== -1) {
            fileStderr = fromExecStart.substring(stderrStartIndexFull + stderrStartMarker.length, stderrEndIndexFull).trim();
        }
        
        const exitCodeMatch = fromExecStart.match(execEndPattern);
        const exitCode = exitCodeMatch ? parseInt(exitCodeMatch[1], 10) : -1;

        if (exitCode === 0 && !fileStderr) {
          const formattedStdout = await this.formatWithGPT(fileStdout, `Output of ${fileName}`, analysisResult.outputFormat.type);
          fileResults.push({ fileName, status: 'success', stdout: formattedStdout, stderr: null, compileErrorAnalysis: null });
        } else {
          fileResults.push({
            fileName, status: 'runtime_error', stdout: fileStdout, // Keep raw stdout for context
            stderr: fileStderr || `Execution failed with exit code ${exitCode}.`, compileErrorAnalysis: null,
          });
        }
      }
      
      // Ensure all files in executionOrder have an entry in fileResults
      analysisResult.executionOrder.forEach(fName => {
          if (!fileResults.some(fr => fr.fileName === fName)) {
              fileResults.push({ fileName: fName, status: 'unknown', stdout: null, stderr: 'File was not processed.', compileErrorAnalysis: null });
          }
      });

      return { language: analysisResult.fileType, fileResults };

    } catch (error) {
      console.error('Critical error during code execution process:', error);
      const rawBuildOutputError = buildLogStrings.join('\n');
      const errorMsgForAnalysis = `${error.message}\n${rawBuildOutputError ? `Build Log Snippet:\n${rawBuildOutputError.substring(0, 1000)}` : ''}`;
      const gptErrorAnalysis = await this.analyzeError(errorMsgForAnalysis, analysisResult?.fileType || "unknown");
      
      return {
        language: analysisResult?.fileType || 'unknown',
        fileResults: [],
        error: { // Top-level error object for general failures
          message: `Execution failed: ${error.message}`,
          aiAnalysis: gptErrorAnalysis,
          rawBuildOutput: rawBuildOutputError,
          stack: error.stack
        }
      };
    } finally {
      // Cleanup
      if (container && container.id) { // Check if container object exists and has an id
        try { 
            const cont = docker.getContainer(container.id); // Get a fresh handle
            await cont.stop({ t: 5 }).catch(e => console.warn(`Failed to stop container ${container.id}: ${e.message}`));
            // AutoRemove is true, so remove might not be needed or might fail.
            // await cont.remove().catch(e => console.warn(`Failed to remove container ${container.id}: ${e.message}`));
        } catch (e) { console.error(`Container cleanup error for ${container.id}:`, e.message); }
      }
      if (containerName) {
        try { 
            const image = docker.getImage(containerName); 
            await image.remove({ force: true }).catch(e => console.warn(`Failed to remove image ${containerName}: ${e.message}`));
        } catch (e) { console.error(`Image ${containerName} cleanup error:`, e.message); }
      }
      await fs.rm(tempDir, { recursive: true, force: true }).catch(e => console.error('Temp dir cleanup error:', e.message));
    }
  }

  async readFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return Promise.all(
      entries
        .filter(entry => entry.isFile())
        .map(entry => 
          fs.readFile(path.join(dir, entry.name), 'utf8')
            .then(content => ({ name: entry.name, content }))
        )
    );
  }
  
  async getContextFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return ['Dockerfile', ...entries.filter(e => e.isFile() && e.name !== 'Dockerfile').map(e => e.name)];
  }

  async formatWithGPT(stdout, title, type) {
    if (!stdout || stdout.trim() === "") return "No output.";
    try {
      const prompt = `Format this program output clearly for title "${title}" (type: ${type}):\n\n${stdout}\n\nPresent it readably. If it's numeric, ensure numbers are clear. For text, maintain structure.`;
      const response = await openai.chat.completions.create({
        model: "gpt-4", messages: [{ role: "user", content: prompt }], temperature: 0.2
      });
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error formatting output with GPT:', error);
      return `Raw Output (GPT formatting failed):\n${stdout}`;
    }
  }

  async analyzeError(errorMsg, language) {
    if (!errorMsg || errorMsg.trim() === "") return { explanation: "No error message provided.", location: "", solution: "", type: "unknown" };
    try {
      const prompt = `Analyze this ${language} error. Explain simply: 1. What's wrong. 2. Error location. 3. How to fix. Format as JSON: {"explanation": "", "location": "", "solution": "", "type": "syntax|runtime|build|unknown"}\nError:\n${errorMsg}`;
      const response = await openai.chat.completions.create({
        model: "gpt-4", messages: [{ role: "user", content: prompt }], temperature: 0.2
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing with GPT:', error);
      return { explanation: "Failed to analyze error with AI.", location: "N/A", solution: "Review the raw error message.", type: "analysis_failed" };
    }
  }
}

// Helper for RegExp escaping
Pattern = {
    escape: function(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
};

module.exports = new CodeExecutionService();
