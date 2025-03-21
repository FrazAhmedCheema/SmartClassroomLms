import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import axios from 'axios';
import CreateDiscussionForm from './CreateDiscussionForm';
import DiscussionMessages from './DiscussionMessages';
import { useSelector } from 'react-redux';

const DiscussionTab = ({ classId }) => {
  const teacherState = useSelector(state => state.teacher);
  const studentState = useSelector(state => state.student);
  
  // Combine states based on role
  const { isAuthenticated, role } = teacherState.role ? teacherState : studentState;
  const userId = teacherState.teacherId || studentState.studentId;

  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTopic, setNewTopic] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);

  useEffect(() => {
    if (!classId) {
      console.warn('Waiting for classId...');
      return;
    }

    console.log('Fetching discussions for class:', classId);
    fetchDiscussions();
  }, [classId]);

  const fetchDiscussions = async () => {
    if (!classId) return;

    try {
      const response = await axios.get(`http://localhost:8080/discussions/class/${classId}`, {
        withCredentials: true
      });
      
      if (response.data.discussions) {
        setDiscussions(response.data.discussions);
      } else {
        setDiscussions([]);
      }
    } catch (err) {
      console.error('Failed to load discussions:', err);
      setError('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

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
        setDiscussions([response.data.discussion, ...discussions]);
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
        // Update discussions with new message
        setDiscussions(prev => prev.map(d => {
          if (d._id === activeTopic) {
            return {
              ...d,
              messages: [...d.messages, response.data.message],
              lastActivity: new Date()
            };
          }
          return d;
        }));
        setNewMessage('');
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/discussions/message/${activeTopic}/${messageId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update discussions by removing the deleted message
        setDiscussions(prev => prev.map(d => {
          if (d._id === activeTopic) {
            return {
              ...d,
              messages: d.messages.filter(m => m._id !== messageId)
            };
          }
          return d;
        }));
      }
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  const filteredMessages = discussions.find(d => d._id === activeTopic)?.messages || [];

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
            {discussions.length === 0 ? (
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
              discussions.map((topic) => (
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
          messages={filteredMessages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          topic={discussions.find(t => t._id === activeTopic)}
          onBack={() => setActiveTopic(null)}
        />
      )}
    </motion.div>
  );
};

export default DiscussionTab;