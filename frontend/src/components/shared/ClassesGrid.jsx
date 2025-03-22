import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TeacherClassCard from '../teacher/ClassCard';
import StudentClassCard from '../student/ClassCard';

const ClassesGrid = ({ classes = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isTeacher = location.pathname.includes('/teacher');
  
  console.log('Rendering ClassesGrid with classes:', classes);

  const handleClassClick = (classId) => {
    navigate(`/class/${classId}`);  // Update to use the shared route
  };

  if (!classes || classes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {isTeacher 
          ? "You haven't created any classes yet."
          : "You haven't joined any classes yet."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((classItem, index) => (
        isTeacher ? (
          <TeacherClassCard 
            key={classItem._id} 
            classData={classItem}
            onClick={() => handleClassClick(classItem._id)} 
          />
        ) : (
          <StudentClassCard 
            key={classItem._id} 
            cls={classItem}
            onClick={() => handleClassClick(classItem._id)} 
          />
        )
      ))}
    </div>
  );
};

export default ClassesGrid;
