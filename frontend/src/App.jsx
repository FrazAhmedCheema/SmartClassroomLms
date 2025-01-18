import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./screens/admin/AdminLogin";
import AdminDashboard from "./screens/admin/AdminDashboard";
import ManageInstitutes from './screens/admin/ManageInstitutes';
import ManageRequests from './screens/admin/ManageRequests';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/manage-institutes" element={<ManageInstitutes />} />
        <Route path="/manage-requests" element={<ManageRequests />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
