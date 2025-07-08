import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Paperclip, Image, Smile, Clock, Trash2, Reply, MoreVertical } from 'lucide-react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import axios from 'axios';

const DiscussionMessages = ({ messages, newMessage, setNewMessage, onSendMessage, onDeleteMessage, topic, onBack }) => {
  const teacherState = useSelector(state => state.teacher);
  const studentState = useSelector(state => state.student);

  // Determine the role and user ID based on authentication state
  const isTeacherAuthenticated = teacherState?.isAuthenticated;
  const isStudentAuthenticated = studentState?.isAuthenticated;

  const currentUserId = isTeacherAuthenticated
    ? teacherState?.teacherId
    : isStudentAuthenticated
    ? studentState?.studentId
    : null;

  const userRole = isTeacherAuthenticated
    ? 'teacher'
    : isStudentAuthenticated
    ? 'student'
    : null;

  // Log derived values for debugging
  console.log('Derived currentUserId:', currentUserId);
  console.log('Derived userRole:', userRole);

  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDelete = async (messageId) => {
    try {
      // Use SweetAlert with smaller and more concise text
      const result = await Swal.fire({
        title: 'Delete Message?',
        text: 'This cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        width: '300px', // Smaller width
        heightAuto: false, // Reduce extra space
        customClass: {
          title: 'text-lg',
          content: 'text-sm'
        }
      });
      
      if (result.isConfirmed) {
        // Send the delete request to the backend
        const response = await axios.delete(
          `http://localhost:8080/discussions/message/${topic._id}/${messageId}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          // Show a smaller success toast
          Swal.fire({
            title: 'Deleted!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            width: '250px',
            toast: true,
            position: 'top-end'
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
        text: 'Failed to delete',
        icon: 'error',
        width: '250px',
        timer: 1500,
        showConfirmButton: false
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

  const isAuthor = (message) => {
    // Log details for debugging
    console.log('Checking isAuthor for message:', message);
    console.log('Current user ID:', currentUserId);
    console.log('Message author ID:', message.author?._id);
    console.log('User role:', userRole);

    // Teachers can delete all messages; students can delete only their own
    return userRole === 'teacher' || message.author?._id === currentUserId;
  };

  const handleTerminateDiscussion = async () => {
    try {
      const result = await Swal.fire({
        title: 'Terminate Discussion?',
        text: 'This will disable further messages in this discussion.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Terminate',
        cancelButtonText: 'Cancel',
      });

      if (!result.isConfirmed) return;

      const response = await axios.post(
        `http://localhost:8080/discussions/terminate/${topic._id}`,
        {},
        {
          withCredentials: true, // Ensure cookies are sent with the request
        }
      );

      if (response.data.success) {
        Swal.fire({
          title: 'Terminated!',
          text: 'This discussion has been terminated.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });

        // Update the topic's terminated status without mutating the original object
        const updatedTopic = { ...topic, terminated: true };
        onBack(); // Navigate back to the discussion list
      }
    } catch (error) {
      console.error('Error terminating discussion:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to terminate discussion. Please try again.',
        icon: 'error',
      });
    }
  };

  // Add a helper function to extract author name properly from message
  const getAuthorName = (message) => {
    if (!message) return 'Unknown';
    
    // Try different possible paths to find the author name
    if (message.author) {
      // If author is a string (just the name)
      if (typeof message.author === 'string') {
        return message.author;
      }
      
      // If author is an object with name property
      if (message.author.name) {
        return message.author.name;
      }
      
      // If author has firstName/lastName
      if (message.author.firstName) {
        return `${message.author.firstName} ${message.author.lastName || ''}`;
      }
    }
    
    // Try authorId path (sometimes backend populates it this way)
    if (message.authorId) {
      if (typeof message.authorId === 'string') {
        return 'User'; // Just ID, can't get name
      }
      
      if (message.authorId.name) {
        return message.authorId.name;
      }
      
      if (message.authorId.firstName) {
        return `${message.authorId.firstName} ${message.authorId.lastName || ''}`;
      }
    }
    
    // Try other potential paths
    if (message.student && message.student.name) {
      return message.student.name;
    }
    
    if (message.teacher && message.teacher.name) {
      return message.teacher.name;
    }
    
    // Last resort - check message.authorModel or authorRole + check the message directly
    if ((message.authorModel === 'Student' || message.authorRole === 'student') && message.name) {
      return message.name;
    }
    
    return 'Unknown';
  };

  // Get the first letter of author name for the avatar
  const getAuthorInitial = (message) => {
    const name = getAuthorName(message);
    return name !== 'Unknown' ? name.charAt(0) : '?';
  };
  
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
        {userRole === 'teacher' && !topic.terminated && (
          <button
            onClick={handleTerminateDiscussion}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Terminate
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
      >
        {topic.terminated && (
          <div className="text-center text-red-500 font-semibold mb-4">
            This discussion has been terminated. No further messages are allowed.
          </div>
        )}
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message._id}
              // Debug logging when hovering over messages
              onMouseEnter={() => console.log('Message data:', message)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`flex items-start space-x-4 group ${getMessageIndentation(message)}`}
            >
              <div className="flex-shrink-0 pt-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md transform transition-transform group-hover:scale-105">
                  {getAuthorInitial(message)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {getAuthorName(message)}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center">
                      <Clock size={12} className="mr-1" />
                      {new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  {/* Action Buttons - Show both delete and reply buttons */}
                  <div className="flex items-center space-x-2 opacity-100 group-hover:opacity-100 transition-opacity">
                    {isAuthor(message) && (
                      <button
                        onClick={() => handleDelete(message._id)}
                        className="p-2 hover:bg-red-500 rounded-lg bg-red-500 text-white hover:text-white transition-colors"
                        title="Delete message"
                      >
                        <Trash2 size={18} className="text-white" />
                      </button>
                    )}
                    <button
                      onClick={() => handleReply(message)}
                      className="p-2 hover:bg-blue-500 rounded-lg bg-blue-500 text-white hover:text-white transition-colors"
                      title="Reply to message"
                    >
                      <Reply size={18} className="text-white" />
                    </button>
                  </div>
                </div>
                {message.replyTo && (
                  <div className="text-sm text-gray-500 mt-1">
                    Replying to @{getAuthorName(messages.find(m => m._id === message.replyTo) || {})}
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
      {!topic.terminated && (
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
      )}
    </motion.div>
  );
};

export default DiscussionMessages;
