import React from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';

const StudentInviteRedirect = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  if (token) {
    return <Navigate to={`/student-invitation?token=${token}`} replace />;
  }
  
  return <Navigate to="/" replace />;
};

export default StudentInviteRedirect;
