import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import axios from 'axios';
import CreateDiscussionForm from './CreateDiscussionForm';
import DiscussionMessages from './DiscussionMessages';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDiscussions, updateDiscussions } from '../../redux/actions/classActions';

const DiscussionTab = ({ classId }) => {
  const dispatch = useDispatch();
  const { data: discussionsData, loading, error } = useSelector(state => state.class.discussions);
  const teacherState = useSelector(state => state.teacher);
  const studentState = useSelector(state => state.student);

  // Combine states safely based on role
  const currentUser = teacherState?.role ? teacherState : studentState;
  const { isAuthenticated, role } = currentUser || {};
  const userId = teacherState?.teacherId || studentState?.studentId;

  const [newTopic, setNewTopic] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Effect to clear success message after a delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (classId && !discussionsData) {
      dispatch(fetchDiscussions(classId));
    }
  }, [classId, discussionsData, dispatch]);

  const getAuthorName = (author) => {
    if (!author) return 'Unknown';
    if (typeof author === 'string') return author;
    if (author.name) return author.name;
    if (author.firstName) return `${author.firstName} ${author.lastName || ''}`;
    return 'Unknown';
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      if (!isAuthenticated || !role) throw new Error('Authentication required');

      const payload = {
        classId,
        title: newTopic,
        message: newMessage,
        authorModel: role.charAt(0).toUpperCase() + role.slice(1)
      };

      const response = await axios.post('http://localhost:8080/discussions/create', payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        const newDiscussion = response.data.discussion;
        const updatedDiscussions = discussionsData ? [...discussionsData, newDiscussion] : [newDiscussion];
        dispatch(updateDiscussions(updatedDiscussions));

        setNewTopic('');
        setNewMessage('');
        setShowTopicForm(false);
        
        // Show a success message
        setSuccessMessage('Discussion created successfully! Notifications sent to class members.');
        
      } else {
        throw new Error(response.data.message || 'Failed to create discussion');
      }
    } catch (err) {
      console.error('Create topic error:', err);
      alert(err.response?.data?.message || 'Failed to create topic');
    }
  };

  const handleSendMessage = async (e, replyTo = null) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:8080/discussions/message/${activeTopic}`,
        { content: newMessage, replyTo },
        { withCredentials: true }
      );

      if (response.data.success && response.data.message) {
        const updatedDiscussions = discussionsData.map(discussion => {
          if (discussion._id === activeTopic) {
            return {
              ...discussion,
              messages: [...discussion.messages, response.data.message],
              lastActivity: new Date().toISOString()
            };
          }
          return discussion;
        });

        dispatch(updateDiscussions(updatedDiscussions));
        setNewMessage('');
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const currentDiscussion = discussionsData.find(d => d._id === activeTopic);
      if (!currentDiscussion) return;

      const updatedMessages = currentDiscussion.messages.filter(msg => msg._id !== messageId);
      const updatedDiscussion = { ...currentDiscussion, messages: updatedMessages };
      const updatedDiscussions = discussionsData.map(d =>
        d._id === activeTopic ? updatedDiscussion : d
      );

      dispatch(updateDiscussions(updatedDiscussions));
    } catch (err) {
      console.error('Error handling message deletion:', err);
      dispatch(fetchDiscussions(classId));
    }
  };

  if (!classId || loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-6"
    >
      {!activeTopic ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Discussion Topics</h2>
            <button
              onClick={() => setShowTopicForm(true)}
              className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors flex items-center gap-2"
            >
              <MessageSquare size={18} />
              New Topic
            </button>
          </div>

          {showTopicForm && (
            <CreateDiscussionForm
              newTopic={newTopic}
              setNewTopic={setNewTopic}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSubmit={handleCreateTopic}
              onCancel={() => setShowTopicForm(false)}
            />
          )}

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center space-x-2"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span>{successMessage}</span>
            </motion.div>
          )}

          <div className="space-y-2">
            {discussionsData?.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center"
              >
                <MessageSquare size={40} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Discussions Yet</h3>
                <p className="text-gray-500 mb-4">Be the first to start a discussion in this class!</p>
                <button
                  onClick={() => setShowTopicForm(true)}
                  className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors inline-flex items-center"
                >
                  <MessageSquare size={18} className="mr-2" />
                  Start New Topic
                </button>
              </motion.div>
            ) : (
              discussionsData?.map((topic) => (
                <motion.div
                  key={topic._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                  onClick={() => setActiveTopic(topic._id)}
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{topic.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="font-medium mr-2">{getAuthorName(topic.author)}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {new Date(topic.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <MessageSquare size={14} className="mr-1" />
                          {topic.messages.length} replies
                        </div>
                      </div>
                      <div>
                        Last activity: {new Date(topic.lastActivity).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    {topic.terminated && (
                      <div className="mt-3 inline-block px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                        Terminated
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      ) : (
        <DiscussionMessages
          messages={discussionsData?.find(d => d._id === activeTopic)?.messages || []}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          topic={discussionsData?.find(t => t._id === activeTopic)}
          onBack={() => setActiveTopic(null)}
        />
      )}
    </motion.div>
  );
};

export default DiscussionTab;
