import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';

const InstituteForm1 = ({ onNext, formData, setFormData }) => {
  const [countries, setCountries] = useState([]);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (selectedOption) => {
    setFormData({ ...formData, region: selectedOption.value });
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
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Number of students and staff</h2>
        <select 
          name="numberOfStudents"
          value={formData.numberOfStudents}
          onChange={handleChange}
          className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
        >
          <option value="0-100">0-100</option>
          <option value="100-500">100-500</option>
          <option value="500-1000">500-1000</option>
          <option value="1000-2000">1000-2000</option>
          <option value="2000-5000">2000-5000</option>
          <option value="5000-10000">5000-10000</option>
        </select>
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
      </div>
      <button 
        type="button" 
        className="w-full px-4 py-2 mt-4 text-white bg-[#1b68b3] rounded-md hover:bg-[#145a8a] focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={onNext}
      >
        Next
      </button>
    </form>
  );
};

export default InstituteForm1;
