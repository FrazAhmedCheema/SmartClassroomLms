import React, { useState, useEffect } from 'react';
import { Folder, Plus, Edit, Trash2, MoreVertical, FileText, CheckCircle, MessageCircle, File } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopics, deleteTopicAction } from '../../redux/actions/classActions';
import CreateTopicModal from './CreateTopicModal';

const TopicsList = ({ classId, onSelectTopic, isTeacher }) => {
  const dispatch = useDispatch();
  const { data: topics, loading } = useSelector(state => state.class.topics);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [showMenuFor, setShowMenuFor] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);

  useEffect(() => {
    if (classId) {
      dispatch(fetchTopics(classId));
    }
  }, [dispatch, classId]);

  const handleCreateTopic = () => {
    setEditingTopic(null);
    setIsCreateModalOpen(true);
  };

  const handleEditTopic = (topic) => {
    setEditingTopic(topic);
    setIsCreateModalOpen(true);
    setShowMenuFor(null);
  };

  const handleDeleteTopic = async (topicId) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      const result = await dispatch(deleteTopicAction(topicId));
      
      if (result.success) {
        if (selectedTopic === topicId) {
          setSelectedTopic('all');
          if (onSelectTopic) onSelectTopic('all');
        }
      } else {
        alert(result.error || 'Failed to delete topic');
      }
    }
    setShowMenuFor(null);
  };

  const handleTopicClick = (topicId) => {
    setSelectedTopic(topicId);
    if (onSelectTopic) onSelectTopic(topicId);
  };

  // Function to get icon based on category
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'assignment': return <FileText className="w-3.5 h-3.5 mr-1" />;
      case 'quiz': return <CheckCircle className="w-3.5 h-3.5 mr-1" />;
      case 'question': return <MessageCircle className="w-3.5 h-3.5 mr-1" />;
      case 'material': return <File className="w-3.5 h-3.5 mr-1" />;
      default: return <Folder className="w-3.5 h-3.5 mr-1" />;
    }
  };

  return (
    <>
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-3 pb-2">
          {/* All Topics button */}
          <button
            onClick={() => handleTopicClick('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 min-w-[100px] justify-center ${
              selectedTopic === 'all' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Folder className="w-4 h-4" />
            All Topics
          </button>

          {/* Topic buttons */}
          {topics && topics.map((topic) => (
            <div key={topic._id} className="relative group">
              <button
                onClick={() => handleTopicClick(topic._id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
                  whitespace-nowrap flex items-center justify-between gap-2
                  min-w-[140px] max-w-[200px] group relative
                  ${
                    selectedTopic === topic._id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }
                `}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {getCategoryIcon(topic.category)}
                  <span className="truncate">{topic.name}</span>
                </div>

                {/* Integrated 3-dots menu button */}
                {isTeacher && (
                  <div className="relative flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenuFor(showMenuFor === topic._id ? null : topic._id);
                      }}
                      className={`
                        p-1 rounded-full transition-colors duration-200
                        ${selectedTopic === topic._id 
                          ? 'hover:bg-white/20 text-white' 
                          : 'hover:bg-gray-200 text-gray-500'
                        }
                      `}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown menu */}
                    {showMenuFor === topic._id && (
                      <div 
                        className="absolute right-0 top-full mt-1 z-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-36 animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleEditTopic(topic)}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Topic
                        </button>
                        <button
                          onClick={() => handleDeleteTopic(topic._id)}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Topic
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </button>
            </div>
          ))}

          {/* Add Topic button */}
          {isTeacher && (
            <button
              onClick={handleCreateTopic}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
                whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200 
                border border-gray-200 flex items-center gap-2 min-w-[120px] justify-center"
            >
              <Plus className="w-4 h-4" />
              Add Topic
            </button>
          )}
        </div>
      </div>

      {/* Add fadeIn animation keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>

      {/* Create/Edit Topic Modal */}
      <CreateTopicModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTopic(null);
        }}
        classId={classId}
        topic={editingTopic}
      />
    </>
  );
};

export default TopicsList;
