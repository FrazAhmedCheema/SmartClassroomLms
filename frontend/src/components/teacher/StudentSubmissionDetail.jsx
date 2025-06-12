import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Download, Send, User, CheckCircle, ArrowLeft, Play, Code, AlertTriangle, Info } from 'lucide-react'; // Added AlertTriangle, Info
import axios from 'axios';

const StudentSubmissionDetail = ({ student, submission, assignment, onBack, onGraded }) => {
  const [grade, setGrade] = useState(submission?.grade || '');
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [loading, setLoading] = useState(false); // For grading
  const [runCodeLoading, setRunCodeLoading] = useState(false); // For running code
  const [error, setError] = useState(null); // General error for the component
  const [success, setSuccess] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [codeExecutionResult, setCodeExecutionResult] = useState(null); // Stores the new result structure

  const handleGrade = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:8080/submission/grade/${submission._id}`,
        { grade, feedback },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess(true);
        onGraded?.(response.data.submission);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to grade submission');
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = (file) => {
    if (file.fileType.startsWith('image/')) {
      return <img src={file.url} alt={file.fileName} className="max-w-full max-h-full object-contain" />;
    } else if (file.fileType === 'application/pdf') {
      return (
        <iframe
          src={file.url}
          title={file.fileName}
          className="w-full h-full"
          frameBorder="0"
        />
      );
    } else if (
      file.fileType === 'application/msword' ||
      file.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.fileType === 'text/csv' ||
      file.fileType === 'application/vnd.ms-powerpoint' ||
      file.fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`;
      return (
        <iframe
          src={viewerUrl}
          title={file.fileName}
          className="w-full h-full"
          frameBorder="0"
        />
      );
    } else {
      return <p className="text-gray-600">Preview not available for this file type.</p>;
    }
  };

  const handleDownload = (file) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleViewCode = async () => {
    try {
      setLoading(true); // Re-use general loading for simplicity, or use a specific one
      setError(null);
      
      if (!submission?.files) {
        setError('No files available to view');
        return;
      }

      const zipFile = submission.files.find(file => 
        file.fileType === 'application/zip' || 
        file.fileType === 'application/x-zip-compressed'
      );

      if (!zipFile) {
        setError('No zip file found in submission');
        return;
      }

      const response = await axios.post(
        'http://localhost:8080/code-view/prepare',
        { fileUrl: zipFile.url },
        { withCredentials: true }
      );

      if (response.data.success && response.data.localPath) {
        const cleanPath = response.data.localPath.replace(/^file:\/\//, '');
        const vscodeUrl = `vscode://file/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
        window.location.href = vscodeUrl;
      } else {
        throw new Error('Failed to prepare code for viewing');
      }
    } catch (error) {
      console.error('Error viewing code:', error);
      setError(error.response?.data?.message || 'Failed to open code in VS Code');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = async () => {
    setRunCodeLoading(true);
    setError(null);
    setCodeExecutionResult(null);
    
    if (!submission || !submission.files || submission.files.length === 0) {
      setError('No files available to execute');
      setRunCodeLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/code/execute`,
        {
          files: submission.files, // Server will find the zip
          language: assignment.category, // Hint for backend, though it re-analyzes
          submissionId: submission._id
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setCodeExecutionResult(response.data.result); // { language, fileResults, error? }
      } else {
        // Handle cases where success is false but it's not a network error
        setError(response.data.message || 'Code execution request failed.');
        if(response.data.errorDetails) {
            setCodeExecutionResult({ error: response.data.errorDetails }); // Store general error
        }
      }
    } catch (err) {
      console.error('Error executing code:', err);
      setError(err.response?.data?.message || err.message || 'Failed to execute code due to a network or server error.');
      if(err.response?.data?.errorDetails) {
        setCodeExecutionResult({ error: err.response.data.errorDetails });
      }
    } finally {
      setRunCodeLoading(false);
    }
  };

  const isProgrammingAssignment = () => {
    const programmingCategories = ['java', 'c++', 'python', 'mern']; // MERN might need special handling not covered here
    return programmingCategories.includes(assignment.category.toLowerCase());
  };

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <button 
            onClick={onBack}
            style={{color: "#1b68b3",}}
            className="flex items-center text-gray-700  font-medium bg-white px-4 py-2 rounded-lg border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to submissions
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  {student.profilePicture ? (
                    <img
                      src={student.profilePicture}
                      alt={student.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{student.name}</h2>
                  <p className="text-gray-600 text-sm">{student.email}</p>
                  {submission?.submittedAt && (
                    <p className="text-gray-500 text-xs mt-1">
                      Submitted on: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Assignment Details</h3>
                {assignment.dueDate && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    new Date(assignment.dueDate) < new Date()
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h4 className="font-medium text-gray-800 mb-2">{assignment.title}</h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{assignment.instructions}</p>
              </div>
            </div>

            {submission && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Submitted Files</h3>
                  <span className="text-xs text-gray-500">
                    {submission.files.length} {submission.files.length === 1 ? 'file' : 'files'}
                  </span>
                </div>
                <div className="space-y-2">
                  {submission.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors group"
                    >
                      <div 
                        className="flex items-center space-x-3 cursor-pointer flex-grow"
                        onClick={() => setPreviewFile(file)}
                      >
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                          <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="truncate">
                          <p className="text-gray-700 font-medium truncate">{file.fileName}</p>
                          <p className="text-xs text-gray-500">{file.fileType}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                        className="ml-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4"  style={{color:"white"}}/>
                      </button>
                    </div>
                  ))}
                </div>

                {submission.privateComment && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Student's Comment</h4>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-600 text-sm">{submission.privateComment}</p>
                    </div>
                  </div>
                )}

                {isProgrammingAssignment() && submission && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleViewCode}
                        disabled={loading}
                        style={{backgroundColor: "#1b68b3"}}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
                      >
                        <Code className="w-5 h-5" />
                        <span className="font-medium">View Code</span>
                      </button>
                      <button
                        onClick={handleRunCode}
                        disabled={runCodeLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
                      >
                        {runCodeLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Play className="w-5 h-5" />
                        )}
                        <span className="font-medium">{runCodeLoading ? 'Running...' : 'Run Code'}</span>
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-gray-500 text-center">
                      Assignment Category: <span className="font-medium capitalize">{assignment.category}</span>
                    </p>
                  </div>
                )}

                {/* Display Code Execution Results */}
                {codeExecutionResult && (
                  <div className="mt-6 bg-gray-900 rounded-lg p-6 overflow-x-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-200">Execution Results</h4>
                      {codeExecutionResult.language && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/30 text-blue-300 capitalize">
                          {codeExecutionResult.language}
                        </span>
                      )}
                    </div>

                    {/* General Error Display */}
                    {codeExecutionResult.error && (
                      <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="w-5 h-5 mr-2 text-red-400"/>
                          <strong className="font-semibold">Overall Execution Failed:</strong>
                        </div>
                        <p className="text-sm mb-1">{codeExecutionResult.error.message}</p>
                        {codeExecutionResult.error.aiAnalysis && typeof codeExecutionResult.error.aiAnalysis.explanation === 'string' && (
                           <div className="mt-2 text-xs p-3 bg-red-800/60 rounded">
                             <p><strong>AI Analysis:</strong> {codeExecutionResult.error.aiAnalysis.explanation}</p>
                           </div>
                        )}
                        {codeExecutionResult.error.rawBuildOutput && (
                            <details className="mt-2 text-xs">
                                <summary className="cursor-pointer hover:underline">Show Raw Build Output</summary>
                                <pre className="mt-1 p-2 bg-black/30 rounded whitespace-pre-wrap break-all">
                                    {codeExecutionResult.error.rawBuildOutput}
                                </pre>
                            </details>
                        )}
                      </div>
                    )}

                    {/* Per-File Results */}
                    {codeExecutionResult.fileResults && codeExecutionResult.fileResults.map((fileRes, index) => (
                      <div key={index} className="mb-6 p-4 bg-gray-800/70 rounded-lg border border-gray-700">
                        <h5 className="text-md font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-2">
                          File: <span className="font-mono">{fileRes.fileName}</span>
                        </h5>
                        
                        {/* Status Badge */}
                        <div className="mb-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full
                            ${fileRes.status === 'success' ? 'bg-green-500/30 text-green-300' : ''}
                            ${fileRes.status === 'compile_error' ? 'bg-red-500/30 text-red-300' : ''}
                            ${fileRes.status === 'runtime_error' ? 'bg-yellow-500/30 text-yellow-300' : ''}
                            ${fileRes.status === 'not_run_due_to_compile_error' ? 'bg-gray-500/30 text-gray-400' : ''}
                            ${['script_error', 'unknown', 'unknown_error'].includes(fileRes.status) ? 'bg-purple-500/30 text-purple-300' : ''}
                          `}>
                            Status: {fileRes.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Successful Output */}
                        {fileRes.status === 'success' && fileRes.stdout && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Output:</p>
                            <pre className="text-green-300 whitespace-pre-wrap p-3 bg-black/30 rounded font-mono text-sm">{fileRes.stdout}</pre>
                          </div>
                        )}

                        {/* Compile Error Analysis */}
                        {fileRes.status === 'compile_error' && fileRes.compileErrorAnalysis && (
                          <div className="space-y-2 text-sm">
                            <div className="text-red-400"><strong>Explanation:</strong> {fileRes.compileErrorAnalysis.explanation}</div>
                            <div className="text-yellow-400"><strong>Location:</strong> {fileRes.compileErrorAnalysis.location}</div>
                            <div className="text-blue-400"><strong>Solution:</strong> {fileRes.compileErrorAnalysis.solution}</div>
                            {fileRes.compileErrorAnalysis.rawErrors && (
                              <details className="mt-2 text-xs">
                                <summary className="cursor-pointer hover:underline text-gray-400">Show Raw Compiler Errors</summary>
                                <pre className="mt-1 p-2 bg-black/30 rounded whitespace-pre-wrap break-all text-red-400">
                                  {fileRes.compileErrorAnalysis.rawErrors}
                                </pre>
                              </details>
                            )}
                          </div>
                        )}
                        
                        {/* Runtime Error */}
                        {fileRes.status === 'runtime_error' && (
                          <div className="text-sm">
                            {fileRes.stdout && (
                              <div className="mb-2">
                                <p className="text-xs text-gray-400 mb-1">Standard Output (if any):</p>
                                <pre className="text-gray-300 whitespace-pre-wrap p-3 bg-black/30 rounded font-mono text-sm">{fileRes.stdout}</pre>
                              </div>
                            )}
                            <p className="text-xs text-gray-400 mb-1">Runtime Error:</p>
                            <pre className="text-yellow-300 whitespace-pre-wrap p-3 bg-black/30 rounded font-mono text-sm">{fileRes.stderr}</pre>
                          </div>
                        )}
                        
                        {/* Other Statuses */}
                        {['not_run_due_to_compile_error', 'script_error', 'unknown', 'unknown_error'].includes(fileRes.status) && (
                            <div className="p-3 bg-gray-700/50 rounded text-gray-400 text-sm">
                                <Info size={16} className="inline mr-2"/>
                                {fileRes.stderr || `This file was marked as: ${fileRes.status.replace(/_/g, ' ')}.`}
                            </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
                 {error && !codeExecutionResult?.error && ( // Display general Axios/network error if not already handled by codeExecutionResult.error
                    <div className="mt-4 p-3 bg-red-900/50 text-red-300 rounded-lg border border-red-700">
                        <AlertTriangle size={18} className="inline mr-2" />
                        <strong>Error:</strong> {error}
                    </div>
                )}
              </div>
            )}
          </div>

          {/* Grading Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Grade Submission</h3>
              {success ? (
                <div className="text-center py-6">
                  <div className="mx-auto w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-green-600">Grade submitted successfully!</p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-4 text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Edit grade
                  </button>
                </div>
              ) : (
                <form onSubmit={handleGrade} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade (out of 100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Enter grade..."
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Feedback
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={5}
                      className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-none placeholder-gray-400"
                      placeholder="Provide constructive feedback..."
                    />
                  </div>

                  {error && !codeExecutionResult?.error && ( // Display grading error if not a code execution general error
                    <div className="p-3 text-sm bg-red-50 text-red-700 rounded-lg border border-red-100">
                      {error}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      style={{backgroundColor: "#1b68b3"}}
                      className={`w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all ${
                        loading 
                          ? 'bg-blue-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 shadow-xs hover:shadow-sm'
                      }`}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {loading ? 'Submitting...' : 'Submit Grade'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {previewFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl p-4 max-w-4xl w-full relative flex flex-col"
                style={{ height: '90vh' }}
              >
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 truncate max-w-[80%]">
                    {previewFile.fileName}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleDownload(previewFile)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPreviewFile(null)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 rounded-lg">
                  {renderPreview(previewFile)}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default StudentSubmissionDetail;
