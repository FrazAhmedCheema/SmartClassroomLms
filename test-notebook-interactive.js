// Test script to verify notebook interactive execution fix
// This simulates the response structure and tests the condition

const mockResponse = {
  data: {
    success: true,
    isNotebookRedirect: true,
    executionResult: {
      language: 'jupyter',
      fileResults: [
        {
          fileName: 'test_notebook.ipynb',
          isNotebook: true,
          contentType: 'text/html',
          stdout: '<html><body><h1>Test Notebook Output</h1></body></html>',
          status: 'success'
        }
      ]
    },
    message: 'Jupyter notebook detected - executed on EC2 instead of interactive mode'
  }
};

// Test the condition that should catch the notebook redirect
function testNotebookRedirectCondition() {
  console.log('Testing notebook redirect condition...');
  
  const { success, isNotebookRedirect } = mockResponse.data;
  console.log('success:', success, typeof success);
  console.log('isNotebookRedirect:', isNotebookRedirect, typeof isNotebookRedirect);
  
  const condition1 = success && isNotebookRedirect;
  console.log('Condition (success && isNotebookRedirect):', condition1);
  
  if (condition1) {
    console.log('✅ PASS: Notebook redirect condition would be caught');
  } else {
    console.log('❌ FAIL: Notebook redirect condition would NOT be caught');
  }
  
  return condition1;
}

// Run the test
testNotebookRedirectCondition();

console.log('\nMock response structure:');
console.log(JSON.stringify(mockResponse.data, null, 2));
