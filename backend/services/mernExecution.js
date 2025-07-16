const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const axios = require('axios');
const { OpenAI } = require('openai');
const { spawn, exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configure OpenAI API
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Store active sessions - renamed to be more generic
const activeJSAppSessions = new Map();

// Port range for apps
const FRONTEND_PORT_START = 3001;
const BACKEND_PORT_START = 8080;
const PORT_RANGE = 100;

class JSAppExecutionService {
  constructor() {
    // Generic service for any JavaScript/Node.js application
  }

  getNpmCommand() {
    if (process.platform === 'win32') {
      return 'npm.cmd';
    }
    return 'npm';
  }

  async checkNodeInstallation() {
    try {
      const { stdout: nodeVersion } = await execAsync('node --version');
      const { stdout: npmVersion } = await execAsync('npm --version');
      
      console.log(`Node.js version: ${nodeVersion.trim()}`);
      console.log(`npm version: ${npmVersion.trim()}`);
      
      return {
        hasNode: true,
        nodeVersion: nodeVersion.trim(),
        npmVersion: npmVersion.trim()
      };
    } catch (error) {
      return {
        hasNode: false,
        error: 'Node.js or npm not found. Please install Node.js from https://nodejs.org/'
      };
    }
  }

  async findAvailablePort(startPort) {
    const net = require('net');
    
    const isPortFree = (port) => {
      return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, (err) => {
          if (err) {
            resolve(false);
          } else {
            server.once('close', () => resolve(true));
            server.close();
          }
        });
        server.on('error', () => resolve(false));
      });
    };

    for (let port = startPort; port < startPort + PORT_RANGE; port++) {
      if (await isPortFree(port)) {
        return port;
      }
    }
    throw new Error(`No available ports found in range ${startPort}-${startPort + PORT_RANGE}`);
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

async analyzeProjectStructure(files) {
  if (!files || files.length === 0) {
    throw new Error('No files found to analyze');
  }

  const folderStructure = {};
  const packageJsonFiles = [];

  files.forEach(file => {
    const pathParts = file.name.split(/[/\\]/);
    if (file.name.endsWith('package.json')) {
      packageJsonFiles.push({
        path: file.name,
        content: file.content
      });
    }

    let current = folderStructure;
    pathParts.forEach((part, index) => {
      if (index === pathParts.length - 1) {
        if (!current.files) current.files = [];
        current.files.push(part);
      } else {
        if (!current.folders) current.folders = {};
        if (!current.folders[part]) current.folders[part] = {};
        current = current.folders[part];
      }
    });
  });

  const maxRetries = 3;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const prompt = `
Analyze this JavaScript/Node.js project structure and package.json files. Determine the project type and what components need to be run.

IMPORTANT: 
- If it's a full-stack app, identify frontend and backend separately
- If it's frontend-only (React, Next.js, Vue, etc.), set hasBackend to false
- If it's backend-only (Express API, etc.), set hasFrontend to false
- Use relative paths from the extraction root
- Check package.json locations to determine correct directories

Respond with ONLY this JSON format:
{
  "projectType": "react|nextjs|mern|express|node|vue|angular",
  "hasFrontend": true/false,
  "hasBackend": true/false,
  "frontendDir": "relative path to frontend directory or root if frontend-only",
  "backendDir": "relative path to backend directory or empty if no backend",
  "frontendInstallCommand": "npm install",
  "backendInstallCommand": "npm install or empty if no backend",
  "frontendStartCommand": "npm start|npm run dev|npm run build",
  "backendStartCommand": "npm start|npm run dev or empty if no backend",
  "frontendPort": 3000,
  "backendPort": 8080,
  "description": "brief project description"
}

Folder Structure:
${JSON.stringify(folderStructure, null, 2)}

Package.json Files:
${packageJsonFiles.map(p => `${p.path}:\n${p.content}`).join('\n\n')}
`;

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Gemini project analysis attempt ${attempt}/${maxRetries}`);

      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": geminiApiKey
          }
        }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      console.log("Gemini response:", responseText);

      let analysis;
      try {
        analysis = JSON.parse(responseText);
      } catch (parseError) {
        const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error(`No valid JSON found in response: ${responseText}`);
        }
      }

      const requiredFields = ['projectType', 'hasFrontend', 'hasBackend'];
      const missingFields = requiredFields.filter(field => !(field in analysis));

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      return analysis;
    } catch (err) {
      lastError = err;
      console.error(`Attempt ${attempt} failed:`, err.message);
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
      }
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}


  async readFiles(dir) {
    const files = [];
    
    async function readDirectory(currentDir, relativePath = '') {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativeFilePath = path.join(relativePath, entry.name);
        
        if (entry.isFile()) {
          try {
            const content = await fs.readFile(fullPath, 'utf8');
            files.push({ 
              name: relativeFilePath.replace(/\\/g, '/'),
              content: content,
              fullPath: fullPath
            });
          } catch (error) {
            console.warn(`Could not read file ${relativeFilePath}:`, error.message);
          }
        } else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await readDirectory(fullPath, relativeFilePath);
        }
      }
    }
    
    await readDirectory(dir);
    return files;
  }

  async installDependencies(projectPath, command = 'npm install') {
    console.log(`Installing dependencies in ${projectPath} using: ${command}`);
    
    // Check if package.json exists
    const packageJsonPath = path.join(projectPath, 'package.json');
    try {
      await fs.access(packageJsonPath);
    } catch (error) {
      throw new Error(`No package.json found at ${packageJsonPath}. Cannot install dependencies.`);
    }

    try {
      await execAsync('npm cache verify');
    } catch (cacheError) {
      console.warn('Cache verification failed, proceeding with installation:', cacheError.message);
    }

    return new Promise((resolve, reject) => {
      const npmCommand = this.getNpmCommand();
      
      const spawnOptions = {
        cwd: projectPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: 'development',
          npm_config_cache: path.join(os.tmpdir(), '.npm-cache'),
          HOME: os.tmpdir()
        }
      };

      if (process.platform === 'win32') {
        spawnOptions.shell = true;
      }

      const child = spawn(npmCommand, ['install', '--no-optional', '--cache', path.join(os.tmpdir(), '.npm-cache'), '--prefer-offline'], spawnOptions);

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        console.log(`[${path.basename(projectPath)} Install]`, text.trim());
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        console.warn(`[${path.basename(projectPath)} Install Error]`, text.trim());
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`Dependencies installed successfully in ${projectPath}`);
          resolve({ success: true, output });
        } else {
          console.error(`Dependency installation failed in ${projectPath} with code ${code}`);
          reject(new Error(`Installation failed with exit code ${code}: ${errorOutput}`));
        }
      });

      child.on('error', (error) => {
        console.error(`Failed to start npm install in ${projectPath}:`, error);
        reject(error);
      });

      setTimeout(() => {
        child.kill();
        reject(new Error('Installation timeout after 5 minutes'));
      }, 5 * 60 * 1000);
    });
  }

  async startProcess(projectPath, command, port, type, env = {}) {
    console.log(`Starting ${type} process: ${command} in ${projectPath} on port ${port}`);
    
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      
      let actualCmd = cmd;
      if (cmd === 'npm' && process.platform === 'win32') {
        actualCmd = this.getNpmCommand();
      }
      
      const spawnOptions = {
        cwd: projectPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PORT: port,
          NODE_ENV: 'development',
          BROWSER: 'none',
          ...env
        }
      };

      if (process.platform === 'win32') {
        spawnOptions.shell = true;
      }

      const child = spawn(actualCmd, args, spawnOptions);

      let startupOutput = '';
      let isReady = false;
      
      const timeoutDuration = type === 'frontend' ? 3 * 60 * 1000 : 2 * 60 * 1000;
      
      const readyTimeout = setTimeout(() => {
        if (!isReady) {
          child.kill();
          reject(new Error(`${type} process startup timeout (${timeoutDuration / 60000} minutes)`));
        }
      }, timeoutDuration);

      child.stdout.on('data', (data) => {
        const output = data.toString();
        startupOutput += output;
        console.log(`[${type}]`, output.trim());
        
        if (type === 'frontend') {
          if (output.includes('Compiled successfully') || 
              output.includes('webpack compiled successfully') ||
              output.includes('You can now view') ||
              output.includes('Local:') ||
              output.includes('development server running') ||
              output.match(/localhost:\d+/) ||
              output.includes('compiled without errors') ||
              output.includes('ready on') ||
              output.includes('started server on')) {
            if (!isReady) {
              isReady = true;
              clearTimeout(readyTimeout);
              console.log(`✅ ${type} is ready on port ${port}`);
              resolve({ process: child, output: startupOutput });
            }
          }
        } else if (type === 'backend') {
          if (output.includes('listening') || 
              output.includes('Server running') ||
              output.includes('server started') ||
              output.includes('Server is running') ||
              output.match(/port\s+\d+/) ||
              output.match(/:\d+/)) {
            if (!isReady) {
              isReady = true;
              clearTimeout(readyTimeout);
              console.log(`✅ ${type} is ready on port ${port}`);
              resolve({ process: child, output: startupOutput });
            }
          }
        }
      });
      
      child.stderr.on('data', (data) => {
        const output = data.toString();
        console.error(`[${type} Error]`, output.trim());
        startupOutput += output;
        
        if (type === 'frontend' && !isReady) {
          if (output.includes('Compiled successfully') || 
              output.includes('webpack compiled successfully') ||
              output.includes('You can now view')) {
            isReady = true;
            clearTimeout(readyTimeout);
            console.log(`✅ ${type} is ready on port ${port} (via stderr)`);
            resolve({ process: child, output: startupOutput });
          }
        }
      });

      child.on('error', (error) => {
        clearTimeout(readyTimeout);
        if (!isReady) {
          reject(error);
        }
      });

      child.on('exit', (code) => {
        clearTimeout(readyTimeout);
        if (!isReady) {
          reject(new Error(`${type} process exited with code ${code} before becoming ready`));
        }
      });
    });
  }

  async openBrowser(url) {
    const platform = process.platform;
    let command;

    switch (platform) {
      case 'win32':
        command = `start ${url}`;
        break;
      case 'darwin':
        command = `open ${url}`;
        break;
      case 'linux':
        command = `xdg-open ${url}`;
        break;
      default:
        console.warn(`Unsupported platform ${platform} for browser opening`);
        return;
    }

    try {
      await execAsync(command);
      console.log(`Browser opened with URL: ${url}`);
    } catch (error) {
      console.error('Failed to open browser:', error);
    }
  }

  async detectBackendPort(backendPath, analysis) {
    if (!backendPath) return null;
    
    console.log(`🔍 Detecting backend port in ${backendPath}`);
    
    const filesToCheck = ['app.js', 'server.js', 'index.js'];
    
    for (const fileName of filesToCheck) {
      const filePath = path.join(backendPath, fileName);
      try {
        await fs.access(filePath);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const portFromFile = this.extractPortFromContent(fileContent, fileName);
        if (portFromFile) {
          console.log(`✅ Found backend port ${portFromFile} in ${fileName}`);
          return portFromFile;
        }
      } catch (error) {
        console.log(`📄 ${fileName} not found in backend directory`);
      }
    }

    // Check .env file
    const envPath = path.join(backendPath, '.env');
    try {
      await fs.access(envPath);
      const envContent = await fs.readFile(envPath, 'utf8');
      const portFromEnv = this.extractPortFromEnv(envContent);
      if (portFromEnv) {
        console.log(`✅ Found backend port ${portFromEnv} in .env file`);
        return portFromEnv;
      }
    } catch (error) {
      console.log(`📄 .env not found in backend directory`);
    }

    const fallbackPort = analysis.backendPort || BACKEND_PORT_START;
    console.log(`⚠️ No specific backend port found, using fallback: ${fallbackPort}`);
    return fallbackPort;
  }

  extractPortFromContent(content, fileName) {
    const cleanContent = content
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/['"`].*?['"`]/g, '');

    const portPatterns = [
      /app\.listen\s*\(\s*(\d+)/i,
      /server\.listen\s*\(\s*(\d+)/i,
      /\.listen\s*\(\s*(\d+)/i,
      /const\s+port\s*=\s*(\d+)/i,
      /let\s+port\s*=\s*(\d+)/i,
      /var\s+port\s*=\s*(\d+)/i,
      /const\s+PORT\s*=\s*(\d+)/i,
      /let\s+PORT\s*=\s*(\d+)/i,
      /var\s+PORT\s*=\s*(\d+)/i,
      /process\.env\.PORT\s*\|\|\s*(\d+)/i,
      /PORT\s*\|\|\s*(\d+)/i
    ];

    for (const pattern of portPatterns) {
      const match = cleanContent.match(pattern);
      if (match && match[1]) {
        const port = parseInt(match[1], 10);
        if (port >= 1000 && port <= 65535) {
          console.log(`🔍 Found port pattern in ${fileName}: ${match[0]} -> ${port}`);
          return port;
        }
      }
    }

    return null;
  }

  extractPortFromEnv(envContent) {
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('PORT=')) {
        const portValue = trimmedLine.split('=')[1].trim();
        const port = parseInt(portValue, 10);
        if (port >= 1000 && port <= 65535) {
          console.log(`🔍 Found PORT in .env: ${trimmedLine} -> ${port}`);
          return port;
        }
      }
    }
    return null;
  }

  async executeJSApp(fileUrl, sessionId) {
    let tempDir = null;
    let frontendPath = null;
    let backendPath = null;
    let analysis = null;
    
    try {
      const nodeCheck = await this.checkNodeInstallation();
      if (!nodeCheck.hasNode) {
        throw new Error(nodeCheck.error);
      }

      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `jsapp-${sessionId}-`));
      
      // Download and extract project
      const zipPath = path.join(tempDir, 'project.zip');
      const zipResponse = await axios({ method: 'get', url: fileUrl, responseType: 'arraybuffer' });
      await fs.writeFile(zipPath, zipResponse.data);
      
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(tempDir, true);
      await fs.unlink(zipPath);
      
      // Analyze project structure
      const files = await this.readFiles(tempDir);
      if (files.length === 0) throw new Error("No files found in submission zip.");
      
      analysis = await this.analyzeProjectStructure(files);
      console.log('Project analysis result:', analysis);
      
      let frontendPort = null;
      let backendPort = null;
      let frontendResult = null;
      let backendResult = null;

      // Handle backend if it exists
      if (analysis.hasBackend && analysis.backendDir) {
        backendPath = path.join(tempDir, analysis.backendDir);
        
        try {
          await fs.access(backendPath);
          
          const detectedBackendPort = await this.detectBackendPort(backendPath, analysis);
          backendPort = await this.findAvailablePort(detectedBackendPort);
          
          console.log('Installing backend dependencies...');
          await this.installDependencies(backendPath, analysis.backendInstallCommand);
          
          console.log('🚀 Starting backend server...');
          backendResult = await this.startProcess(
            backendPath,
            analysis.backendStartCommand,
            backendPort,
            'backend',
            { 
              PORT: backendPort,
              NODE_ENV: 'development'
            }
          );
          console.log('✅ Backend server started successfully and is ready');
          
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          throw new Error(`Backend setup failed: ${error.message}`);
        }
      }

      // Handle frontend if it exists
      if (analysis.hasFrontend && analysis.frontendDir) {
        frontendPath = path.join(tempDir, analysis.frontendDir);
        
        try {
          await fs.access(frontendPath);
          
          frontendPort = await this.findAvailablePort(FRONTEND_PORT_START);
          
          console.log('Installing frontend dependencies...');
          await this.installDependencies(frontendPath, analysis.frontendInstallCommand);
          
          console.log('🎨 Starting frontend server...');
          const frontendEnv = { 
            PORT: frontendPort,
            NODE_ENV: 'development',
            BROWSER: 'none'
          };
          
          if (backendPort) {
            frontendEnv.REACT_APP_BACKEND_URL = `http://localhost:${backendPort}`;
          }
          
          frontendResult = await this.startProcess(
            frontendPath,
            analysis.frontendStartCommand,
            frontendPort,
            'frontend',
            frontendEnv
          );
          console.log('✅ Frontend server started successfully and is ready');

          const actualFrontendPort = this.extractActualFrontendPort(frontendResult.output, frontendPort);
          if (actualFrontendPort !== frontendPort) {
            console.log(`Frontend port changed from ${frontendPort} to ${actualFrontendPort}`);
            frontendPort = actualFrontendPort;
          }
        } catch (error) {
          throw new Error(`Frontend setup failed: ${error.message}`);
        }
      }

      if (!frontendResult && !backendResult) {
        throw new Error('No valid application components found to run');
      }

      // Store session
      activeJSAppSessions.set(sessionId, {
        frontendProcess: frontendResult?.process || null,
        backendProcess: backendResult?.process || null,
        frontendPort,
        backendPort,
        tempDir,
        logs: {
          frontend: frontendResult ? [frontendResult.output] : [],
          backend: backendResult ? [backendResult.output] : []
        },
        lastActivity: Date.now(),
        analysis
      });
      
      setTimeout(() => {
        this.stopJSAppSession(sessionId);
      }, 30 * 60 * 1000);
      
      // Open browser to frontend if available, otherwise backend
      const urlToOpen = frontendPort ? `http://localhost:${frontendPort}` : `http://localhost:${backendPort}`;
      console.log(`🌐 Opening browser to ${urlToOpen}...`);
      
      setTimeout(async () => {
        await this.openBrowser(urlToOpen);
      }, 1000);

      return {
        sessionId,
        frontendUrl: frontendPort ? `http://localhost:${frontendPort}` : null,
        backendUrl: backendPort ? `http://localhost:${backendPort}` : null,
        openBrowserUrl: urlToOpen,
        status: 'running',
        analysis,
        nodeInfo: nodeCheck
      };

    } catch (error) {
      const enhancedError = new Error(
        `JavaScript app execution failed: ${error.message}\n` +
        `${backendPath ? `Backend Path: ${backendPath}\n` : ''}` +
        `${frontendPath ? `Frontend Path: ${frontendPath}\n` : ''}` +
        `${analysis ? `Project Type: ${analysis.projectType}` : ''}`
      );
      enhancedError.originalError = error;
      
      if (tempDir) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(console.error);
      }
      throw enhancedError;
    }
  }

  extractActualFrontendPort(output, expectedPort) {
    const localMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
    if (localMatch && localMatch[1]) {
      const actualPort = parseInt(localMatch[1], 10);
      if (actualPort >= 1000 && actualPort <= 65535) {
        return actualPort;
      }
    }
    
    const viewMatch = output.match(/You can now view.*?http:\/\/localhost:(\d+)/s);
    if (viewMatch && viewMatch[1]) {
      const actualPort = parseInt(viewMatch[1], 10);
      if (actualPort >= 1000 && actualPort <= 65535) {
        return actualPort;
      }
    }
    
    // Check for Next.js pattern
    const nextMatch = output.match(/ready on.*?(\d+)/i);
    if (nextMatch && nextMatch[1]) {
      const actualPort = parseInt(nextMatch[1], 10);
      if (actualPort >= 1000 && actualPort <= 65535) {
        return actualPort;
      }
    }
    
    return expectedPort;
  }

  async stopJSAppSession(sessionId) {
    const session = activeJSAppSessions.get(sessionId);
    if (!session) {
      return { success: false, message: 'Session not found' };
    }
    
    try {
      if (session.frontendProcess) {
        session.frontendProcess.kill('SIGTERM');
        console.log(`Frontend process ${session.frontendProcess.pid} terminated`);
      }
      
      if (session.backendProcess) {
        session.backendProcess.kill('SIGTERM');
        console.log(`Backend process ${session.backendProcess.pid} terminated`);
      }
      
      if (session.tempDir) {
        await fs.rm(session.tempDir, { recursive: true, force: true });
        console.log(`Cleaned up temp directory: ${session.tempDir}`);
      }
      
      activeJSAppSessions.delete(sessionId);
      
      return { success: true, message: 'JavaScript app session stopped successfully' };
    } catch (error) {
      console.error('Error stopping JavaScript app session:', error);
      return { success: false, message: error.message };
    }
  }

  async getJSAppSessionStatus(sessionId) {
    const session = activeJSAppSessions.get(sessionId);
    if (!session) {
      return { status: 'not_found', message: 'Session not found' };
    }
    
    const frontendRunning = session.frontendProcess && !session.frontendProcess.killed;
    const backendRunning = session.backendProcess && !session.backendProcess.killed;
    
    return {
      status: 'running',
      sessionId,
      frontendUrl: session.frontendPort ? `http://localhost:${session.frontendPort}` : null,
      backendUrl: session.backendPort ? `http://localhost:${session.backendPort}` : null,
      frontendRunning,
      backendRunning,
      isHealthy: (session.frontendPort ? frontendRunning : true) && (session.backendPort ? backendRunning : true),
      lastActivity: session.lastActivity
    };
  }

  cleanupIdleJSAppSessions() {
    const idleTimeout = 30 * 60 * 1000;
    
    activeJSAppSessions.forEach(async (session, sessionId) => {
      if (Date.now() - session.lastActivity > idleTimeout) {
        console.log(`Cleaning up idle JavaScript app session: ${sessionId}`);
        await this.stopJSAppSession(sessionId);
      }
    });
  }

  // Legacy methods for backward compatibility
  async executeMERNStack(fileUrl, sessionId) {
    return this.executeJSApp(fileUrl, sessionId);
  }

  async stopMERNSession(sessionId) {
    return this.stopJSAppSession(sessionId);
  }

  async getMERNSessionStatus(sessionId) {
    return this.getJSAppSessionStatus(sessionId);
  }

  cleanupIdleMERNSessions() {
    return this.cleanupIdleJSAppSessions();
  }

  // Expose the sessions map for cleanup
  get activeMERNSessions() {
    return activeJSAppSessions;
  }
}

const jsAppExecutionServiceInstance = new JSAppExecutionService();

setInterval(() => {
  jsAppExecutionServiceInstance.cleanupIdleJSAppSessions();
}, 5 * 60 * 1000);

module.exports = jsAppExecutionServiceInstance;
