import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.png';

const SubAdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', // changed from email to username
    password: '' 
  });
  const [errors, setErrors] = useState({});
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [isLoading, setIsLoading] = useState(true); // Set to true for initial auth check

  // Check if sub-admin is already logged in when component mounts
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:8080/sub-admin/check-auth', {
          method: 'GET',
          credentials: 'include',
        });
        
        // If response is OK, user is authenticated
        if (response.ok) {
          // Check if they have the username in localStorage as fallback
          const subAdminUsername = localStorage.getItem('subAdminUsername');
          if (subAdminUsername) {
            navigate('/sub-admin/dashboard');
            return;
          }
          
          // If API confirms they're authenticated
          const data = await response.json();
          if (data.authenticated) {
            navigate('/sub-admin/dashboard');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // If there's an error, we'll just continue showing the login page
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, [navigate]);

  const validate = (name, value) => {
    let error = '';
    if (name === 'username' && !value.trim()) {
      error = 'Username is required';
    }
    setErrors({ ...errors, [name]: error });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    validate(name, value);
    setFormData({ ...formData, [name]: value });
  };

  const isFormValid = () => {
    return formData.username && formData.password && !Object.values(errors).some((error) => error); // Check password field
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    // Validate form fields before sending request
    if (!formData.username || !formData.password || Object.values(errors).some(err => err)) {
      setShowError(true);
      return;
    }
    setShowError(false); // Clear errors

    try {
      const response = await fetch("http://localhost:8080/sub-admin/login", {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(formData),
         credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      localStorage.setItem('subAdminUsername', formData.username);
      // Show spinner then delay navigation
      setIsLoading(true);
      setTimeout(() => {
        navigate('/sub-admin/dashboard');
      }, 1500); // 1.5 seconds delay
    } catch (error) {
      setShowError(true);
      alert(error.message || "Login failed. Please try again.");
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <motion.div 
          className="w-12 h-12 border-t-2 border-b-2 border-[#1b68b3] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-500 opacity-20" 
             style={{
               backgroundImage: `linear-gradient(30deg, #1b68b3 12%, transparent 12.5%, transparent 87%, #1b68b3 87.5%, #1b68b3),
                                linear-gradient(150deg, #1b68b3 12%, transparent 12.5%, transparent 87%, #1b68b3 87.5%, #1b68b3),
                                linear-gradient(30deg, #1b68b3 12%, transparent 12.5%, transparent 87%, #1b68b3 87.5%, #1b68b3),
                                linear-gradient(150deg, #1b68b3 12%, transparent 12.5%, transparent 87%, #1b68b3 87.5%, #1b68b3),
                                linear-gradient(60deg, #1b68b3 25%, transparent 25.5%, transparent 75%, #1b68b3 75%, #1b68b3),
                                linear-gradient(60deg, #1b68b3 25%, transparent 25.5%, transparent 75%, #1b68b3 75%, #1b68b3)`,
               backgroundSize: '40px 70px',
               backgroundPosition: '0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px'
             }}>
        </div>
      </div>

      {/* Blue accent elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-500 opacity-10"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-400 opacity-10"></div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
          <motion.div 
            className="w-12 h-12 border-t-2 border-b-2 border-[#1b68b3] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Header with logo */}
      <div className="relative z-10 w-full flex flex-col items-center mb-12">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full bg-white shadow-md py-4"
        >
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center relative">
              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 bg-blue-100 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-3 px-6 py-2 rounded-lg">
                  <img src={logo} alt="Logo" className="h-16 object-contain" />
                  <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent opacity-50"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 flex justify-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-100"
        >
          <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">Sub Admin Login</h1>
          <p className="text-gray-600 mb-8 text-center">Please enter your credentials to access your account</p>

          <form onSubmit={handleLogin} className="space-y-8">
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative space-y-2"
            >
              <div className="flex items-center mb-2">
                <Mail className="h-5 w-5 text-[#1b68b3] mr-2" />
                <label className="block text-lg font-semibold text-gray-700">
                  Username <span className="text-red-500">*</span>
                </label>
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter Username"
                className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b68b3] focus:border-transparent bg-white text-gray-800 transition-all duration-200 shadow-sm hover:border-[#1b68b3]"
              />
              {errors.username && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-1 flex items-center"
                >
                  <span 
                    onClick={() => setErrors({ ...errors, username: '' })}
                    className="text-red-500 mr-1 cursor-pointer hover:text-red-700"
                  >
                    ●
                  </span> 
                  {errors.username}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative space-y-2"
            >
              <div className="flex items-center mb-2">
                <Lock className="h-5 w-5 text-[#1b68b3] mr-2" />
                <label className="block text-lg font-semibold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                  className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b68b3] focus:border-transparent bg-white text-gray-800 transition-all duration-200 shadow-sm hover:border-[#1b68b3] pr-12"
                />
                <span 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-[#1b68b3] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-1 flex items-center"
                >
                  <span 
                    onClick={() => setErrors({ ...errors, password: '' })}
                    className="text-red-500 mr-1 cursor-pointer hover:text-red-700"
                  >
                    ●
                  </span>
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {showError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg 
                      className="h-5 w-5 text-red-500 cursor-pointer hover:text-red-700" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                      onClick={() => setShowError(false)}
                    >
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">Please fill out all fields correctly before proceeding.</p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 transform -skew-y-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <button
                  type="submit"
                  className="w-full px-6 py-3.5 text-white bg-[#1b68b3] rounded-lg hover:bg-[#145a8a] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-[1.02] font-semibold text-lg shadow-md hover:shadow-lg flex items-center justify-center group"
                >
                  <span>Login</span>
                  <svg 
                    className="ml-2 w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>

              <div className="text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/sub-admin/register" className="text-[#1b68b3] hover:text-[#145a8a] font-medium hover:underline transition-colors">
                    Register now
                  </Link>
                </p>
              </div>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 w-full py-4 bg-white mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} SmartClassroomLTD. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default SubAdminLogin;