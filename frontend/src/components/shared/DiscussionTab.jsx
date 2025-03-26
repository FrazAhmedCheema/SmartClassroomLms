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
  
  // Combine states based on role
  const { isAuthenticated, role } = teacherState.role ? teacherState : studentState;
  const userId = teacherState.teacherId || studentState.studentId;

  const [newTopic, setNewTopic] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);

  // Use cached data from Redux
  useEffect(() => {
    if (classId && !discussionsData) {
      dispatch(fetchDiscussions(classId));
    }
  }, [classId, discussionsData, dispatch]);

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      if (!isAuthenticated || !role) {
        throw new Error('Authentication required');
      }

      const payload = {
        classId,
        title: newTopic,
        message: newMessage,
        authorModel: role.charAt(0).toUpperCase() + role.slice(1) // Convert 'teacher' to 'Teacher'
      };

      console.log('Creating discussion with:', payload);
      
      const response = await axios.post('http://localhost:8080/discussions/create', payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // Update local state with new discussion
        const newDiscussion = response.data.discussion;
        const updatedDiscussions = discussionsData ? [...discussionsData, newDiscussion] : [newDiscussion];
        dispatch(updateDiscussions(updatedDiscussions));
        
        setNewTopic('');
        setNewMessage('');
        setShowTopicForm(false);
      } else {
        throw new Error(response.data.message || 'Failed to create discussion');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create topic');
      console.error('Create topic error:', err);
    }
  };

  const handleSendMessage = async (e, replyTo = null) => {
    e.preventDefault();
    try {
      console.log('Sending message:', { content: newMessage, replyTo });

      const response = await axios.post(
        `http://localhost:8080/discussions/message/${activeTopic}`,
        {
          content: newMessage,
          replyTo
        },
        {
          withCredentials: true
        }
      );

      if (response.data.success && response.data.message) {
        // Update local state with new message
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

  // Update the handleDeleteMessage function to properly update Redux state
  const handleDeleteMessage = async (messageId) => {
    try {
      // Find the current discussion
      const currentDiscussion = discussionsData.find(d => d._id === activeTopic);
      
      if (!currentDiscussion) return;
      
      // Filter out the deleted message
      const updatedMessages = currentDiscussion.messages.filter(msg => msg._id !== messageId);
      
      // Create a new discussion object with the updated messages
      const updatedDiscussion = {
        ...currentDiscussion,
        messages: updatedMessages
      };
      
      // Create a new array of discussions with the updated one
      const updatedDiscussions = discussionsData.map(disc => 
        disc._id === activeTopic ? updatedDiscussion : disc
      );
      
      // Update the Redux store
      dispatch(updateDiscussions(updatedDiscussions));
      
      // No need to refetch all discussions since we've updated the state locally
    } catch (err) {
      console.error('Error handling message deletion:', err);
      
      // On error, refresh all discussions to ensure consistency
      dispatch(fetchDiscussions(classId));
    }
  };

  if (!classId || loading) {
    return <div className="flex justify-center items-center p-8">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>;
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
                      <span className="font-medium mr-2">{topic.author?.name || 'Unknown'}</span>
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