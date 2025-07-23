import React, { useEffect, useState } from 'react';
import { useNavigate  ,Link} from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Users, BookOpen, Clock, Mail, Home, Info, 
  CheckCircle, Award, Globe, MessageCircle, HelpCircle, Code, 
  Shield, FileText, Video, Zap, Database
} from 'lucide-react';
import logo from '../assets/logo2.png';
import landingImage from '../assets/landingpage1.webp';
import landingImage2 from '../assets/landingpage2.jpg';
import FAQModal from '../components/modals/FAQModal';
import SupportModal from '../components/modals/SupportModal';
import DocumentationModal from '../components/modals/DocumentationModal';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [showRoleMenu, setShowRoleMenu] = useState(null); // 'signin' or 'signup'

  const roles = [
    { label: 'Teacher', path: '/teacher' },
    { label: 'Student', path: '/student' }
  ];

  const handleRoleSelect = (role, action) => {
    setShowRoleMenu(null);
    navigate(`${role.path}/${action}`);
  };

  // Add smooth scrolling functionality
  useEffect(() => {
    const handleSmoothScroll = (e) => {
      e.preventDefault();
      const targetId = e.currentTarget.getAttribute('href').slice(1);
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
      link.addEventListener('click', handleSmoothScroll);
    });

    return () => {
      navLinks.forEach(link => {
        link.removeEventListener('click', handleSmoothScroll);
      });
    };
  }, []);

  const features = [
    {
      icon: <MessageCircle className="w-12 h-12" style={{ color: "#1b68b3" }} />, 
      title: "Discussion Forum", 
      description: "Interactive forums for students and teachers to discuss topics, ask questions, and collaborate."
    },
    {
      icon: <Code className="w-12 h-12" style={{ color: "#1b68b3" }} />, 
      title: "Code Execution", 
      description: "Real-time code execution environment supporting multiple programming languages."
    },
    {
      icon: <Shield className="w-12 h-12" style={{ color: "#1b68b3" }} />, 
      title: "Plagiarism Detection", 
      description: "Advanced AI-powered plagiarism detection to ensure academic integrity."
    },
    {
      icon: <FileText className="w-12 h-12" style={{ color: "#1b68b3" }} />, 
      title: "Assignment Management", 
      description: "Create, distribute, and grade assignments with automated workflow management."
    }
  ];

  const navLinks = [
    { 
      href: "#home", 
      label: "Home", 
      icon: <Home className="w-5 h-5" />,
      description: "Back to top"
    },
    { 
      href: "#about", 
      label: "About", 
      icon: <Info className="w-5 h-5" />,
      description: "Learn about SmartClassroom"
    },
    { 
      href: "#help", 
      label: "Help", 
      icon: <HelpCircle className="w-5 h-5" />,
      description: "Get support"
    },
    { 
      href: "#contact", 
      label: "Contact", 
      icon: <Mail className="w-5 h-5" />,
      description: "Reach out to us"
    }
  ];

  const handleModalOpen = (modalType, subject = '') => {
    setActiveModal({
      type: modalType,
      subject: subject
    });
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1 }}
        className="min-h-screen bg-gradient-to-br from-white via-[#e6f0ff] to-gray-100"
      >
        {/* Enhanced Navbar with Tooltips */}
        <motion.nav 
          initial={{ y: -50 }} 
          animate={{ y: 0 }} 
          transition={{ duration: 0.8 }}
          className="sticky top-0 z-50 from-[#1b68b3] to-[#154d85] shadow-lg"
          style={{ backgroundColor: "#1b68b3" }}
        >
          <div className="max-w-10xl mx-auto px-8 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <a href="#home">
                <img src={logo} alt="SmartClassroom Logo" className="h-16 animate-fade-in brightness-0 invert" />
              </a>
            </div>
            
            {/* Enhanced Navigation Links with Tooltips */}
            <div className="hidden md:flex items-center space-x-12">
              {navLinks.map((link, index) => (
                <div key={index} className="group relative">
                  <motion.a
                    href={link.href}
                    className="relative flex items-center space-x-2 text-white/90 font-medium text-lg group"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="text-white/90 group-hover:text-blue-200"
                    >
                      {link.icon}
                    </motion.div>
                    <span className="group-hover:text-blue-200">{link.label}</span>
                    <motion.div
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300 group-hover:w-full"
                    />
                  </motion.a>
                  {/* Tooltip */}
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200
                              bg-white text-gray-800 text-sm py-1 px-2 rounded shadow-lg whitespace-nowrap">
                    {link.description}
                  </div>
                </div>
              ))}
            </div>

            {/* Auth Buttons Desktop */}
            <div className="hidden md:flex space-x-6 relative items-center">
              <motion.div className="relative inline-block">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRoleMenu(showRoleMenu === 'signin' ? null : 'signin')}
                  className="px-5 py-2 bg-white font-semibold rounded-lg transition-all duration-300 
                           shadow-md border-2 border-[#1b68b3] text-[#1b68b3] 
hover:bg-[#1b68b3] hover:text-white hover:border-white"
                  style={{ color: "#1b68b3" }}
                >
                  Sign In
                </motion.button>
                {showRoleMenu === 'signin' && (
  <motion.div 
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="absolute right-0 mt-3 w-56 bg-[#1b68b3] rounded-xl shadow-2xl py-2 z-50 border border-blue-200"
  >
    <div className="px-4 py-2 border-b border-gray-200 mb-1 bg-white rounded-t-xl">
      <h3 className="text-sm font-semibold text-gray-900">Choose Account Type</h3>
    </div>
    <div className="space-y-0.5">
      {roles.map((role, index) => (
        <motion.button
          key={index}
          onClick={() => handleRoleSelect(role, 'login')}
          className="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center space-x-3
                   transition-all duration-150 group"
          whileHover={{ x: 4 }}
        >
          <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                       group-hover:bg-white/20 transition-colors">
            {index === 0 && <GraduationCap className="w-4 h-4 text-white" />}
            {index === 1 && <BookOpen className="w-4 h-4 text-white" />}
          </span>
          <div>
            <p className="font-medium text-white">
              {role.label}
            </p>
            <p className="text-xs text-white/70">
              Sign in as {role.label}
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  </motion.div>
)}
              </motion.div>

              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/sub-admin/register')}
                style={{ backgroundColor: "#1b68b3" }}
                className="px-5 py-2 text-white font-semibold rounded-lg transition-all duration-300 
                         shadow-md hover:shadow-xl border-2 border-white/20 bg-[#1b68b3]
                         hover:bg-blue-700"
              >
                Sign Up
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setShowRoleMenu(showRoleMenu === 'menu' ? null : 'menu')}
                className="text-white focus:outline-none hover:bg-blue-700 p-2 rounded-lg transition-colors"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                >
                  {showRoleMenu === 'menu' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Overlay */}
            {showRoleMenu === 'menu' && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setShowRoleMenu(null)}
              />
            )}

            {/* Mobile Sidebar Menu */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: showRoleMenu === 'menu' ? 0 : '-100%' }}
              transition={{ type: "tween", duration: 0.3 }}
              style={{ backgroundColor: "#1b68b3" }}
              className={`fixed top-0 left-0 h-full w-72  shadow-xl z-50 md:hidden
                        transform transition-transform duration-300 ease-in-out ${
                          showRoleMenu === 'menu' ? 'translate-x-0' : '-translate-x-full'
                        }`}
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-blue-400">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button 
                  onClick={() => setShowRoleMenu(null)}
                  className="text-white hover:bg-blue-700/50 p-2 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Menu Links */}
              <div className="py-4">
                <div className="px-4 py-2 space-y-1">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={index}
                      href={link.href}
                      className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-blue-700 rounded-lg
                              transition-colors duration-200 group"
                      whileHover={{ x: 4 }}
                      onClick={() => setShowRoleMenu(null)}
                    >
                      <span className="text-white group-hover:text-blue-100">
                        {link.icon}
                      </span>
                      <span className="group-hover:text-blue-100 font-medium">{link.label}</span>
                    </motion.a>
                  ))}
                </div>
              </div>

                {/* Mobile Auth Buttons */}
                <div className="px-6 py-4 space-y-3 border-t border-blue-400 mt-4">
  <button
    onClick={() => {
      setShowRoleMenu('signin');
    }}
    
    style={{
      color: "#1b68b3",
      backgroundColor: "white",
      border: "2px solid #1b68b3",
      fontWeight: "600",
      padding: "12px 16px",
      width: "100%",
      borderRadius: "8px",
      transition: "all 0.2s",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = "#1b68b3";
      e.target.style.color = "white";
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = "white";
      e.target.style.color = "#1b68b3";
    }}
  >
    Sign In
  </button>
  <button
    onClick={() => {
      setShowRoleMenu(null);
      navigate('/sub-admin/register');
    }}
    style={{
      color: "#1b68b3",
      backgroundColor: "white",
      border: "2px solid #1b68b3",
      fontWeight: "600",
      padding: "12px 16px",
      width: "100%",
      borderRadius: "8px",
      transition: "all 0.2s",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = "#1b68b3";
      e.target.style.color = "white";
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = "white";
      e.target.style.color = "#1b68b3";
    }}
  >
    Sign Up
  </button>
</div>


            </motion.div>

          </div>
        </motion.nav>

        {/* Main Content Sections */}
        <main>
          {/* Home Section */}
          <section id="home" className="min-h-screen flex items-center">
            <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center gap-12">
              {/* Hero Section */}
              <motion.div 
                initial={{ x: -50, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/2 text-center md:text-left"
              >
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                  Transform Your <span style={{ color: "#1b68b3" }}>Educational</span> Experience Today
                </h1>
                <p className="text-xl text-gray-700 mb-12">
                  Join the next generation of smart learning with modern tools. Click "Get Started" to register your institute and begin your journey with us.
                </p>
                <div className="flex justify-center md:justify-start space-x-6">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}

                    onClick={() => navigate('/sub-admin/register')}
                    style={{ color: "white", borderColor: "#1b68b3" }}
                    className="px-8 py-4 text-lg font-semibold border-2 
                              rounded-lg hover:bg-[#e6f0ff] shadow-lg hover:shadow-2xl  transition-all duration-300"
        
                  >
                    Get Started
                    
                  </motion.button>
                  {/* <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ color: "white", borderColor: "#1b68b3" }}
                    className="px-8 py-4 text-lg font-semibold border-2 
                              rounded-lg hover:bg-[#e6f0ff] shadow-lg hover:shadow-2xl  transition-all duration-300"
                  >
                    Learn More
                  </motion.button> */}
                </div>
              </motion.div>
              {/* shadow-lg hover:shadow-2xl */}
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
                            hover:shadow-xl border border-blue-200 
                            cursor-pointer group"
                  >
                    <motion.div 
                      className="bg-gradient-to-br from-blue-50 to-blue-100 
                              p-4 rounded-lg flex items-center justify-center mr-4
                              group-hover:from-blue-600 group-hover:to-blue-800
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
                      <h3 className="text-xl font-bold text-gray-800 mb-2 ">
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
          </section>

          {/* About Section */}
          <section id="about" className="min-h-screen py-16">
            <motion.section 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="py-16 bg-gradient-to-br from-blue-50 to-white overflow-hidden relative"
            >
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="pattern" width="100" height="100" patternUnits="userSpaceOnUse">
                      <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="none" stroke="blue" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="10" fill="rgba(59, 130, 246, 0.1)" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#pattern)" />
                </svg>
              </div>

              <div className="max-w-7xl mx-auto px-8 relative z-10">
                <motion.h2 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl font-bold text-center text-gray-900 mb-16 tracking-tight"
                >
                  Our <span style={{ color: "#1b68b3" }}>Mission</span> & Vision
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center space-x-4 bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all">
                      <CheckCircle className="w-12 h-12" style={{ color: "#1b68b3" }} />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Our Commitment</h3>
                        <p className="text-gray-600">
                          Delivering transformative educational experiences that empower learners worldwide.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all">
                      <Award className="w-12 h-12" style={{ color: "#1b68b3" }} />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Our Goal</h3>
                        <p className="text-gray-600">
                          Creating innovative learning platforms that bridge technology and education.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all">
                      <Globe className="w-12 h-12" style={{ color: "#1b68b3" }} />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Global Reach</h3>
                        <p className="text-gray-600">
                          Connecting learners and educators across geographical boundaries.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="relative"
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.02, 0.98, 1]
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        repeatType: "mirror"
                      }}
                      className="bg-white rounded-2xl overflow-hidden shadow-2xl"
                    >
                      <img 
                        src={landingImage}
                        alt="Our Team" 
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-4 rounded-lg shadow-xl"
                      style={{ backgroundColor: "#1b68b3" }}
                    >
                      <h4 className="text-xl font-bold"> Enhancing Learning</h4>
                      <p className="text-sm">with a smarter classroom experience... </p>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.section>
          </section>

          {/* How It Works Section */}
<section id="how-it-works" className="py-16 bg-gradient-to-br from-white to-blue-50 overflow-hidden relative">
  <div className="absolute inset-0 opacity-10">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="pattern2" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="none" stroke="blue" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="10" fill="rgba(59, 130, 246, 0.1)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pattern2)" />
    </svg>
  </div>

  <div className="max-w-7xl mx-auto px-8 relative z-10">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        How <span style={{ color: "#1b68b3" }}>It Works</span>
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        SmartClassroom makes education management simple and effective with our intuitive platform
      </p>
    </motion.div>

    {/* Steps */}
    <div className="relative">
      {/* Connection line */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-blue-200 transform -translate-x-1/2 z-0" 
           style={{ backgroundColor: "#cce0f5" }}></div>

      {/* Step 1 */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col md:flex-row items-center mb-16 relative z-10"
      >
        <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0 md:text-right">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Register Your Institution</h3>
          <p className="text-gray-600">
            Sign up as an administrator and create your institution's profile on our platform. Set up your branding, policies, and administrative preferences.
          </p>
        </div>
        <div className="md:w-24 flex justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center z-20 shadow-xl"
               style={{ backgroundColor: "#1b68b3" }}>
            <span className="text-2xl font-bold text-white">1</span>
          </div>
        </div>
        <div className="md:w-1/2 md:pl-12 flex justify-center md:justify-start">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="bg-white p-4 rounded-xl shadow-lg w-64 h-64 flex items-center justify-center overflow-hidden">
            <Users className="w-24 h-24" style={{ color: "#1b68b3" }} />
          </motion.div>
        </div>
      </motion.div>

      {/* Step 2 */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col md:flex-row-reverse items-center mb-16 relative z-10"
      >
        <div className="md:w-1/2 md:pl-12 mb-8 md:mb-0 md:text-left">
          <h3 className="text-2xl font-bold text-gray-800 mb-3"> Add Teachers & Students</h3>
          <p className="text-gray-600">
          Easily add faculty members and students directly or via CSV upload. Manage teachers and students efficiently, and create virtual classrooms seamlessly.
         </p>
        </div>
        <div className="md:w-24 flex justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center z-20 shadow-xl"
               style={{ backgroundColor: "#1b68b3" }}>
            <span className="text-2xl font-bold text-white">2</span>
          </div>
        </div>
        <div className="md:w-1/2 md:pr-12 flex justify-center md:justify-end">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -2 }}
            className="bg-white p-4 rounded-xl shadow-lg w-64 h-64 flex items-center justify-center overflow-hidden">
            <Mail className="w-24 h-24" style={{ color: "#1b68b3" }} />
          </motion.div>
        </div>
      </motion.div>

      {/* Step 3 */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col md:flex-row items-center mb-16 relative z-10"
      >
        <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0 md:text-right">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Create & Share Content</h3>
          <p className="text-gray-600">
            Teachers can easily create lessons, assignments, quizzes, and resources. Our platform supports various content formats including video, documents, and interactive media.
          </p>
        </div>
        <div className="md:w-24 flex justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center z-20 shadow-xl"
               style={{ backgroundColor: "#1b68b3" }}>
            <span className="text-2xl font-bold text-white">3</span>
          </div>
        </div>
        <div className="md:w-1/2 md:pl-12 flex justify-center md:justify-start">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="bg-white p-4 rounded-xl shadow-lg w-64 h-64 flex items-center justify-center overflow-hidden">
            <BookOpen className="w-24 h-24" style={{ color: "#1b68b3" }} />
          </motion.div>
        </div>
      </motion.div>

      {/* Step 4 */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col md:flex-row-reverse items-center relative z-10"
      >
        <div className="md:w-1/2 md:pl-12 mb-8 md:mb-0 md:text-left">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Run & Execute Code</h3>
          <p className="text-gray-600">
          Students submit coding assignments directly on the platform where their code can be compiled and run instantly. The output is displayed within the system, allowing teachers to see results and  to review code execution without leaving the platform.          </p>
        </div>
        <div className="md:w-24 flex justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center z-20 shadow-xl"
               style={{ backgroundColor: "#1b68b3" }}>
            <span className="text-2xl font-bold text-white">4</span>
          </div>
        </div>
        <div className="md:w-1/2 md:pr-12 flex justify-center md:justify-end">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -2 }}
            className="bg-white p-4 rounded-xl shadow-lg w-64 h-64 flex items-center justify-center overflow-hidden">
            <CheckCircle className="w-24 h-24" style={{ color: "#1b68b3" }} />
          </motion.div>
        </div>
      </motion.div>
    </div>

    {/* CTA Button */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="text-center mt-16"
    >
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/sub-admin/register')}
        className="px-10 py-4 text-xl font-semibold text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
        style={{ backgroundColor: "#1b68b3" }}
      >
        Start Your Journey Today
      </motion.button>
      <p className="text-gray-600 mt-4">No credit card required. Get started in minutes.</p>
    </motion.div>
  </div>
</section>

          {/* Help Section */}
          <section id="help" className="py-8 bg-white"> {/* Changed min-h-screen to py-12 and removed extra padding */}
            <div className="max-w-7xl mx-auto px-8">
              <motion.h2 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-4xl font-bold text-center mb-12" // Changed mb-16 to mb-12
              >
                Need <span style={{ color: "#1b68b3" }}>Help?</span>
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: "FAQ",
                    description: "Find answers to common questions",
                    icon: <HelpCircle className="w-12 h-12" style={{ color: "#1b68b3" }} />,
                    onClick: () => handleModalOpen('faq')
                  },
                  {
                    title: "Support Center",
                    description: "Get technical assistance",
                    icon: <MessageCircle className="w-12 h-12" style={{ color: "#1b68b3" }} />,
                    onClick: () => handleModalOpen('support', '') // Pass empty string as subject
                  },
                  {
                    title: "Documentation",
                    description: "Learn about the platform",
                    icon: <BookOpen className="w-12 h-12" style={{ color: "#1b68b3" }} />,
                    onClick: () => handleModalOpen('docs')
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-xl shadow-lg cursor-pointer"
                    onClick={item.onClick}
                  >
                    <div className="flex flex-col items-center text-center">
                      {item.icon}
                      <h3 className="text-xl font-bold mt-4 text-gray-800">{item.title}</h3> {/* Changed from text-gray-900 to text-gray-800 */}
                      <p className="text-gray-600 mt-2">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="min-h-screen py-16">
            <motion.section 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="py-16 bg-gradient-to-br from-white to-blue-50 relative overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-8 relative z-10">
                <motion.h2 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl font-bold text-center text-gray-900 mb-16 tracking-tight"
                >
                  Get In <span style={{ color: "#1b68b3" }}>Touch</span>
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                
                  <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="relative h-[500px]" // Added fixed height
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.02, 0.98, 1]
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        repeatType: "mirror"
                      }}
                      className="bg-white rounded-2xl overflow-hidden shadow-2xl h-full" // Added h-full
                    >
                      <img 
                        src={landingImage2}
                        alt="Contact Us" 
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    {/* Stats div moved outside of image container */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="absolute -bottom-6 -left-6 text-white p-4 rounded-lg shadow-xl"
                      style={{ backgroundColor: "#1b68b3" }}
                    >
                      <h4 className="text-xl font-bold">24/7 Support</h4>
                      <p className="text-sm">Contact whenever you need!</p>
                    </motion.div>
                  </motion.div>
                  <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-8"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all flex items-center space-x-4"
                    >
                      <MessageCircle className="w-12 h-12" style={{ color: "#1b68b3" }} />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Email Support</h3>
                        <p className="text-gray-600">smartclassroom@gmail.com</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all flex items-center space-x-4"
                    >
                      <Globe className="w-12 h-12" style={{ color: "#1b68b3" }} />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Our Location</h3>
                        <p className="text-gray-600">123 SmartClassroomLTD Lane, Gujranwala City, Pakistan</p>
                      </div>
                    </motion.div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleModalOpen('support', 'Consultation Request')}
                      className="w-full  text-white py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg"
                    style={{ backgroundColor: "#1b68b3" }}
                    >
                      Schedule a Consultation
                    </motion.button>
                  </motion.div>

                </div>
              </div>
            </motion.section>
          </section>
        </main>

        {/* Footer */}
        <footer style={{ backgroundColor: "#1b68b3" }} className="text-white py-12">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="hover:text-blue-200">Home</a></li>
                <li><a href="#about" className="hover:text-blue-200">About</a></li>
                <li><a href="#contact" className="hover:text-blue-200">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-200">Online Courses</a></li>
                <li><a href="#" className="hover:text-blue-200">Live Classes</a></li>
                <li><a href="#" className="hover:text-blue-200">Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-200">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-200">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-200">Disclaimer</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-200">Facebook</a>
                <a href="#" className="hover:text-blue-200">Twitter</a>
                <a href="#" className="hover:text-blue-200">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="text-center mt-8 border-t border-blue-800 pt-6">
            <p>&copy; 2025 SmartClassroomLTD. All Rights Reserved.</p>
          </div>
        </footer>

        {/* Optional: Add a subtle background pattern */}
        <div 
          className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </motion.div>

      {/* Remove the click outside handler since we don't need it for signup anymore */}
      {showRoleMenu === 'signin' && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowRoleMenu(null)}
        />
      )}

      {/* Modals */}
      <FAQModal isOpen={activeModal?.type === 'faq'} onClose={handleModalClose} />
      <SupportModal 
        isOpen={activeModal?.type === 'support'} 
        onClose={handleModalClose}
        initialSubject={activeModal?.subject || ''}
      />
      <DocumentationModal isOpen={activeModal?.type === 'docs'} onClose={handleModalClose} />
    </>
  );
};

export default LandingPage;