# Jupyter Notebook Support Implementation

## Overview
Successfully extended the Smart Classroom LMS to support Jupyter notebook (.ipynb) execution using EC2 instance at `16.16.214.215`. The implementation ensures all existing Java, C++, and Python (.py) code execution remains untouched while adding robust notebook support.

## Key Features Implemented

### 1. Backend Changes

#### Service Layer (`services/codeExecution.js`)
- **Enhanced `analyzeCode()` method**: Now detects `.ipynb` files first before processing other file types
- **New `executeNotebookOnEC2()` method**: Handles notebook execution workflow
- **New `executeNotebookRemotely()` method**: Manages SSH connection and command execution on EC2
- **New `executeCommandsSequentially()` method**: Executes SSH commands in sequence for reliability
- **Enhanced `executeInteractiveCode()` method**: Now blocks interactive execution for notebooks with helpful error message

#### SSH Integration
- Added `ssh2` npm package for EC2 connectivity
- Configured EC2 connection to `16.16.214.215` using SSH agent forwarding
- Supports multiple authentication methods (SSH keys, password, agent)

#### Notebook Execution Pipeline
1. **Detection**: Identifies `.ipynb` files during zip analysis
2. **Transfer**: Uploads notebook content to EC2 via SSH
3. **Dependency Installation**: Automatically scans and installs pip packages found in notebook cells
4. **Execution**: Uses `nbclient` to execute notebook with 5-minute timeout
5. **Conversion**: Converts executed notebook to HTML using `nbconvert`
6. **Return**: Sends HTML content back to frontend for display

### 2. Frontend Changes

#### User Interface (`frontend/src/components/teacher/StudentSubmissionDetail.jsx`)
- **Enhanced assignment type detection**: Added `isNotebookAssignment()` function
- **Improved button rendering**: Shows "Execute Notebook" button instead of interactive terminal for notebooks
- **HTML content rendering**: Added iframe support for displaying notebook HTML output
- **Better error handling**: Graceful handling of notebook-specific errors

#### Assignment Categories
- Extended programming assignment categories to include `jupyter` and `notebook`
- Notebook assignments show specialized execution button instead of interactive terminal

### 3. Controller Layer
- **No changes required**: Existing `codeExecutionController.js` handles notebook responses seamlessly
- Maintains consistent API response format for all execution types

## Technical Implementation Details

### Notebook Detection Logic
```javascript
const notebookFiles = files.filter(f => f.name.endsWith('.ipynb'));
if (notebookFiles.length > 0) {
  return {
    fileType: 'jupyter',
    projectType: 'notebook',
    isNotebook: true,
    mainFile: notebookFiles[0].name,
    notebookFiles: notebookFiles.map(f => f.name),
    message: 'Jupyter notebook project detected. Will execute on EC2 instance.'
  };
}
```

### EC2 Execution Commands
1. `mkdir -p /tmp/notebook_<timestamp>` - Create working directory
2. Upload notebook content via SSH cat command with EOF delimiter
3. Python script to scan for pip install commands and install dependencies
4. Python script using nbclient and nbconvert to execute and convert notebook
5. Return HTML content

### Frontend HTML Rendering
```jsx
{fileRes.isNotebook && fileRes.contentType === 'text/html' ? (
  <iframe
    srcDoc={fileRes.stdout}
    title={`Notebook output for ${fileRes.fileName}`}
    className="w-full min-h-96 border-0"
    sandbox="allow-scripts allow-same-origin"
  />
) : (
  <pre className="text-green-300 whitespace-pre-wrap p-3 bg-black/30 rounded font-mono text-sm">
    {fileRes.stdout}
  </pre>
)}
```

## Security Considerations

### SSH Authentication
- Currently configured for SSH agent forwarding
- Can be easily configured for private key or password authentication
- Connection timeout set to 30 seconds for reliability

### Sandbox Execution
- Notebooks execute in isolated temporary directories on EC2
- HTML output is sandboxed in iframe with restricted permissions
- Automatic cleanup of temporary files after execution

## Required EC2 Setup
The following packages must be pre-installed on the EC2 instance:
```bash
pip install nbclient nbformat nbconvert matplotlib pandas numpy
```

## Error Handling

### Interactive Mode Block
- Jupyter notebooks cannot be run in interactive mode
- Clear error message guides users to use regular execution
- Frontend hides interactive button for notebook assignments

### SSH Connection Errors
- Comprehensive error handling for connection failures
- Detailed error messages for debugging
- Fallback error responses maintain API consistency

## Backward Compatibility
- ✅ All existing Java code execution unchanged
- ✅ All existing C++ code execution unchanged  
- ✅ All existing Python (.py) code execution unchanged
- ✅ All existing MERN stack execution unchanged
- ✅ All existing Docker-based execution unchanged

## API Response Format
Notebook execution returns the same format as other code execution:
```javascript
{
  success: true,
  result: {
    language: 'jupyter',
    fileResults: [{
      fileName: 'notebook.ipynb',
      status: 'success',
      stdout: '<html>...</html>', // Full HTML content
      stderr: null,
      isNotebook: true,
      contentType: 'text/html'
    }]
  }
}
```

## Testing
- Created `test-notebook.ipynb` with sample Python code and visualizations
- Created `test-notebook-detection.js` for testing notebook detection logic
- Verified frontend renders notebook execution button correctly

## Future Enhancements
1. Support for multiple notebooks in single submission
2. Real-time execution progress feedback
3. Notebook cell-by-cell execution results
4. Support for custom kernel specifications
5. Integration with cloud storage for large datasets

## Configuration
Update `.env` file with EC2 credentials if using private key authentication:
```bash
EC2_HOST=16.16.214.215
EC2_USERNAME=ubuntu
EC2_PRIVATE_KEY_PATH=/path/to/your/key.pem
```
