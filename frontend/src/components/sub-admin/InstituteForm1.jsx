import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';

const InstituteForm1 = ({ onNext, formData, setFormData }) => {
  const [countries, setCountries] = useState([]);
  const [errors, setErrors] = useState({});
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    axios.get('https://restcountries.com/v3.1/all')
      .then(response => {
        const countryOptions = response.data
          .map(country => ({
            value: country.name.common,
            label: country.name.common
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCountries(countryOptions);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });
  }, []);

  const validate = (name, value) => {
    let error = '';
    if (name === 'instituteName' && value.length < 3) {
      error = 'Institute name must be at least 3 characters long';
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

  return (
    <form>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Institute Name</h2>
        <input 
          type="text" 
          name="instituteName"
          placeholder="Enter Institute Name" 
          value={formData.instituteName}
          onChange={handleChange}
          className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
        />
        {errors.instituteName && <p className="text-red-500 text-sm mt-1">{errors.instituteName}</p>}
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Number of students and staff</h2>
        <select 
          name="numberOfStudents"
          value={formData.numberOfStudents}
          onChange={handleChange}
          className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
        >
          <option value="">Select number of students</option>
          <option value="0-100">0-100</option>
          <option value="100-500">100-500</option>
          <option value="500-1000">500-1000</option>
          <option value="1000-2000">1000-2000</option>
          <option value="2000-5000">2000-5000</option>
          <option value="5000-10000">5000-10000</option>
        </select>
        {errors.numberOfStudents && <p className="text-red-500 text-sm mt-1">{errors.numberOfStudents}</p>}
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Region</h2>
        <Select 
          options={countries} 
          value={countries.find(option => option.value === formData.region)}
          onChange={handleSelectChange}
          className="w-full mt-2 text-black"
          placeholder="Select Region"
        />
        {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
      </div>
      {showError && <p className="text-red-500 text-sm mt-1">Please fill out all fields correctly before proceeding.</p>}
      <button 
        type="button" 
        className="w-full px-4 py-2 mt-4 text-white bg-[#1b68b3] rounded-md hover:bg-[#145a8a] focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={handleNext}
      >
        Next
      </button>
    </form>
  );
};

export default InstituteForm1;
