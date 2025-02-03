import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ClipboardList } from 'lucide-react';
import axios from 'axios';
import logo from '../../assets/logo.png';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
import AdminNavbar from './AdminNavbar';

const socket = io('http://localhost:8080', { withCredentials: true });

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:8080/admin/dashboard', {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 200) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          console.warn('User is not authenticated. Redirecting to login...');
          navigate('/admin/login');
        } else {
          console.error('Authentication error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:8080/admin/notifications', {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 200) {
          setRecentActivity(response.data);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    socket.on('newInstituteRequest', (data) => {
      console.log('New Institute Request:', data);
      setRecentActivity((prev) => [
        { title: 'New Institute Request', message: `New institute request from "${data.instituteName}"`, type: 'request', createdAt: new Date() },
        ...prev
      ]);
    });

    return () => {
      socket.off('newInstituteRequest');
    };
  }, []);

  const handleLogout = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      borderRadius: '1rem',
      customClass: {
        title: 'text-xl font-bold text-gray-800',
        content: 'text-md text-gray-600',
        confirmButton: 'px-4 py-2 text-white rounded-lg text-sm font-medium',
        cancelButton: 'px-4 py-2 text-white rounded-lg text-sm font-medium'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post('http://localhost:8080/admin/logout', {}, { withCredentials: true });
          navigate('/admin/login');
        } catch (err) {
          console.error('Logout error:', err);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold " style={{ color: '#1b68b3' }}>Welcome to the Admin Dashboard</h2>
          <p className="mt-2 text-gray-600">Manage your educational system efficiently</p>
        </div>

        {/* Quick Actions Section */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-6 text-center" style={{ color: '#1b68b3' }}>Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard
              title="Manage Institutes" 
              
              description="Add, edit, or remove institute information"
              icon={<Building2 className="w-8 h-8 text-blue-600" />}
              onClick={() => navigate('/admin/manage-institutes')}
              buttonText="Manage Now"
              buttonColor="bg-blue-600 hover:bg-blue-700"
            />
            <ActionCard
              title="View Requests"
              description="Review and manage pending institute requests"
              icon={<ClipboardList className="w-8 h-8 text-green-600" />}
              onClick={() => navigate('/admin/manage-requests')}
              buttonText="View Requests"
              buttonColor="bg-green-600 hover:bg-green-700"
            />
          </div>
        </section>

        {/* Recent Activity Section */}
        <section>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <ActivityItem key={index} title={activity.title} message={activity.message} time={activity.createdAt} type={activity.type} />
                ))
              ) : (
                <p className="text-gray-500 text-center">No recent activity</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const ActionCard = ({ title, description, icon, onClick, buttonText, buttonColor }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <div className="p-6 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="text-lg font-semibold mb-2 text-blue-700">{title}</h4>
      <p className="text-gray-600 mb-4">{description}</p>
      <button
        onClick={onClick}
        className={`${buttonColor} text-white px-6 py-2 rounded-md transition-colors`}
      >
        {buttonText}
      </button>
    </div>
  </div>
);

const ActivityItem = ({ title, message, time, type }) => (
  <div className="flex items-center p-3 bg-gray-50 rounded shadow-sm">
    <div className={`w-2 h-2 bg-${type === 'request' ? 'blue' : type === 'alert' ? 'red' : 'green'}-500 rounded-full mr-3`}></div>
    <div>
      <p className="text-gray-700 font-semibold">{title}</p>
      <p className="text-gray-700">{message}</p>
    </div>
    <span className="ml-auto text-sm text-gray-500">{new Date(time).toLocaleString()}</span>
  </div>
);

export default AdminDashboard;
