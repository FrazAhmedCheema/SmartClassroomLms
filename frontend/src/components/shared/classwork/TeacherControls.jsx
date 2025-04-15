import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, ChevronDown, FileText, CheckCircle, File, MessageCircle } from 'lucide-react';

const TeacherControls = ({
  createMenuOpen,
  setCreateMenuOpen,
  topicsMenuOpen,
  setTopicsMenuOpen,
  createOptions,
  handleOptionSelect,
  expandedTopic,
  topics,
  handleTopicSelect
}) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'assignment': return <FileText size={16} className="text-gray-500" />;
      case 'quiz': return <CheckCircle size={16} className="text-gray-500" />;
      case 'question': return <MessageCircle size={16} className="text-gray-500" />;
      case 'material': return <File size={16} className="text-gray-500" />;
      default: return <Folder size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="mb-6 flex justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {/* Create Button */}
      <div className="relative">
        <button
          onClick={() => setCreateMenuOpen(!createMenuOpen)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} />
          Create
        </button>
        <AnimatePresence>
          {createMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            >
              {createOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <option.icon size={16} className="text-gray-500" />
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Topics Dropdown */}
      <div className="relative">
        <button
          onClick={() => setTopicsMenuOpen(!topicsMenuOpen)}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium flex items-center gap-2"
        >
          <Folder size={16} />
          {expandedTopic === 'all' ? 'All Topics' : topics?.find(t => t._id === expandedTopic)?.name || 'All Topics'}
          <ChevronDown size={14} className={`transition-transform ${topicsMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {topicsMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            >
              {/* Default Topics */}
              <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Default Topics
              </div>
              {['assignment', 'quiz', 'material', 'question'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    handleTopicSelect(type);
                    setTopicsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  {getCategoryIcon(type)}
                  <span className="capitalize">{type === 'material' ? 'Lecture Material' : type}</span>
                </button>
              ))}

              {/* Custom Topics */}
              {topics && topics.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Custom Topics
                  </div>
                  {topics.map((topic) => (
                    <button
                      key={topic._id}
                      onClick={() => {
                        handleTopicSelect(topic._id);
                        setTopicsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      {getCategoryIcon(topic.category)}
                      {topic.name}
                    </button>
                  ))}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeacherControls;
