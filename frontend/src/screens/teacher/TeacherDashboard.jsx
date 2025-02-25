import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import SharedDashboard from '../../components/shared/SharedDashboard';
import ClassesGrid from '../../components/teacher/ClassesGrid';
import CreateClassModal from '../../components/teacher/CreateClassModal';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { fetchClasses, selectClasses } from '../../redux/slices/classesSlice';

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { teacherId } = useSelector((state) => state.teacher);
  const classes = useSelector(selectClasses);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const coverImages = [
    'https://gstatic.com/classroom/themes/img_code.jpg',
    'https://gstatic.com/classroom/themes/img_breakfast.jpg',
    'https://gstatic.com/classroom/themes/img_bookclub.jpg',
    'https://gstatic.com/classroom/themes/img_reachout.jpg'
  ];

  useEffect(() => {
    if (teacherId) {
      dispatch(fetchClasses());
    }
  }, [teacherId, dispatch]);

  const handleCreateClass = async (classData) => {
    try {
      const response = await fetch('http://localhost:8080/teacher/create-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...classData,
          teacherId
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const newClass = {
          ...data.data,
          coverImage: coverImages[classes.length % coverImages.length]
        };
        dispatch(fetchClasses()); // Fetch classes again to update the state
        
        Swal.fire({
          title: 'Success!',
          text: 'Class created successfully',
          icon: 'success',
          confirmButtonColor: '#1b68b3',
        });
        
        setIsModalOpen(false);
      } else {
        throw new Error(data.message || 'Failed to create class');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to create class',
        icon: 'error',
        confirmButtonColor: '#1b68b3',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-4">
        {/* Stats Section */}
        <div className="mb-6">
          <SharedDashboard userRole="Teacher" />
        </div>
        
        {/* Classes Section */}
        <div className="relative">
          <div className="absolute inset-x-0 -top-4 h-px bg-gray-200"></div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Classes</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors flex items-center gap-2"
              >
                + Create Class
              </button>
            </div>
            <ClassesGrid classes={classes} />
          </motion.div>
        </div>
      </div>

      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateClass}
      />
    </div>
  );
};

export default TeacherDashboard;
