import React, { useState, useEffect } from 'react';
import SharedDashboard from '../../components/shared/SharedDashboard';
import ClassesGrid from '../../components/teacher/ClassesGrid';
import CreateClassModal from '../../components/teacher/CreateClassModal';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const coverImages = [
    'https://gstatic.com/classroom/themes/img_code.jpg',
    'https://gstatic.com/classroom/themes/img_breakfast.jpg',
    'https://gstatic.com/classroom/themes/img_reading.jpg',
    'https://gstatic.com/classroom/themes/img_bookclub.jpg',
    'https://gstatic.com/classroom/themes/img_reachout.jpg'
  ];

  // Add event listener for class creation
  useEffect(() => {
    const handleClassCreated = (event) => {
      const classData = event.detail;
      const newClass = {
        id: Date.now(),
        ...classData,
        teacherName: 'John Doe',
        studentCount: 0,
        coverImage: coverImages[Math.floor(Math.random() * coverImages.length)]
      };
      setClasses(prevClasses => [...prevClasses, newClass]);
    };

    window.addEventListener('classCreated', handleClassCreated);
    return () => window.removeEventListener('classCreated', handleClassCreated);
  }, []);

  const handleCreateClass = (classData) => {
    try {
      const newClass = {
        id: Date.now(),
        className: classData.className,
        section: classData.section,
        teacherName: 'John Doe',
        studentCount: 0,
        coverImage: coverImages[Math.floor(Math.random() * coverImages.length)]
      };

      setClasses(prevClasses => [...prevClasses, newClass]);
      
      Swal.fire({
        title: 'Success!',
        text: 'Class created successfully',
        icon: 'success',
        confirmButtonColor: '#1b68b3',
      });
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating class:', error);
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
