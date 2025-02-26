import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SharedDashboard from '../../components/shared/SharedDashboard';
import ClassesGrid from '../../components/shared/ClassesGrid';
import JoinClassModal from '../../components/student/JoinClassModal';
import { motion } from 'framer-motion';
import { fetchEnrolledClasses } from '../../redux/slices/enrolledClassesSlice';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { studentId } = useSelector((state) => state.student);
  const { classes, status, error } = useSelector((state) => state.enrolledClasses);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log('Fetching enrolled classes...');
    dispatch(fetchEnrolledClasses())
      .unwrap()
      .then(classes => console.log('Fetched classes:', classes))
      .catch(error => console.error('Error fetching classes:', error));
  }, [dispatch]);

  // Add loading state
  if (status === 'loading') {
    return <div>Loading classes...</div>;
  }

  // Add error state
  if (status === 'failed') {
    console.error('Error loading classes:', error);
  }

  console.log('Current classes in state:', classes);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-4">
        <div className="mb-6">
          <SharedDashboard userRole="Student" />
        </div>
        
        <div className="relative">
          <div className="absolute inset-x-0 -top-4 h-px bg-gray-200"></div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Enrolled Classes</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors flex items-center gap-2"
              >
                + Join Class
              </button>
            </div>
            {/* Add debug information */}
            <div className="text-sm text-gray-500 mb-4">
              {`${classes.length} classes loaded`}
            </div>
            <ClassesGrid classes={classes} />
          </motion.div>
        </div>
      </div>

      <JoinClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default StudentDashboard;
