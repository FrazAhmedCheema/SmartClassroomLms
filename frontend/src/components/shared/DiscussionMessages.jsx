import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Paperclip, Image, Smile, Clock, Trash2, Reply, MoreVertical } from 'lucide-react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import axios from 'axios';

const DiscussionMessages = ({ messages, newMessage, setNewMessage, onSendMessage, onDeleteMessage, topic, onBack }) => {
  const teacherState = useSelector(state => state.teacher);
  const studentState = useSelector(state => state.student);
  
  // Get current user ID based on role
  const currentUserId = teacherState.teacherId || studentState.studentId;
  const userRole = teacherState.role || studentState.role;

  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDelete = async (messageId) => {
    try {
      // Use SweetAlert instead of the built-in confirm dialog
      const result = await Swal.fire({
        title: 'Delete Message',
        text: 'Are you sure you want to delete this message? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });
      
      if (result.isConfirmed) {
        // Send the delete request to the backend
        const response = await axios.delete(
          `http://localhost:8080/discussions/message/${topic._id}/${messageId}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          // Show success toast
          Swal.fire({
            title: 'Deleted!',
            text: 'Your message has been deleted.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          
          // Update UI by filtering out the deleted message
          if (onDeleteMessage) {
            onDeleteMessage(messageId);
          }
        }
      }
      
      // Clear the messageToDelete state
      setMessageToDelete(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      // Show error toast
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete message. Please try again.',
        icon: 'error'
      });
      setMessageToDelete(null);
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    // Remove automatic username insertion
    setNewMessage('');
    document.querySelector('textarea').focus();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await onSendMessage(e, replyingTo?._id);
      setReplyingTo(null); // Only clear replyingTo if message was sent successfully
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally show error to user
    }
  };

  const getMessageIndentation = (message) => {
    return message.replyTo ? 'ml-8' : '';
  };

  const isAuthor = (message) => message.author?._id === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[calc(100vh-180px)] bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center p-6 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 rounded-xl transition-all duration-200 mr-3"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">{topic?.title}</h2>
          <div className="flex items-center mt-1 text-sm text-gray-500">
            <Clock size={14} className="mr-1" />
            Started by {topic?.author?.name || 'Unknown'} • {messages.length} messages
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
      >
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`flex items-start space-x-4 group ${getMessageIndentation(message)}`}
            >
              <div className="flex-shrink-0 pt-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md transform transition-transform group-hover:scale-105">
                  {message.author?.name?.charAt(0) || '?'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {message.author?.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center">
                      <Clock size={12} className="mr-1" />
                      {new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAuthor(message) ? (
                      <button
                        onClick={() => handleDelete(message._id)}
                        className="p-1 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600 transition-colors"
                        title="Delete message"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReply(message)}
                        className="p-1 hover:bg-blue-50 rounded-lg text-blue-500 hover:text-blue-600 transition-colors"
                        title="Reply to message"
                      >
                        <Reply size={16} />
                      </button>
                    )}
                  </div>
                </div>
                {message.replyTo && (
                  <div className="text-sm text-gray-500 mt-1">
                    Replying to @{messages.find(m => m._id === message.replyTo)?.author?.name}
                  </div>
                )}
                <p className="mt-1 text-gray-800 leading-relaxed">
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        {replyingTo && (
          <div className="flex items-center justify-between mb-2 p-2 bg-blue-50 rounded">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-600">
                Replying to {replyingTo.author?.name}
              </span>
              <span className="text-xs text-gray-500">
                "{replyingTo.content.substring(0, 50)}..."
              </span>
            </div>
            <button
              onClick={() => {
                setReplyingTo(null);
                setNewMessage('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex flex-col">
          <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-3 bg-white text-gray-900 focus:outline-none resize-none"
              rows={3}
              required
            />
            
            {/* Buttons below textarea */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                {[
                  { icon: Paperclip, tooltip: "Attach file" },
                  { icon: Image, tooltip: "Add image" },
                ].map((item, index) => (
                    <button
                        key={index}
                        type="button"
                        title={item.tooltip}
                        style={{ backgroundColor: '#f9fafb' , border: '1px solid #f9fafb',  padding: '0.5rem' , margin: '0.1rem' , cursor: 'pointer' }}
                        className="p-1.5 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-700"
                    >
                        <item.icon size={18} />
                    </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center space-x-2"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default DiscussionMessages;
