import React from 'react';
import { useNavigate } from 'react-router-dom';
import SharedNavbar from '../shared/SharedNavbar';

const StudentNavbar = (props) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8080/student/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        navigate('/student/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SharedNavbar
      {...props}
      userRole="Student"
      onLogout={handleLogout}
    />
  );
};

export default StudentNavbar;
