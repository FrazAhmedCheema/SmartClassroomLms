import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css'; 
import RegisterInstitute from './screens/sub-admin/RegisterInstitute';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from "./components/admin/AdminDashboard";
import ManageInstitutes from './components/admin/ManageInstitutes';
import ManageRequests from './components/admin/ManageRequests';
import AdminNotifications from './components/admin/AdminNotifications';
import SubAdminLogin from './screens/sub-admin/SubAdminLogin';
import SubAdminDashboard from './screens/sub-admin/SubAdminDashboard';
import ManageStudents from './screens/sub-admin/ManageStudents';
import ManageTeachers from './screens/sub-admin/ManageTeachers';
import ViewClasses from './screens/sub-admin/ViewClasses';
import LandingPage from './screens/LandingPage';
import ClassDetails from './screens/sub-admin/ClassDetails';
import VerifyEmail from './screens/sub-admin/VerifyEmail';
import SubAdminLayout from './layouts/SubAdminLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-institutes" element={<ManageInstitutes />} />
        <Route path="/admin/manage-requests" element={<ManageRequests />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />

        {/* Sub-Admin Routes */}
        <Route path="/sub-admin/login" element={<SubAdminLogin />} />
        <Route path="/sub-admin/register" element={<RegisterInstitute />} />
        <Route path="/sub-admin/verify-email" element={<VerifyEmail />} />
        
        {/* Protected Sub-Admin Routes */}
        <Route path="/sub-admin" element={<SubAdminLayout />}>
          <Route path="dashboard" element={<SubAdminDashboard />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="teachers" element={<ManageTeachers />} />
          <Route path="classes" element={<ViewClasses />} />
          <Route path="classes/:id" element={<ClassDetails />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
