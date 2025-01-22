import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const SubAdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [showError, setShowError] = useState(false);

  const validate = (name, value) => {
    let error = '';
    if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
      error = 'Please enter a valid email address';
    }
    setErrors({ ...errors, [name]: error });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    validate(name, value);
    setFormData({ ...formData, [name]: value });
  };

  const isFormValid = () => {
    return formData.email && !Object.values(errors).some((error) => error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      // Navigate to SetLoginPassword
      navigate('/sub-admin/set-login-password', { state: { email: formData.email } });
    } else {
      setShowError(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="fixed top-0 w-full flex flex-col items-center">
        <img src={logo} alt="Logo" className="h-16 mt-4" />
        <hr className="w-full border-gray-300 mt-4" />
      </div>
      <div className="w-full max-w-md p-8 bg-blue-50 rounded-lg shadow-md mt-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Welcome back!</h2>
          <p className="text-blue-700">Please login to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-500">Email</h2>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {showError && <p className="text-red-500 text-sm mt-1">Please fill out all fields correctly before proceeding.</p>}
          
          <button 
            type="submit"
            className="w-full px-4 py-2 mt-4 text-white bg-[#1b68b3] rounded-md hover:bg-[#145a8a] focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Next
          </button>

          <div className="mt-4 text-center">
            <Link to="/sub-admin/register" className="text-blue-700 hover:underline">
              Don't have an account? Register now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubAdminLogin;