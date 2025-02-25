import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const StudentClassCard = ({ cls, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        to={`/student/classes/${cls._id}`}
        className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      >
        <div 
          className="h-32 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${cls.coverImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <p className="text-sm font-medium">Teacher: {cls.teacherName}</p>
          </div>
        </div>
        <div className="p-4 bg-white">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">{cls.className}</h3>
          <p className="text-gray-600">{cls.subject}</p>
          <p className="text-sm text-gray-500">{cls.section}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default StudentClassCard;
