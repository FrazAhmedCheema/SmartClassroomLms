import React, { useState, useEffect } from 'react';
import { Paperclip, Send, Clock, Upload, Check, X, AlertCircle } from 'lucide-react';
import { format, isPast } from 'date-fns';
import axios from 'axios';
import { motion } from 'framer-motion';

const WorkSubmission = ({ itemId, itemType, dueDate, studentInfo }) => {
  const [files, setFiles] = useState([]);
  const [comment, setComment] = useState('');
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true
  });
  
  const isOverdue = dueDate && isPast(new Date(dueDate));
  
  // Fetch existing submission if any
  useEffect(() => {
    const fetchSubmission = async () => {
      if (!itemId || !studentInfo.studentId) return;
      
      setLoading(true);
      try {
        // Updated endpoints to use new route structure
        const endpoint = itemType === 'quiz' 
          ? `/quiz-submission/${itemId}/student`
          : `/assignment-submission/${itemId}/student`;
          
        const response = await api.get(endpoint);
        
        if (response.data.success && response.data.submission) {
          setSubmission(response.data.submission);
        }
      } catch (error) {
        console.error(`Error fetching ${itemType} submission:`, error);
        // Don't show error if it's just that no submission exists yet
        if (error.response?.status !== 404) {
          setError(`Could not load your submission. ${error.response?.data?.message || ''}`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmission();
  }, [itemId, itemType, studentInfo.studentId]);
  
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };
  
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0 && !comment.trim()) {
      setError('Please upload at least one file or add a comment before submitting.');
      return;
    }
    
    setError(null);
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append('comment', comment);
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      // Updated endpoints to use new route structure
      const endpoint = itemType === 'quiz' 
        ? `/quiz-submission/${itemId}/submit`
        : `/assignment-submission/${itemId}/submit`;
        
      const response = await api.post(endpoint, formData);
      
      if (response.data.success) {
        setSuccessMessage(`Your ${itemType} has been submitted successfully!`);
        setSubmission(response.data.submission);
        setFiles([]);
        setComment('');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error(`Error submitting ${itemType}:`, error);
      setError(error.response?.data?.message || `Failed to submit your ${itemType}.`);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleUnsubmit = async () => {
    if (!window.confirm(`Are you sure you want to unsubmit this ${itemType}?`)) {
      return;
    }
    
    setSubmitting(true);
    try {
      // Updated endpoints to use new route structure
      const endpoint = itemType === 'quiz' 
        ? `/quiz-submission/${itemId}/unsubmit`
        : `/assignment-submission/${itemId}/unsubmit`;
        
      const response = await api.post(endpoint);
      
      if (response.data.success) {
        setSubmission(null);
        setSuccessMessage(`Your ${itemType} has been unsubmitted.`);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error(`Error unsubmitting ${itemType}:`, error);
      setError(error.response?.data?.message || `Failed to unsubmit your ${itemType}.`);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6 flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading your work...</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-xl font-medium text-gray-900">Your Work</h2>
      
      {/* Due date information */}
      {dueDate && (
        <div className={`flex items-center mt-2 ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
          <Clock className="w-4 h-4 mr-2" />
          <span>
            {isOverdue 
              ? `Due date passed: ${format(new Date(dueDate), 'PPp')}` 
              : `Due ${format(new Date(dueDate), 'PPp')}`
            }
          </span>
        </div>
      )}
      
      {/* Error and success messages */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 text-red-700 rounded-lg mt-4 flex items-center"
        >
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </motion.div>
      )}
      
      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-green-50 text-green-700 rounded-lg mt-4 flex items-center"
        >
          <Check className="w-5 h-5 mr-2" />
          {successMessage}
        </motion.div>
      )}
      
      {/* Submission status */}
      {submission ? (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-blue-700 font-medium">
                  {itemType === 'quiz' 
                    ? 'Quiz completed' 
                    : 'Assignment turned in'}
                </p>
                <p className="text-sm text-blue-600">
                  {submission.submittedAt ? 
                    `Submitted on ${format(new Date(submission.submittedAt), 'PPp')}` : 
                    'Submitted'
                  }
                  {submission.late && <span className="ml-2 text-amber-600 font-medium">LATE</span>}
                </p>
              </div>
            </div>
            
            {/* Only show unsubmit button if not graded yet */}
            {!submission.grade && !submission.score && (
              <button
                onClick={handleUnsubmit}
                disabled={submitting}
                className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Unsubmit
              </button>
            )}
          </div>
          
          {/* Attached files */}
          {submission.files && submission.files.length > 0 && (
            <div className="mt-4">
              <h3 className="text-gray-700 font-medium mb-2">Submitted files:</h3>
              <div className="space-y-2">
                {submission.files.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <Paperclip className="w-4 h-4 text-gray-400 mr-2" />
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {file.fileName}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Student comment */}
          {submission.comment && (
            <div className="mt-4">
              <h3 className="text-gray-700 font-medium mb-2">Your comment:</h3>
              <p className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                {submission.comment}
              </p>
            </div>
          )}
          
          {/* Grade information if available */}
          {(submission.grade || submission.score !== undefined) && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-green-700 font-medium">Graded</h3>
              <div className="mt-1 flex items-center">
                <p className="text-xl font-semibold text-green-900">
                  {submission.grade || submission.score || 0}
                  <span className="text-sm text-green-700 ml-1">
                    / {itemType === 'quiz' ? submission.quiz?.points : submission.assignment?.points || 100}
                  </span>
                </p>
              </div>
              
              {/* Feedback if available */}
              {(submission.feedback) && (
                <div className="mt-2 pt-2 border-t border-green-200">
                  <h4 className="text-sm text-green-700 mb-1">Teacher feedback:</h4>
                  <p className="text-green-900">
                    {submission.feedback}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* File upload section */}
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="work-file-upload"
              />
              <label htmlFor="work-file-upload" className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Click to upload files</p>
                  <p className="text-xs text-gray-500">or drag and drop</p>
                </div>
              </label>
            </div>
            
            {/* Selected files preview */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Comment section */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Add private comment (optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Add a comment for your teacher..."
            />
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || (files.length === 0 && !comment.trim())}
              className={`px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center ${
                submitting || (files.length === 0 && !comment.trim()) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-blue-700'
              }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Turn in {itemType}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WorkSubmission;
