import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store'; // Import as named export
import { checkAuthStatus } from './redux/slices/teacherSlice'; // Correct import path
import AppRoutes from './routes';
import './index.css';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('Dispatching checkAuthStatus');
    dispatch(checkAuthStatus());
  }, [dispatch]);

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
