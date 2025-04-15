import React from 'react';

const FormError = ({ message }) => {
  if (!message) return null;

  return (
    <div className="text-red-500 text-sm mt-1 flex items-center">
      <span className="mr-1">•</span>
      <span>{message}</span>
    </div>
  );
};

export default FormError;
