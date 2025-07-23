const Docker = require('dockerode');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const axios = require('axios');
const { Client } = require('ssh2'); // For EC2 SSH connection
// Gemini API is used for code analysis and related tasks (see analyzeCode method)
const WebSocket = require('ws'); // Used for type checking WebSocket.OPEN

// Configure Docker
const docker = new Docker({
  host: '13.53.42.198',
  port: 2375,
  protocol: 'http'
});

// Configure EC2 for Jupyter notebook execution
const ec2Config = {
  host: '16.16.75.204',
  username: 'ubuntu', // Default for Ubuntu AMI
  // TODO: Configure SSH authentication - options:
  // 1. privateKey: require('fs').readFileSync('/path/to/your/key.pem')
  // 2. password: 'your-password'
  // 3. agent: process.env.SSH_AUTH_SOCK (for SSH agent forwarding)
  // For now, we'll try multiple authentication methods
  tryKeyboard: true,
  algorithms: {
    kex: [
      'ecdh-sha2-nistp256',
      'ecdh-sha2-nistp384', 
      'ecdh-sha2-nistp521',
      'diffie-hellman-group14-sha256',
      'diffie-hellman-group16-sha512',
      'diffie-hellman-group18-sha512',
      'diffie-hellman-group14-sha1'
    ],
    serverHostKey: [
      'rsa-sha2-512',
      'rsa-sha2-256', 
      'ecdsa-sha2-nistp256',
      'ecdsa-sha2-nistp384',
      'ecdsa-sha2-nistp521',
      'ssh-rsa',
      'ssh-dss'
    ],
    cipher: [
      'aes128-ctr',
      'aes192-ctr', 
      'aes256-ctr',
      'aes128-gcm',
      'aes256-gcm'
    ],
    hmac: [
      'hmac-sha2-256',
      'hmac-sha2-512',
      'hmac-sha1'
    ]
  }
};

// Gemini API is now used for code analysis (see analyzeCode method)

// Store active interactive sessions
const activeInteractiveSessions = new Map(); // containerId -> { container, imageName, stream, wsConnections: Set<WebSocket>, lastActivity, analysisCommands: { build: string, run: string }, initialCommandsSent: boolean }

class CodeExecutionService {
  async analyzeCode(files) {
    if (!files || files.length === 0) {
      throw new Error('No files found to analyze');
    }

    // Check for Jupyter notebook files first
    const notebookFiles = files.filter(f => f.name.endsWith('.ipynb'));
    if (notebookFiles.length > 0) {
      console.log('Jupyter notebook detected:', notebookFiles.map(f => f.name));
      return {
        fileType: 'jupyter',
        projectType: 'notebook',
        isNotebook: true,
        mainFile: notebookFiles[0].name,
        notebookFiles: notebookFiles.map(f => f.name),
        message: 'Jupyter notebook project detected. Will execute on EC2 instance.'
      };
    }

    // Check if this is a MERN stack project
    const hasFrontendDir = files.some(f => f.name.includes('frontend/') || f.name.includes('client/'));
    const hasBackendDir = files.some(f => f.name.includes('backend/') || f.name.includes('server/'));
    const hasPackageJson = files.some(f => f.name === 'package.json' || f.name.includes('package.json'));

    if (hasFrontendDir && hasBackendDir && hasPackageJson) {
      return {
        fileType: 'mern',
        projectType: 'mern',
        isMERNStack: true,
        message: 'MERN stack project detected. Use MERN execution endpoint.'
      };
    }

    const codeContent = files.map(f => `File: ${f.name}\nContent:\n${f.content}`).join('\n\n');
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Gemini analysis attempt ${attempt}/${maxRetries}`);

        const prompt = `Analyze these code files and provide information in this exact JSON format:
{
  "mainFile": "string, name of the main file that should be executed first (if applicable, else pick one)",
  "fileType": "string, language type (cpp, java, python)",
  "dependencyInstallCommands": ["string"],
  "executionOrder": ["string"],
  "buildCommand": "string",
  "runCommand": "string",
  "outputFormat": {
    "title": "string",
    "type": "string"
  }
}

Code files:
${codeContent}`;

        const geminiRes = await axios.post(
           'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',


          {
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': process.env.GEMINI_API_KEY
            }
          }
        );

        const geminiText = geminiRes.data.candidates[0]?.content?.parts[0]?.text?.trim();
        if (!geminiText) {
          throw new Error('No response content from Gemini');
        }

        let analysis;
        try {
          // Remove Markdown code block wrappers if present
          let cleanText = geminiText.trim();
          // Remove triple backticks and optional json after them
          cleanText = cleanText.replace(/^```json\s*|^```\s*|```$/gim, '');
          // Remove any leading/trailing backticks or whitespace
          cleanText = cleanText.replace(/^```[a-zA-Z]*\s*|```$/g, '').trim();
          analysis = JSON.parse(cleanText);
        } catch (parseError) {
          console.error(`JSON parse error on attempt ${attempt}:`, parseError);
          // Try to extract JSON object from within the text
          const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              analysis = JSON.parse(jsonMatch[0]);
            } catch (innerErr) {
              throw innerErr;
            }
          } else {
            throw parseError;
          }
        }

        const requiredFields = ['mainFile', 'fileType', 'dependencyInstallCommands', 'executionOrder', 'buildCommand', 'runCommand', 'outputFormat'];
        const missingFields = requiredFields.filter(field => !(field in analysis));
        if (missingFields.length > 0) {
          throw new Error(`Invalid analysis format. Missing fields: ${missingFields.join(', ')}`);
        }

        const mainExt = analysis.mainFile.split('.').pop().toLowerCase();
        analysis.baseImage = this.getBaseImage(mainExt, analysis.fileType);
        return analysis;

      } catch (error) {
        lastError = error;
        console.error(`Analysis attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          console.error('All analysis attempts failed');
          throw new Error(`Failed to analyze code files with Gemini after ${maxRetries} attempts: ${lastError.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 5000)));
      }
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

  generateDockerfile(analysis, interactive = false) {
    let dockerfile = `FROM ${analysis.baseImage}\nWORKDIR /app\n`;

    // If python dependencies are in requirements.txt, copy it over first for caching.
    if (analysis.dependencyInstallCommands?.some(cmd => cmd.includes('requirements.txt'))) {
      dockerfile += `COPY requirements.txt .\n`;
    }

    // Add dependency installation step
    if (analysis.dependencyInstallCommands && analysis.dependencyInstallCommands.length > 0) {
      dockerfile += `RUN ${analysis.dependencyInstallCommands.join(' && ')}\n`;
    }

    dockerfile += `COPY . .\n`;

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

    if (interactive) {
      // For interactive mode, provide a shell.
      dockerfile += `ENV PS1="[container@\\h \\W]\\$ "\n`; // Basic prompt for sh/bash
      dockerfile += `CMD ["/bin/sh"]`; // Default to /bin/sh, more universally available
    } else {
      dockerfile += `COPY run_script.sh .\nRUN chmod +x run_script.sh\nCMD ["./run_script.sh"]`;
    }
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
      console.log('Code analysis by Gemini:', analysisResult);

      // Handle Jupyter notebook execution
      if (analysisResult.isNotebook) {
        return await this.executeNotebookOnEC2(tempDir, analysisResult);
      }

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
      const aiErrorAnalysis = await this.analyzeError(errorMsgForAnalysis, analysisResult?.fileType || "unknown");
      
      return {
        language: analysisResult?.fileType || 'unknown',
        fileResults: [],
        error: { // Top-level error object for general failures
          message: `Execution failed: ${error.message}`,
          aiAnalysis: aiErrorAnalysis,
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

  async executeInteractiveCode(fileUrl) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `interactive-code-${Date.now()}`));
    const uniqueId = Date.now();
    const imageName = `interactive-image-${uniqueId}`;
    const containerName = `interactive-container-${uniqueId}`; // Docker container names must be unique
    let analysisResult = null;

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
      console.log('Interactive Code analysis by Gemini:', analysisResult);

      // Handle Jupyter notebook - automatically redirect to regular execution
      if (analysisResult.isNotebook) {
        console.log('Jupyter notebook detected in interactive request - redirecting to regular notebook execution');
        return await this.executeNotebookOnEC2(tempDir, analysisResult);
      }

      const dockerfileContent = this.generateDockerfile(analysisResult, true); // Generate Dockerfile for interactive mode
      await fs.writeFile(path.join(tempDir, 'Dockerfile'), dockerfileContent);
      console.log('Generated Interactive Dockerfile content:\n', dockerfileContent);

      const buildStream = await docker.buildImage(
        { context: tempDir, src: await this.getContextFiles(tempDir) },
        { t: imageName, nocache: true, forcerm: true, q: false } // q:false for verbose build output
      );

      await new Promise((resolve, reject) => {
        docker.modem.followProgress(buildStream, (err, res) => {
          if (err) return reject(err);
          const lastResponse = res && res.length > 0 ? res[res.length - 1] : null;
          if (lastResponse && lastResponse.errorDetail) {
            console.error('Build error detail:', lastResponse.errorDetail.message);
            // Log full build output for debugging
            // res.forEach(event => console.log(event.stream || event.status || event.progressDetail || event.errorDetail));
            return reject(new Error(lastResponse.errorDetail.message));
          }
          resolve(res);
        });
      });
      
      const container = await docker.createContainer({
        Image: imageName,
        name: containerName, // Assign a unique name
        AttachStdin: true,
        OpenStdin: true,
        Tty: true, 
        HostConfig: {
          // AutoRemove: false, // Explicitly false or not set, so container persists
          Memory: 512 * 1024 * 1024, 
          NanoCpus: 1 * 1000000000, 
        },
      });

      await container.start();

      activeInteractiveSessions.set(container.id, { 
        container, 
        imageName, 
        wsConnections: new Set(), 
        lastActivity: Date.now(),
        stream: null, // Stream will be attached on first WebSocket connection
        analysisCommands: { // Store commands from analysis
          build: analysisResult.buildCommand,
          run: analysisResult.runCommand
        },
        initialCommandsSent: false // Flag to send commands only once
      });
      
      console.log(`Interactive container ${container.id} (name: ${containerName}) started with image ${imageName}`);
      return { containerId: container.id, language: analysisResult.fileType };

    } catch (error) {
      console.error('Error starting interactive code session:', error);
      if (imageName) {
        docker.getImage(imageName).remove({ force: true }).catch(e => console.warn(`Cleanup error for image ${imageName} during interactive start failure: ${e.message}`));
      }
      // If container was created but failed before adding to map, try to remove it by name
      if (containerName && !activeInteractiveSessions.has(containerName)) { // Assuming container.id would be set if created
          try {
            const possiblyCreatedContainer = docker.getContainer(containerName);
            await possiblyCreatedContainer.remove({ force: true, v: true });
          } catch (e) {
            // Ignore if not found
          }
      }
      throw error;
    } finally {
      if (tempDir) await fs.rm(tempDir, { recursive: true, force: true }).catch(e => console.error('Temp dir cleanup error in finally (interactive):', e.message));
    }
  }

  async attachToContainerStreams(containerId, ws) {
    const session = activeInteractiveSessions.get(containerId);
    if (!session || !session.container) {
      ws.send('\r\nError: Container not found or not active.\r\n');
      ws.close();
      console.log(`[${containerId}] Attach attempt failed: Session or container not found.`);
      return;
    }
    console.log(`[${containerId}] Attaching WebSocket. Current connections: ${session.wsConnections.size}`);

    session.wsConnections.add(ws);
    session.lastActivity = Date.now();

    if (!session.stream) {
        console.log(`[${containerId}] No existing stream. Creating and attaching new stream.`);
        try {
            const stream = await session.container.attach({
              stream: true, stdin: true, stdout: true, stderr: true, logs: false
            });
            session.stream = stream;
            console.log(`[${containerId}] Docker stream attached successfully.`);

            // Send an initial newline to "wake up" the shell and prompt
            if (stream.writable) {
                stream.write('\n', 'utf8', (err) => {
                    if (err) {
                        console.error(`[${containerId}] Error writing initial newline to container stream:`, err);
                    } else {
                        console.log(`[${containerId}] Sent initial newline to container stream.`);
                        
                        // Automatically send build and run commands if not already sent
                        if (!session.initialCommandsSent && session.analysisCommands) {
                            const { build, run } = session.analysisCommands;
                            let commandsToSend = "";
                            if (build) {
                                console.log(`[${containerId}] Auto-sending build command: ${build}`);
                                commandsToSend += `${build}\n`;
                            }
                            if (run) {
                                console.log(`[${containerId}] Auto-sending run command: ${run}`);
                                commandsToSend += `${run}\n`;
                            }

                            if (commandsToSend && stream.writable) {
                                stream.write(commandsToSend, 'utf8', (cmdErr) => {
                                    if (cmdErr) {
                                        console.error(`[${containerId}] Error auto-sending commands:`, cmdErr);
                                    } else {
                                        console.log(`[${containerId}] Auto-sent initial commands.`);
                                        session.initialCommandsSent = true;
                                        activeInteractiveSessions.set(containerId, session); // Update session in map
                                    }
                                });
                            } else if (!commandsToSend) {
                                // No commands to send, mark as sent to avoid re-check
                                session.initialCommandsSent = true;
                                activeInteractiveSessions.set(containerId, session);
                            }
                        }
                    }
                });
            } else {
                console.warn(`[${containerId}] Container stream not writable for initial newline.`);
            }


            stream.on('data', (chunk) => {
              console.log(`[${containerId}] Data from container stream:`, chunk.toString()); 
              session.wsConnections.forEach(clientWs => {
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(chunk);
                }
              });
              session.lastActivity = Date.now();
            });

            stream.on('end', () => {
              console.log(`[${containerId}] Docker stream ended.`);
              session.wsConnections.forEach(clientWs => {
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send('\r\nContainer stream ended.\r\n');
                  // clientWs.close(); // Optionally close WebSocket from server side
                }
              });
              // Consider auto-cleanup or marking for cleanup
            });
            stream.on('error', (err) => {
                console.error(`[${containerId}] Docker stream error:`, err);
                session.wsConnections.forEach(clientWs => {
                    if (clientWs.readyState === WebSocket.OPEN) {
                        clientWs.send(`\r\nContainer stream error: ${err.message}\r\n`);
                    }
                });
            });
        } catch (attachError) {
            console.error(`[${containerId}] Failed to attach to container streams:`, attachError);
            ws.send(`\r\nError: Could not attach to container streams: ${attachError.message}\r\n`);
            ws.close();
            session.wsConnections.delete(ws); // Remove this ws since attach failed
            // If attach fails, the session might be corrupted, consider cleaning it up.
            if (session.wsConnections.size === 0) {
                // Check if container is still considered running by Docker before attempting to stop
                try {
                    const containerInfo = await session.container.inspect();
                    if (containerInfo.State.Running) {
                        console.log(`[${containerId}] Cleaning up session after attach error as no connections left and container was running.`);
                        this.stopInteractiveContainer(containerId).catch(e => console.error(`[${containerId}] Cleanup failed after attach error:`, e));
                    } else {
                        console.log(`[${containerId}] Session had attach error, no connections left, container not running. Removing from active sessions.`);
                        activeInteractiveSessions.delete(containerId); // Just remove from map if not running
                    }
                } catch (inspectError) {
                    console.error(`[${containerId}] Error inspecting container during attach error cleanup: ${inspectError.message}. Removing from active sessions.`);
                    activeInteractiveSessions.delete(containerId); // Remove from map on inspect error
                }
            }
            return;
        }
    } else {
        console.log(`[${containerId}] Reusing existing stream for new WebSocket connection.`);
        // If reusing stream, also try to send a newline to ensure prompt for new connection
        // Do not resend initial build/run commands for subsequent connections to the same session.
        if (session.stream.writable) {
            session.stream.write('\n', 'utf8', (err) => {
                if (err) {
                    console.error(`[${containerId}] Error writing newline to reused container stream:`, err);
                } else {
                    console.log(`[${containerId}] Sent newline to reused container stream for new WS connection.`);
                }
            });
        }
    }
    
    ws.on('message', (message) => {
      // Log the message received from frontend
      const messageString = (typeof message === 'string') ? message : (message instanceof Buffer ? message.toString() : 'Non-string/buffer message');
      console.log(`[${containerId}] Message from WebSocket client (type: ${typeof message}, content: '${messageString.replace(/\r/g, '\\r').replace(/\n/g, '\\n')}')`); 
      
      if (session.stream && session.container) { // Check if stream is still valid
        try {
            session.stream.write(message); // message is Buffer or string from ws
            session.lastActivity = Date.now();
        } catch (error) {
            console.error(`[${containerId}] Error writing to container stream:`, error);
            if (ws.readyState === WebSocket.OPEN) {
                 ws.send(`\r\nError writing to container: ${error.message}\r\n`);
            }
        }
      } else {
         if (ws.readyState === WebSocket.OPEN) {
            ws.send('\r\nError: Container stream not available.\r\n');
         }
         console.warn(`[${containerId}] Attempted to write to a non-existent or closed stream.`);
      }
    });

    ws.on('close', (code, reason) => {
      session.wsConnections.delete(ws);
      session.lastActivity = Date.now();
      const reasonString = reason instanceof Buffer ? reason.toString() : reason;
      console.log(`[${containerId}] WebSocket disconnected. Code: ${code}, Reason: ${reasonString}. Remaining connections: ${session.wsConnections.size}`); // Added log & reason to string
    });
     ws.on('error', (error) => {
        console.error(`[${containerId}] WebSocket error for client:`, error); // Added log
        session.wsConnections.delete(ws); // Ensure removal on error
    });
  }

  async stopInteractiveContainer(containerId) {
    const session = activeInteractiveSessions.get(containerId);
    if (!session) {
      console.warn(`Attempted to stop non-existent or already cleaned up session: ${containerId}`);
      return { success: false, message: 'Session not found or already stopped.' };
    }

    const { container, imageName, stream, wsConnections } = session;

    // Notify all clients and close their connections
    wsConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('\r\nContainer session is being terminated by the server.\r\n');
        ws.terminate(); // Force close
      }
    });

    try {
      if (stream) {
        stream.destroy ? stream.destroy() : stream.end();
      }

      if (container) {
        try {
            const containerInfo = await container.inspect(); // Check if it exists
            if (containerInfo.State.Running) {
                 await container.stop({ t: 5 }); // 5 seconds timeout
            }
            await container.remove({ v: true, force: true }); // v: remove volumes, force: if can't stop
            console.log(`Container ${containerId} (name: ${containerInfo.Name}) stopped and removed.`);
        } catch (err) {
            console.warn(`Error during container stop/remove for ${containerId} (may already be gone or in error state): ${err.message}`);
            // Fallback: try to remove by ID if the object is stale or name if ID is not available
            const actualContainerId = container.id || containerId; // container.id is usually the full ID
            try {
                const contToForceRemove = docker.getContainer(actualContainerId);
                await contToForceRemove.remove({ force: true, v: true });
                console.log(`Force removed container ${actualContainerId}.`);
            } catch (forceRemoveErr) {
                console.warn(`Force remove failed for ${actualContainerId}: ${forceRemoveErr.message}`);
            }
        }
      }
      
      if (imageName) {
        try {
            const image = docker.getImage(imageName);
            await image.remove({ force: true });
            console.log(`Image ${imageName} removed.`);
        } catch (imgErr) {
            console.warn(`Failed to remove image ${imageName}: ${imgErr.message}`);
        }
      }
    } catch (error) {
      console.error(`Error during full cleanup of interactive container ${containerId}:`, error);
      // Log error but proceed to remove from map
    } finally {
      activeInteractiveSessions.delete(containerId);
      console.log(`Session ${containerId} definitively cleaned from active sessions map.`);
    }
    return { success: true, message: 'Container and associated resources have been requested for cleanup.' };
  }

  async getInteractiveContainerStatus(containerId) {
    const session = activeInteractiveSessions.get(containerId);
    if (!session || !session.container) {
      // If not in map, double check with Docker by ID in case map is stale
      try {
        const cont = docker.getContainer(containerId);
        const data = await cont.inspect();
         return { 
            status: data.State.Status, 
            running: data.State.Running,
            id: data.Id,
            message: "Session not in active map but found in Docker." 
        };
      } catch (e) {
         return { status: 'not_found', message: 'Container session not found in active map or Docker.' };
      }
    }
    try {
      const data = await session.container.inspect();
      return { 
        status: data.State.Status, 
        running: data.State.Running,
        startedAt: data.State.StartedAt,
        image: data.Config.Image,
        id: data.Id
      };
    } catch (error) {
      console.error(`Error inspecting container ${containerId}:`, error);
      if (error.statusCode === 404) { // Not Found
        activeInteractiveSessions.delete(containerId); // Clean up map
        return { status: 'not_found', message: 'Container not found (removed from Docker).' };
      }
      return { status: 'error', message: `Error inspecting container: ${error.message}` };
    }
  }

  cleanupIdleSessions() {
    const idleTimeout = 30 * 60 * 1000; // 30 minutes
    const absoluteTimeout = 2 * 60 * 60 * 1000; // 2 hours absolute max lifetime

    activeInteractiveSessions.forEach(async (session, containerId) => {
      const sessionAge = Date.now() - (new Date(session.container?.Created || session.lastActivity).getTime());

      if (sessionAge > absoluteTimeout) {
        console.log(`Session ${containerId} exceeded absolute timeout (${absoluteTimeout / 60000}m). Cleaning up...`);
        await this.stopInteractiveContainer(containerId);
      } else if (session.wsConnections.size === 0 && (Date.now() - session.lastActivity > idleTimeout)) {
        console.log(`Session ${containerId} is idle for over ${idleTimeout / 60000}m. Cleaning up...`);
        await this.stopInteractiveContainer(containerId);
      }
    });
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
      const prompt = `Format this program output clearly for title \"${title}\" (type: ${type}):\n\n${stdout}\n\nPresent it readably. If it's numeric, ensure numbers are clear. For text, maintain structure.`;
      const geminiRes = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': process.env.GEMINI_API_KEY
          }
        }
      );
      const geminiText = geminiRes.data.candidates[0]?.content?.parts[0]?.text?.trim();
      if (!geminiText) {
        throw new Error('No response content from Gemini');
      }
      return geminiText;
    } catch (error) {
      console.error('Error formatting output with Gemini:', error);
      return `Raw Output (Gemini formatting failed):\n${stdout}`;
    }
  }

  async analyzeNotebookError(errorMsg, cellErrors, errorDetails) {
    if (!errorMsg || errorMsg.trim() === "") {
      return { 
        explanation: "No error message provided.", 
        suggestions: [], 
        errorSummary: "No errors detected",
        cellAnalysis: []
      };
    }
    
    try {
      const prompt = `Analyze this Jupyter notebook execution error. Provide a comprehensive analysis including:

1. Overall error summary
2. Specific explanations for each error type
3. Actionable suggestions to fix the issues
4. Common causes and solutions

Error Details:
${errorMsg}

Cell-specific errors:
${cellErrors.map(err => `Cell ${err.cell_index} (${err.category}): ${err.error_name || err.error} - ${err.error_value || err.error}`).join('\n')}

Error Context:
${errorDetails ? `Main Error: ${errorDetails.error_type} - ${errorDetails.error_message} (Category: ${errorDetails.category})` : 'Multiple cell-level errors'}

Format response as JSON:
{
  "explanation": "Brief overall explanation of what went wrong",
  "errorSummary": "One-sentence summary of the main issues",
  "suggestions": ["specific action 1", "specific action 2", ...],
  "cellAnalysis": [
    {
      "cellIndex": number,
      "issue": "what's wrong in this cell",
      "fix": "how to fix it",
      "category": "error type"
    }
  ],
  "commonCauses": ["likely cause 1", "likely cause 2"],
  "severity": "low|medium|high"
}`;

      const geminiRes = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': process.env.GEMINI_API_KEY
          }
        }
      );

      const geminiText = geminiRes.data.candidates[0]?.content?.parts[0]?.text?.trim();
      if (!geminiText) {
        throw new Error('No response content from Gemini');
      }

      // Clean up the response to extract JSON
      let cleanText = geminiText.trim();
      cleanText = cleanText.replace(/^```json\s*|^```\s*|```$/gim, '');
      cleanText = cleanText.replace(/^```[a-zA-Z]*\s*|```$/g, '').trim();
      
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }

      const analysis = JSON.parse(cleanText);
      
      // Ensure all required fields are present
      return {
        explanation: analysis.explanation || "Failed to analyze error",
        errorSummary: analysis.errorSummary || "Error analysis unavailable",
        suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions : ["Review error messages manually"],
        cellAnalysis: Array.isArray(analysis.cellAnalysis) ? analysis.cellAnalysis : [],
        commonCauses: Array.isArray(analysis.commonCauses) ? analysis.commonCauses : [],
        severity: analysis.severity || "medium"
      };
      
    } catch (error) {
      console.error('Error analyzing notebook error with Gemini:', error);
      return { 
        explanation: "Failed to analyze notebook errors with AI", 
        errorSummary: "AI analysis failed",
        suggestions: ["Review the raw error messages below", "Check notebook cell syntax", "Verify all required packages are installed"],
        cellAnalysis: cellErrors.map(err => ({
          cellIndex: err.cell_index,
          issue: `${err.error_name || err.error}: ${err.error_value || err.error}`,
          fix: "Review and fix the code in this cell",
          category: err.category || "unknown"
        })),
        commonCauses: ["Syntax errors", "Missing dependencies", "Runtime exceptions"],
        severity: "medium"
      };
    }
  }

  async analyzeError(errorMsg, language) {
    if (!errorMsg || errorMsg.trim() === "") return { explanation: "No error message provided.", location: "", solution: "", type: "unknown" };
    try {
      const prompt = `Analyze this ${language} error. Explain simply: 1. What's wrong. 2. Error location. 3. How to fix. Format as JSON: {\"explanation\": \"\", \"location\": \"\", \"solution\": \"\", \"type\": \"syntax|runtime|build|unknown\"}\nError:\n${errorMsg}`;
      const geminiRes = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': process.env.GEMINI_API_KEY
          }
        }
      );
      const geminiText = geminiRes.data.candidates[0]?.content?.parts[0]?.text?.trim();
      if (!geminiText) {
        throw new Error('No response content from Gemini');
      }

      // Clean up the response to extract JSON
      let cleanText = geminiText.trim();
      // Remove Markdown code block wrappers if present
      cleanText = cleanText.replace(/^```json\s*|^```\s*|```$/gim, '');
      cleanText = cleanText.replace(/^```[a-zA-Z]*\s*|```$/g, '').trim();
      
      // Try to extract JSON object from within the text if there are extra characters
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }

      return JSON.parse(cleanText);
    } catch (error) {
      console.error('Error analyzing with Gemini:', error);
      return { explanation: "Failed to analyze error with AI.", location: "N/A", solution: "Review the raw error message.", type: "analysis_failed" };
    }
  }

  async analyzeTerminalOutputAndStructure(terminalLog, languageHint) {
    if (!terminalLog || terminalLog.trim() === "") {
      return { structuredSummary: "No terminal output provided to analyze." };
    }

    // Remove ANSI escape codes (colors, etc.) from the log for cleaner analysis
    const cleanLog = terminalLog.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

    const prompt = `
Given the following terminal log from a code execution session (language hint: ${languageHint}), provide a structured summary.
The summary should identify each distinct program/file execution attempt.
For each attempt, detail:
1. The file name (e.g., ArrayInput.java, HelloWorld.py).
2. A brief description of what the program likely does based on its output or name.
3. The actual output produced by the program.
4. Any errors encountered during its compilation or execution, including a simple explanation of the error.

Format the output as a JSON array, where each object in the array represents a file/program execution attempt and has the following structure:
{
  "fileName": "string",
  "description": "string",
  "output": "string (actual program output, be concise)",
  "errors": [ // Array of error objects, if any
    {
      "type": "string (e.g., Compile Error, Runtime Error)",
      "message": "string (the error message)",
      "explanation": "string (simple explanation of the error)"
    }
  ],
  "status": "string (e.g., Success, Success with Warnings, Compilation Failed, Runtime Error)"
}

If the log shows commands being typed but no clear program execution (e.g., just 'ls', 'pwd'), you can summarize those as "Shell Commands" or ignore them if they are not relevant to program execution. Focus on actual program runs.

Terminal Log:
\`\`\`
${cleanLog}
\`\`\`
`;

    try {
      const geminiRes = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': process.env.GEMINI_API_KEY
          }
        }
      );
      const geminiText = geminiRes.data.candidates[0]?.content?.parts[0]?.text?.trim();
      if (!geminiText) {
        throw new Error('No response content from Gemini');
      }
      // Remove Markdown code block wrappers if present
      let cleanText = geminiText.trim();
      cleanText = cleanText.replace(/^```json\s*|^```\s*|```$/gim, '');
      cleanText = cleanText.replace(/^```[a-zA-Z]*\s*|```$/g, '').trim();
      const analysis = JSON.parse(cleanText);
      return { structuredSummary: analysis };
    } catch (error) {
      console.error('Gemini analysis error for terminal output:', error);
      throw new Error('Failed to analyze terminal output with Gemini.');
    }
  }

  // New methods for Jupyter notebook execution on EC2
  async executeNotebookOnEC2(tempDir, analysisResult) {
    console.log('Executing Jupyter notebook on EC2...');
    const notebookFile = analysisResult.notebookFiles[0]; // Use the first notebook file
    const notebookPath = path.join(tempDir, notebookFile);
    
    try {
      // Read the notebook content
      const notebookContent = await fs.readFile(notebookPath, 'utf8');
      
      // Execute notebook on EC2
      const executionResult = await this.executeNotebookRemotely(notebookContent, notebookFile);
      
      // Process the execution result
      if (executionResult.success) {
        return {
          language: 'jupyter',
          fileResults: [{
            fileName: notebookFile,
            status: 'success',
            stdout: executionResult.htmlContent || null,
            stderr: null,
            isNotebook: true,
            contentType: 'text/html',
            rawOutput: null,
            generatedFiles: executionResult.generatedFiles || [],
            workDir: executionResult.workDir, // Pass the workDir for downloads
            executionDetails: {
              success: true,
              message: executionResult.message
            }
          }]
        };
      } else {
        // Handle execution with errors or partial success
        const fileResult = {
          fileName: notebookFile,
          status: executionResult.hasPartialResults ? 'partial_success' : 'error',
          stdout: executionResult.htmlContent || null,
          stderr: null,
          isNotebook: true,
          contentType: 'text/html',
          rawOutput: executionResult.rawOutput || null,
          generatedFiles: executionResult.generatedFiles || [], // Include generated files even with errors
          workDir: executionResult.workDir, // Pass the workDir for downloads
          executionDetails: {
            success: false,
            message: executionResult.message,
            hasPartialResults: executionResult.hasPartialResults
          },
          notebookErrors: {
            syntaxErrors: executionResult.syntaxErrors || [],
            cellErrors: executionResult.cellErrors || [],
            errorDetails: executionResult.errorDetails,
            aiAnalysis: executionResult.aiAnalysis
          }
        };

        return {
          language: 'jupyter',
          fileResults: [fileResult],
          hasErrors: true,
          errorSummary: executionResult.aiAnalysis?.errorSummary || 'Notebook execution encountered errors'
        };
      }
    } catch (error) {
      console.error('Notebook execution error:', error);
      
      // Analyze the error with AI
      const aiAnalysis = await this.analyzeNotebookError(error.message, [], {
        error_type: error.constructor.name,
        error_message: error.message,
        category: 'system',
        traceback: error.stack
      });

      return {
        error: {
          message: `Failed to execute Jupyter notebook: ${error.message}`,
          aiAnalysis,
          rawBuildOutput: error.stack,
          category: 'system_error'
        }
      };
    }
  }

  async executeNotebookRemotely(notebookContent, fileName) {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      let htmlContent = '';
      let errorOutput = '';
      
      // Create a unique working directory
      const workDir = `notebook_${Date.now()}`;
      const fullWorkDir = `/tmp/${workDir}`;
      
      conn.on('ready', () => {
        console.log('SSH connection established to EC2');
        
        const notebookPath = `${fullWorkDir}/${fileName}`;
        const htmlPath = `${fullWorkDir}/${fileName.replace('.ipynb', '.html')}`;
        
        // Execute commands sequentially
        const commands = [
          `mkdir -p ${fullWorkDir}`,
          `cat > ${notebookPath} << 'EOF'\n${notebookContent}\nEOF`,
          `cd ${fullWorkDir}`,
          `cd ${fullWorkDir} && source /home/ubuntu/venv/bin/activate && python -c "
import sys
import json
import traceback
import os
import re

# Change to the working directory
os.chdir('${fullWorkDir}')
print(f'Current working directory: {os.getcwd()}')
print('Files in directory:', os.listdir('.'))

def categorize_error(error_str, traceback_str):
    '''Categorize the type of error for better handling'''
    error_lower = error_str.lower()
    traceback_lower = traceback_str.lower()
    
    # Syntax errors
    if 'syntaxerror' in error_lower or 'indentationerror' in error_lower:
        return 'syntax'
    
    # Import/dependency errors
    if 'modulenotfounderror' in error_lower or 'importerror' in error_lower:
        return 'dependency'
    
    # Runtime errors
    if any(err in error_lower for err in ['nameerror', 'typeerror', 'valueerror', 'attributeerror', 'keyerror', 'indexerror']):
        return 'runtime'
    
    # File/IO errors
    if 'filenotfounderror' in error_lower or 'permissionerror' in error_lower:
        return 'file_io'
    
    # Timeout or execution errors
    if 'timeout' in error_lower or 'execution' in error_lower:
        return 'execution'
    
    return 'unknown'

def extract_cell_errors(nb):
    '''Extract errors from executed notebook cells'''
    cell_errors = []
    for i, cell in enumerate(nb.cells):
        if cell.cell_type == 'code' and hasattr(cell, 'outputs'):
            for output in cell.outputs:
                if output.output_type == 'error':
                    cell_errors.append({
                        'cell_index': i + 1,
                        'error_name': output.get('ename', 'Unknown'),
                        'error_value': output.get('evalue', ''),
                        'traceback': '\\n'.join(output.get('traceback', [])),
                        'category': categorize_error(
                            output.get('ename', '') + ' ' + output.get('evalue', ''),
                            '\\n'.join(output.get('traceback', []))
                        )
                    })
    return cell_errors

try:
    import nbformat
    import nbclient
    from nbconvert import HTMLExporter
    
    print('Reading notebook file: ${fileName}')
    with open('${fileName}', 'r') as f:
        nb = nbformat.read(f, as_version=4)
    print(f'Notebook loaded successfully with {len(nb.cells)} cells')
    
    # Check for basic syntax issues in cells before execution
    syntax_errors = []
    for i, cell in enumerate(nb.cells):
        if cell.cell_type == 'code' and cell.source.strip():
            try:
                compile(cell.source, f'<cell_{i+1}>', 'exec')
            except SyntaxError as e:
                syntax_errors.append({
                    'cell_index': i + 1,
                    'error': str(e),
                    'line': e.lineno,
                    'text': e.text.strip() if e.text else '',
                    'category': 'syntax'
                })
    
    if syntax_errors:
        print('NOTEBOOK_SYNTAX_ERRORS_DETECTED')
        print('SYNTAX_ERRORS_START')
        print(json.dumps(syntax_errors, indent=2))
        print('SYNTAX_ERRORS_END')
        # Continue execution anyway to see how far we get
    
    print('Executing notebook...')
    client = nbclient.NotebookClient(nb, timeout=300)  # 5 minute timeout
    
    execution_successful = True
    try:
        client.execute()
        print('Notebook execution completed successfully')
    except Exception as exec_error:
        execution_successful = False
        print(f'Notebook execution failed: {str(exec_error)}')
        print('Execution error traceback:')
        traceback.print_exc()
        
        # Still try to extract partial results and cell-level errors
        cell_errors = extract_cell_errors(nb)
        if cell_errors:
            print('CELL_ERRORS_START')
            print(json.dumps(cell_errors, indent=2))
            print('CELL_ERRORS_END')
    
    print('Converting to HTML...')
    html_exporter = HTMLExporter()
    (body, resources) = html_exporter.from_notebook_node(nb)
    
    print('Writing HTML output...')
    with open('notebook_output.html', 'w') as f:
        f.write(body)
    print('HTML file written successfully')
    
    # Check for generated CSV files and other output files
    generated_files = []
    current_files = os.listdir('.')
    csv_files = [f for f in current_files if f.endswith('.csv') and f != '${fileName}']
    
    if csv_files:
        print('GENERATED_CSV_FILES_DETECTED')
        for csv_file in csv_files:
            try:
                # Get file size and basic info
                file_size = os.path.getsize(csv_file)
                
                # Read first few lines to get preview
                with open(csv_file, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    preview = ''.join(lines[:5])  # First 5 lines
                    total_lines = len(lines)
                
                generated_files.append({
                    'fileName': csv_file,
                    'fileType': 'csv',
                    'fileSize': file_size,
                    'totalLines': total_lines,
                    'preview': preview,
                    'fullPath': os.path.abspath(csv_file)
                })
                print(f'Found CSV file: {csv_file} ({file_size} bytes, {total_lines} lines)')
            except Exception as csv_error:
                print(f'Error reading CSV file {csv_file}: {str(csv_error)}')
                generated_files.append({
                    'fileName': csv_file,
                    'fileType': 'csv',
                    'error': str(csv_error),
                    'fullPath': os.path.abspath(csv_file)
                })
    
    # Also check for other common output file types
    other_output_files = [f for f in current_files if f.endswith(('.txt', '.json', '.xml', '.log')) and f not in ['notebook_output.html', '${fileName}']]
    for output_file in other_output_files:
        try:
            file_size = os.path.getsize(output_file)
            with open(output_file, 'r', encoding='utf-8') as f:
                content = f.read()
                preview = content[:500] if len(content) > 500 else content
            
            generated_files.append({
                'fileName': output_file,
                'fileType': output_file.split('.')[-1],
                'fileSize': file_size,
                'preview': preview,
                'fullPath': os.path.abspath(output_file)
            })
            print(f'Found output file: {output_file} ({file_size} bytes)')
        except Exception as file_error:
            print(f'Error reading output file {output_file}: {str(file_error)}')
    
    if generated_files:
        print('GENERATED_FILES_START')
        print(json.dumps(generated_files, indent=2))
        print('GENERATED_FILES_END')
    
    # Extract any remaining cell errors after execution
    final_cell_errors = extract_cell_errors(nb)
    if final_cell_errors:
        print('FINAL_CELL_ERRORS_START')
        print(json.dumps(final_cell_errors, indent=2))
        print('FINAL_CELL_ERRORS_END')
    
    if execution_successful and not final_cell_errors:
        print('NOTEBOOK_EXECUTION_SUCCESS')
    else:
        print('NOTEBOOK_EXECUTION_COMPLETED_WITH_ERRORS')
    
except Exception as e:
    error_category = categorize_error(str(e), traceback.format_exc())
    error_details = {
        'error_type': type(e).__name__,
        'error_message': str(e),
        'category': error_category,
        'traceback': traceback.format_exc()
    }
    
    print(f'NOTEBOOK_EXECUTION_ERROR: {str(e)}')
    print('ERROR_DETAILS_START')
    print(json.dumps(error_details, indent=2))
    print('ERROR_DETAILS_END')
    print('Full traceback:')
    traceback.print_exc()
    sys.exit(1)
"`,
          `cd ${fullWorkDir} && cat notebook_output.html`,
          `cd ${fullWorkDir} && ls -la *.csv *.txt *.json *.xml *.log 2>/dev/null || echo "No additional output files found"`
        ];
        
        this.executeCommandsSequentially(conn, commands, 0, async (success, output, error) => {
          conn.end();
          
          console.log('Command execution completed:', { success, outputLength: output.length, errorLength: error.length });
          
          // Parse the output for different types of results
          const parseExecutionResult = async (output, error) => {
            let htmlContent = '';
            let executionErrors = [];
            let syntaxErrors = [];
            let cellErrors = [];
            let executionSuccessful = false;
            let errorDetails = null;
            
            // Check for complete success
            if (output.includes('NOTEBOOK_EXECUTION_SUCCESS')) {
              executionSuccessful = true;
            } else if (output.includes('NOTEBOOK_EXECUTION_COMPLETED_WITH_ERRORS')) {
              executionSuccessful = false; // Partial success with errors
            }
            
            // Extract syntax errors
            const syntaxErrorMatch = output.match(/SYNTAX_ERRORS_START\n([\s\S]*?)\nSYNTAX_ERRORS_END/);
            if (syntaxErrorMatch) {
              try {
                syntaxErrors = JSON.parse(syntaxErrorMatch[1]);
              } catch (e) {
                console.warn('Failed to parse syntax errors:', e);
              }
            }
            
            // Extract cell execution errors
            const cellErrorMatch = output.match(/(?:CELL_ERRORS_START|FINAL_CELL_ERRORS_START)\n([\s\S]*?)\n(?:CELL_ERRORS_END|FINAL_CELL_ERRORS_END)/);
            if (cellErrorMatch) {
              try {
                cellErrors = JSON.parse(cellErrorMatch[1]);
              } catch (e) {
                console.warn('Failed to parse cell errors:', e);
              }
            }
            
            // Extract error details for complete failures
            const errorDetailsMatch = output.match(/ERROR_DETAILS_START\n([\s\S]*?)\nERROR_DETAILS_END/);
            if (errorDetailsMatch) {
              try {
                errorDetails = JSON.parse(errorDetailsMatch[1]);
              } catch (e) {
                console.warn('Failed to parse error details:', e);
              }
            }
            
            // Extract HTML content
            const htmlStart = output.indexOf('<!DOCTYPE html>');
            if (htmlStart !== -1) {
              htmlContent = output.substring(htmlStart);
              console.log('HTML content extracted successfully, length:', htmlContent.length);
            }
            
            // Extract generated files information
            let generatedFiles = [];
            const generatedFilesMatch = output.match(/GENERATED_FILES_START\n([\s\S]*?)\nGENERATED_FILES_END/);
            if (generatedFilesMatch) {
              try {
                generatedFiles = JSON.parse(generatedFilesMatch[1]);
                console.log('Generated files detected:', generatedFiles.length);
              } catch (e) {
                console.warn('Failed to parse generated files:', e);
              }
            }
            
            // Compile all errors for AI analysis
            const allErrors = [...syntaxErrors, ...cellErrors];
            let aiAnalysis = null;
            
            if (errorDetails || allErrors.length > 0) {
              const errorForAnalysis = errorDetails ? 
                `${errorDetails.error_type}: ${errorDetails.error_message}\n${errorDetails.traceback}` :
                allErrors.map(err => 
                  `Cell ${err.cell_index}: ${err.error_name || err.error}: ${err.error_value || err.error}\n${err.traceback || ''}`
                ).join('\n\n');
              
              try {
                aiAnalysis = await this.analyzeNotebookError(errorForAnalysis, allErrors, errorDetails);
              } catch (aiError) {
                console.warn('Failed to get AI analysis for notebook errors:', aiError);
                aiAnalysis = {
                  explanation: 'Failed to analyze errors with AI',
                  suggestions: ['Review the error messages below for details'],
                  errorSummary: 'AI analysis unavailable'
                };
              }
            }
            
            return {
              success: executionSuccessful && allErrors.length === 0 && !errorDetails,
              htmlContent,
              syntaxErrors,
              cellErrors,
              errorDetails,
              aiAnalysis,
              generatedFiles,
              workDir, // Include the workDir for file downloads
              hasPartialResults: htmlContent.length > 0,
              message: executionSuccessful ? 
                (allErrors.length > 0 ? 'Notebook executed with some cell errors' : 'Notebook executed successfully') :
                (errorDetails ? `Execution failed: ${errorDetails.error_message}` : 'Notebook execution failed')
            };
          };
          
          if (success && (output.includes('NOTEBOOK_EXECUTION_SUCCESS') || output.includes('NOTEBOOK_EXECUTION_COMPLETED_WITH_ERRORS'))) {
            const result = await parseExecutionResult(output, error);
            resolve(result);
          } else {
            console.error('Notebook execution failed');
            console.log('Error output:', error);
            console.log('Output sample:', output.substring(Math.max(0, output.length - 1000)));
            
            // Try to parse partial results even on failure
            const result = await parseExecutionResult(output, error);
            if (!result.success) {
              result.error = error || 'Notebook execution failed';
              result.rawOutput = output.length > 2000 ? output.substring(0, 2000) + '...' : output;
            }
            resolve(result);
          }
        });
      });
      
      conn.on('error', (err) => {
        console.error('SSH connection error:', err);
        
        // Provide more specific error messages based on the error type
        let errorMessage = `SSH connection failed: ${err.message}`;
        
        if (err.level === 'client-authentication') {
          errorMessage = `SSH authentication failed to EC2 instance ${ec2Config.host}. Please configure proper authentication credentials. You can set:
- EC2_PRIVATE_KEY_PATH environment variable to point to your private key file
- EC2_PASSWORD environment variable for password authentication
- Ensure SSH agent is running with loaded keys (SSH_AUTH_SOCK)
- Check that private key file has correct permissions (chmod 600)`;
        } else if (err.level === 'handshake') {
          errorMessage = `SSH handshake failed with EC2 instance ${ec2Config.host}. This might be due to:
- Incompatible SSH algorithms between client and server
- Network connectivity issues
- Server configuration problems
Error: ${err.message}`;
        } else if (err.code === 'ECONNREFUSED') {
          errorMessage = `Cannot connect to EC2 instance ${ec2Config.host}. Please verify:
- The EC2 instance is running
- Security group allows SSH access from your IP
- The host address is correct`;
        }
        
        reject(new Error(errorMessage));
      });
      
      // Connect to EC2 - try multiple authentication methods
      const connectionConfig = {
        host: ec2Config.host,
        username: ec2Config.username,
        readyTimeout: 30000,
        ...ec2Config.algorithms && { algorithms: ec2Config.algorithms }
      };

      // Try SSH agent first if available
      if (process.env.SSH_AUTH_SOCK) {
        connectionConfig.agent = process.env.SSH_AUTH_SOCK;
      }

      // Try password authentication as fallback (if configured)
      if (process.env.EC2_PASSWORD) {
        connectionConfig.password = process.env.EC2_PASSWORD;
      }

      // Try private key authentication as another fallback (if configured)
      if (process.env.EC2_PRIVATE_KEY_PATH) {
        try {
          const keyPath = path.resolve(process.env.EC2_PRIVATE_KEY_PATH);
          console.log(`Attempting to load private key from: ${keyPath}`);
          connectionConfig.privateKey = require('fs').readFileSync(keyPath);
          console.log('Private key loaded successfully');
        } catch (keyError) {
          console.warn('Failed to read EC2 private key:', keyError.message);
        }
      }

      conn.connect(connectionConfig);
    });
  }

  async downloadGeneratedFile(workDir, fileName) {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      
      conn.on('ready', () => {
        console.log(`SSH connection established for file download: ${fileName}`);
        
        const filePath = `${workDir}/${fileName}`;
        
        conn.exec(`cd ${workDir} && cat ${fileName}`, (err, stream) => {
          if (err) {
            conn.end();
            return reject(new Error(`Failed to read file ${fileName}: ${err.message}`));
          }
          
          let fileContent = '';
          
          stream.on('close', (code) => {
            conn.end();
            if (code === 0) {
              console.log(`Successfully downloaded file: ${fileName}`);
              resolve(fileContent);
            } else {
              reject(new Error(`File download failed with exit code: ${code}`));
            }
          }).on('data', (data) => {
            fileContent += data.toString();
          }).stderr.on('data', (data) => {
            console.error(`Download stderr: ${data}`);
          });
        });
      });
      
      conn.on('error', (err) => {
        console.error('SSH connection error during file download:', err);
        reject(new Error(`SSH connection failed: ${err.message}`));
      });
      
      // Use the same connection config as notebook execution
      const connectionConfig = {
        host: ec2Config.host,
        username: ec2Config.username,
        readyTimeout: 30000,
        ...ec2Config.algorithms && { algorithms: ec2Config.algorithms }
      };

      if (process.env.SSH_AUTH_SOCK) {
        connectionConfig.agent = process.env.SSH_AUTH_SOCK;
      }

      if (process.env.EC2_PASSWORD) {
        connectionConfig.password = process.env.EC2_PASSWORD;
      }

      if (process.env.EC2_PRIVATE_KEY_PATH) {
        try {
          const keyPath = path.resolve(process.env.EC2_PRIVATE_KEY_PATH);
          connectionConfig.privateKey = require('fs').readFileSync(keyPath);
        } catch (keyError) {
          console.warn('Failed to read EC2 private key for file download:', keyError.message);
        }
      }

      conn.connect(connectionConfig);
    });
  }

  executeCommandsSequentially(conn, commands, index, callback, accumulatedOutput = '', accumulatedError = '') {
    if (index >= commands.length) {
      return callback(true, accumulatedOutput, accumulatedError);
    }
    
    const command = commands[index];
    console.log(`Executing command ${index + 1}/${commands.length}: ${command.substring(0, 100)}...`);
    
    let stdout = '';
    let stderr = '';
    
    conn.exec(command, (err, stream) => {
      if (err) {
        console.error(`Command execution error at step ${index + 1}:`, err);
        return callback(false, accumulatedOutput + stdout, accumulatedError + `Command execution error: ${err.message}`);
      }
      
      stream.on('close', (code, signal) => {
        console.log(`Command ${index + 1} completed with exit code: ${code}`);
        if (stdout) console.log(`Command ${index + 1} stdout:`, stdout.substring(0, 500));
        if (stderr) console.log(`Command ${index + 1} stderr:`, stderr.substring(0, 500));
        
        // Accumulate output from all commands
        const newAccumulatedOutput = accumulatedOutput + stdout;
        const newAccumulatedError = accumulatedError + stderr;
        
        if (code === 0) {
          // Continue with next command
          this.executeCommandsSequentially(conn, commands, index + 1, callback, newAccumulatedOutput, newAccumulatedError);
        } else {
          console.error(`Command ${index + 1} failed with exit code ${code}`);
          callback(false, newAccumulatedOutput, newAccumulatedError || `Command failed with exit code ${code}`);
        }
      }).on('data', (data) => {
        stdout += data.toString();
      }).stderr.on('data', (data) => {
        stderr += data.toString();
      });
    });
  }

  // Method to download generated files from EC2
  async downloadGeneratedFile(workDir, fileName) {
    return new Promise((resolve, reject) => {
      const conn = new Client();

      conn.on('ready', () => {
        console.log('SSH connection established for file download');
        
        // Construct the full file path
        const filePath = `/tmp/${workDir}/${fileName}`;
        
        // Security check - ensure we're only accessing files in the expected directory
        if (!workDir.startsWith('notebook_')) {
          conn.end();
          return reject(new Error('Invalid work directory format'));
        }
        
        // Download the file content
        conn.exec(`cat ${filePath}`, (err, stream) => {
          if (err) {
            console.error('Error executing file download command:', err);
            conn.end();
            return reject(new Error(`Failed to read file: ${err.message}`));
          }

          let fileContent = '';
          let errorOutput = '';

          stream.on('close', (code) => {
            conn.end();
            
            if (code === 0 && fileContent) {
              console.log(`File ${fileName} downloaded successfully, size: ${fileContent.length} bytes`);
              resolve(fileContent);
            } else {
              console.error(`File download failed with exit code: ${code}, error: ${errorOutput}`);
              reject(new Error(errorOutput || `File not found or could not be read: ${fileName}`));
            }
          }).on('data', (data) => {
            fileContent += data.toString();
          }).stderr.on('data', (data) => {
            errorOutput += data.toString();
          });
        });
      });

      conn.on('error', (err) => {
        console.error('SSH connection error during file download:', err);
        reject(new Error(`SSH connection failed: ${err.message}`));
      });

      // Use the same connection configuration as notebook execution
      const connectionConfig = {
        host: ec2Config.host,
        username: ec2Config.username,
        readyTimeout: 30000,
        ...ec2Config.algorithms && { algorithms: ec2Config.algorithms }
      };

      // Try SSH agent first if available
      if (process.env.SSH_AUTH_SOCK) {
        connectionConfig.agent = process.env.SSH_AUTH_SOCK;
      }

      // Try password authentication as fallback (if configured)
      if (process.env.EC2_PASSWORD) {
        connectionConfig.password = process.env.EC2_PASSWORD;
      }

      // Try private key authentication as another fallback (if configured)
      if (process.env.EC2_PRIVATE_KEY_PATH) {
        try {
          const keyPath = path.resolve(process.env.EC2_PRIVATE_KEY_PATH);
          connectionConfig.privateKey = require('fs').readFileSync(keyPath);
        } catch (keyError) {
          console.warn('Failed to read EC2 private key for file download:', keyError.message);
        }
      }

      conn.connect(connectionConfig);
    });
  }
}

// Helper for RegExp escaping
Pattern = {
    escape: function(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
};

const codeExecutionServiceInstance = new CodeExecutionService();
// Start periodic cleanup of idle sessions
setInterval(() => {
  codeExecutionServiceInstance.cleanupIdleSessions();
}, 5 * 60 * 1000); // Check every 5 minutes

module.exports = codeExecutionServiceInstance;
