const Docker = require('dockerode');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const axios = require('axios');
const { OpenAI } = require('openai');

// Configure Docker to use the EC2-hosted Docker Engine
const docker = new Docker({
  host: '13.61.185.212', // EC2 public IP
  port: 2375,            // Docker TCP port
  protocol: 'http'
});

// Configure OpenAI API
const openai = new OpenAI(process.env.OPENAI_API_KEY);

class CodeExecutionService {
  async analyzeCode(files) {
    const codeContent = files.map(f => `File: ${f.name}\nContent:\n${f.content}`).join('\n\n');
    
    const prompt = `Analyze the following code files and provide:
1. The main file or entry point (e.g., the file containing the main method or function).
2. The required build/compile commands.
3. The run command to execute the code.
4. The appropriate Docker base image to use.
5. Any additional setup commands required.

Code files:
${codeContent}

Response format:
{
  "mainFile": "main file name",
  "buildCommand": "build/compile command",
  "runCommand": "run command",
  "baseImage": "docker base image",
  "setupCommands": ["list of setup commands"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    try {
      const analysis = JSON.parse(response.choices[0].message.content);
      
      // Determine language and file type
      const fileExtensions = files.map(f => f.name.split('.').pop().toLowerCase());
      const isCpp = fileExtensions.includes('cpp') || fileExtensions.includes('cc');
      const isJava = fileExtensions.includes('java');

      analysis.fileType = isCpp ? 'cpp' : isJava ? 'java' : 'unknown';
      analysis.baseImage = isCpp ? 'gcc:latest' : 'openjdk:8';
      
      return analysis;
    } catch (error) {
      throw new Error('Failed to parse GPT response for code analysis');
    }
  }

  async executeCode(fileUrl) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-'));
    const containerName = `code-exec-${Date.now()}`;
    let container = null;
    let containerCreated = false;
    let analysis = null;

    try {
      // Download and extract zip
      const zipPath = path.join(tempDir, 'submission.zip');
      const response = await axios({
        method: 'get',
        url: fileUrl,
        responseType: 'arraybuffer'
      });
      await fs.writeFile(zipPath, response.data);

      // Extract files locally
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(tempDir, true);
      await fs.unlink(zipPath);

      // Read files and analyze
      const files = await this.readFiles(tempDir);
      console.log('Files found:', files.map(f => f.name));

      try {
        analysis = await this.analyzeCode(files);
        console.log('Code analysis:', analysis);

        // Generate Dockerfile based on file type
        let dockerfile;
        if (analysis.fileType === 'cpp') {
          const mainFile = analysis.mainFile.replace('.cpp', '');
          dockerfile = `FROM ${analysis.baseImage}
WORKDIR /app
RUN mkdir -p bin
COPY *.cpp *.h .
RUN g++ -o bin/${mainFile} *.cpp
CMD ["./bin/${mainFile}"]`;
        } else {
          // Existing Java Dockerfile generation code
          const mainFile = files.find(f => f.name === analysis.mainFile);
          const packageMatch = mainFile?.content.match(/package\s+([\w.]+);/);
          const hasPackage = !!packageMatch;
          
          dockerfile = hasPackage ? 
            `FROM ${analysis.baseImage}
WORKDIR /app
RUN mkdir -p src/com/example bin
COPY *.java src/com/example/
RUN javac -d bin src/com/example/*.java
ENV CLASSPATH=/app/bin
CMD ["java", "com.example.${analysis.mainFile.replace('.java', '')}"]` :
            `FROM ${analysis.baseImage}
WORKDIR /app
RUN mkdir -p bin
COPY *.java .
RUN javac -d bin *.java
ENV CLASSPATH=/app/bin
CMD ["java", "-cp", "bin", "${analysis.mainFile.replace('.java', '')}"]`;
        }

        await fs.writeFile(path.join(tempDir, 'Dockerfile'), dockerfile);
        console.log('Generated Dockerfile:', dockerfile);

        // Build Docker image with debug logging
        console.log('Building Docker image with Dockerfile:');
        console.log(dockerfile);
        
        const buildStream = await docker.buildImage({
          context: tempDir,
          src: await this.getContextFiles(tempDir)
        }, { 
          t: containerName,
          nocache: true,
          forcerm: true 
        });

        // Wait for build to complete and collect all output
        const buildOutput = await new Promise((resolve, reject) => {
          let output = [];
          buildStream.on('data', data => {
            const lines = data.toString().split('\n').filter(Boolean);
            output.push(...lines);
          });
          
          docker.modem.followProgress(buildStream, 
            (err, res) => err ? reject(err) : resolve({ result: res, output }),
            (event) => console.log('Build event:', event?.stream?.trim() || event)
          );
        });

        console.log('Build output:', buildOutput.output);

        // Verify image exists with retries
        const maxRetries = 3;
        let imageExists = false;
        
        for (let i = 0; i < maxRetries && !imageExists; i++) {
          try {
            console.log(`Attempting to verify image (attempt ${i + 1}/${maxRetries})...`);
            const images = await docker.listImages();
            imageExists = images.some(img => 
              img.RepoTags && img.RepoTags.includes(`${containerName}:latest`)
            );
            
            if (!imageExists) {
              console.log('Image not found, waiting before retry...');
              await new Promise(r => setTimeout(r, 1000)); // Wait 1 second between retries
            }
          } catch (err) {
            console.error('Error checking for image:', err);
          }
        }

        if (!imageExists) {
          throw new Error('Failed to verify Docker image build. Build output: ' + 
            JSON.stringify(buildOutput.output));
        }

        // Create and start container with improved output capturing
        console.log('Creating Docker container...');
        container = await docker.createContainer({
          Image: containerName,
          name: containerName,
          HostConfig: {
            AutoRemove: false,
            Memory: 512 * 1024 * 1024,
            MemorySwap: 512 * 1024 * 1024,
            NanoCpus: 1 * 1000000000
          },
          AttachStdout: true,
          AttachStderr: true,
          Tty: false
        });
        containerCreated = true;

        console.log('Starting Docker container...');
        await container.start();

        // Wait for container to complete and capture output
        const output = await new Promise((resolve, reject) => {
          let stdout = '';
          let stderr = '';

          container.wait((waitErr, waitData) => {
            if (waitErr) {
              reject(waitErr);
              return;
            }

            container.logs({
              stdout: true,
              stderr: true,
              follow: false,
              timestamps: false
            }, (logErr, logData) => {
              if (logErr) {
                reject(logErr);
                return;
              }

              const logs = logData.toString('utf8');
              console.log('Raw container logs:', logs);

              logs.split('\n').forEach(line => {
                line = line.trim();
                if (line.startsWith('STDERR:')) {
                  stderr += line.substring(7) + '\n';
                } else {
                  stdout += line + '\n';
                }
              });

              resolve({
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                exitCode: waitData.StatusCode
              });
            });
          });
        });

        console.log('Container output:', output);

        return {
          stdout: output.stdout || 'No output',
          stderr: output.stderr || '',
          executionTime: '1s',
          exitCode: output.exitCode,
          analysis
        };

      } catch (analysisError) {
        console.error('Analysis error:', analysisError);
        throw analysisError; // Propagate to outer catch block
      }

    } catch (error) {
      console.error('Error during code execution:', error);
      return {
        stdout: '',
        stderr: 'Build/Execution error: ' + error.message,
        executionTime: '0s',
        error: true,
        buildLogs: error.buildOutput || []
      };

    } finally {
      // Enhanced cleanup logic
      if (containerCreated) {
        try {
          console.log('Stopping container...');
          await container.stop().catch(() => console.log('Container already stopped'));
          
          console.log('Removing container...');
          await container.remove({ force: true }).catch(e => 
            console.log('Container removal error:', e.message)
          );
        } catch (e) {
          console.error('Container cleanup error:', e.message);
        }
      }

      try {
        console.log('Removing Docker image...');
        const image = docker.getImage(containerName);
        await image.remove({ force: true }).catch(e => 
          console.log('Image removal error:', e.message)
        );
      } catch (e) {
        console.error('Image cleanup error:', e.message);
      }

      // Clean up temp directory
      await fs.rm(tempDir, { recursive: true, force: true })
        .catch(e => console.error('Temp directory cleanup error:', e.message));
    }
  } // Close executeCode method

  async readFiles(dir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile()) {
        files.push({ name: entry.name, content: await fs.readFile(path.join(dir, entry.name), 'utf8') });
      }
    }

    return files;
  }

  async parseContainerOutput(logStream) {
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      logStream.on('data', chunk => {
        const output = chunk.toString('utf8');
        if (output.startsWith('\x01')) {
          stdout += output.slice(1);
        } else if (output.startsWith('\x02')) {
          stderr += output.slice(1);
        }
      });

      logStream.on('end', () => resolve({ stdout, stderr }));
      logStream.on('error', reject);
    });
  }

  // New helper method to get context files
  async getContextFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return ['Dockerfile', ...entries
      .filter(entry => entry.isFile() && entry.name !== 'Dockerfile')
      .map(entry => entry.name)
    ];
  }
}

module.exports = new CodeExecutionService();
