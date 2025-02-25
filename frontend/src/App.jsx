import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store'; // Import as named export
import { checkAuthStatus } from './redux/slices/teacherSlice'; // Correct import path
import { checkStudentAuthStatus } from './redux/slices/studentSlice';
import AppRoutes from './routes';
import './index.css';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      if (location.pathname.includes('/teacher')) {
        await dispatch(checkAuthStatus());
      } else if (location.pathname.includes('/student')) {
        await dispatch(checkStudentAuthStatus());
      }
    };

    checkAuth();
  }, [dispatch, location.pathname]);

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
