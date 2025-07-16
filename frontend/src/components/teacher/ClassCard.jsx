import React, { useState, useEffect } from 'react';
import { Users, Edit2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateClass } from '../../redux/actions/classActions';

const TeacherClassCard = ({ classData, onClick }) => {
  const dispatch = useDispatch();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClassName, setEditingClassName] = useState('');
  const [editingSection, setEditingSection] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { 
    _id,
    className, 
    section, 
    students = [], 
    coverImage,
    classCode 
  } = classData;

  // Close dropdown when clicking outside
  useEffect(() => {
    // Nothing needed here anymore
  }, []);

  const handleEditClass = (e) => {
    e.stopPropagation();
    setEditingClassName(className);
    setEditingSection(section);
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    if (!editingClassName.trim()) {
      alert('Class name cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      const updates = {};
      if (editingClassName.trim() !== className) {
        updates.className = editingClassName.trim();
      }
      if (editingSection.trim() !== section) {
        updates.section = editingSection.trim();
      }

      if (Object.keys(updates).length > 0) {
        const result = await updateClass(_id, updates)(dispatch);
        if (result.success) {
          setShowEditModal(false);
          // The parent component should handle refreshing the class list
          window.location.reload(); // Simple refresh for now
        } else {
          alert(result.message || 'Failed to update class');
        }
      } else {
        setShowEditModal(false);
      }
    } catch (error) {
      alert('Failed to update class');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingClassName(className);
    setEditingSection(section);
    setShowEditModal(false);
  };

  return (
    <>
      <div 
        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative group"
        onClick={onClick} // Use the onClick prop directly
      >
        {/* Header/Banner with cover image */}
        <div 
          className="h-32 relative bg-cover bg-center md:h-40"
          style={{ 
            backgroundImage: `url(${coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/10">
            <div className="p-4 md:p-6 relative h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg md:text-2xl font-bold text-white truncate pr-8">
                    {className}
                  </h3>
                  <p className="text-white/90 text-sm md:text-base mt-1">
                    Section: {section}
                  </p>
                </div>
                
                {/* Edit button with animation */}
                <div className="transition-all duration-300 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 tooltip" data-tooltip="Edit class">
                  <button 
                    onClick={handleEditClass}
                    className="edit-button-glow p-2 rounded-full bg-gradient-to-tr from-blue-400/80 to-indigo-500/80 hover:from-blue-500/90 hover:to-indigo-600/90 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-xl border border-white/20 group"
                    aria-label="Edit class"
                  >
                    <Edit2 className="text-white transform group-hover:rotate-12 transition-transform duration-300" size={18} />
                    <span className="edit-button-ring absolute inset-0 rounded-full border-2 border-white/30 scale-0 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500"></span>
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50">
          <div className="flex items-center text-gray-600">
            <Users size={18} className="mr-2" />
            <span className="text-sm font-medium">{students.length} students</span>
          </div>
          <button 
            className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors text-sm font-medium"
          >
            Open Class
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCancelEdit}>
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-100 animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#1b68b3]/10 rounded-lg">
                  <Edit2 size={20} className="text-[#1b68b3]" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Edit Class Information</h2>
              </div>
              <button 
                onClick={handleCancelEdit}
                className="text-white bg-gray-800 hover:bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                aria-label="Close modal"
              >
                <span className="text-white font-bold text-lg">✕</span>
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class Name
                </label>
                <input
                  type="text"
                  value={editingClassName}
                  onChange={(e) => setEditingClassName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b68b3]/20 focus:border-[#1b68b3] transition-all duration-200 bg-white text-gray-800"
                  placeholder="Enter class name"
                  disabled={isUpdating}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Section
                </label>
                <input
                  type="text"
                  value={editingSection}
                  onChange={(e) => setEditingSection(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b68b3]/20 focus:border-[#1b68b3] transition-all duration-200 bg-white text-gray-800"
                  placeholder="Enter section"
                  disabled={isUpdating}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="px-5 py-2.5 text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isUpdating || !editingClassName.trim()}
                className="px-5 py-2.5 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-[#1b68b3]/25"
              >
                {isUpdating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherClassCard;
