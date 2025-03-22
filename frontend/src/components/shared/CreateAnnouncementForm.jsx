import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Link, File, Image, Calendar } from 'lucide-react';

const CreateAnnouncementForm = ({ onSubmit, onCancel }) => {
  const [content, setContent] = useState('');
  const [hoveredButton, setHoveredButton] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(content);
    setContent('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white rounded-xl p-4"
    >
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share something with your class..."
          className="w-full p-4 border rounded-lg mb-4 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          required
        />
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {[
              { id: 'link', icon: <Link size={20} />, tip: 'Add Link' },
              { id: 'file', icon: <File size={20} />, tip: 'Add File' },
              { id: 'image', icon: <Image size={20} />, tip: 'Add Image' },
              { id: 'calendar', icon: <Calendar size={20} />, tip: 'Add Due Date' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className="p-2 rounded-full transition-all duration-200 hover:bg-gray-100"
                title={item.tip}
                onMouseEnter={() => setHoveredButton(item.id)}
                onMouseLeave={() => setHoveredButton(null)}
              >
                {item.icon}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={16} />
              Post
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateAnnouncementForm;
