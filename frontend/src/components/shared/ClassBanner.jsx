import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const ClassBanner = ({ safeClassData, isTeacher, actualTeacherName }) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-72 rounded-2xl relative bg-cover bg-center mb-8 overflow-hidden"
      style={{ 
        backgroundImage: `url(${safeClassData.coverImage})`,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
    >
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.2) 100%)'
      }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-0 left-0 right-0 p-8"
        >
          <div className="inline-block px-4 py-1.5 rounded-full mb-4" 
              style={{ 
                backgroundColor: 'rgba(59, 130, 246, 0.3)', 
                backdropFilter: 'blur(10px)'
              }}>
            <span className="text-white text-sm font-medium">{safeClassData.section}</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            {safeClassData.className}
          </h1>
          <div className="flex items-center flex-wrap gap-2">
            <div className="px-4 py-1.5 rounded-full flex items-center space-x-2" 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  backdropFilter: 'blur(10px)'
                }}>
              <User size={14} style={{ color: 'white' }} />
              <span className="text-sm text-white">
                Teacher: {isTeacher ? "You" : actualTeacherName}
              </span>
            </div>
              {isTeacher && safeClassData.classCode !== 'Loading...' && (
                <div className="px-4 py-1.5 rounded-full flex items-center space-x-2"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                      backdropFilter: 'blur(10px)'
                    }}>
                  <span className="text-sm text-white">Class Code: {safeClassData.classCode}</span>
                </div>
              )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ClassBanner;
