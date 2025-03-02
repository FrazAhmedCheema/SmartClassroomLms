import React, { useEffect, useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './redux/store';
import { checkAuthStatus } from './redux/slices/teacherSlice';
import { checkStudentAuthStatus } from './redux/slices/studentSlice';
import AppRoutes from './routes';
import './index.css';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const { isAuthenticated: isTeacherAuthenticated } = useSelector(state => state.teacher);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking auth for path:', location.pathname);
      try {
        if (location.pathname.includes('/teacher')) {
          await dispatch(checkAuthStatus());
        } else if (location.pathname.includes('/student')) {
          await dispatch(checkStudentAuthStatus());
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [dispatch, location.pathname]);

  // For debugging
  useEffect(() => {
    if (authChecked) {
      console.log('Teacher auth status:', isTeacherAuthenticated);
    }
  }, [authChecked, isTeacherAuthenticated]);

  if (!authChecked && (location.pathname.includes('/teacher') || location.pathname.includes('/student'))) {
    // Show loading state while checking auth
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return <AppRoutes />;
}

function RootApp() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
}

export default RootApp;
