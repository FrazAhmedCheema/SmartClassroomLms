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
import TeacherNotifications from './screens/teacher/TeacherNotifications';
import TeacherTodo from './screens/teacher/TeacherTodo';
import TeacherSettings from './screens/teacher/TeacherSettings';
import StudentDashboard from './screens/student/StudentDashboard';
import StudentNotifications from './screens/student/StudentNotifications';
import StudentTodo from './screens/student/StudentTodo';
import StudentSettings from './screens/student/StudentSettings';
import NotificationDebugger from './components/debug/NotificationDebugger';
import TeacherLogin from './screens/teacher/TeacherLogin';
import PrivateRoute from './components/PrivateRoute';
import StudentLogin from './screens/student/StudentLogin';
import AdminNavbar from './components/admin/AdminNavbar';
import ClassPage from './components/shared/ClassPage';
import AssignmentDetailScreen from './components/shared/classwork/AssignmentDetailScreen';
import QuizDetailScreen from './components/shared/classwork/QuizDetailScreen';
import MaterialDetailScreen from './components/shared/classwork/MaterialDetailScreen';
import QuestionDetailScreen from './components/shared/classwork/QuestionDetailScreen';
import StudentInvitation from './components/student/StudentSignup';
import StudentInviteRedirect from './components/student/StudentInviteRedirect';
import PlagiarismReportScreen from './components/teacher/PlagiarismReportScreen';

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
      <Route path="/student-invitation" element={<StudentInvitation />} />
      <Route path="/invite" element={<StudentInviteRedirect />} />
      
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
          <Route path="notifications" element={<TeacherNotifications />} />
          <Route path="todos" element={<TeacherTodo />} />
          <Route path="settings" element={<TeacherSettings />} />
        </Route>
      </Route>

      {/* Student invitation route - public access */}
      <Route path="/student-invitation" element={<StudentInvitation />} />
      <Route path="/invite" element={<StudentInviteRedirect />} />

      {/* Student Routes */}
      <Route path="/student">
        <Route path="login" element={
          isStudentAuthenticated 
            ? <Navigate to="/student/home" replace /> 
            : <StudentLogin />
        } />
        <Route path="signup" element={<StudentInvitation />} />
        <Route path="invitation" element={<StudentInvitation />} />
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
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="todos" element={<StudentTodo />} />
          <Route path="settings" element={<StudentSettings />} />
          <Route path="debug" element={<NotificationDebugger />} />
        </Route>
      </Route>

      {/* Class Routes - Common for both teacher and student */}
      <Route element={
        <PrivateRoute 
          isAuthenticated={isTeacherAuthenticated || isStudentAuthenticated}
          redirectPath={isTeacherAuthenticated ? "/teacher/login" : "/student/login"}
        >
          {isTeacherAuthenticated ? <TeacherLayout /> : <StudentLayout />}
        </PrivateRoute>
      }>
        <Route path="/class/:id" element={<ClassPage defaultTab="stream" />} />
        <Route path="/cw/:id" element={<ClassPage defaultTab="classwork" />} />
        <Route path="/people/:id" element={<ClassPage defaultTab="people" />} />
          <Route path="/plagiarism-report" element={<PlagiarismReportScreen />} />

        <Route path="/discussions/:id" element={<ClassPage defaultTab="discussion" />} />
        <Route path="/assignment/:id" element={<AssignmentDetailScreen />} />
        <Route path="/quiz/:id" element={<QuizDetailScreen />} />
        <Route path="/material/:id" element={<MaterialDetailScreen />} />
        <Route path="/question/:id" element={<QuestionDetailScreen />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
