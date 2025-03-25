import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Link, File, Image, Calendar } from 'lucide-react';

const CreateAnnouncementForm = ({ onSubmit, isLoading }) => {
  const [content, setContent] = useState('');
  const [hoveredButton, setHoveredButton] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() && !isLoading) {
      onSubmit(content);
      setContent(''); // Clear the form after submission
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
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
            T
          </div>
          <p className="font-medium" style={{ color: '#374151' }}>Announce something to your class</p>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share updates, resources, or announcements..."
          className="w-full p-4 border rounded-lg resize-none transition-all duration-200"
          style={{ 
            backgroundColor: '#f9fafb',
            borderColor: '#e5e7eb',
            outline: 'none',
            fontSize: '15px',
            lineHeight: '1.5',
            caretColor: '#1b68b3', // Ensure blinking cursor is visible
            color: '#6B7280' // Gray text color
          }}
          rows={3}
          disabled={isLoading}
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
                disabled={isLoading}
              >
                {item.icon}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={!content.trim() || isLoading}
            className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Posting...
              </>
            ) : (
              <>
                <Send size={16} />
                Post
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateAnnouncementForm;
