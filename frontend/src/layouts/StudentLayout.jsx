import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import StudentNavbar from '../components/student/StudentNavbar';
import StudentSidebar from '../components/student/StudentSidebar';
import useMediaQuery from '../hooks/useMediaQuery';

const StudentLayout = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

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
