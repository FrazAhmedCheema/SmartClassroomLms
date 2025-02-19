import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/sub-admin/Navbar';
import Sidebar from '../components/sub-admin/Sidebar';
import useMediaQuery from '../hooks/useMediaQuery';

const SubAdminLayout = () => {
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
      <Navbar 
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
      />
      <Sidebar 
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

export default SubAdminLayout;
