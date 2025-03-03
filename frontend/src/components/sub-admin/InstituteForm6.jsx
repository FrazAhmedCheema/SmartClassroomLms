import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react'; // Add AlertCircle icon

const InstituteForm6 = ({ onNext, onPrevious, formData, setFormData }) => {
  const [errors, setErrors] = useState({});
  const [showError, setShowError] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameTaken, setUsernameTaken] = useState(false);

  // Password strength criteria
  const passwordCriteria = {
    minLength: { test: (pass) => pass.length >= 8, message: 'At least 8 characters long' },
    hasUppercase: { test: (pass) => /[A-Z]/.test(pass), message: 'Contains uppercase letter' },
    hasLowercase: { test: (pass) => /[a-z]/.test(pass), message: 'Contains lowercase letter' },
    hasNumber: { test: (pass) => /\d/.test(pass), message: 'Contains number' },
    hasSpecial: { test: (pass) => /[!@#$%^&*(),.?":{}|<>]/.test(pass), message: 'Contains special character' },
  };

  const checkPasswordStrength = (password) => {
    const results = {};
    Object.keys(passwordCriteria).forEach(criterion => {
      results[criterion] = passwordCriteria[criterion].test(password);
    });
    return results;
  };

  const handleUsernameChange = (e) => {
    const usernameWithoutDomain = e.target.value.split('@')[0];
    setFormData((prev) => ({
      ...prev,
      username: `${usernameWithoutDomain}@${formData.domainName}`,
    }));
    
    // Check if username exists (example API call)
    if (usernameWithoutDomain.length > 0) {
      fetch(`http://localhost:8080/check-username/${usernameWithoutDomain}@${formData.domainName}`)
        .then(res => res.json())
        .then(data => {
          setUsernameTaken(data.exists);
          if (data.exists) {
            setErrors(prev => ({
              ...prev,
              username: "Username already taken"
            }));
          } else {
            setErrors(prev => ({
              ...prev,
              username: undefined
            }));
          }
        })
        .catch(err => console.error(err));
    }
  };

  const validateOnSubmit = () => {
    let newErrors = {};

    if (!formData.username) {
      newErrors.username = "Username is required.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else {
      const strengthResults = checkPasswordStrength(formData.password);
      const isStrongPassword = Object.values(strengthResults).every(result => result);
      if (!isStrongPassword) {
        newErrors.password = "Password does not meet all requirements.";
      }
    }

    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateOnSubmit()) {
      onNext();
    } else {
      setShowError(true);
    }
  };

  return (
    <form>
      <h1 className="text-2xl font-bold text-center text-[#1b68b3] mb-6">
        How you'll sign in
      </h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Username <span className="text-red-500">*</span></h2>
        <p className="text-sm text-gray-500 mt-1">
          You'll use your username to sign into your Smart Classroom account. Ensure the account exists.
        </p>
        <div className="relative mt-2">
          <input
            type="text"
            name="username"
            value={formData.username.split('@')[0]} // Only show the username part for editing
            onChange={handleUsernameChange}
            placeholder="admin"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              usernameTaken 
                ? 'border-red-300 focus:ring-red-400' 
                : 'focus:ring-blue-400'
            } bg-white text-black`}
          />
          <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">
            @{formData.domainName}
          </span>
          {usernameTaken && (
            <div className="mt-2 flex items-center space-x-2 bg-red-50 p-2 rounded-md border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-600 text-sm">
                This username is already taken. Please try another one.
              </span>
            </div>
          )}
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
        </div>
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Password <span className="text-red-500">*</span></h2>
        <div className="mt-2">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Enter password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black pr-12"
            />
            <span 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-[#1b68b3] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          
          {/* Password strength indicators */}
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-gray-700">Password requirements:</p>
            {Object.entries(passwordCriteria).map(([key, { message, test }]) => (
              <div key={key} className="flex items-center text-sm">
                <span className={`mr-2 ${test(formData.password) ? 'text-green-500' : 'text-gray-400'}`}>
                  {test(formData.password) ? '✓' : '○'}
                </span>
                <span className={test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
                  {message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Confirm Password <span className="text-red-500">*</span></h2>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black pr-12"
          />
          <span 
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-[#1b68b3] transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>
      </div>
      {showError && (
        <p className="text-red-500 text-sm mt-1">
          Please fill out all fields correctly before proceeding.
        </p>
      )}
      <div className="flex justify-between gap-2">
        <button
          type="button"
          className="w-1/4 px-4 py-2 mt-4 text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onClick={onPrevious}
        >
          Previous
        </button>
        <button
          type="button"
          className="w-3/4 px-4 py-2 mt-4 text-white bg-[#1b68b3] rounded-md hover:bg-[#145a8a] focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default InstituteForm6;
