import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { studentLogout } from '../../redux/slices/studentSlice';
import SharedNavbar from '../shared/SharedNavbar';

const StudentNavbar = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(studentLogout()).unwrap();
      navigate('/student/login');
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
