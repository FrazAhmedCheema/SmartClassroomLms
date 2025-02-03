import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Users, BookOpen, Clock } from 'lucide-react';
import logo from '../assets/logo.png';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <GraduationCap className="w-12 h-12 text-blue-600" />, 
      title: "Smart Learning", 
      description: "Enhanced learning experience with modern tools."
    },
    {
      icon: <Users className="w-12 h-12 text-blue-600" />, 
      title: "Interactive Classes", 
      description: "Real-time collaboration between teachers and students."
    },
    {
      icon: <Clock className="w-12 h-12 text-blue-600" />, 
      title: "24/7 Support", 
      description: "Round-the-clock assistance for all users."
    },
    {
      icon: <BookOpen className="w-12 h-12 text-blue-600" />, 
      title: "Rich Resources", 
      description: "Access to comprehensive learning materials."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1 }}
      className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-100"
    >
      {/* Enhanced Navbar */}
      <motion.nav 
        initial={{ y: -50 }} 
        animate={{ y: 0 }} 
        transition={{ duration: 0.8 }}
        className="bg-white shadow-md border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src={logo} alt="Logo" className="h-16 animate-fade-in" />
            <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">
              Smart Classroom
            </h1>
          </div>
          <div className="space-x-6">
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/sub-admin/login')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold 
                         rounded-lg transition-all duration-300 shadow-md hover:shadow-xl"
            >
              Sign In
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold 
                         rounded-lg transition-all duration-300 shadow-md hover:shadow-xl"
            >
              Sign Up
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero & Features Section Side by Side */}
      <div className="max-w-7xl mx-auto px-8 py-24 flex flex-col md:flex-row items-center gap-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/2 text-center md:text-left"
        >
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Transform Your <span className="text-blue-700">Educational</span> Experience Today
          </h1>
          <p className="text-xl text-gray-700 mb-12">
            Join the next generation of smart learning with modern tools and real-time collaboration.
          </p>
          <div className="flex justify-center md:justify-start space-x-6">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold 
                         rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              Get Started
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-blue-700 text-lg font-semibold border-2 
                         border-blue-300 rounded-lg hover:bg-blue-50 transition-all duration-300"
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Features Grid with Animations */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          transition={{ duration: 1 }}
          className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                rotate: 1,
                transition: { duration: 0.2 }
              }}
              className="flex flex-row items-center bg-white p-6 rounded-xl shadow-md
                       hover:shadow-xl border border-blue-100 
                       cursor-pointer group"
            >
              <motion.div 
                className="bg-gradient-to-br from-blue-50 to-blue-100 
                         p-4 rounded-lg flex items-center justify-center mr-4
                         group-hover:from-blue-100 group-hover:to-blue-200
                         transition-all duration-300"
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                </motion.div>
              </motion.div>
              <div className="transform transition-all duration-300 group-hover:translate-x-2">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm group-hover:text-gray-700">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Optional: Add a subtle background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
             backgroundSize: '60px 60px'
           }}
      />
    </motion.div>
  );
};

export default LandingPage;
