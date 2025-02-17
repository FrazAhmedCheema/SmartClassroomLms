import React from 'react';
import SharedSidebar from '../shared/SharedSidebar';

const TeacherSidebar = (props) => {
  // Example classes - in real app, these would come from props or context
  const assignedClasses = [
    { id: 1, name: 'Mathematics 101' },
    { id: 2, name: 'Mathematics 201' },
    { id: 3, name: 'Advanced Calculus' }
  ];

  return (
    <SharedSidebar
      {...props}
      userRole="Teacher"
      classes={assignedClasses}
    />
  );
};

export default TeacherSidebar;
