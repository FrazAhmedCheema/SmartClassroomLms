import React from 'react';
import ReactDOM from 'react-dom/client';
import RootApp from './App'; // ✅ Correct import
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RootApp /> // ✅ Rendering RootApp
  </React.StrictMode>
);
