import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css'; // Updated to include Tailwind CSS
import InstituteRegistration from './screens/sub-admin/InstituteRegistration';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from "./components/admin/AdminDashboard";
import ManageInstitutes from './components/admin/ManageInstitutes';
import ManageRequests from './components/admin/ManageRequests';
// ...import other components as needed...

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<InstituteRegistration />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/manage-institutes" element={<ManageInstitutes />} />
        <Route path="/manage-requests" element={<ManageRequests />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
