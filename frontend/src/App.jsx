import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css'; // Updated to include Tailwind CSS
import RegisterInstitute from './screens/sub-admin/RegisterInstitute';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from "./components/admin/AdminDashboard";
import ManageInstitutes from './components/admin/ManageInstitutes';
import ManageRequests from './components/admin/ManageRequests';
import SubAdminLogin from './screens/sub-admin/SubAdminLogin';
import SubAdminDashboard from './screens/sub-admin/SubAdminDashboard';
import ManageStudents from './screens/sub-admin/ManageStudents';
import ManageTeachers from './screens/sub-admin/ManageTeachers';
import ViewClasses from './screens/sub-admin/ViewClasses';
import LandingPage from './screens/LandingPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterInstitute />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*">
          <Route path="login" element={<AdminLogin />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="manage-institutes" element={<ManageInstitutes />} />
          <Route path="manage-requests" element={<ManageRequests />} />
        </Route>

        {/* Sub-Admin Routes */}
        <Route path="/sub-admin/*">
          <Route path="login" element={<SubAdminLogin />} />
          <Route path="dashboard" element={<SubAdminDashboard />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="teachers" element={<ManageTeachers />} />
          <Route path="classes" element={<ViewClasses />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
