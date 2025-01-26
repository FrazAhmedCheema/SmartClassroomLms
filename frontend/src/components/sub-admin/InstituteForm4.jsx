import React, { useState } from 'react';

const InstituteForm4 = ({ onNext, onPrevious, formData, setFormData }) => {
  const [errors, setErrors] = useState({});
  const [showError, setShowError] = useState(false);

  const validate = (name, value) => {
    let error = '';
    if (name === 'domainName' && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
      error = 'Domain name format is invalid';
    }
    setErrors({ ...errors, [name]: error });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    validate(name, value);
    setFormData({ ...formData, [name]: value });
  };

  const isFormValid = () => {
    return formData.domainName && !Object.values(errors).some((error) => error);
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
      <h1 className="text-2xl font-bold text-center text-[#1b68b3] mb-6">
        What's your institution's domain name?
      </h1>
      <p className="text-center text-gray-500 mb-6">
        Enter your institution's domain name. You’ll use it to set up custom email addresses, like info@example.edu. We'll walk you through verifying that your institution owns this domain later.
      </p>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Your domain name <span className="text-red-500">*</span></h2>
        <input 
          type="text" 
          name="domainName"
          placeholder="Enter your domain name" 
          value={formData.domainName}
          onChange={handleChange}
          className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
        />
        {errors.domainName && <p className="text-red-500 text-sm mt-1">{errors.domainName}</p>}
        <p className="text-sm text-gray-500 mt-1">E.g. example.edu</p>
      </div>
      {showError && <p className="text-red-500 text-sm mt-1">Please fill out all fields correctly before proceeding.</p>}
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

export default InstituteForm4;
