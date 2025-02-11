import React from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaPlus, FaFileImport } from 'react-icons/fa';
import { motion } from 'framer-motion';

const EntityHeader = ({ entityType, onAddClick, onImportClick }) => {
  const getIcon = () => {
    switch (entityType) {
      case 'Student':
        return <FaUserGraduate className="text-xl md:text-2xl" />;
      case 'Teacher':
        return <FaChalkboardTeacher className="text-xl md:text-2xl" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    return `Manage ${entityType}s`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3" 
              style={{ color: '#1b68b3' }}>
            {getIcon()}
            {getTitle()}
          </h1>
          <p className="mt-1 text-gray-600 text-sm md:text-base">
            View and manage all {entityType.toLowerCase()} accounts
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
        <button
            onClick={onAddClick}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1b68b3] text-white rounded-lg 
                     hover:bg-[#154d85] transition-all duration-300 shadow-md hover:shadow-lg 
                     transform hover:-translate-y-0.5 text-sm md:text-base w-full md:w-auto"
          >
            <FaPlus />
            <span>Add {entityType}</span>
          </button>
          <button
            onClick={onImportClick}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg 
                     hover:bg-green-700 transition-all duration-300 text-sm md:text-base w-full md:w-auto"
          >
            <FaFileImport />
            <span>Import CSV</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default EntityHeader;

