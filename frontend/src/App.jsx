import React, { useEffect, useState } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store';
import { checkAuthStatus } from './redux/slices/teacherSlice';
import { checkStudentAuthStatus } from './redux/slices/studentSlice';
import { checkSubAdminAuthStatus } from './redux/slices/subAdminAuthSlice';
import AppRoutes from './routes';
import './index.css';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkRelevantAuth = async () => {
      try {
        // Check auth based on current path
        if (location.pathname.startsWith('/admin')) {
          // Admin auth check is handled by the AdminDashboard component
          setAuthChecked(true);
        } else if (location.pathname.startsWith('/teacher')) {
          await dispatch(checkAuthStatus());
        } else if (location.pathname.startsWith('/student')) {
          await dispatch(checkStudentAuthStatus());
        } else if (location.pathname.startsWith('/sub-admin')) {
          await dispatch(checkSubAdminAuthStatus());
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setAuthChecked(true);
      }
    };

    checkRelevantAuth();
  }, [dispatch, location.pathname]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
