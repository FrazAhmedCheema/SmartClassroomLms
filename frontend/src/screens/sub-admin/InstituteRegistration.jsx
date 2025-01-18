import React, { useState } from 'react';
import InstituteForm1 from '../../components/sub-admin/InstituteForm1';
import InstituteForm2 from '../../components/sub-admin/InstituteForm2';
import InstituteForm3 from '../../components/sub-admin/InstituteForm3';
import InstituteForm4 from '../../components/sub-admin/InstituteForm4';
import InstituteForm5 from '../../components/sub-admin/InstituteForm5';
import logo from '../../assets/logo.png';

const InstituteRegistration = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    instituteName: '',
    numberOfStudents: '',
    region: '',
    name: '',
    email: '',
    institutePhoneNumber: '',
    field1: '',
    domainName: ''
  });

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="fixed top-0 w-full flex flex-col items-center">
        <img src={logo} alt="Logo" className="h-16 mt-4" />
        <hr className="w-full border-gray-300 mt-4" />
      </div>
      <div className="w-full max-w-md p-8 bg-blue-50 rounded-lg shadow-md mt-20">
        {step === 1 && (
          <h1 className="text-2xl font-bold text-center text-[#1b68b3] mb-6">
            Let's get started
          </h1>
        )}
        {step === 1 && <InstituteForm1 onNext={handleNext} formData={formData} setFormData={setFormData} />}
        {step === 2 && <InstituteForm2 onNext={handleNext} onPrevious={handlePrevious} formData={formData} setFormData={setFormData} />}
        {step === 3 && <InstituteForm3 onNext={handleNext} onPrevious={handlePrevious} formData={formData} setFormData={setFormData} />}
        {step === 4 && <InstituteForm4 onNext={handleNext} onPrevious={handlePrevious} formData={formData} setFormData={setFormData} />}
        {step === 5 && <InstituteForm5 onNext={handleNext} onPrevious={handlePrevious} formData={formData} />}
        {step === 6 && (
          <div className="text-center text-[#1b68b3]">
            <h1 className="text-2xl font-bold mb-6">Thanks for your interest</h1>
            <p className="text-lg" style={{ color: '#1b68b3' }}>We will get back to you soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstituteRegistration;