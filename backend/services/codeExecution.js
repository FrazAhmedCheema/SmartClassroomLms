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
    if (!files || files.length === 0) {
      throw new Error('No files found to analyze');
    }

    const codeContent = files.map(f => `File: ${f.name}\nContent:\n${f.content}`).join('\n\n');
    
    const prompt = `Analyze these code files and provide information in this exact format:
{
  "mainFile": "name of the main file that should be executed first",
  "fileType": "language type (cpp, java, python)",
  "executionOrder": ["file1.ext", "file2.ext"],
  "buildCommand": "build command if needed",
  "runCommand": "command to run the code",
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
      
      // Add file type based on main file extension
      const mainExt = analysis.mainFile.split('.').pop().toLowerCase();
      analysis.baseImage = this.getBaseImage(mainExt);
      
      return analysis;
    } catch (error) {
      console.error('GPT Analysis error:', error);
      throw new Error('Failed to analyze code files');
    }
  }

  getBaseImage(extension) {
    const imageMap = {
      'cpp': 'gcc:latest',
      'java': 'openjdk:8',
      'py': 'python:3.9-slim'
    };
    return imageMap[extension] || 'gcc:latest';
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

        let dockerfile = this.generateDockerfile(analysis, files);
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

        // Format output using GPT
        const formattedOutput = await this.formatWithGPT(
          output.stdout,
          analysis.outputFormat.title,
          analysis.outputFormat.type
        );

        // Return formatted results
        return {
          title: analysis.outputFormat.title,
          stdout: formattedOutput,
          stderr: output.stderr || '',
          executionTime: '1s',
          language: analysis.fileType
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

  readFiles(dir) {
    return fs.readdir(dir, { withFileTypes: true })
      .then(entries => 
        Promise.all(entries
          .filter(entry => entry.isFile())
          .map(entry => 
            fs.readFile(path.join(dir, entry.name), 'utf8')
              .then(content => ({ name: entry.name, content }))
          )
        )
      );
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
  getContextFiles(dir) {
    return fs.readdir(dir, { withFileTypes: true })
      .then(entries => 
        ['Dockerfile', ...entries
          .filter(entry => entry.isFile() && entry.name !== 'Dockerfile')
          .map(entry => entry.name)
        ]
      );
  }

  generateDockerfile(analysis, files) {
    const setupCommands = [];
    let dockerfile = '';

    switch (analysis.fileType) {
      case 'cpp':
        const cppFiles = analysis.executionOrder.map(file => file.replace('.cpp', ''));
        dockerfile = `FROM ${analysis.baseImage}
WORKDIR /app
COPY . .
${cppFiles.map(file => `RUN g++ -o bin/${file} ${file}.cpp`).join('\n')}
CMD ["sh", "-c", "${cppFiles.map(file => `echo '=== Output from ${file}.cpp ===' && ./bin/${file}`).join(' && ')}"]`;
        break;

      case 'python':
        dockerfile = `FROM ${analysis.baseImage}
WORKDIR /app
COPY . .
CMD ["sh", "-c", "${analysis.executionOrder.map(file => `echo '=== Output from ${file} ===' && python ${file}`).join(' && ')}"]`;
        break;

      case 'java':
        dockerfile = `FROM ${analysis.baseImage}
WORKDIR /app
COPY . .
RUN javac ${analysis.executionOrder.join(' ')}
CMD sh -c '${analysis.executionOrder.map(file => {
          const className = file.replace('.java', '');
          return `echo "=== Output from ${file} ===" && java ${className}`;
        }).join(' && ')}'`;
        break;

      default:
        throw new Error('Unsupported file type');
    }

    return dockerfile;
  }

  formatOutput(stdout, type) {
    if (!stdout) return 'No output';
    
    // Split by file outputs
    const outputs = stdout.split(/===\s*Output from[^=]*===/).filter(Boolean);
    
    if (outputs.length === 0) return stdout.trim();

    // Format each output section
    return outputs.map(output => {
      const formattedOutput = output.trim();
      switch (type) {
        case 'numeric':
          return formattedOutput.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join(',');
        case 'text':
          return formattedOutput;
        case 'mixed':
          return formattedOutput.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
        default:
          return formattedOutput;
      }
    }).join('\n\n');
  }

  async captureOutput(container) {
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      container.logs({
        stdout: true,
        stderr: true,
        follow: true,
        timestamps: false
      })
      .on('data', chunk => {
        const output = chunk.toString('utf8');
        if (output.startsWith('\x01')) {
          stdout += output.slice(1);
        } else if (output.startsWith('\x02')) {
          stderr += output.slice(1);
        }
      })
      .on('end', () => resolve({ stdout, stderr }))
      .on('error', reject);
    });
  }

  async formatWithGPT(stdout, title, type) {
    try {
      const prompt = `Format this program output in a clear, readable way:
Raw output: ${stdout}
Title: ${title}
Type: ${type}

Format it with section headers and proper spacing. For example:

Array Addition Example:
45, 64, 767, 87, 9

Sorting Results:
Bubble Sort: [1, 2, 3, 4, 5]
Quick Sort: [1, 2, 3, 4, 5]

Make sure numbers are properly comma-separated and use clear section headers.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error formatting output with GPT:', error);
      return stdout; // Return original output if formatting fails
    }
  }
}

module.exports = new CodeExecutionService();
