import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const HomeNavButton = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="absolute top-6 left-6 z-20"
    >
      <Link 
        to="/" 
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-100 hover:shadow-lg hover:bg-blue-50 transition-all duration-300 group"
      >
        <div className="relative w-5 h-5 overflow-hidden">
          <ChevronLeft 
            size={16} 
            className="text-blue-600 absolute group-hover:-translate-x-4 transition-all duration-300 opacity-0 group-hover:opacity-100" 
          />
          <ChevronLeft 
            size={16} 
            className="text-blue-600 absolute group-hover:-translate-x-0 transition-all duration-300 group-hover:opacity-0" 
          />
        </div>
        <Home size={18} className="text-blue-600" />
        <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">Back to Home</span>
      </Link>
    </motion.div>
  );
};

export default HomeNavButton;
