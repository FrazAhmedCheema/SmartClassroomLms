import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Trash2, File, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CommentSection from './CommentSection';

const AnnouncementCard = ({
  post,
  index,
  isTeacher,
  getAuthorInitial,
  getAuthorName,
  commentInputs,
  setCommentInputs,
  handleCommentSubmit,
  handleDeleteComment,
  handleDeleteAnnouncement,
  isCommentAuthor
}) => {
  return (
    <motion.div
      key={post._id || `announcement-${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm"
    >
      <div className="p-6">
        <div className="flex items-center mb-4 justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" 
                 style={{ backgroundColor: '#1b68b3', color: 'white' }}>
              {getAuthorInitial(post)}
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900">
                  {getAuthorName(post)}
                </h3>
                {(post.authorRole === 'Teacher') && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                    Teacher
                  </span>
                )}
              </div>
              <div className="flex items-center text-xs mt-1 text-gray-500">
                <Clock size={12} className="mr-1" />
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
          
          {/* Add delete button for teacher */}
          {isTeacher && (
            <button 
              onClick={() => handleDeleteAnnouncement(post._id)}
              className="p-2 rounded-full hover:bg-red-50 transition-colors"
              title="Delete announcement"
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          )}
        </div>
        
        <p className="whitespace-pre-wrap mb-4 leading-relaxed text-gray-700">{post.content}</p>
        
        {/* Attachments with improved UI */}
        {post.attachments?.length > 0 && (
          <div className="mt-4 mb-4">
            {post.attachments.map((attachment, i) => {
              const [isHovered, setIsHovered] = useState(false);
              return (
                <div 
                  key={`${post._id}-attachment-${i}`}
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
        
        {/* Comments section */}
        <CommentSection 
          post={post}
          isTeacher={isTeacher}
          commentInputs={commentInputs}
          setCommentInputs={setCommentInputs}
          handleCommentSubmit={handleCommentSubmit}
          handleDeleteComment={handleDeleteComment}
          isCommentAuthor={isCommentAuthor}
        />
      </div>
    </motion.div>
  );
};

export default AnnouncementCard;
