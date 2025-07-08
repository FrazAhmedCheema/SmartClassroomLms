import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FileText, Calendar, Clock, User, Paperclip, X, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import AssignmentSubmission from '../../student/AssignmentSubmission';
import axios from 'axios';
import SubmissionsList from '../../teacher/SubmissionsList';
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
  
  // State for tracking assignment and loading
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use useRef to track fetch status without causing re-renders
  const hasFetchedRef = useRef(false);
  const currentIdRef = useRef(null);
  
  const isTeacher = propIsTeacher !== undefined ? propIsTeacher : teacherAuth.isAuthenticated;
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to handle assignment loading
  useEffect(() => {
    // Reset fetch status if ID changes
    if (currentIdRef.current !== id) {
      hasFetchedRef.current = false;
      currentIdRef.current = id;
    }
    
    if (propAssignment) {
      // If assignment is passed as prop, use it
      setAssignment(propAssignment);
      setError(null);
      hasFetchedRef.current = true;
      return;
    }
    
    // Check if assignment exists in Redux
    const foundAssignment = id && Array.isArray(assignments) && assignments.find((a) => a && a._id === id);
    
    if (foundAssignment) {
      // If assignment is found in Redux, use it
      setAssignment(foundAssignment);
      setError(null);
      hasFetchedRef.current = true;
      return;
    }
    
    if (id && !hasFetchedRef.current) {
      // If assignment is not in Redux but we have an ID, fetch it
      const fetchAssignment = async () => {
        hasFetchedRef.current = true; // Set this early to prevent multiple calls
        setIsLoading(true);
        setError(null);
        
        try {
          console.log('Fetching assignment with ID:', id);
          const fetchedAssignment = await dispatch(fetchSingleAssignment(id));
          console.log('Fetched assignment result:', fetchedAssignment);
          
          if (fetchedAssignment) {
            setAssignment(fetchedAssignment);
            console.log('Assignment set successfully:', fetchedAssignment);
          } else {
            console.log('No assignment returned from API');
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
