import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import custom eye icons

const SubAdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', // changed from email to username
    password: '' 
  });
  const [errors, setErrors] = useState({});
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [isLoading, setIsLoading] = useState(false); // new loading state

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: "#e6f0ff" }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: "#1b68b3" }}></div>
        </div>
      )}
      <div className="fixed top-0 w-full flex flex-col items-center">
        <img src={logo} alt="Logo" className="h-16 mt-4" />
        <hr className="w-full border-gray-300 mt-4" />
      </div>
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md mt-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: "#1b68b3" }}>Welcome back!</h2>
          <p style={{ color: "#1b68b3" }}>Please login to your account</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-600">
              Username <span className="text-red-500">*</span>
            </h2>
            <input 
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter Username"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b68b3] bg-white text-black"
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          <div className="mb-4 relative">
            <h2 className="text-lg font-semibold text-gray-600">
              Password <span className="text-red-500">*</span>
            </h2>
            <input 
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter Password"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b68b3] bg-white text-black"
            />
            <span 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3/4 transform -translate-y-1/2 cursor-pointer"
              style={{ color: "#1b68b3" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {showError && <p className="text-red-500 text-sm mt-1">Please fill out all fields correctly before proceeding.</p>}
          
          <button 
            type="submit"
            className="w-full px-4 py-2 mt-4 text-white rounded-md hover:bg-[#154d85] focus:outline-none focus:ring-2 focus:ring-[#1b68b3] transition-colors duration-300"
            style={{ backgroundColor: "#1b68b3" }}
          >
            Login
          </button>

          <div className="mt-4 text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/sub-admin/register" style={{ color: "#1b68b3" }} className="hover:underline font-medium">
              Register now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubAdminLogin;