import React from 'react';
import { MoreVertical, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClassCard = ({ classData }) => {
  const { className, section, studentCount = 0, coverImage } = classData;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header/Banner with cover image */}
      <div 
        className="h-32 relative bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${coverImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/10">
          <div className="p-6 relative h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white truncate pr-8">
                  {className}
                </h3>
                <p className="text-white/90 text-base mt-1">{section}</p>
              </div>
              <MoreVertical className="text-white cursor-pointer hover:text-white/80" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50">
        <div className="flex items-center text-gray-600">
          <Users size={18} className="mr-2" />
          <span className="text-sm font-medium">{studentCount} students</span>
        </div>
        <Link 
          to={`/teacher/class/${classData.id}`}
          className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors text-sm font-medium"
        >
          Open Class
        </Link>
      </div>
    </div>
  );
};

export default ClassCard;
