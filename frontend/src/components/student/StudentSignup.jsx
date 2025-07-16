import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Mail, CheckCircle, AlertCircle, Loader, UserCheck } from 'lucide-react';

const StudentInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [invitationData, setInvitationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    // Verify invitation token
    fetch(`http://localhost:8080/student/verify-invitation/${token}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setInvitationData(data.invitation);
        } else {
          setError(data.message || 'Invalid or expired invitation');
        }
      })
      .catch(err => {
        console.error('Error verifying invitation:', err);
        setError('Failed to verify invitation');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleJoinClass = async () => {
    console.log('handleJoinClass called with token:', token);
    setJoining(true);
    setError('');

    try {
      console.log('Making API call to join class...');
      const response = await fetch('http://localhost:8080/student/join-class-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      console.log('API response status:', response.status);
      const result = await response.json();
      console.log('API response data:', result);
      
      if (result.success) {
        console.log('Join successful, setting success state');
        setSuccess(true);
        setSuccessMessage(result.message);
        setTimeout(() => {
          // Redirect to login page so student can log in and see their new class
          navigate('/student/login');
        }, 3000);
      } else {
        console.log('Join failed:', result.message);
        setError(result.message || 'Failed to join class');
      }
    } catch (err) {
      console.error('Error joining class:', err);
      setError('Network error. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4"
        >
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4"
        >
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Successfully Joined!</h2>
            <p className="text-gray-600 mb-4">{successMessage}</p>
            <p className="text-sm text-gray-500 mb-4">
              You can now access <strong>{invitationData?.className}</strong> from your student dashboard.
            </p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Class Invitation</h1>
          <p className="text-gray-600">You've been invited to join a class</p>
        </div>

        {/* Invitation Info */}
        {invitationData && (
          <div className="bg-blue-50 p-6 rounded-lg mb-6 border-l-4 border-blue-500">
            <h3 className="font-bold text-blue-800 text-lg mb-2">{invitationData.className}</h3>
            <p className="text-blue-600 text-sm mb-3">Invited by: <strong>{invitationData.invitedBy}</strong></p>
            <div className="flex items-center text-blue-600 text-sm">
              <Mail className="w-4 h-4 mr-2" />
              {invitationData.email}
            </div>
          </div>
        )}

        {/* Join Button */}
        <div className="space-y-4">
          <button
            onClick={handleJoinClass}
            disabled={joining}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-semibold"
          >
            {joining ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Joining Class...
              </>
            ) : (
              <>
                <UserCheck className="w-5 h-5 mr-2" />
                Join {invitationData?.className}
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By clicking "Join", you'll be enrolled in this class and can access it from your student dashboard.
          </p>
          <div className="mt-4">
            <button
              onClick={() => navigate('/student/login')}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Go to Student Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentInvitation;
