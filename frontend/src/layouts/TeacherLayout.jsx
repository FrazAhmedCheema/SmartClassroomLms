import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TeacherNavbar from '../components/teacher/TeacherNavbar';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import useMediaQuery from '../hooks/useMediaQuery';

const TeacherLayout = () => {
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
      <TeacherNavbar 
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
      />
      <TeacherSidebar 
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

export default TeacherLayout;
