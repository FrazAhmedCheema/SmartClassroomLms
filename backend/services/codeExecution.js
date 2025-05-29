const Docker = require('dockerode');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const { OpenAI } = require('openai');
const axios = require('axios');

const docker = new Docker();
const openai = new OpenAI(process.env.OPENAI_API_KEY);

class CodeExecutionService {
  async analyzeCode(files) {
    // First, analyze the code to find the main class
    const codeContent = files.map(f => `File: ${f.name}\nContent:\n${f.content}`).join('\n\n');
    
    const prompt = `Analyze this Java code submission and provide:
1. The main class name (the class containing public static void main)
2. Required build/compile commands
3. Run command with the correct main class
4. Required dependencies or environment setup

Code files:
${codeContent}

Response format:
{
  "language": "Java",
  "mainClass": "the class name containing main method",
  "buildCommand": "javac command",
  "runCommand": "java command with main class",
  "baseImage": "openjdk:11-slim",
  "setup": []
}

Rules:
1. Find the class with 'public static void main'
2. If multiple main classes exist, choose the most appropriate one
3. Include all .java files in compilation
4. Ensure the run command uses the correct main class name
5. Handle packages if present`;

    const response = await openai.chat.completions.create({
      model: "gpt-4", // Using GPT-4 for better code analysis
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      // Fallback configuration if GPT response parsing fails
      return {
        language: "Java",
        mainClass: this.findMainClass(files),
        buildCommand: "javac *.java",
        runCommand: `java ${this.findMainClass(files)}`,
        baseImage: "openjdk:11-slim",
        setup: []
      };
    }
  }

  // Helper method to find main class by scanning files
  findMainClass(files) {
    for (const file of files) {
      // Look for main method signature
      if (file.content.includes("public static void main")) {
        // Get package declaration if exists
        let packageName = "";
        const packageMatch = file.content.match(/package\s+([\w.]+);/);
        if (packageMatch) {
          packageName = packageMatch[1] + ".";
        }

        // Get class name
        const classMatch = file.content.match(/public\s+class\s+(\w+)/);
        if (classMatch) {
          return packageName + classMatch[1];
        }
      }
    }
    return null;
  }

  generateDockerfile(analysis) {
    return `FROM ${analysis.baseImage}
WORKDIR /app
${analysis.setup.map(cmd => `RUN ${cmd}`).join('\n')}
COPY . .
RUN ${analysis.buildCommand}
CMD ${analysis.runCommand}`;
  }

  getLanguageConfig(language) {
    const configs = {
      java: {
        language: 'Java',
        buildCommand: 'javac -d bin -cp src src/**/*.java',
        runCommand: '', // Will be set dynamically
        baseImage: 'openjdk:11-slim',
        setup: []
      },
      // Add more languages as needed
    };

    return configs[language.toLowerCase()] || null;
  }

  // Modify executeCode to include better error handling and logging
  async executeCode(fileUrl, providedLanguage = null) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-'));
    const containerName = `code-exec-${Date.now()}`;
    
    try {
      // Download and extract zip
      const zipPath = path.join(tempDir, 'submission.zip');
      const response = await axios({
        method: 'get',
        url: fileUrl,
        responseType: 'arraybuffer'
      });
      await fs.writeFile(zipPath, response.data);
      
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(tempDir, true);

      // Read files and analyze code
      const files = await this.readFiles(tempDir);
      console.log('Files found:', files.map(f => f.name));

      // Create package directory structure if needed
      for (const file of files) {
        const content = file.content;
        const packageMatch = content.match(/package\s+([\w.]+);/);
        if (packageMatch) {
          const packagePath = packageMatch[1].replace(/\./g, path.sep);
          const targetDir = path.join(tempDir, 'src', packagePath);
          await fs.mkdir(targetDir, { recursive: true });
          await fs.writeFile(path.join(targetDir, file.name), content);
        } else {
          // No package - put in src directory
          await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });
          await fs.writeFile(path.join(tempDir, 'src', file.name), content);
        }
      }

      // Create bin directory
      await fs.mkdir(path.join(tempDir, 'bin'), { recursive: true });

      // Get base config and find main class
      const config = this.getLanguageConfig(providedLanguage || 'java');
      const mainClass = this.findMainClass(files);

      if (!mainClass) {
        throw new Error('No main class found in submission');
      }

      // Update commands to use src directory
      config.buildCommand = 'find src -name "*.java" > sources.txt && javac -d bin -cp src @sources.txt';
      config.runCommand = `java -cp bin ${mainClass}`;

      console.log('Using main class:', mainClass);
      console.log('Build command:', config.buildCommand);
      console.log('Run command:', config.runCommand);

      // Generate Dockerfile with correct directory structure
      const dockerfile = `FROM ${config.baseImage}
WORKDIR /app
${config.setup.map(cmd => `RUN ${cmd}`).join('\n')}
COPY . .
RUN ${config.buildCommand}
CMD ${config.runCommand}`;

      await fs.writeFile(path.join(tempDir, 'Dockerfile'), dockerfile);

      // Get all files recursively for Docker context
      const getAllFiles = async (dir) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const files = [];
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            files.push(...(await getAllFiles(fullPath)));
          } else {
            files.push(fullPath);
          }
        }
        return files;
      };

      // Build image with proper context
      const allFiles = await getAllFiles(tempDir);
      const contextFiles = allFiles.map(file => path.relative(tempDir, file));

      const image = await docker.buildImage({
        context: tempDir,
        src: contextFiles
      }, {
        t: containerName
      });

      await new Promise((resolve, reject) => {
        image.pipe(process.stdout);
        image.on('end', resolve);
        image.on('error', reject);
      });

      // Run container with limits
      const container = await docker.createContainer({
        Image: containerName,
        name: containerName,
        HostConfig: {
          Memory: 512 * 1024 * 1024, // 512MB
          MemorySwap: 512 * 1024 * 1024,
          NanoCpus: 1 * 1000000000, // 1 CPU
          AutoRemove: true
        },
      });

      // Modified parseContainerOutput function
      const parseContainerOutput = (buffer) => {
        const output = buffer.toString('utf8');
        const lines = output.split('\n')
          .map(line => line.trim())
          .filter(Boolean);

        const stdout = [];
        const stderr = [];

        for (const line of lines) {
          // Docker prefixes stdout with 0x01 and stderr with 0x02
          if (line.charCodeAt(0) === 2) {
            stderr.push(line.slice(1));
          } else {
            stdout.push(line.replace(/^\x01/, ''));
          }
        }

        return {
          stdout: stdout.join('\n'),
          stderr: stderr.join('\n')
        };
      };

      // Run container and get output
      await container.start();
      
      // Wait for container to finish and get logs
      const output = await Promise.race([
        new Promise(async (resolve) => {
          // Wait for container to finish
          await container.wait();
          // Get all logs after completion
          const logs = await container.logs({
            stdout: true,
            stderr: true,
            timestamps: false,
            follow: false
          });
          resolve(logs);
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Execution timeout')), 10000)
        )
      ]);

      const { stdout, stderr } = parseContainerOutput(output);

      return {
        stdout: stdout || 'No output',
        stderr: stderr || '',
        language: config.language,
        executionTime: '1s',
        mainClass
      };

    } catch (error) {
      console.error('Build/execution error:', error);
      return {
        stdout: '',
        stderr: error.message,
        language: 'Java',
        executionTime: '0s',
        error: true
      };
    } finally {
      // Cleanup
      try {
        const container = docker.getContainer(containerName);
        await container.stop();
      } catch (e) {}

      try {
        const image = docker.getImage(containerName);
        await image.remove();
      } catch (e) {}

      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  async readFiles(dir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name !== 'Dockerfile') {
        const content = await fs.readFile(path.join(dir, entry.name), 'utf8');
        files.push({ name: entry.name, content });
      }
    }

    return files;
  }
}

module.exports = new CodeExecutionService();
