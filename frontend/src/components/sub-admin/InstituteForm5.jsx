import React from 'react';

const InstituteForm5 = ({ onNext, onPrevious, formData }) => {
  return (
    <form>
      <h1 className="text-2xl font-bold text-center text-[#1b68b3] mb-6">
        Using this domain to set up the account
      </h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Your domain name</h2>
        <input 
          type="text" 
          name="domainName"
          value={formData.domainName}
          readOnly
          className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
        />
        <p className="text-sm text-gray-500 mt-1">
          Emails sent to {formData.domainName} won't be affected until you set up email with this account.
        </p>
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

export default InstituteForm5;
