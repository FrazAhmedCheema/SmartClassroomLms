import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ClipboardList } from 'lucide-react';
import axios from 'axios';
import logo from '../../assets/logo.png';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:8080/admin/dashboard', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.status === 200) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          // Handle 401 Unauthorized error explicitly
          console.warn('User is not authenticated. Redirecting to login...');
          navigate('/admin/login');
        } else {
          // Handle other errors if necessary
          console.error('An unexpected error occurred:', err);
        }
      } finally {
        setLoading(false);
      }
    };
  
    checkAuth();
  }, [navigate]);
  




  const handleManageInstitutes = () => {
    navigate('/admin/manage-institutes');
  };

  const handleViewRequests = () => {
    navigate('/admin/manage-requests');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-16 w-16"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: '#1b68b3' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <img src={logo} alt="Logo" className="h-14 filter invert brightness-0" />
          <div className="flex items-center space-x-4">
            <span className="text-white">Welcome, Admin</span>
            <img
              src="/api/placeholder/40/40"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-white"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold" style={{ color: '#1b68b3' }}>Welcome to the Admin Dashboard</h2>
          <p className="mt-2 text-gray-500">Manage your educational system efficiently</p>
        </div>

        {/* Quick Actions Section */}
        <section className="text-center mb-8">
          <h3 className="text-xl font-semibold mb-6" style={{ color: '#1b68b3' }}>Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manage Institute Card */}
            <div style={{ backgroundColor: '#EFF6FF' }} className="rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2" style={{ color: '#1b68b3' }}>Manage Institutes</h4>
                <p className="text-gray-500 mb-4">Add, edit, or remove institute information</p>
                <button
                  onClick={handleManageInstitutes}
                  className="bg-[#1b68b3] text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Manage Now
                </button>
              </div>
            </div>

            {/* View Requests Card */}
            <div style={{ backgroundColor: '#EFF6FF' }} className="rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-4">
                  <ClipboardList className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2" style={{ color: '#1b68b3' }}>View Requests</h4>
                <p className="text-gray-500 mb-4">Review and manage pending institute requests</p>
                <button
                  onClick={handleViewRequests}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  View Requests
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity Section */}
        <section>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#1b68b3' }}>Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-blue-50 rounded">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <p className="text-blue-600">New institute registration request from "ABC School"</p>
                <span className="ml-auto text-sm text-blue-500">2 mins ago</span>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <p className="text-blue-600">Institute details updated for "XYZ College"</p>
                <span className="ml-auto text-sm text-blue-500">1 hour ago</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;