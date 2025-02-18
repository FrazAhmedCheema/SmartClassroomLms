import React from 'react';
import SharedSidebar from '../shared/SharedSidebar';

const StudentSidebar = (props) => {
  // Example classes - in real app, these would come from props or context
  const enrolledClasses = [
    { id: 1, name: 'Mathematics 101' },
    { id: 2, name: 'Physics 101' },
    { id: 3, name: 'Computer Science 101' }
  ];

  return (
    <SharedSidebar
      {...props}
      userRole="Student"
      classes={enrolledClasses}
    />
  );
};

export default StudentSidebar;
