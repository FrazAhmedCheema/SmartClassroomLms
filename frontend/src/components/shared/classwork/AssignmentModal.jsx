import React, { useState } from 'react';
import AssignmentDetail from './AssignmentDetailScreen';
import axios from 'axios';

const AssignmentModal = ({ assignment, onClose, isTeacher, classId }) => {
  console.log('AssignmentModal rendered with assignment:', assignment);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (files, privateComment) => {
    try {
      console.log('AssignmentModal handleSubmit called');
      setIsSubmitting(true);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      if (privateComment) {
        formData.append('privateComment', privateComment);
      }
      
      const response = await axios.post(
        `http://localhost:8080/submission/${assignment._id}/submit`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
      if (response.data.success) {
        console.log('Assignment submitted successfully');
        alert('Assignment submitted successfully!');
        setIsSubmitting(false);
        onClose();
        return response.data;
      }
      
      throw new Error(response.data.message || 'Failed to submit assignment');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setIsSubmitting(false);
      throw error;
    }
  };

  return (
    <AssignmentDetail
      assignment={assignment}
      isTeacher={isTeacher}
      onClose={onClose}
      onSubmit={handleSubmit} // Pass handleSubmit as onSubmit prop
      isSubmitting={isSubmitting}
    />
  );
};

export default AssignmentModal;
