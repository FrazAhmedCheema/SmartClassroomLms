import React from 'react'
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { io } from "socket.io-client"
import AdminNavbar from './AdminNavbar'
import { formatDistanceToNow } from 'date-fns'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

import {
  Building2,
  ClipboardList,
  Activity,
  TrendingUp,
  Users,
  Bell,
  ChevronRight,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react"
import axios from "axios"
import profilePic from "../../assets/admin-profile-picture.jpg"
import LineChartComponent from '../charts/LineChartComponent';
import PieChartComponent from '../charts/PieChartComponent';
import { motion, useAnimation } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logout, loginFail, setLoading } from '../../redux/slices/adminAuthSlice';

const socket = io("http://localhost:8080", { withCredentials: true })

const DashboardCard = ({ icon, title, value, change, color }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:-translate-y-2">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>{icon}</div>
      <span className={`text-sm font-medium ${change > 0 ? "text-green-600" : "text-red-600"}`}>
        {change > 0 ? "+" : ""}
        {change.toFixed(1)}%
      </span>
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-3xl font-extrabold" style={{ color: "#1b68b3" }}>
      {value}
    </p>
  </div>
)

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, admin, loading } = useSelector(state => state.adminAuth);
  const [dashboardData, setDashboardData] = useState({
    institutes: { count: 0, change: 0 },
    requests: { count: 0, change: 0 },
    users: { count: 0, change: 0 },
    activities: { count: 0, change: 0 },
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeDashboard = async () => {
      try {
        dispatch(setLoading(true));  // Use Redux loading state
        // First check auth status
        const authResponse = await axios.get("http://localhost:8080/admin/check-auth", {
          withCredentials: true
        });

        if (!authResponse.data.authenticated) {
          dispatch(loginFail('Not authenticated'));
          navigate("/admin/login");
          return;
        }

        if (!mounted) return;

        try {
          const [dashboardResponse, notificationsResponse] = await Promise.all([
            axios.get("http://localhost:8080/admin/dashboard", {
              withCredentials: true
            }),
            axios.get("http://localhost:8080/admin/notifications?limit=3", {
              withCredentials: true
            })
          ]);

          if (mounted) {
            setDashboardData(dashboardResponse.data);
            setRecentActivity(notificationsResponse.data.notifications);
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          if (error.response?.status === 401) {
            dispatch(loginFail('Session expired'));
            navigate("/admin/login");
          }
        } finally {
          if (mounted) {
            dispatch(setLoading(false));  // Use Redux loading state
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (error.response?.status === 401) {
          dispatch(loginFail('Not authenticated'));
          navigate("/admin/login");
        }
      }
    };

    if (isAuthenticated) {
      initializeDashboard();
    } else {
      navigate("/admin/login");
    }

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, navigate, dispatch]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      
      if (response.ok) {
        dispatch(logout());
        navigate("/admin/login");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleViewAll = () => {
    navigate("/admin/notifications")
  }

  const menuItems = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Manage Institutes",
      description: "Add, edit, remove institute details",
      color: "text-blue-600",
      onClick: () => navigate("/admin/manage-institutes"),
    },
    {
      icon: <ClipboardList className="w-6 h-6" />,
      title: "View Requests",
      description: "Pending institute applications",
      color: "text-green-600",
      onClick: () => navigate("/admin/manage-requests"),
    },
  ]

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: "#e6f0ff" }}>
        <AdminNavbar title="Admin Dashboard" />
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards Grid */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <DashboardCard
                  icon={<Building2 className="w-6 h-6 text-blue-600" />}
                  title="Institutes"
                  value={dashboardData.institutes.count}
                  change={dashboardData.institutes.change}
                  color="bg-blue-600"
                />
                <DashboardCard
                  icon={<ClipboardList className="w-6 h-6 text-green-600" />}
                  title="Requests"
                  value={dashboardData.requests.count}
                  change={dashboardData.requests.change}
                  color="bg-green-600"
                />
                <DashboardCard
                  icon={<Users className="w-6 h-6 text-purple-600" />}
                  title="Users"
                  value={dashboardData.users.count}
                  change={dashboardData.users.change}
                  color="bg-purple-600"
                />
                <DashboardCard
                  icon={<Activity className="w-6 h-6 text-indigo-600" />}
                  title="Activities"
                  value={dashboardData.activities.count}
                  change={dashboardData.activities.change}
                  color="bg-indigo-600"
                />
              </div>

              {/* First Row: Quick Actions + Chart */}
              <div className="grid grid-cols-3 gap-8 mb-8">
                {/* Quick Actions - Now on the left */}
                <div className="col-span-1 bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: "#1b68b3" }}>
                      Quick Actions
                    </h2>
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={item.onClick}
                        className="w-full flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gray-50 transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${item.color} bg-opacity-10`}>
                            {item.icon}
                          </div>
                          <div className="text-left">
                            <h3 className="font-bold text-gray-800">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Line Chart - Now on the right */}
                <motion.div 
                  className="col-span-2 bg-white rounded-2xl shadow-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl font-bold mb-6" style={{ color: '#1b68b3' }}>
                    Activity Trends
                  </h2>
                  <LineChartComponent 
                    key={Math.random()}
                    institutes={dashboardData.institutes.count}
                    requests={dashboardData.requests.count}
                    users={dashboardData.users.count}
                  />
                </motion.div>
              </div>

              {/* Second Row: Chart + Recent Activity */}
              <div className="grid grid-cols-3 gap-8">
                <motion.div 
                  className="col-span-1 bg-white rounded-2xl shadow-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl font-bold mb-6" style={{ color: '#1b68b3' }}>
                    Distribution Overview
                  </h2>
                  <PieChartComponent 
                    key={Math.random()}
                    institutes={dashboardData.institutes.count}
                    requests={dashboardData.requests.count}
                    users={dashboardData.users.count}
                  />
                </motion.div>

                {/* Recent Activity */}
                <div className="col-span-2 bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: "#1b68b3" }}>
                      Recent Activity
                    </h2>
                    <button 
                      onClick={handleViewAll} 
                      className="text-sm text-white px-4 py-2 rounded-lg transition-all duration-300"
                      style={{ backgroundColor: '#1b68b3' }}
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentActivity.slice(0, 3).map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                      >
                        <div>
                          <h3 className="font-bold text-gray-800">{activity.title}</h3>
                          <p className="text-sm text-gray-500">{activity.message}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}

                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  )
}

export default AdminDashboard

