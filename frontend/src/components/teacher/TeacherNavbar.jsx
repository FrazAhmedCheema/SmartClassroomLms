import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { teacherLogout } from '../../redux/slices/teacherSlice';
import SharedNavbar from '../shared/SharedNavbar';

const TeacherNavbar = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8080/teacher/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        dispatch(teacherLogout());
        navigate('/teacher/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SharedNavbar
      {...props}
      userRole="Teacher"
      onLogout={handleLogout}
    />
  );
};

export default TeacherNavbar;
