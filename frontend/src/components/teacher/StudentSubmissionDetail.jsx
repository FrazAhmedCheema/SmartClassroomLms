import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, X, Download, Send, User, CheckCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const StudentSubmissionDetail = ({ student, submission, assignment, onBack, onGraded }) => {
  const [grade, setGrade] = useState(submission?.grade || '');
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Back Button */}
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium bg-white px-4 py-2 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to submissions
        </button>
      </div>

      <div className="space-y-6">
        {/* Student Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-300">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
              {student.profilePicture ? (
                <img
                  src={student.profilePicture}
                  alt={student.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <p className="text-blue-600">{student.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Side Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Assignment Details */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-300">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Assignment Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-3">{assignment.title}</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{assignment.instructions}</p>
              </div>
            </div>

            {/* Submitted Files Section */}
            {submission && (
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Submitted Files</h3>
                <div className="space-y-3">
                  {submission.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <a 
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {file.fileName}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Student's Comment */}
                {submission.privateComment && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Student's Comment</h4>
                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <p className="text-gray-700">{submission.privateComment}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Grading Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-300 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Grade Submission</h3>
              {success ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 border-2 border-green-200">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-lg font-medium text-green-700">Grade submitted successfully!</p>
                </div>
              ) : (
                <form onSubmit={handleGrade} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Grade (out of 100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Feedback
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-none"
                      placeholder="Provide feedback to the student..."
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border-2 border-red-200">
                      {error}
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium transition-all ${
                        loading 
                          ? 'bg-blue-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg border-2 border-blue-700'
                      }`}
                    >
                      <Send className="w-5 h-5 mr-2" />
                      {loading ? 'Submitting...' : 'Submit Grade'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSubmissionDetail;
