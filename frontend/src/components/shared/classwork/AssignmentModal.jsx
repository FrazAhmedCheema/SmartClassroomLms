import React from 'react';
import AssignmentDetail from './AssignmentDetail';

const AssignmentModal = ({ assignment, onClose, isTeacher, classId }) => {
  const handleSubmit = async (files) => {
    // TODO: Implement submission logic
    console.log('Submitting files:', files);
  };

  return (
    <AssignmentDetail
      assignment={assignment}
      isTeacher={isTeacher}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
};

export default AssignmentModal;
