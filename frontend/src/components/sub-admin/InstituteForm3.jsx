import React from 'react';

const InstituteForm3 = ({ onNext, onPrevious, formData, setFormData }) => {
  const handleYes = () => {
    setFormData({ ...formData, hasDomain: true });
    onNext();
  };

  const handleNo = () => {
    setFormData({ ...formData, hasDomain: false });
    onPrevious();
  };

  return (
    <form>
      <h1 className="text-2xl font-bold text-center text-[#1b68b3] mb-6">
        Does your institution have a domain?
      </h1>
      <p className="text-center text-gray-500 mb-6">
        You'll need a domain, like example.edu, to set up account for your institution.
      </p>
      <div className="flex justify-center gap-4 mb-4">
        <button 
          type="button" 
          className="w-1/3 px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onClick={handleNo}
        >
          No, I don't
        </button>
        <button 
          type="button" 
          className="w-2/3 px-4 py-2 text-white bg-[#1b68b3] rounded-md hover:bg-[#145a8a] focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={handleYes}
        >
          Yes, I have one I can use
        </button>
      </div>
    </form>
  );
};

export default InstituteForm3;
