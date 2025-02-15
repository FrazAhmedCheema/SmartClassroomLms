import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../../assets/logo.png';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          setStatus('error');
          return;
        }

        const response = await fetch(`http://localhost:8080/sub-admin/verify-email/${token}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();

        if (response.ok && data.message === 'Email verified, registration request sent!') {
          setStatus('success');
          // Set verification status in localStorage
          localStorage.setItem('emailVerificationStatus', 'success');
          // Force reload registration page after delay
          setTimeout(() => {
            navigate('/sub-admin/register', { replace: true });
          }, 3000);
        } else {
          setStatus('error');
          console.error('Verification failed:', data.error);
        }
      } catch (error) {
        setStatus('error');
        console.error('Verification error:', error);
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <img src={logo} alt="Logo" className="h-16 mb-8" />
      
      {status === 'verifying' && (
        <div className="text-center p-8 bg-blue-50 rounded-lg shadow-md">
          <div className="spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-[#1b68b3] mb-2">Verifying your email...</h2>
          <p className="text-gray-600">Please wait while we verify your email address.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center p-8 bg-green-50 rounded-lg shadow-md">
          <div className="w-16 h-16 mx-auto mb-4 text-green-500">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1b68b3] mb-2">Verification Successful!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for verifying your email. Your account has been successfully activated.
          </p>
          <p className="text-sm text-gray-500">
            You will be redirected to the registration page in 3 seconds...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center p-8 bg-red-50 rounded-lg shadow-md">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-4">
            We couldn't verify your email. The link might be expired or invalid.
          </p>
          <button 
            onClick={() => navigate('/sub-admin/login')}
            className="text-white bg-[#1b68b3] px-6 py-2 rounded-lg hover:bg-[#154d85] transition-colors"
          >
            Return to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;

