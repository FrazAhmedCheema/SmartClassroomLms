import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

const PrivateRoute = ({ children, isAuthenticated, redirectPath }) => {
  const location = useLocation();
  const isTeacherRoute = location.pathname.includes('/teacher');

  const loading = useSelector((state) => 
    isTeacherRoute ? state.teacher.loading : state.student.loading
  );

  console.log('PrivateRoute check - isAuthenticated:', isAuthenticated, 'Path:', location.pathname);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1b68b3]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with the return url
    return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default PrivateRoute;
