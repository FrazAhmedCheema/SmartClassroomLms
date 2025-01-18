import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';

const InstituteForm2 = ({ onNext, onPrevious, formData, setFormData }) => {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    axios
      .get('https://restcountries.com/v3.1/all')
      .then((response) => {
        const countryOptions = response.data
          .map((country) => ({
            value: country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : ''),
            label: `${country.name.common} (${country.idd.root}${
              country.idd.suffixes ? country.idd.suffixes[0] : ''
            })`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCountries(countryOptions);
      })
      .catch((error) => {
        console.error('Error fetching countries:', error);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (selectedOption) => {
    setFormData({ ...formData, countryCode: selectedOption.value });
  };

  const customSingleValue = ({ data }) => <div>{data.value}</div>;

  return (
    <form>
      <h1 className="text-2xl font-bold text-center text-[#1b68b3] mb-6">
        What's your contact info?
      </h1>
      <p className="text-center text-gray-500 mb-6">
        You'll be the Institue account admin since you're creating the account.
      </p>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Name</h2>
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
        />
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Email</h2>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
        />
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Institute Phone Number</h2>
        <div className="flex items-center gap-2">
          <div className="w-1/3">
            <Select
              options={countries}
              value={countries.find((option) => option.value === formData.countryCode)}
              onChange={handleSelectChange}
              className="text-black"
              placeholder="Code"
              components={{ SingleValue: customSingleValue }}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: '2.5rem',
                  borderRadius: '0.375rem',
                  borderColor: '#d1d5db',
                  backgroundColor: '#f9fafb',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#1b68b3' },
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'black',
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
            />
          </div>
          <input
            type="tel"
            name="institutePhoneNumber"
            placeholder="Enter institute phone number"
            value={formData.institutePhoneNumber}
            onChange={handleChange}
            className="w-2/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
          />
        </div>
      </div>
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
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default InstituteForm2;
