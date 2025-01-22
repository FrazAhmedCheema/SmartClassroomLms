import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../../assets/logo.png';

const SetLoginPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showError, setShowError] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = (name, value) => {
    let error = '';
    if (name === 'password') {
      if (value.length < 8) {
        error = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[A-Z])/.test(value)) {
        error = 'Password must contain at least one uppercase letter';
      } else if (!/(?=.*[0-9])/.test(value)) {
        error = 'Password must contain at least one number';
      } else if (!/(?=.*[!@#$%^&*])/.test(value)) {
        error = 'Password must contain at least one special character';
      }
      setShowRequirements(!!error);
    } else if (name === 'confirmPassword' && value !== formData.password) {
      error = 'Passwords do not match';
    }
    setErrors({ ...errors, [name]: error });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    validate(name, value);
    setFormData({ ...formData, [name]: value });
  };

  const isFormValid = () => {
    return formData.password && 
           formData.confirmPassword && 
           formData.password === formData.confirmPassword && 
           !Object.values(errors).some((error) => error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      console.log('Setting up password for:', email);
      setShowSuccessMessage(true);
      setTimeout(() => {
        navigate('/sub-admin/dashboard');
      }, 3000);
    } else {
      setShowError(true);
    }
  };

  const PasswordToggleButton = ({ show, onToggle }) => (
    <button 
      type="button" 
      onClick={onToggle}
      className="p-2 hover:bg-blue-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
    >
      {show ? (
        <FaEyeSlash className="text-white w-5 h-5 " />
      ) : (
        <FaEye className="text-white w-5 h-5 " />
      )}
    </button>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="fixed top-0 w-full flex flex-col items-center z-10 bg-white">
        <img src={logo} alt="Logo" className="h-16 mt-4" />
        <hr className="w-full border-gray-300 mt-4" />
      </div>

      <div className="w-full max-w-md p-8 bg-blue-50 rounded-lg shadow-md mt-32">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Set Your Password</h2>
          <p className="text-blue-700">Create a secure password for your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-500">Email</h2>
            <input 
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 mt-2 border rounded-md bg-gray-100 text-gray-600"
            />
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-500">New Password</h2>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
                className="w-full px-4 py-2 mt-2 border rounded-md bg-white text-black pr-12"
              />
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 mt-1">
                <PasswordToggleButton 
                  show={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                />
              </div>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-500">Confirm Password</h2>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full px-4 py-2 mt-2 border rounded-md bg-white text-black pr-12"
              />
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 mt-1">
                <PasswordToggleButton 
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </div>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {showError && <p className="text-red-500 text-sm mt-1">Please fill out all fields correctly before proceeding.</p>}

          <button 
            type="submit"
            className="w-full px-4 py-2 mt-4 text-white bg-[#1b68b3] rounded-md hover:bg-[#145a8a] focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Set Password
          </button>

          {showRequirements && (
            <div className="mt-4">
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Password must be at least 8 characters long</li>
                <li>Include at least one uppercase letter</li>
                <li>Include at least one number</li>
                <li>Include at least one special character (!@#$%^&*)</li>
              </ul>
            </div>
          )}
        </form>

        {showSuccessMessage && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
            <p>Password has been set successfully! Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetLoginPassword;