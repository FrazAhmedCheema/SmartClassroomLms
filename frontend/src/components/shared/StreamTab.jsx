import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CreateAnnouncementForm from './CreateAnnouncementForm';
import { formatDistanceToNow } from 'date-fns';
import { Send, Link, File, Image, Calendar, Paperclip, User, Clock } from 'lucide-react';

const defaultClassData = {
  coverImage: 'https://gstatic.com/classroom/themes/img_code.jpg', // default cover image
  section: 'Loading...',
  className: 'Loading...',
  teachers: [{ name: 'Loading...' }],
  classCode: 'Loading...',
  announcements: []
};

const StreamTab = ({ classData = defaultClassData, userRole }) => {
  const [announcement, setAnnouncement] = useState('');
  const [hoveredButton, setHoveredButton] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const isTeacher = userRole === 'Teacher';
  
  // Merge provided classData with default values to ensure all properties exist
  const safeClassData = {
    ...defaultClassData,
    ...classData,
    teachers: classData?.teachers || defaultClassData.teachers,
    classCode: classData?.classCode || 'Loading...' // Only show loading if classCode is undefined
  };

  const announcements = safeClassData?.announcements || [
    {
      _id: 'default-1',
      content: 'Welcome to the class! 👋',
      createdBy: {
        name: 'System',
        role: 'system'
      },
      createdAt: new Date().toISOString()
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle submission logic
    console.log('Announcement submitted:', announcement);
    setAnnouncement('');
  };

  const handleCreateAnnouncement = async (content) => {
    // ...existing code...
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-6"
    >
      {/* Class banner with improved glass effect */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-72 rounded-2xl relative bg-cover bg-center mb-8 overflow-hidden"
        style={{ 
          backgroundImage: `url(${safeClassData.coverImage})`,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.2) 100%)'
        }}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-0 left-0 right-0 p-8"
          >
            <div className="inline-block px-4 py-1.5 rounded-full mb-4" 
                style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.3)', 
                  backdropFilter: 'blur(10px)'
                }}>
              <span className="text-white text-sm font-medium">{safeClassData.section}</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              {safeClassData.className}
            </h1>
            <div className="flex items-center flex-wrap gap-2">
              <div className="px-4 py-1.5 rounded-full flex items-center space-x-2" 
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                    backdropFilter: 'blur(10px)'
                  }}>
                <User size={14} style={{ color: 'white' }} />
                <span className="text-sm text-white">Teacher: {isTeacher ? "You" : safeClassData.teachers?.[0]?.name || "Dr. Sarah Johnson"}</span>
              </div>
                {isTeacher && safeClassData.classCode !== 'Loading...' && (
                  <div className="px-4 py-1.5 rounded-full flex items-center space-x-2"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                        backdropFilter: 'blur(10px)'
                      }}>
                    <span className="text-sm text-white">Class Code: {safeClassData.classCode}</span>
                  </div>
                )}
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Announcement form - enhanced UI */}
      {isTeacher && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl p-6 mb-8 overflow-hidden"
          style={{ 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3" 
                   style={{ backgroundColor: '#1b68b3', color: 'white' }}>
                {safeClassData.teachers?.[0]?.name?.charAt(0) || "T"}
              </div>
              <p className="font-medium" style={{ color: '#374151' }}>Announce something to your class</p>
            </div>
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Share updates, resources, or announcements..."
              className="w-full p-4 border rounded-lg resize-none transition-all duration-200"
              style={{ 
                backgroundColor: '#f9fafb',
                borderColor: '#e5e7eb',
                outline: 'none',
                fontSize: '15px',
                lineHeight: '1.5'
              }}
              rows={3}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex space-x-1">
                {[
                  { id: 'link', icon: <Link size={20} />, tip: 'Add Link' },
                  { id: 'file', icon: <File size={20} />, tip: 'Add File' }, 
                  { id: 'image', icon: <Image size={20} />, tip: 'Add Image' },
                  { id: 'calendar', icon: <Calendar size={20} />, tip: 'Add Due Date' }
                ].map((item) => (
                  <button 
                    key={item.id}
                    type="button" 
                    className="p-2 rounded-full transition-all duration-200"
                    style={{ 
                      backgroundColor: hoveredButton === item.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      color: hoveredButton === item.id ? '#1b68b3' : '#9ca3af' 
                    }}
                    title={item.tip}
                    onMouseEnter={() => setHoveredButton(item.id)}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm transition-all duration-200"
                style={{ 
                  backgroundColor: announcement.trim() ? '#1b68b3' : '#e5e7eb',
                  color: announcement.trim() ? 'white' : '#9ca3af',
                  cursor: announcement.trim() ? 'pointer' : 'not-allowed'
                }}
                disabled={!announcement.trim()}
              >
                <Send size={16} />
                Post
              </button>
            </div>
          </form>
        </motion.div>
      )}
      
      {/* Create announcement button for teachers */}
      {userRole === 'Teacher' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          {showCreateForm ? (
            <CreateAnnouncementForm
              onSubmit={handleCreateAnnouncement}
              onCancel={() => setShowCreateForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full text-left px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              Create announcement...
            </button>
          )}
        </div>
      )}

      {/* Announcements list with professional design */}
      <div className="space-y-6">
        {announcements.map((post, index) => (
          <motion.div
            key={post._id || `announcement-${index}`} // Updated key prop
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl overflow-hidden"
            style={{ 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#1b68b3', color: 'white' }}>
                  {post.createdBy?.name?.charAt(0) || 'U'}
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    <h3 className="font-medium" style={{ color: '#111827' }}>{post.createdBy?.name || 'Unknown User'}</h3>
                    {post.createdBy?.role === 'Teacher' && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs" 
                            style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                        Teacher
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-xs mt-1" style={{ color: '#6b7280' }}>
                    <Clock size={12} className="mr-1" />
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <p className="whitespace-pre-wrap mb-4 leading-relaxed" style={{ color: '#374151' }}>{post.content}</p>
              
              {/* Attachments with improved UI */}
              {post.attachments?.length > 0 && (
                <div className="mt-4 mb-4">
                  {post.attachments.map((attachment, i) => {
                    const [isHovered, setIsHovered] = useState(false);
                    return (
                      <div 
                        key={`${post._id}-attachment-${i}`} // Added unique key
                        className="flex items-center p-3 border rounded-lg transition-colors"
                        style={{
                          backgroundColor: isHovered ? '#eff6ff' : '#f9fafb',
                          borderColor: isHovered ? '#bfdbfe' : '#e5e7eb',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                      >
                        <div className="p-2 rounded-md mr-3" style={{ backgroundColor: '#dbeafe' }}>
                          <File className="w-5 h-5" style={{ color: '#2563eb' }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: '#2563eb' }}>{attachment.name}</p>
                          <p className="text-xs" style={{ color: '#6b7280' }}>PDF Document</p>
                        </div>
                        <button className="p-2 rounded-full" style={{ backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                          <Paperclip className="w-4 h-4" style={{ color: isHovered ? '#1b68b3' : '#6b7280' }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Comment input - replacing the interaction buttons */}
              <div className="mt-4 pt-3 flex items-center" style={{ borderTop: '1px solid #f3f4f6' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold" 
                     style={{ backgroundColor: '#1b68b3', color: 'white' }}>
                  {post.createdBy?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 ml-3">
                  <input 
                    type="text" 
                    placeholder="Add class comment..." 
                    className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    style={{ transition: 'all 0.2s ease' }}
                  />
                </div>
                <button 
                  className="ml-2 p-2 rounded-full" 
                  style={{ backgroundColor: 'rgba(27, 104, 179, 0.1)', color: '#1b68b3' }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StreamTab;
