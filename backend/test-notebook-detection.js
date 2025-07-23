const codeExecutionService = require('./services/codeExecution');
const fs = require('fs').promises;
const path = require('path');

async function testNotebookDetection() {
  console.log('Testing Jupyter notebook detection...');
  
  try {
    // Read the test notebook
    const notebookPath = path.join(__dirname, 'test-notebook.ipynb');
    const notebookContent = await fs.readFile(notebookPath, 'utf8');
    
    // Create a files array similar to what would be extracted from a zip
    const files = [
      {
        name: 'test-notebook.ipynb',
        content: notebookContent
      }
    ];
    
    // Test the analysis
    const analysis = await codeExecutionService.analyzeCode(files);
    console.log('Analysis result:', JSON.stringify(analysis, null, 2));
    
    if (analysis.isNotebook) {
      console.log('✅ Notebook detection successful!');
      console.log(`Detected file type: ${analysis.fileType}`);
      console.log(`Main notebook file: ${analysis.mainFile}`);
    } else {
      console.log('❌ Notebook detection failed');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testNotebookDetection();
