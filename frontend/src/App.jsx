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

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/sub-admin/register" element={<RegisterInstitute />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-institutes" element={<ManageInstitutes />} />
        <Route path="/admin/manage-requests" element={<ManageRequests />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />

        {/* Sub-Admin Routes */}
        <Route path="/sub-admin/login" element={<SubAdminLogin />} />
        <Route path="/sub-admin/dashboard" element={<SubAdminDashboard />} />
        <Route path="/sub-admin/students" element={<ManageStudents />} />
        <Route path="/sub-admin/teachers" element={<ManageTeachers />} />
        <Route path="/sub-admin/classes" element={<ViewClasses />} />
        <Route path="/sub-admin/classes/:id" element={<ClassDetails />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
