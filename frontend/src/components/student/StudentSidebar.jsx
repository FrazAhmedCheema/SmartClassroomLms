import React from 'react';
import { useSelector } from 'react-redux';
import SharedSidebar from '../shared/SharedSidebar';
import { selectEnrolledClasses } from '../../redux/slices/enrolledClassesSlice';

const StudentSidebar = ({ isOpen, toggle, isMobile }) => {
  const classes = useSelector(selectEnrolledClasses);

  console.log('Classes in StudentSidebar:', classes);

  return (
    <SharedSidebar 
      isOpen={isOpen} 
      toggle={toggle} 
      isMobile={isMobile}
      userRole="Student"
      classes={classes}
    />
  );
};

export default StudentSidebar;
