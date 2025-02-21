import React from 'react';
import ClassCard from './ClassCard';

const ClassesGrid = ({ classes = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((classItem) => (
        <ClassCard key={classItem.id} classData={classItem} />
      ))}
    </div>
  );
};

export default ClassesGrid;
