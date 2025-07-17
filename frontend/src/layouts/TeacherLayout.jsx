import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import TeacherNavbar from '../components/teacher/TeacherNavbar';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import useMediaQuery from '../hooks/useMediaQuery';
import Swal from 'sweetalert2';
import { fetchTeacherAssignments } from '../redux/actions/assignmentActions';

const TeacherLayout = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  console.log("TeacherLayout: Current path:", location.pathname);

  useEffect(() => {
    // Log the route change
    console.log("TeacherLayout: Route changed to", location.pathname);
  }, [location]);

  useEffect(() => {
    // Load teacher assignments data when layout mounts
    console.log("TeacherLayout: Loading assignments data");
    dispatch(fetchTeacherAssignments())
      .then(result => {
        console.log("TeacherLayout: Assignments loaded", result);
      })
      .catch(error => {
        console.error("TeacherLayout: Error loading assignments", error);
      });
  }, [dispatch]);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCreateClass = (classData) => {
    const event = new CustomEvent('classCreated', { detail: classData });
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherNavbar 
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
        onCreateClass={handleCreateClass}
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
