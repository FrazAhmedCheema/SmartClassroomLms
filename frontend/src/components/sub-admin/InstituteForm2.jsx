import React, { useState, useEffect } from "react";
import countryData from "../../data/countryData";

const InstituteForm2 = ({ onNext, onPrevious, formData, setFormData }) => {
  const [errors, setErrors] = useState({});
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const selectedCountry = countryData.find(
      (country) => country.label === formData.region
    );
    if (selectedCountry) {
      setFormData((prevData) => ({
        ...prevData,
        countryCode: selectedCountry.phone,
      }));
    }
  }, [formData.region, setFormData]);

  const validateOnSubmit = () => {
    let newErrors = {};

    // Validate Admin Name
    if (!formData.instituteAdminName || formData.instituteAdminName.length < 3) {
      newErrors.instituteAdminName = "Name must be at least 3 characters long.";
    } else if (/\d/.test(formData.instituteAdminName)) {
      newErrors.instituteAdminName = "Name must not contain numbers.";
    }

    // Validate Email
    if (!formData.instituteAdminEmail || !/\S+@\S+\.\S+/.test(formData.instituteAdminEmail)) {
      newErrors.instituteAdminEmail = "Email format is invalid.";
    }

    // Validate Phone Number
    const fullPhoneNumber = formData.institutePhoneNumber || "";
    if (!/^\+\d+$/.test(fullPhoneNumber)) {
      newErrors.institutePhoneNumber = "Phone number must contain only digits, including the country code.";
    } else {
      const phoneWithoutCountryCode = fullPhoneNumber.replace(`+${formData.countryCode}`, "");
      const selectedCountry = countryData.find(
        (country) => country.phone === formData.countryCode
      );
      if (selectedCountry && phoneWithoutCountryCode.length !== selectedCountry.phoneLength) {
        newErrors.institutePhoneNumber = `Phone number must be ${selectedCountry.phoneLength} digits long (excluding the country code).`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "institutePhoneNumber") {
      // Remove existing country code to avoid duplication
      const onlyDigits = value.replace(/\D/g, ""); // Remove all non-digit characters
      const countryCode = formData.countryCode || "+92"; // Default country code if not set
      const withoutCountryCode = onlyDigits.startsWith(countryCode.replace("+", ""))
        ? onlyDigits.slice(countryCode.length)
        : onlyDigits;
  
      setFormData((prevData) => ({
        ...prevData,
        [name]: `+${countryCode}${withoutCountryCode}`, // Prepend country code only once
      }));
    } else if (name === "instituteAdminName") {
      // Prevent numbers in Admin Name
      if (!/\d/.test(value)) {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };
  

  const handleNext = () => {
    if (validateOnSubmit()) {
      onNext();
    } else {
      setShowError(true);
    }
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
        {/* Admin Name Field */}
        <div>
          <h2 className="text-lg font-semibold text-gray-500">Admin Name <span className="text-red-500">*</span></h2>
          <input
            type="text"
            name="instituteAdminName"
            placeholder="Enter your name"
            value={formData.instituteAdminName}
            onChange={handleChange}
            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
          />
          {errors.instituteAdminName && (
            <p className="text-red-500 text-sm mt-1">{errors.instituteAdminName}</p>
          )}
        </div>

        {/* Admin Email Field */}
        <div>
          <h2 className="text-lg font-semibold text-gray-500">Admin Email <span className="text-red-500">*</span></h2>
          <input
            type="email"
            name="instituteAdminEmail"
            placeholder="Enter your email"
            value={formData.instituteAdminEmail}
            onChange={handleChange}
            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
          />
          {errors.instituteAdminEmail && (
            <p className="text-red-500 text-sm mt-1">{errors.instituteAdminEmail}</p>
          )}
        </div>

        {/* Phone Number Field */}
        <div>
          <h2 className="text-lg font-semibold text-gray-500">
            Institute Phone Number <span className="text-red-500">*</span>
          </h2>
          <input
            type="tel"
            name="institutePhoneNumber"
            placeholder="Enter institute phone number"
            value={formData.institutePhoneNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
          />
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
