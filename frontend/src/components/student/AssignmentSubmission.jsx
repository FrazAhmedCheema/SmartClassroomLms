import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, FileText, AlertCircle, Check, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const AssignmentSubmission = ({ assignment, onSubmit, isSubmitting }) => {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [privateComment, setPrivateComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false); 
  const fileInputRef = useRef(null);

  // Check if assignment exists before proceeding
  if (!assignment || !assignment._id) {
    console.error('Assignment prop is missing or invalid:', assignment);
    return (
      <div className="mt-8 bg-white rounded-lg border border-red-100 p-5 shadow-sm text-center">
        <p className="text-red-500">Error: Cannot load assignment submission form</p>
      </div>
    );
  }

  console.log('AssignmentSubmission component rendered for assignment:', assignment._id);

  // Fetch existing submission on load to show any previous comments
  useEffect(() => {
    const fetchExistingSubmission = async () => {
      try {
        console.log('Fetching existing submission for assignment:', assignment._id);
        const response = await axios.get(
          `http://localhost:8080/submission/student/${assignment._id}`,
          { withCredentials: true }
        );
        
        if (response.data.success && response.data.submission) {
          console.log('Found existing submission:', response.data.submission);
          setPrivateComment(response.data.submission.privateComment || '');
        } else {
          console.log('No existing submission found');
        }
      } catch (error) {
        console.error('Error fetching existing submission:', error);
      }
    };
    
    fetchExistingSubmission();
  }, [assignment._id]);

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
    // Reset the file input to allow selecting the same file again
    e.target.value = '';
  };

  const handleFiles = (newFiles) => {
    setError(null);
    // Check file size (50MB limit)
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

  const handleSubmitComment = async () => {
    if (!privateComment.trim()) return;
    
    try {
      setIsSubmittingComment(true);
      setError(null);
      
      console.log('Submitting private comment for assignment:', assignment._id);
      const response = await axios.post(
        `http://localhost:8080/submission/${assignment._id}/comment`,
        { privateComment },
        { withCredentials: true }
      );
      
      setSuccessMessage('Private comment saved successfully');
      console.log('Comment submitted successfully:', response.data);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError(error.response?.data?.message || 'Failed to save comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Please add at least one file to submit');
      return;
    }
    
    try {
      setSuccessMessage(null);
      setError(null);
      console.log('Submitting assignment with files:', files);
      
      const formData = new FormData(); // Create new FormData instance
      files.forEach(file => {
        formData.append('files', file);
      });
      
      if (privateComment) {
        formData.append('privateComment', privateComment);
      }
      
      const response = await axios.post(
        `http://localhost:8080/submission/${assignment._id}/submit`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
      if (response.data.success) {
        setFiles([]);
        setSuccessMessage('Assignment submitted successfully!');
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error(response.data.message || 'Failed to submit assignment');
      }
    } catch (err) {
      console.error('Error in submission:', err);
      setError(err.message || 'Failed to submit assignment');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-8 bg-white rounded-lg border border-blue-100 p-5 shadow-sm"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Your work</h3>
      </div>

      {/* Upload Area */}
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
            <h4 className="text-sm font-medium text-gray-700 mb-2">Attached files ({files.length})</h4>
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
            onClick={handleSubmitComment}
            disabled={isSubmittingComment || !privateComment.trim()}
            className="self-end p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            title="Save comment"
          >
            {isSubmittingComment ? (
              <div className="w-5 h-5 animate-spin border-t-2 border-white rounded-full"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1 italic">
          Your comment will only be visible to your teacher
        </p>
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

      {/* Submit Button */}
      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={files.length === 0 || isSubmitting}
          className={`px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-all
            ${files.length === 0 || isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow hover:shadow-md'
            }`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : 'Turn in'}
        </button>
      </div>
    </motion.div>
  );
};

export default AssignmentSubmission;
