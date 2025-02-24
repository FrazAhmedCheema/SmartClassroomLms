import React from 'react';
import { useSelector } from 'react-redux';
import SharedSidebar from '../shared/SharedSidebar';
import { selectClasses } from '../../redux/slices/classesSlice';

const TeacherSidebar = ({ isOpen, toggle, isMobile }) => {
  const classes = useSelector(selectClasses);

  return (
    <SharedSidebar 
      isOpen={isOpen} 
      toggle={toggle} 
      isMobile={isMobile} 
      userRole="Teacher" 
      classes={classes} 
    />
  );
};

export default TeacherSidebar;
