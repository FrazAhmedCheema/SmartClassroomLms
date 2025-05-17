import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, X, CheckCircle } from 'lucide-react';
import axios from 'axios';

const GradeAssignment = ({ submission, onClose, onGraded }) => {
  const [grade, setGrade] = useState(submission?.grade || '');
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
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
        setTimeout(() => {
          onGraded?.(response.data.submission);
          onClose();
        }, 1000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to grade submission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
      >
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-800">Grade Assignment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Grading Successful!</h3>
            <p className="text-gray-600">The submission has been graded successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student: <span className="font-semibold">{submission?.studentId?.name || 'Unknown Student'}</span>
              </label>
              <div className="h-px bg-gray-200 my-3"></div>
            </div>
            
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                Grade (out of 100)
              </label>
              <input
                id="grade"
                type="number"
                min="0"
                max="100"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              />
            </div>

            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                Feedback
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Provide feedback to the student..."
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center px-4 py-2 rounded-md text-white transition-colors ${
                  loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit Grade'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default GradeAssignment;
