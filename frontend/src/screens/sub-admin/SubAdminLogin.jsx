import React, { useState } from "react";
import Select from "react-select";

const InstituteForm2 = ({ onNext, onPrevious, formData, setFormData }) => {
  const [errors, setErrors] = useState({});
  const [showError, setShowError] = useState(false);



  const validateOnSubmit = () => {
    let newErrors = {};

    // Validate name
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters long";
    }

    // Validate email
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (selectedOption) => {
    setFormData({ ...formData, countryCode: selectedOption.value });
  };

  const handleNext = () => {
    if (validateOnSubmit()) {
      const selectedCountry = countries.find((country) => country.value === formData.countryCode);
      if (selectedCountry) {
        formData.institutePhoneNumber = `+${selectedCountry.value}${formData.institutePhoneNumber}`;
      }
      onNext();
    } else {
      setShowError(true);
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: "2.5rem",
      borderRadius: "0.375rem",
      borderColor: "#d1d5db",
      backgroundColor: "#f9fafb",
      boxShadow: "none",
      "&:hover": { borderColor: "#1b68b3" },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999, // Ensure it stays on top
      maxHeight: "200px",
      overflowY: "auto",
      backgroundColor: "#fff",
    }),
    singleValue: (base) => ({
      ...base,
      color: "black", // Ensure the selected text is black
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#E5F6FF" : "#fff",
      color: "#000", // Text color for the dropdown options
    }),
    input: (base) => ({
      ...base,
      color: "black", // Input text color
    }),
    placeholder: (base) => ({
      ...base,
      color: "#6B7280", // Placeholder text color (gray-500)
    }),
  };

  return (
    <form className="space-y-6">
      <h1 className="text-2xl font-bold text-center text-[#1b68b3] mb-6">
        What's your contact info?
      </h1>
      <p className="text-center text-gray-500 mb-6">
        You'll be the Institute account admin since you're creating the account.
      </p>
      
      <div className="space-y-4">
        {/* Name Field */}
        <div>
          <h2 className="text-lg font-semibold text-gray-500">Name</h2>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <h2 className="text-lg font-semibold text-gray-500">Email</h2>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Phone Number Field */}
        <div>
          <h2 className="text-lg font-semibold text-gray-500">Institute Phone Number</h2>
          <div className="flex items-center gap-2">
            <div className="w-1/3">
              <Select
                options={countries}
                value={countries.find((option) => option.value === formData.countryCode)}
                onChange={handleSelectChange}
                styles={customStyles}
                placeholder="Code"
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
          {errors.institutePhoneNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.institutePhoneNumber}</p>
          )}
        </div>
      </div>

      {showError && (
        <p className="text-red-500 text-sm mt-1">
          Please fill out all fields correctly before proceeding.
        </p>
      )}

      {/* Buttons */}
      <div className="flex justify-between gap-2 mt-6">
        <button
          type="button"
          className="w-1/4 px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onClick={onPrevious}
        >
          Previous
        </button>
        <button
          type="button"
          className="w-3/4 px-4 py-2 text-white bg-[#1b68b3] rounded-md hover:bg-[#145a8a] focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default InstituteForm2;
