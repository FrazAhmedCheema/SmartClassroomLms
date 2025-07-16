import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FileText, Calendar, Clock, User, Paperclip, X, Trash2, Download, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import AssignmentSubmission from '../../student/AssignmentSubmission';
import axios from 'axios';
import SubmissionsList from '../../teacher/SubmissionsList';
import PlagiarismCheckButton from '../../teacher/PlagiarismCheckButton';
import { fetchSingleAssignment } from '../../../redux/actions/classActions';

const AssignmentDetailScreen = ({ assignment: propAssignment, onClose, isSubmitting: propIsSubmitting, isTeacher: propIsTeacher }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Use props if available, otherwise use Redux
  const assignments = useSelector((state) => state.class?.classwork?.data || []);
  const teacherAuth = useSelector((state) => state.teacher);
  const studentAuth = useSelector((state) => state.student);
  const studentId = useSelector(state => state.student.studentId);
  
  // All useState hooks grouped together
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plagiarismResults, setPlagiarismResults] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // All useRef hooks grouped together
  const hasFetchedRef = useRef(false);
  const currentIdRef = useRef(null);

  // Derived state
  const isTeacher = propIsTeacher !== undefined ? propIsTeacher : teacherAuth.isAuthenticated;

  // Effect for user role check - always runs
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const teacherResponse = await axios.get(
          'http://localhost:8080/teacher/auth-status',
          { withCredentials: true }
        );
        
        if (teacherResponse.data.success) {
          setUserRole('teacher');
        } else {
          const studentResponse = await axios.get(
            'http://localhost:8080/student/auth-status',
            { withCredentials: true }
          );
          
          if (studentResponse.data.success) {
            setUserRole('student');
          } else {
            setUserRole(null);
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setUserRole(null);
      }
    };

    checkUserRole();
  }, []);

  // Effect for assignment loading - always runs
  useEffect(() => {
    if (currentIdRef.current !== id) {
      hasFetchedRef.current = false;
      currentIdRef.current = id;
    }
    
    if (propAssignment) {
      setAssignment(propAssignment);
      setError(null);
      hasFetchedRef.current = true;
      return;
    }
    
    const foundAssignment = id && Array.isArray(assignments) && assignments.find((a) => a && a._id === id);
    
    if (foundAssignment) {
      setAssignment(foundAssignment);
      setError(null);
      hasFetchedRef.current = true;
      return;
    }
    
    if (id && !hasFetchedRef.current) {
      const fetchAssignment = async () => {
        hasFetchedRef.current = true;
        setIsLoading(true);
        setError(null);
        
        try {
          const fetchedAssignment = await dispatch(fetchSingleAssignment(id));
          
          if (fetchedAssignment) {
            setAssignment(fetchedAssignment);
          } else {
            setError('Assignment not found.');
          }
        } catch (err) {
          console.error('Error fetching assignment:', err);
          setError('Failed to load assignment.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchAssignment();
    } else if (!id && !hasFetchedRef.current) {
      setError('Assignment ID not provided.');
      hasFetchedRef.current = true;
    }
  }, [propAssignment, assignments, id, dispatch]);

  // Effect for plagiarism results - always runs but has internal conditions
  useEffect(() => {
    const fetchPlagiarismResults = async () => {
      if (!assignment || userRole !== 'teacher') return;
      
      try {
        const response = await axios.get(
          `http://localhost:8080/plagiarism/${assignment._id}/report`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setPlagiarismResults(response.data.report);
        }
      } catch (error) {
        console.error('Error fetching plagiarism results:', error);
      }
    };

    fetchPlagiarismResults();
  }, [assignment, userRole]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading assignment...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  // Assignment not found
  if (!assignment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Assignment not found.</p>
      </div>
    );
  }

  // Helper to render preview based on fileType
  const renderPreview = (file) => {
    if (file.fileType.startsWith('image/')) {
      return <img src={file.url} alt={file.fileName} className="max-w-full max-h-full" />;
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
      // Use Google Docs Viewer to embed the file
      const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`;
      return (
        <iframe
          src={viewerUrl}
          title={file.fileName}
          className="w-full h-full"
          frameBorder="0"
        />
      );
    } else if (file.fileType === 'application/zip' || file.fileType === 'application/x-rar-compressed') {
      return (
        <div className="text-center">
          <p className="text-gray-700">Preview not available for compressed files.</p>
          <a
            href={file.url}
            download={file.fileName}
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            Download {file.fileName}
          </a>
        </div>
      );
    } else {
      return <p className="text-gray-700">Preview not available for this file type.</p>;
    }
  };

  const handleSubmitAssignment = async (files, privateComment) => {
    try {
      console.log('AssignmentDetailScreen handleSubmitAssignment called');
      console.log('Student ID:', studentId);
      setIsSubmitting(true);

      if (!studentId) {
        throw new Error('Student ID not found. Please log in again.');
      }

      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      if (privateComment) formData.append('privateComment', privateComment);
      formData.append('studentId', studentId); // Add studentId to formData

      const response = await axios.post(
        `http://localhost:8080/submission/${assignment._id}/submit`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        setIsSubmitting(false);
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to submit assignment');
    } catch (error) {
      console.error('Error in assignment submission:', error);
      setIsSubmitting(false);
      throw error;
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  };

  const handlePreviewClose = () => {
    setPreviewAttachment(null);
  };

  // Modify the download button click handler
  const handleDownload = (e, fileUrl, fileName) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Move fetchPlagiarismResults to be a regular function since it's called by a button
  const fetchPlagiarismResultsManual = async () => {
    if (!assignment) return;
    
    try {
      const response = await axios.get(
        `http://localhost:8080/plagiarism/${assignment._id}/report`,
        { withCredentials: true }
      );
      if (response.data.success && response.data.report) {
        // Transform the data to match the expected structure
        const report = response.data.report;
        setPlagiarismResults({
          checkId: report.checkId,
          courseId: report.courseId,
          overview: {
            overviewURL: report.reportUrl,
            submissions: report.overview?.submissions || [],
            bardata: report.overview?.bardata || []
          },
          details: report.details || {},
          status: report.status
        });
      }
    } catch (error) {
      console.error('Error fetching plagiarism results:', error);
    }
  };

  // Function to render plagiarism results
  const renderPlagiarismResults = () => {
    if (!plagiarismResults || !plagiarismResults.overview) return null;

    return (
      <div className="mt-8 border-t pt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Plagiarism Analysis Results</h3>
        
        {/* Report Links */}
        <div className="mb-6 flex gap-4">
          <a
            href={plagiarismResults.overview.overviewURL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Full Report
          </a>
          <a
            href={`https://dashboard.codequiry.com/course/${plagiarismResults.courseId}/assignment/${plagiarismResults.checkId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            Open in Dashboard
          </a>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {plagiarismResults.overview.submissions.map(submission => (
            <div 
              key={submission.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer"
              onClick={() => setSelectedSubmission(submission)}
            >
              <h4 className="font-medium text-gray-900">{submission.filename}</h4>
              <div className="mt-2">
                <div className={`text-lg font-bold ${Number(submission.total_result) > 50 ? 'text-red-600' : 'text-green-600'}`}>
                  {submission.total_result}% Match
                </div>
                <div className="text-sm text-gray-500">
                  Created: {format(new Date(submission.created_at), 'PPp')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Results */}
        {selectedSubmission && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold mb-4">Detailed Analysis for {selectedSubmission.filename}</h4>
            
            <div className="space-y-4">
              {selectedSubmission.submissionresults?.map(result => (
                <div key={result.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Comparison with: {plagiarismResults.overview.submissions.find(s => s.id === result.submission_id_compared)?.filename || result.submission_id_compared}
                    </span>
                    <span className={`text-lg font-bold ${Number(result.score) > 50 ? 'text-red-600' : 'text-green-600'}`}>
                      {result.score}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning for High Similarity */}
        {plagiarismResults.overview.submissions.some(s => Number(s.total_result) > 50) && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-red-800">High Similarity Detected</h5>
              <p className="text-red-700 text-sm mt-1">
                Some submissions show significant similarity. Please review the detailed analysis for more information.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{assignment.title}</h1>
              <p className="text-sm text-gray-500">
                {assignment.points} points •{' '}
                {assignment.dueDate
                  ? `Due ${format(new Date(assignment.dueDate), 'PPp')}`
                  : 'No due date'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Instructions</h2>
          <p className="text-gray-700 mt-2">{assignment.instructions || 'No instructions provided.'}</p>
        </div>

        {/* Attachments */}
        {assignment.attachments?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Attachments</h2>
            <div className="mt-2 space-y-2">
              {assignment.attachments.map((file, index) => (
                <div
                  key={index}
                  
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div
                    onClick={() => setPreviewAttachment(file)}
                    
                    className="flex items-center cursor-pointer"
                  >
                    
                    <Paperclip className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700" >{file.fileName}</span>
                  </div>
                  <a
                                        style={{backgroundColor: "#1b68b3"}}

                    href={file.url}
                    download={file.fileName}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
                    title="Download"
                    onClick={(e) => handleDownload(e, file.url, file.fileName)}
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        

        {/* Add AssignmentSubmission component for students */}
        {!isTeacher && (
          <AssignmentSubmission
            assignment={assignment}
            onSubmit={handleSubmitAssignment} // Pass handleSubmitAssignment to AssignmentSubmission
            isSubmitting={propIsSubmitting || isSubmitting}
          />
        )}

        {/* Add SubmissionsList component for teachers */}
        {isTeacher && (
          <div className="mt-8">
            <SubmissionsList 
              assignment={assignment} 
              classId={assignment.classId} // Pass the classId
            />
          </div>
        )}

        {/* Plagiarism Check Button and Results - Only for Teachers */}
        {userRole === 'teacher' && (
          <>
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Academic Integrity</h3>
              <PlagiarismCheckButton 
                assignmentId={assignment._id} 
                assignmentTitle={assignment.title}
                onCheckComplete={fetchPlagiarismResultsManual}
              />
            </div>
            {renderPlagiarismResults()}
          </>
        )}
      </div>

      {/* Preview Attachment Modal */}
      <AnimatePresence>
        {previewAttachment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              // Updated: set fixed height, flex-col and flex-1 for preview area
              className="bg-white rounded-lg p-4 max-w-4xl w-full relative flex flex-col"
              style={{ height: '90vh' }}  // Force 90% viewport height
            >
              <button
                onClick={handlePreviewClose}
                className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <h3 className="text-xl font-semibold mb-4">{previewAttachment.fileName}</h3>
              <div className="flex-1 flex justify-center items-center overflow-auto">
                {renderPreview(previewAttachment)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentDetailScreen;
