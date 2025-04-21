import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FileText, Paperclip, X, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';
import { updateClasswork } from '../../../redux/slices/classSlice';

const MaterialDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const material = useSelector((state) =>
    state.class?.classwork?.data?.find((m) => m._id === id && m.type === 'material')
  );
  const teacherAuth = useSelector(state => state.teacher);
  const studentAuth = useSelector(state => state.student);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Determine if the current user is a teacher or student
  const currentUser = teacherAuth.isAuthenticated ? teacherAuth : studentAuth;
  const isTeacher = teacherAuth.isAuthenticated;
  
  // Get current user ID based on who is logged in
  const currentUserId = teacherAuth.isAuthenticated ? teacherAuth.teacherId : studentAuth.studentId;

  const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true
  });
  
  useEffect(() => {
    if (!material) {
      fetchMaterial();
    }
  }, [id]);
  
  const fetchMaterial = async () => {
    try {
      const response = await api.get(`/material/item/${id}`);
      if (response.data.success) {
        // Update the material in Redux store
        dispatch(updateClasswork({
          ...response.data.material,
          type: 'material'
        }));
      }
    } catch (error) {
      console.error('Error fetching material:', error);
    }
  };

  if (!material) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Material not found.</p>
      </div>
    );
  }

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
    } else {
      const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`;
      return (
        <iframe
          src={viewerUrl}
          title={file.fileName}
          className="w-full h-full"
          frameBorder="0"
        />
      );
    }
  };
  
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const userName = isTeacher ? teacherAuth.name : studentAuth.name;
      
      const response = await api.post(`/material/item/${id}/comment`, { 
        text: comment,
        userName // Send the actual user name
      });
      
      if (response.data.success) {
        // Update the material with the new comment
        const updatedMaterial = {
          ...material,
          comments: [...(material.comments || []), response.data.comment]
        };
        
        // Update Redux store
        dispatch(updateClasswork(updatedMaterial));
        
        // Clear input
        setComment('');
      } else {
        setError('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const response = await api.delete(`/material/item/${id}/comment/${commentId}`);
      
      if (response.data.success) {
        // Update material with comment removed
        const updatedMaterial = {
          ...material,
          comments: material.comments.filter(comment => comment._id !== commentId)
        };
        
        // Update Redux store
        dispatch(updateClasswork(updatedMaterial));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{material.title}</h1>
              <p className="text-sm text-gray-500">{material.description || 'No description provided.'}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Attachments */}
        {material.attachments?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Attachments</h2>
            <div className="mt-2 space-y-2">
              {material.attachments.map((file, index) => (
                <div
                  key={index}
                  onClick={() => setPreviewAttachment(file)}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                >
                  <Paperclip className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">{file.fileName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Class Comments</h2>
          
          {/* Comment List */}
          <div className="mt-4 space-y-4">
            {material.comments && material.comments.length > 0 ? (
              material.comments.map((comment) => (
                <div key={comment._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${comment.authorRole === 'Teacher' ? 'text-blue-600' : 'text-gray-700'}`}>
                        {comment.authorName}
                        {comment.authorRole === 'Teacher' && (
                          <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Teacher</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a')}
                      </span>
                    </div>
                    
                    {/* Updated delete button visibility logic */}
                    {(isTeacher || comment.author === currentUserId) && (
                      <button 
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-gray-700">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            )}
          </div>
          
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mt-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a class comment..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={!comment.trim() || isSubmitting}
                className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
                  (!comment.trim() || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Send size={16} />
                <span>Post</span>
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </form>
        </div>
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
              className="bg-white rounded-lg p-4 max-w-4xl w-full relative flex flex-col"
              style={{ height: '90vh' }}
            >
              <button
                onClick={() => setPreviewAttachment(null)}
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

export default MaterialDetailScreen;
