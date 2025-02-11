import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import InstituteForm1 from '../../components/sub-admin/InstituteForm1';
import InstituteForm2 from '../../components/sub-admin/InstituteForm2';
import InstituteForm3 from '../../components/sub-admin/InstituteForm3';
import InstituteForm4 from '../../components/sub-admin/InstituteForm4';
import InstituteForm5 from '../../components/sub-admin/InstituteForm5';
import InstituteForm6 from '../../components/sub-admin/InstituteForm6';
import logo from '../../assets/logo.png';


const RegisterInstitute = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    instituteName: '',
    numberOfStudents: '',
    region: '',
    instituteAdminName: '',
    instituteAdminEmail: '',
    institutePhoneNumber: '',
    domainName: '',
    username: '',
    password: '',
  });

  const handleNext = () => {
    if (step === 6) {
      submitRegistrationForm(); // Submit on the last step
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setStep((prev) => prev - 1);
  };

  const submitRegistrationForm = async () => {
    try {
      const response = await fetch('http://localhost:8080/sub-admin/registerInstitute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 201) {
        const data = await response.json();
        console.log('Registration request processed:', data);
      } else {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
      }
    } catch (error) {
      console.error('An error occurred during registration:', error);
    }

    // Move to the final "thank you" step
    setStep(7);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="fixed top-0 w-full flex flex-col items-center">
        <img src={logo} alt="Logo" className="h-16 mt-4" />
        <hr className="w-full border-gray-300 mt-4" />
      </div>
      <div className="w-full max-w-md p-8 bg-blue-50 rounded-lg shadow-md mt-20">
        {step === 1 && <InstituteForm1 onNext={handleNext} formData={formData} setFormData={setFormData} />}
        {step === 2 && <InstituteForm2 onNext={handleNext} onPrevious={handlePrevious} formData={formData} setFormData={setFormData} />}
        {step === 3 && <InstituteForm3 onNext={handleNext} onPrevious={handlePrevious} formData={formData} setFormData={setFormData} />}
        {step === 4 && <InstituteForm4 onNext={handleNext} onPrevious={handlePrevious} formData={formData} setFormData={setFormData} />}
        {step === 5 && <InstituteForm5 onNext={handleNext} onPrevious={handlePrevious} formData={formData} />}
        {step === 6 && <InstituteForm6 onNext={handleNext} onPrevious={handlePrevious} formData={formData} setFormData={setFormData} />}
        {step === 7 && (
          <div className="text-center text-[#1b68b3]">
            <h1 className="text-2xl font-bold mb-6">Thanks for your interest</h1>
            <p className="text-lg" style={{ color: '#1b68b3' }}>We will get back to you soon.</p>
          </div>
        )}
        {step !== 7 && (
          <div className="text-center mt-4">
            <span className="text-gray-600">Already have a registered account? </span>
            <Link to="/sub-admin/login" className="hover:underline font-medium" style={{ color: '#1b68b3' }}>
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterInstitute;
