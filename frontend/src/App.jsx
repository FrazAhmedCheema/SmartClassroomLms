import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css'; // Updated to include Tailwind CSS
import RegisterInstitute from './screens/sub-admin/RegisterInstitute';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from "./components/admin/AdminDashboard";
import ManageInstitutes from './components/admin/ManageInstitutes';
import ManageRequests from './components/admin/ManageRequests';
import SubAdminLogin from './screens/sub-admin/SubAdminLogin';
import SetLoginPassword from './components/sub-admin/SetLoginPassword';
// ...import other components as needed...

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterInstitute />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-institutes" element={<ManageInstitutes />} />
        <Route path="/admin/manage-requests" element={<ManageRequests />} />
        <Route path="/sub-admin/login" element={<SubAdminLogin />} />
        <Route path="/sub-admin/set-login-password" element={<SetLoginPassword />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
