import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaChalkboardTeacher, FaBook } from 'react-icons/fa';
import Navbar from '../../components/sub-admin/Navbar';
import Sidebar from '../../components/sub-admin/Sidebar';

const SubAdminDashboard = () => {
  // Dummy data for overview
  const stats = {
    teachers: 25,
    students: 150,
    assignedCourses: 18,
    totalCourses: 30
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Sidebar />
      
      <div className="ml-64 pt-20 p-8">
        {/* Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-6">
            <Link to="/sub-admin/students" className="bg-white p-6 rounded-lg shadow-md hover:bg-blue-800 hover:text-white transition-all duration-300 flex flex-col items-center group">
              <FaUsers className="text-4xl text-blue-600 mb-2 group-hover:text-white transition-colors" />
              <span className="text-gray-700 font-semibold group-hover:text-white transition-colors">Manage Students</span>
            </Link>
            <Link to="/sub-admin/teachers" className="bg-white p-6 rounded-lg shadow-md hover:bg-blue-800 hover:text-white transition-all duration-300 flex flex-col items-center group">
              <FaChalkboardTeacher className="text-4xl text-blue-600 mb-2 group-hover:text-white transition-colors" />
              <span className="text-gray-700 font-semibold group-hover:text-white transition-colors">Manage Teachers</span>
            </Link>
            <Link to="/sub-admin/courses" className="bg-white p-6 rounded-lg shadow-md hover:bg-blue-800 hover:text-white transition-all duration-300 flex flex-col items-center group">
              <FaBook className="text-4xl text-blue-600 mb-2 group-hover:text-white transition-colors" />
              <span className="text-gray-700 font-semibold group-hover:text-white transition-colors">View Classes</span>
            </Link>
          </div>
        </div>

        {/* Overview Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Overview</h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">Available Teachers</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.teachers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">Available Students</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.students}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">Assigned Courses</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.assignedCourses}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">Total Courses</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalCourses}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubAdminDashboard;
