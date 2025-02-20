import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaChalkboardTeacher, FaBook, FaGraduationCap } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Activity, ChevronRight } from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import Navbar from '../../components/sub-admin/Navbar';
import Sidebar from '../../components/sub-admin/Sidebar';

const SubAdminDashboard = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    assignedCourses: 0,
    totalCourses: 0
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://localhost:8080/sub-admin/dashboard", {

          method: "GET",

          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          }
        });
        if (response.status === 200) {
          navigate('/sub-admin/dashboard');
        }
        if (!response.ok || response.status === 401 || response.status === 403) {
          navigate('/sub-admin/login');
        }
    
        if (!response.ok) {
          throw new Error("Authentication failed");
        }
    
        const data = await response.json(); // <-- This was failing before because the response was not JSON
        setStats(data.stats); // Make sure stats is returned in JSON
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication error:", error);
        navigate('/sub-admin/login');
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    

    fetchDashboardData();
  }, [navigate]);

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1b68b3] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#154d85] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Only render dashboard content if authenticated
  if (!isAuthenticated) {
    return null;
  }

  const recentActivities = [
    {
      title: "New Student Enrolled",
      message: "John Doe has been enrolled in Computer Science",
      timestamp: "2 hours ago"
    },
    {
      title: "Course Assignment",
      message: "Prof. Sarah assigned new course 'Web Development'",
      timestamp: "3 hours ago"
    },
    {
      title: "Teacher Registration",
      message: "New teacher Dr. Mike Johnson registered",
      timestamp: "5 hours ago"
    }
  ];

  const handleViewAll = () => {
    navigate('/sub-admin/activities');
  };

  // Data for charts
  const studentEnrollmentData = [
    { name: 'Jan', students: 40 },
    { name: 'Feb', students: 30 },
    { name: 'Mar', students: 20 },
    { name: 'Apr', students: 27 },
    { name: 'May', students: 18 },
    { name: 'Jun', students: 23 },
    { name: 'Jul', students: 34 },
  ];

  const courseDistributionData = [
    { name: 'Computer Science', value: 40 },
    { name: 'Mathematics', value: 30 },
    { name: 'Physics', value: 20 },
    { name: 'Chemistry', value: 10 },
  ];

  const teacherPerformanceData = [
    { name: 'Jan', performance: 65 },
    { name: 'Feb', performance: 59 },
    { name: 'Mar', performance: 80 },
    { name: 'Apr', performance: 81 },
    { name: 'May', performance: 56 },
    { name: 'Jun', performance: 55 },
    { name: 'Jul', performance: 40 },
  ];

  const COLORS = ['#1b68b3', '#2180db', '#1a5a8d', '#164c7a'];

  const StatCard = ({ icon: Icon, title, value }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300"
      style={{ borderBottom: '4px solid #1b68b3' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: '#666' }}>{title}</p>
          <h3 className="text-3xl font-bold mt-2" style={{ color: '#1b68b3' }}>{value}</h3>
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(27, 104, 179, 0.1)' }}>
          <Icon className="text-2xl" style={{ color: '#1b68b3' }} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <Navbar
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        toggle={toggleSidebar}
        isMobile={isMobile}
      />

      <div className={`transition-all duration-300 pt-16 
        ${isSidebarOpen ? 'ml-64' : isMobile ? 'ml-0' : 'ml-20'}`}>
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold" style={{ color: '#1b68b3' }}>Dashboard Overview</h1>
            <p style={{ color: '#666' }} className="mt-1">Welcome to your admin dashboard</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={FaChalkboardTeacher} title="Teachers" value={stats.teachers} />
            <StatCard icon={FaUsers} title="Students" value={stats.students} />
            <StatCard icon={FaBook} title="Assigned Courses" value={stats.assignedCourses} />
            <StatCard icon={FaGraduationCap} title="Total Courses" value={stats.totalCourses} />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Bar Chart - Student Enrollment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: '#1b68b3' }}>Student Enrollment</h2>
              <BarChart width={400} height={300} data={studentEnrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#1b68b3" />
              </BarChart>
            </motion.div>

            {/* Pie Chart - Course Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: '#1b68b3' }}>Course Distribution</h2>
              <PieChart width={400} height={300}>
                <Pie
                  data={courseDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {courseDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </motion.div>

            {/* Line Chart - Teacher Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: '#1b68b3' }}>Teacher Performance</h2>
              <LineChart width={400} height={300} data={teacherPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="performance" stroke="#1b68b3" />
              </LineChart>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: FaUsers, title: 'Manage Students', path: '/sub-admin/students' },
              { icon: FaChalkboardTeacher, title: 'Manage Teachers', path: '/sub-admin/teachers' },
              { icon: FaBook, title: 'View Classes', path: '/sub-admin/classes' },
            ].map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={action.path}
                  className="block p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: 'linear-gradient(to right, #1b68b3, #2180db)',
                    color: 'white'
                  }}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <action.icon className="text-4xl" />
                    <h3 className="text-lg font-semibold">{action.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6" style={{ color: '#1b68b3' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#1b68b3' }}>
                  Recent Activity
                </h2>
              </div>
              <button 
                onClick={handleViewAll} 
                className="text-sm px-4 py-2 rounded-lg transition-all duration-300 text-white hover:text-[#1b68b3] hover:bg-blue-50"
                style={{ backgroundColor: '#1b68b3' }}
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{activity.title}</h3>
                    <p className="text-sm text-gray-500">{activity.message}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{activity.timestamp}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SubAdminDashboard;