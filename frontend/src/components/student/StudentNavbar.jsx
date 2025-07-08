import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { studentLogout } from '../../redux/slices/studentSlice';
import { clearNotifications } from '../../redux/slices/notificationSlice';
import SharedNavbar from '../shared/SharedNavbar';

const StudentNavbar = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { name } = useSelector(state => state.student);

  const handleLogout = async () => {
    try {
      await dispatch(studentLogout()).unwrap();
      dispatch(clearNotifications()); // Clear notifications on logout
      navigate('/student/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SharedNavbar
      {...props}
      userRole="Student"
      userName={name}
      onLogout={handleLogout}
    />
  );
};

export default StudentNavbar;
