import React, { useEffect, useState } from 'react';
import { useNavigate  ,Link} from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Users, BookOpen, Clock, Mail, Home, Info, 
  CheckCircle, Award, Globe, MessageCircle, HelpCircle 
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
    { label: 'Admin', path: '/admin' },
    { label: 'SubAdmin', path: '/sub-admin' },
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
      icon: <GraduationCap className="w-12 h-12" style={{ color: "#1b68b3" }} />, 
      title: "Smart Learning", 
      description: "Enhanced learning experience with modern tools."
    },
    {
      icon: <Users className="w-12 h-12" style={{ color: "#1b68b3" }} />, 
      title: "Interactive Classes", 
      description: "Real-time collaboration between teachers and students."
    },
    {
      icon: <Clock className="w-12 h-12" style={{ color: "#1b68b3" }} />, 
      title: "24/7 Support", 
      description: "Round-the-clock assistance for all users."
    },
    {
      icon: <BookOpen className="w-12 h-12" style={{ color: "#1b68b3" }} />, 
      title: "Rich Resources", 
      description: "Access to comprehensive learning materials."
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
            <div className="flex items-center space-x-12">
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

            {/* Auth Buttons */}
            <div className="space-x-6 relative">
              <motion.div className="relative inline-block">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRoleMenu(showRoleMenu === 'signin' ? null : 'signin')}
                  className="px-5 py-2 bg-white font-semibold rounded-lg transition-all duration-300 
                           shadow-md hover:shadow-xl hover:bg-[#1b68b3] hover:text-white"
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
            {index === 0 && <Award className="w-4 h-4 text-white" />}
            {index === 1 && <Users className="w-4 h-4 text-white" />}
            {index === 2 && <GraduationCap className="w-4 h-4 text-white" />}
            {index === 3 && <BookOpen className="w-4 h-4 text-white" />}
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
                         shadow-md hover:shadow-xl border-2 border-white/20"
              >
                Sign Up
              </motion.button>
            </div>
          </div>
        </motion.nav>

        {/* Main Content Sections */}
        <main>
          {/* Home Section */}
          <section id="home" className="min-h-screen flex items-center">
            <div className="max-w-7xl mx-auto px-8 py-24 flex flex-col md:flex-row items-center gap-12">
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
                  Join the next generation of smart learning with modern tools and real-time collaboration.
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
          <section id="about" className="min-h-screen py-24">
            <motion.section 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="py-24 bg-gradient-to-br from-blue-50 to-white overflow-hidden relative"
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
                      <h4 className="text-xl font-bold">2000+ Happy Learners</h4>
                      <p className="text-sm">And growing every day!</p>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.section>
          </section>

          {/* Help Section */}
          <section id="help" className="py-12 bg-white"> {/* Changed min-h-screen to py-12 and removed extra padding */}
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
          <section id="contact" className="min-h-screen py-24">
            <motion.section 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="py-24 bg-gradient-to-br from-white to-blue-50 relative overflow-hidden"
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