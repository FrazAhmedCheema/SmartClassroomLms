import React from 'react';

const TestTodo = () => {
  console.log('TestTodo component is rendering...');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Test Todo Page</h1>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">This is a test todo page</h2>
          <p className="text-gray-600">
            If you can see this message, the routing is working correctly and the issue is with the data loading.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestTodo;
