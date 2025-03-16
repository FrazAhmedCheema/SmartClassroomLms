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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Static Navbar */}
      <Navbar 
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
      />
      
      <div className="flex flex-1 pt-16">
        {/* Static Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggle={toggleSidebar}
          isMobile={isMobile}
        />
        
        {/* Main Content Area */}
        <main className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-64' : isMobile ? 'ml-0' : 'ml-20'
        }`}>
          <div className="h-full min-h-screen bg-gray-50">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default React.memo(SubAdminLayout); // Add memo to prevent unnecessary re-renders
