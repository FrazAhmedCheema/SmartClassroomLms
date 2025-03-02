import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import InstituteForm1 from '../../components/sub-admin/InstituteForm1';
import InstituteForm2 from '../../components/sub-admin/InstituteForm2';
import InstituteForm3 from '../../components/sub-admin/InstituteForm3';
import InstituteForm4 from '../../components/sub-admin/InstituteForm4';
import InstituteForm5 from '../../components/sub-admin/InstituteForm5';
import InstituteForm6 from '../../components/sub-admin/InstituteForm6';
import logo from '../../assets/logo.png';
import { motion } from 'framer-motion';

const socket = io('http://localhost:8080');

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
        localStorage.removeItem('emailVerificationStatus');
      }
    };

    checkVerification();
    const timeoutId = setTimeout(checkVerification, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

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

  useEffect(() => {
    socket.on('emailVerified', (data) => {
      console.log('Socket.IO event received for email verification:', data);
      setVerificationSuccess(true);
      setVerificationSent(false);
    });

    return () => {
      socket.off('emailVerified');
    };
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-500 opacity-20" 
             style={{
               backgroundImage: `linear-gradient(30deg, #1b68b3 12%, transparent 12.5%, transparent 87%, #1b68b3 87.5%, #1b68b3),
                                linear-gradient(150deg, #1b68b3 12%, transparent 12.5%, transparent 87%, #1b68b3 87.5%, #1b68b3),
                                linear-gradient(30deg, #1b68b3 12%, transparent 12.5%, transparent 87%, #1b68b3 87.5%, #1b68b3),
                                linear-gradient(150deg, #1b68b3 12%, transparent 12.5%, transparent 87%, #1b68b3 87.5%, #1b68b3),
                                linear-gradient(60deg, #1b68b3 25%, transparent 25.5%, transparent 75%, #1b68b3 75%, #1b68b3),
                                linear-gradient(60deg, #1b68b3 25%, transparent 25.5%, transparent 75%, #1b68b3 75%, #1b68b3)`,
               backgroundSize: '40px 70px',
               backgroundPosition: '0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px'
             }}>
        </div>
      </div>
      
      {/* Blue accent elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-500 opacity-10"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-400 opacity-10"></div>
      
      {/* Header with logo */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="w-full bg-white shadow-sm py-3 mb-8">
          <div className="container mx-auto px-4 flex justify-center">
            <img src={logo} alt="Logo" className="h-16" />
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 flex justify-center">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg mb-12">
          {verificationSuccess ? (
            <div className="text-center p-8 bg-green-50 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 text-green-500">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#1b68b3" }}>Verification Successful!</h2>
              <p className="text-gray-600 mb-4">
                Thank you for verifying your email. Now you will receive a confirmation mail from our team upon your request and the way forward will be shared there.
              </p>
              <Link
                to="/sub-admin/login"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-[#154d85] transition-colors inline-block"
              >
                Proceed to Login
              </Link>
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
                    <h2 className="text-2xl font-bold text-blue-600 mb-2">Verification Email Sent!</h2>
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
                  <div className="mb-6">
                    <div className="flex items-center justify-center">
                      <div className="font-semibold text-blue-600 text-xl"></div>
                    </div>
                    <div className="flex justify-center mt-4">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
                          <React.Fragment key={stepNumber}>
                            <motion.div
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-700 relative ${
                                stepNumber === step 
                                  ? 'step-glow step-shine bg-blue-600 text-white scale-110 font-bold z-10' 
                                  : stepNumber < step 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ 
                                scale: stepNumber === step ? 1.1 : 1, 
                                opacity: 1,
                              }}
                              transition={{ 
                                duration: 0.7,
                                ease: "easeInOut"
                              }}
                            >
                              {stepNumber}
                              {stepNumber === step && (
                                <motion.div
                                  className="absolute inset-0 rounded-full bg-blue-400 -z-10"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1.2 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                  }}
                                  style={{ opacity: 0.3 }}
                                />
                              )}
                            </motion.div>
                            {stepNumber < 6 && (
                              <div className="relative w-8 h-1 mx-0.5"> {/* Reduced width from w-12 to w-8 and mx-1 to mx-0.5 */}
                                <motion.div
                                  className="absolute inset-0"
                                  initial={{ scaleX: 0 }}
                                  animate={{ 
                                    scaleX: stepNumber < step ? 1 : 0,
                                    backgroundColor: stepNumber < step ? '#2563eb' : '#e5e7eb'
                                  }}
                                  style={{
                                    originX: 0,
                                    backgroundColor: stepNumber < step ? '#2563eb' : '#e5e7eb'
                                  }}
                                  transition={{ 
                                    duration: 0.7,
                                    delay: stepNumber === step ? 0.2 : 0,
                                    ease: "easeInOut"
                                  }}
                                />
                                <div 
                                  className="absolute inset-0" 
                                  style={{ 
                                    backgroundColor: '#e5e7eb',
                                    zIndex: -1
                                  }} 
                                />
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                  
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
      
      {/* Footer */}
      <div className="relative z-10 w-full py-4 bg-white mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} SmartClassroomLTD. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default RegisterInstitute;