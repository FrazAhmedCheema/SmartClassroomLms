import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LandingPage from './screens/LandingPage';
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
import ClassDetails from './screens/sub-admin/ClassDetails';
import VerifyEmail from './screens/sub-admin/VerifyEmail';
import RegisterInstitute from './screens/sub-admin/RegisterInstitute';
import SubAdminLayout from './layouts/SubAdminLayout';
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';
import TeacherDashboard from './screens/teacher/TeacherDashboard';
import StudentDashboard from './screens/student/StudentDashboard';
import TeacherLogin from './screens/teacher/TeacherLogin';
import PrivateRoute from './components/PrivateRoute';
import StudentLogin from './screens/student/StudentLogin';
// Import the class page components
import TeacherClassPage from './screens/teacher/TeacherClassPage';
import StudentClassPage from './screens/student/StudentClassPage';
import AdminNavbar from './components/admin/AdminNavbar';

// Create AdminLayout component
const AdminLayout = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

const AppRoutes = () => {
  const { isAuthenticated: isTeacherAuthenticated } = useSelector((state) => state.teacher || {});
  const { isAuthenticated: isStudentAuthenticated } = useSelector((state) => state.student || {});
  const { isAuthenticated: isAdminAuthenticated } = useSelector((state) => state.adminAuth || {});
  const { isAuthenticated: isSubAdminAuthenticated } = useSelector((state) => state.subAdminAuth || {});

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={
        isAdminAuthenticated 
          ? <Navigate to="/admin/dashboard" replace /> 
          : <AdminLogin />
      } />
      <Route path="/admin" element={
        <PrivateRoute 
          isAuthenticated={isAdminAuthenticated} 
          redirectPath="/admin/login"
        >
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="manage-institutes" element={<ManageInstitutes />} />
        <Route path="manage-requests" element={<ManageRequests />} />
        <Route path="notifications" element={<AdminNotifications />} />
      </Route>

      {/* Sub-Admin Routes */}
      <Route path="/sub-admin/login" element={
        isSubAdminAuthenticated 
          ? <Navigate to="/sub-admin/dashboard" replace /> 
          : <SubAdminLogin />
      } />
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
      <Route path="/teacher">
        <Route path="login" element={
          isTeacherAuthenticated 
            ? <Navigate to="/teacher/home" replace /> 
            : <TeacherLogin />
        } />
        <Route element={
          <PrivateRoute 
            isAuthenticated={isTeacherAuthenticated} 
            redirectPath="/teacher/login"
          >
            <TeacherLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<TeacherDashboard />} />
          <Route path="dashboard" element={<Navigate to="/teacher/home" replace />} />
          {/* Add TeacherClassPage route */}
          <Route path="class/:id" element={<TeacherClassPage />} />
          {/* Additional teacher routes go here */}
        </Route>
      </Route>

      {/* Student Routes */}
      <Route path="/student">
        <Route path="login" element={
          isStudentAuthenticated 
            ? <Navigate to="/student/home" replace /> 
            : <StudentLogin />
        } />
        <Route element={
          <PrivateRoute 
            isAuthenticated={isStudentAuthenticated} 
            redirectPath="/student/login"
          >
            <StudentLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<StudentDashboard />} />
          {/* Add StudentClassPage route */}
          <Route path="class/:id" element={<StudentClassPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
