import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Building2, Users, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const InstituteForm1 = ({ onNext, formData, setFormData }) => {
  const [countries, setCountries] = useState([]);
  const [errors, setErrors] = useState({});
  const [showError, setShowError] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [countryError, setCountryError] = useState(false);

  // Fallback countries in case API fails
  const fallbackCountries = [
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'India', label: 'India' },
    { value: 'Pakistan', label: 'Pakistan' },
    { value: 'China', label: 'China' },
    { value: 'Japan', label: 'Japan' },
    { value: 'Brazil', label: 'Brazil' },
    { value: 'Russia', label: 'Russia' },
    { value: 'South Africa', label: 'South Africa' },
  ].sort((a, b) => a.label.localeCompare(b.label));

  useEffect(() => {
    setLoadingCountries(true);
    axios.get('https://restcountries.com/v3.1/all')
      .then(response => {
        const countryOptions = response.data
          .map(country => ({
            value: country.name.common,
            label: country.name.common
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCountries(countryOptions);
        setCountryError(false);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
        setCountries(fallbackCountries);
        setCountryError(true);
      })
      .finally(() => {
        setLoadingCountries(false);
      });
  }, []);

  const validate = (name, value) => {
    let error = '';
    if (name === 'instituteName') {
      if (value.length < 3) {
        error = 'Institute name must be at least 3 characters long';
      } else if (!/^[A-Za-z\s]+$/.test(value)) {
        error = 'Institute name must contain only alphabets';
      }
    } else if (name === 'numberOfStudents' && value === '') {
      error = 'Please select the number of students';
    } else if (name === 'region' && value === '') {
      error = 'Please select a region';
    }
    setErrors({ ...errors, [name]: error });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    validate(name, value);
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (selectedOption) => {
    validate('region', selectedOption.value);
    setFormData({ ...formData, region: selectedOption.value });
  };
  
  const isFormValid = () => {
    return formData.instituteName && formData.numberOfStudents && formData.region && !Object.values(errors).some((error) => error);
  };

  const handleNext = () => {
    if (isFormValid()) {
      onNext();
    } else {
      setShowError(true);
    }
  };

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: state.isFocused ? '2px solid #1b68b3' : '1px solid #e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 1px #1b68b3' : 'none',
      borderRadius: '0.375rem',
      padding: '4px',
      '&:hover': {
        border: '1px solid #1b68b3',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#1b68b3' 
        : state.isFocused 
          ? '#e6f0f9' 
          : 'white',
      color: state.isSelected ? 'white' : '#333',
      cursor: 'pointer',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#333',
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
    >
      <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">Institute Registration</h1>
      <p className="text-gray-600 mb-8 text-center">Please provide the following information to set up your institution</p>
      
      <form className="space-y-6">
        <motion.div 
          className="relative"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center mb-2">
            <Building2 className="h-5 w-5 text-[#1b68b3] mr-2" />
            <label className="block text-lg font-semibold text-gray-700">Institute Name <span className="text-red-500">*</span></label>
          </div>
          <input 
            type="text" 
            name="instituteName"
            placeholder="Enter full institute name" 
            value={formData.instituteName}
            onChange={handleChange}
            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b68b3] focus:border-transparent bg-white text-gray-800 transition-all duration-200 shadow-sm"
          />
          {errors.instituteName && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm mt-1 flex items-center"
            >
              <span className="text-red-500 mr-1">●</span> {errors.instituteName}
            </motion.p>
          )}
        </motion.div>
        
        <motion.div 
          className="relative"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 text-[#1b68b3] mr-2" />
            <label className="block text-lg font-semibold text-gray-700">Number of students and staff <span className="text-red-500">*</span></label>
          </div>
          <select 
            name="numberOfStudents"
            value={formData.numberOfStudents}
            onChange={handleChange}
            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b68b3] focus:border-transparent bg-white text-gray-800 transition-all duration-200 shadow-sm appearance-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", 
                     backgroundPosition: "right 0.5rem center", 
                     backgroundRepeat: "no-repeat", 
                     backgroundSize: "1.5em 1.5em", 
                     paddingRight: "2.5rem" }}
          >
            <option value="">Select number of students</option>
            <option value="0-100">0-100</option>
            <option value="100-500">100-500</option>
            <option value="500-1000">500-1000</option>
            <option value="1000-2000">1000-2000</option>
            <option value="2000-5000">2000-5000</option>
            <option value="5000-10000">5000-10000</option>
          </select>
          {errors.numberOfStudents && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm mt-1 flex items-center"
            >
              <span className="text-red-500 mr-1">●</span> {errors.numberOfStudents}
            </motion.p>
          )}
        </motion.div>
        
        <motion.div 
          className="relative"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center mb-2">
            <Globe className="h-5 w-5 text-[#1b68b3] mr-2" />
            <label className="block text-lg font-semibold text-gray-700">Region <span className="text-red-500">*</span></label>
          </div>
          {loadingCountries ? (
            <div className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
              Loading countries...
            </div>
          ) : (
            <>
              <Select 
                options={countries.length > 0 ? countries : fallbackCountries} 
                value={countries.find(option => option.value === formData.region) || null}
                onChange={handleSelectChange}
                styles={customSelectStyles}
                className="mt-1 text-gray-800"
                placeholder="Select your region"
                classNamePrefix="select"
                isSearchable={true}
              />
              {countryError && (
                <p className="text-amber-600 text-sm mt-1">
                  Using fallback country list. You can still proceed with registration.
                </p>
              )}
            </>
          )}
          {errors.region && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm mt-1 flex items-center"
            >
              <span className="text-red-500 mr-1">●</span> {errors.region}
            </motion.p>
          )}
        </motion.div>
        
        {showError && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Please fill out all required fields correctly before proceeding.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-4 space-y-4"
        >
          <button 
            type="button" 
            className="w-full px-6 py-3 text-white bg-[#1b68b3] rounded-lg hover:bg-[#145a8a] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-[1.02] font-semibold text-lg shadow-md hover:shadow-lg flex items-center justify-center"
            onClick={handleNext}
          >
            <span>Continue</span>
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </button>

          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/sub-admin/login" 
                className="text-[#1b68b3] hover:text-[#145a8a] font-medium hover:underline transition-colors"
              >
                Login 
              </Link>
            </p>
          </div>
        </motion.div>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>All fields marked with <span className="text-red-500">*</span> are required</p>
      </div>
    </motion.div>
  );
};

export default InstituteForm1;