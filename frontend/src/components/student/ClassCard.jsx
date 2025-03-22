import React from 'react';
import { MoreVertical, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentClassCard = ({ cls, onClick }) => {
  const { 
    _id,
    className, 
    section,
    subject,
    coverImage
  } = cls;
  
  const teacherName = cls.teacher.name;
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/class/${_id}`);
  };

  const handleMoreClick = (e) => {
    e.stopPropagation(); // Prevent card navigation when clicking the menu
    // Handle more menu action
  };

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
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
              <div onClick={handleMoreClick}>
                <MoreVertical className="text-white cursor-pointer hover:text-white/80" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50">
        <div className="flex items-center text-gray-600">
          <User size={18} className="mr-2" />
          <span className="text-sm font-medium">{teacherName}</span>
        </div>
        <button 
          className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors text-sm font-medium"
        >
          Open Class
        </button>
      </div>
    </div>
  );
};

export default StudentClassCard;
