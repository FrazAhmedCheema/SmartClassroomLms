import React from 'react';

const InstituteForm4 = ({ onNext, onPrevious, formData, setFormData }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        <h2 className="text-lg font-semibold text-gray-500">Your domain name</h2>
        <input 
          type="text" 
          name="domainName"
          placeholder="Enter your domain name" 
          value={formData.domainName}
          onChange={handleChange}
          className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
        />
        <p className="text-sm text-gray-500 mt-1">E.g. example.edu</p>
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

export default InstituteForm4;
