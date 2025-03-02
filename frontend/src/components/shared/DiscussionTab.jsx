import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, ThumbsUp, Reply, MoreVertical, ArrowLeft } from 'lucide-react';

const DiscussionTab = ({ classData, userRole }) => {
  const [newTopic, setNewTopic] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);
  
  const topics = [
    {
      id: 1,
      title: 'Questions about Assignment 1',
      author: 'Ayesha Asghar',
      createdAt: '2023-09-08T14:32:00Z',
      replies: 5,
      lastActivity: '2023-09-10T09:45:00Z',
    },
    {
      id: 2,
      title: 'Study Group for Midterm',
      author: 'Fraz Ahmed',
      createdAt: '2023-09-09T16:20:00Z',
      replies: 8,
      lastActivity: '2023-09-11T11:30:00Z',
    },
    {
      id: 3,
      title: 'Additional Resources for Chapter 3',
      author: 'Nimra Aslam',
      createdAt: '2023-09-07T10:15:00Z',
      replies: 3,
      lastActivity: '2023-09-09T08:20:00Z',
    },
  ];
  
  const messages = [
    {
      id: 1,
      topicId: 1,
      author: 'Ayesha Asghar',
      content: 'I\'m having trouble understanding question 3 in Assignment 1. Can anyone explain what it\'s asking for?',
      createdAt: '2023-09-08T14:32:00Z',
      likes: 2,
      isMainPost: true,
    },
    {
      id: 2,
      topicId: 1,
      author: 'Fraz Ahmed',
      content: 'I think it\'s asking for us to analyze the time complexity of the algorithm and suggest improvements.',
      createdAt: '2023-09-08T15:10:00Z',
      likes: 3,
      isMainPost: false,
    },
    {
      id: 3,
      topicId: 1,
      author: 'Zain ul hassan',
      content: 'Alex is correct. You need to analyze the time and space complexity and suggest at least two optimization approaches.',
      createdAt: '2023-09-08T16:45:00Z',
      likes: 5,
      isMainPost: false,
    },
  ];
  
  const handleCreateTopic = (e) => {
    e.preventDefault();
    // Handle topic creation logic
    console.log('Creating topic:', newTopic);
    setNewTopic('');
    setShowTopicForm(false);
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    // Handle message sending logic
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };
  
  const filteredMessages = messages.filter(msg => msg.topicId === activeTopic);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-6"
    >
      {/* Display all topics or messages for a specific topic */}
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
          
          {/* New topic form */}
          {showTopicForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 p-4 rounded-xl mb-6"
            >
              <form onSubmit={handleCreateTopic}>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Enter topic title"
                  className="w-full px-4 py-3 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b68b3] focus:border-transparent"
                  required
                />
                <textarea
                  placeholder="Write your first message"
                  className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b68b3] focus:border-transparent resize-none"
                  rows={4}
                  required
                ></textarea>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTopicForm(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors"
                  >
                    Create Topic
                  </button>
                </div>
              </form>
            </motion.div>
          )}
          
          {/* Topics list */}
          <div className="space-y-2">
            {topics.map((topic) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                onClick={() => setActiveTopic(topic.id)}
              >
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{topic.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="font-medium mr-2">{topic.author}</span>
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
                        {topic.replies} replies
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
            ))}
          </div>
        </>
      ) : (
        /* Topic discussion view */
        <>
          <div className="mb-6">
            {/* <button
              onClick={() => setActiveTopic(null)}
              className="flex items-center text-[#1b68b3] hover:underline mb-4"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to all topics
            </button> */}
            
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {topics.find(t => t.id === activeTopic)?.title}
            </h2>
            <div className="text-sm text-gray-500">
              Started by {topics.find(t => t.id === activeTopic)?.author}
            </div>
          </div>
          
          {/* Messages list */}
          <div className="space-y-6 mb-6">
            {filteredMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${
                  message.isMainPost ? 'border-l-4 border-l-[#1b68b3]' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">
                        {message.author.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{message.author}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <MoreVertical size={18} className="text-gray-400 cursor-pointer" />
                  </div>
                  <p className="text-gray-800 mb-4">{message.content}</p>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center text-gray-200 hover:text-[#1b68b3] text-sm">
                      <ThumbsUp size={14} className="mr-1" />
                      Like ({message.likes})
                    </button>
                    <button className="flex items-center text-gray-200 hover:text-[#1b68b3] text-sm">
                      <Reply size={14} className="mr-1" />
                      Reply
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Reply form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <form onSubmit={handleSendMessage}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write your reply..."
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b68b3] focus:border-transparent resize-none"
                rows={3}
                required
              ></textarea>
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  Reply
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default DiscussionTab;