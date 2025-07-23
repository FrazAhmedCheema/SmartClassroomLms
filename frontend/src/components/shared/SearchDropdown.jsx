import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User } from 'lucide-react';

const SearchDropdown = ({ searchResults, isOpen, onClose, searchTerm }) => {
  const navigate = useNavigate();

  const handleClassClick = (classId) => {
    navigate(`/class/${classId}`);
    onClose();
  };

  if (!isOpen || !searchTerm.trim()) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
      {searchResults.length > 0 ? (
        <div className="py-2">
          <div className="px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wide">
            Classes ({searchResults.length})
          </div>
          {searchResults.map((classItem) => (
            <button
              key={classItem._id}
              onClick={() => handleClassClick(classItem._id)}
              style={{ backgroundColor: 'transparent' }}
              className="w-full px-4 py-3 text-left hover:bg-gray-400 flex items-center space-x-3 transition-colors"
            >
              <div className="flex-shrink-0">
                <BookOpen size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {classItem.className}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {classItem.subject} {classItem.teacherName && `• ${classItem.teacherName}`}
                </div>
                {classItem.description && (
                  <div className="text-xs text-gray-400 truncate mt-1">
                    {classItem.description}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-4 py-8 text-center text-gray-500">
          <BookOpen size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No classes found for "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
