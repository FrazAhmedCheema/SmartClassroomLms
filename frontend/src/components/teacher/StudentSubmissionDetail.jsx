import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Download, Send, User, CheckCircle, ArrowLeft, Play, Code } from 'lucide-react';
import axios from 'axios';

const StudentSubmissionDetail = ({ student, submission, assignment, onBack, onGraded }) => {
  const [grade, setGrade] = useState(submission?.grade || '');
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

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

  // Add new handlers for code actions
  const handleViewCode = () => {
    // TODO: Implement code viewing logic
    console.log('View code clicked');
  };

  const handleRunCode = () => {
    // TODO: Implement code running logic
    console.log('Run code clicked');
  };

  // Helper function to check if assignment is a programming assignment
  const isProgrammingAssignment = () => {
    const programmingCategories = ['java', 'c++', 'python', 'mern'];
    return programmingCategories.includes(assignment.category);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back Button */}
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
        {/* Left Column - Student Info and Assignment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Info Card */}
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

          {/* Assignment Details */}
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

          {/* Submitted Files Section */}
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

              {/* Student's Comment */}
              {submission.privateComment && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Student's Comment</h4>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-600 text-sm">{submission.privateComment}</p>
                  </div>
                </div>
              )}

              {/* Programming Assignment Actions - Moved here */}
              {isProgrammingAssignment() && submission && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleViewCode}
                      style={{backgroundColor: "#1b68b3"}}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
                    >
                      <Code className="w-5 h-5" />
                      <span className="font-medium">View Code</span>
                    </button>
                    <button
                      onClick={handleRunCode}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
                    >
                      <Play className="w-5 h-5" />
                      <span className="font-medium">Run Code</span>
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-gray-500 text-center">
                    Assignment Category: <span className="font-medium capitalize">{assignment.category}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Grading Section */}
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

                {error && (
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

      {/* File Preview Modal */}
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
  );
};

export default StudentSubmissionDetail;