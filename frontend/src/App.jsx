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
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';
import TeacherDashboard from './screens/teacher/TeacherDashboard';
import StudentDashboard from './screens/student/StudentDashboard';
import TeacherLogin from './screens/teacher/TeacherLogin'; // Import TeacherLogin

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

        {/* Teacher Routes */}
        <Route path="/teacher/login" element={<TeacherLogin />} /> {/* Add TeacherLogin route */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<TeacherDashboard />} />
          {/* Comment out until components are created
          <Route path="notifications" element={<TeacherNotifications />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="todos" element={<TeacherTodos />} />
          <Route path="settings" element={<TeacherSettings />} />
          */}
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<StudentDashboard />} />
          {/* Comment out until components are created
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="classes" element={<StudentClasses />} />
          <Route path="todos" element={<StudentTodos />} />
          <Route path="settings" element={<StudentSettings />} />
          */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
