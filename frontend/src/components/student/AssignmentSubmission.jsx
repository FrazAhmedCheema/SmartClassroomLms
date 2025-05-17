import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, FileText, AlertCircle, Check, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useSelector } from 'react-redux';

const AssignmentSubmission = ({ assignment, quiz, submissionType = 'assignment' }) => {
  const [files, setFiles] = useState([]);
  const [submittedFiles, setSubmittedFiles] = useState([]);
  const [privateComment, setPrivateComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [grade, setGrade] = useState(null);
  const [feedback, setFeedback] = useState('');
  const fileInputRef = useRef(null);

  const studentId = useSelector(state => state.student.studentId);
  const item = submissionType === 'quiz' ? quiz : assignment;

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        if (!item?._id || !studentId) return;

        const endpoint = submissionType === 'quiz'
          ? `/submission/quiz/${item._id}/student`
          : `/submission/student/${item._id}`;

        const response = await axios.get(`http://localhost:8080${endpoint}`, { withCredentials: true });

        if (response.data.success && response.data.submission) {
          setSubmittedFiles(response.data.submission.files || []);
          setPrivateComment(response.data.submission.privateComment || '');
          setIsSubmitted(true);
          setIsEditable(false);
          setGrade(response.data.submission.grade);
          setFeedback(response.data.submission.feedback);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          setError('Failed to fetch submission');
        }
      }
    };

    fetchSubmission();
  }, [item?._id, studentId, submissionType]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
    e.target.value = '';
  };

  const handleFiles = (newFiles) => {
    setError(null);
    const invalidFiles = newFiles.filter(file => file.size > 50 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError('Files must be smaller than 50MB');
      return;
    }
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }; 
 // Add this new function

  const removeSubmittedFile = (index) => {
    setSubmittedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0 && submittedFiles.length === 0) {
      setError('Please add at least one file to submit');
      return;
    }
  
    if (!studentId) {
      setError('Student ID not found. Please log in again.');
      return;
    }
  
    try {
      setError(null);
      const formData = new FormData();
            // Add new files

      files.forEach(file => formData.append('files', file));
            // Add existing files data
     
      formData.append('existingFiles', JSON.stringify(submittedFiles));
      
      if (privateComment) formData.append('privateComment', privateComment);
      formData.append('studentId', studentId);

      const endpoint = submissionType === 'quiz'
        ? `/submission/quiz/${quiz._id}/submit`
        : `/submission/${assignment._id}/submit`;
  
      const response = await axios.post(
        `http://localhost:8080${endpoint}`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
      if (response.data.success) {
        // Update submitted files with both existing and new files
        setSubmittedFiles(response.data.submission.files);
        setFiles([]);
        setSuccessMessage(`${submissionType} submitted successfully!`);
        setIsSubmitted(true);
        setIsEditable(false);
      } else {
        throw new Error(response.data.message || 'Failed to submit assignment');
      }
    } catch (err) {
      console.error('Error in submission:', err);
      setError(err.message || 'Failed to submit assignment');
    }
  };

  const handleUnsubmit = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/submission/student/${assignment._id}/unsubmit`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setIsSubmitted(false);
        setIsEditable(true);
        setSuccessMessage('Submission has been unsubmitted. You can now modify your files.');
      } else {
        throw new Error(response.data.message || 'Failed to unsubmit assignment');
      }
    } catch (err) {
      console.error('Error in unsubmission:', err);
      setError(err.message || 'Failed to unsubmit assignment');
    }
  };

  const handleSaveComment = async () => {
    try {
      const endpoint = submissionType === 'quiz'
        ? `/submission/quiz/${quiz._id}/comment`
        : `/submission/${assignment._id}/comment`;

      const response = await axios.post(
        `http://localhost:8080${endpoint}`,
        { privateComment },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccessMessage('Private comment saved successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(response.data.message || 'Failed to save comment');
      }
    } catch (err) {
      console.error('Error saving comment:', err);
      setError(err.message || 'Failed to save comment');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-8 bg-white rounded-lg border border-blue-100 p-5 shadow-sm"
    >
      {/* Header Section with Grade Badge */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Your work</h3>
            <p className="text-sm text-gray-500">Assignment submission</p>
          </div>
        </div>
        
        {/* Grade Badge - Show if graded */}
        {grade !== null && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Grade</p>
              <div className="flex items-baseline justify-center">
                <span className="text-3xl font-bold text-blue-600">{grade}</span>
                <span className="text-gray-500 ml-1">/100</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Grid - Two Column Layout for larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Submission Files and Feedback */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submitted Files Section */}
          {(isSubmitted || submittedFiles.length > 0) && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {isSubmitted ? 'Submitted files' : 'Attached files'}
              </h4>
              <div className="space-y-2">
                {submittedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-2 truncate">
                      <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-500" />
                      </div>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" 
                         className="text-sm text-blue-600 hover:underline truncate">
                        {file.fileName}
                      </a>
                    </div>
                    {!isSubmitted && (
                      <button 
                        onClick={() => removeSubmittedFile(index)}
                        className="p-1.5 hover:bg-gray-200 rounded-full flex-shrink-0 transition-colors ml-2"
                        title="Remove file"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {isSubmitted && (
                <button
                  onClick={handleUnsubmit}
                  disabled={grade !== null}
                  className={`mt-4 px-4 py-2 rounded-lg text-white
                    ${grade !== null 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'}`}
                >
                  Unsubmit
                </button>
              )}
            </div>
          )}

          {/* Teacher's Feedback - Show if exists */}
          {feedback && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Teacher's Feedback</h4>
              <p className="text-gray-700 bg-white p-3 rounded border border-blue-100">{feedback}</p>
            </div>
          )}

          {/* Upload Area */}
          {(!isSubmitted || isEditable) && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center transition-all
                  ${dragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }`}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                  ref={fileInputRef}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3 transition-transform hover:scale-110">
                    <Upload className="w-8 h-8 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 mb-1">
                    Drop files here or click to upload
                  </span>
                  <span className="text-xs text-gray-500">
                    Maximum file size: 50MB
                  </span>
                </label>
              </div>

              {/* File List */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-5"
                  >
                    <h4 className="text-sm font-medium text-gray-700 mb-2">New files ({files.length})</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {files.map((file, index) => (
                        <motion.div
                          key={`${file.name}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="truncate">
                              <span className="text-sm text-gray-700 font-medium truncate block">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1.5 hover:bg-gray-200 rounded-full flex-shrink-0 transition-colors ml-2"
                            title="Remove file"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <div className="mt-5 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={files.length === 0 && submittedFiles.length === 0}
                  className={`px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-all
                    ${files.length === 0 && submittedFiles.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 shadow hover:shadow-md'
                    }`}
                >
                  {isEditable ? 'Resubmit' : 'Turn in'}
                </button>
              </div>
            </div>
          )}
           {/* Private Comment Section */}
        <div className="mt-5">
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-700">Private comment</h4>
          </div>
          <div className="flex items-center gap-2">
            <textarea
              value={privateComment}
              onChange={(e) => setPrivateComment(e.target.value)}
              placeholder="Add a private comment (only visible to your teacher)"
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition-all text-black"
              rows="3"
            />
            <button
              onClick={handleSaveComment}
              className="self-end p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
        </div>

       

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center space-x-2"
          >
            <Check className="w-5 h-5" />
            <span className="text-sm">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AssignmentSubmission;
