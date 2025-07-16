import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import StudentNavbar from '../components/student/StudentNavbar';
import StudentSidebar from '../components/student/StudentSidebar';
import useMediaQuery from '../hooks/useMediaQuery';
import { fetchAssignments } from '../redux/actions/assignmentActions';

const StudentLayout = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const dispatch = useDispatch();

  useEffect(() => {
    // Load assignments data when layout mounts
    console.log("StudentLayout: Loading assignments data");
    dispatch(fetchAssignments())
      .then(result => {
        console.log("StudentLayout: Assignments loaded", result);
      })
      .catch(error => {
        console.error("StudentLayout: Error loading assignments", error);
      });
  }, [dispatch]);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar 
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
      />
      <StudentSidebar 
        isOpen={isSidebarOpen} 
        toggle={toggleSidebar}
        isMobile={isMobile}
      />
      <div className={`transition-all duration-300 pt-16 ${isSidebarOpen ? 'ml-64' : isMobile ? 'ml-0' : 'ml-20'}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default StudentLayout;
