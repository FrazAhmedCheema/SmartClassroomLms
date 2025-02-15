import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkVerification = () => {
      const status = localStorage.getItem('emailVerificationStatus');
      if (status === 'success') {
        setVerificationSuccess(true);
        setVerificationSent(false);
        // Clear the verification status
        localStorage.removeItem('emailVerificationStatus');
      }
    };

    // Check immediately on mount
    checkVerification();

    // Check again after a short delay to ensure we catch the status
    const timeoutId = setTimeout(checkVerification, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Create another useEffect to handle storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'emailVerificationStatus' && e.newValue === 'success') {
        setVerificationSuccess(true);
        setVerificationSent(false);
        localStorage.removeItem('emailVerificationStatus');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleNext = () => {
    if (step === 6) {
      submitRegistrationForm();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setStep((prev) => prev - 1);
  };

  const submitRegistrationForm = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8080/sub-admin/registerInstitute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();

      if (response.status === 200) {
        setStep(7);
        setVerificationSent(true);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="fixed top-0 w-full flex flex-col items-center">
        <img src={logo} alt="Logo" className="h-16 mt-4" />
        <hr className="w-full border-gray-300 mt-4" />
      </div>
      <div className="w-full max-w-md p-8 bg-blue-50 rounded-lg shadow-md mt-20">
        {verificationSuccess ? (
          <div className="text-center">
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-2xl font-bold text-[#1b68b3] mb-2">Email Verified Successfully!</h2>
              <p className="text-gray-600 mb-4">
                Your registration is now complete. You can proceed to login.
              </p>
              <Link
                to="/sub-admin/login"
                className="text-white bg-[#1b68b3] px-6 py-2 rounded-lg hover:bg-[#154d85] transition-colors inline-block"
              >
                Proceed to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="text-red-600 text-center mb-4 p-3 bg-red-50 rounded">
                {error}
              </div>
            )}
            
            {isSubmitting && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                  <div className="spinner mx-auto mb-4"></div>
                  <p className="text-gray-700">Processing your request...</p>
                </div>
              </div>
            )}

            {step === 7 && verificationSent ? (
              <div className="text-center">
                <div className="text-green-600 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                  </svg>
                  <h2 className="text-2xl font-bold text-[#1b68b3] mb-2">Verification Email Sent!</h2>
                  <p className="text-gray-600 mb-4">
                    We've sent a verification link to your email address.
                    Please check your inbox and click the link to complete registration.
                  </p>
                  <p className="text-sm text-gray-500">
                    Didn't receive the email? Check your spam folder or contact support.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {step === 1 && <InstituteForm1 onNext={handleNext} formData={formData} setFormData={setFormData} />}
                {step === 2 && <InstituteForm2 onNext={handleNext} onPrevious={handlePrevious} formData={formData} setFormData={setFormData} />}
                {step === 3 && <InstituteForm3 onNext={handleNext} onPrevious={handlePrevious} formData={formData} setFormData={setFormData} />}
                {step === 4 && <InstituteForm4 onNext={handleNext} onPrevious={handlePrevious} formData={formData} setFormData={setFormData} />}
                {step === 5 && <InstituteForm5 onNext={handleNext} onPrevious={handlePrevious} formData={formData} />}
                {step === 6 && <InstituteForm6 onNext={handleNext} onPrevious={handlePrevious} formData={formData} setFormData={setFormData} />}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterInstitute;


