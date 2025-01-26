import React from 'react';

const InstituteForm6 = ({ onNext, onPrevious, formData, setFormData }) => {
  const handleUsernameChange = (e) => {
    const usernameWithoutDomain = e.target.value.split('@')[0];
    setFormData((prev) => ({
      ...prev,
      username: `${usernameWithoutDomain}@${formData.domainName}`, // Append domain to username
    }));
  };

  return (
    <form>
      <h1 className="text-2xl font-bold text-center text-[#1b68b3] mb-6">
        How you'll sign in
      </h1>
      <div className="mb-4">
        <p className="text-sm text-gray-500 mt-1">
          You'll use your username to sign into your Smart Classroom account. Ensure the account exists.
        </p>
        <div className="relative mt-2">
          <input
            type="text"
            name="username"
            value={formData.username.split('@')[0]} // Only show the username part for editing
            onChange={handleUsernameChange}
            placeholder="admin"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
          />
          <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">
            @{formData.domainName}
          </span>
        </div>
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Password <span className="text-red-500">*</span></h2>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          placeholder="password"
          className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
        />
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

export default InstituteForm6;
