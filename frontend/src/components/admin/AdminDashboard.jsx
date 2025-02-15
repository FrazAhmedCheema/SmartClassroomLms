import React from 'react'
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { io } from "socket.io-client"
import AdminNavbar from './AdminNavbar'
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
import { formatDistanceToNow } from 'date-fns'

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
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    institutes: { count: 0, change: 0 },
    requests: { count: 0, change: 0 },
    users: { count: 0, change: 0 },
    activities: { count: 0, change: 0 },
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("http://localhost:8080/admin/notifications?limit=3", {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        if (response.status === 403) {
          navigate("/admin/login");
          
        }
  
        if (response.status === 200) {
          setDashboardData(response.data.dashboardData);
          setRecentActivity(response.data.notifications); // Ensure only notifications are set here
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchNotifications();
  
    socket.on("newInstituteRequest", (data) => {
      console.log("New Institute Request:", data);
  
      setRecentActivity((prev) => [
        {
          title: "New Institute Request",
          message: `New institute request from "${data.instituteName}"`,
          createdAt: new Date().toISOString(), // Keeping consistency with DB format
        },
        ...prev.slice(0, 2),
      ]);
    });
  
    return () => {
      socket.off("newInstituteRequest");
    };
  }, [navigate]);
  

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8080/admin/logout", {}, { withCredentials: true })
      navigate("/admin/login")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

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
    <div className="min-h-screen" style={{ backgroundColor: "#e6f0ff" }}>
      <AdminNavbar title="Admin Dashboard" />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-6 mb-8">
          <DashboardCard
            icon={<Building2 className="w-6 h-6 text-blue-600" />}
            title="Institutes"
            value={50}
            change={60}
            color="bg-blue-600"
          />
          <DashboardCard
            icon={<ClipboardList className="w-6 h-6 text-green-600" />}
            title="Requests"
            value={23}
            change={50}
            color="bg-green-600"
          />
          <DashboardCard
            icon={<Users className="w-6 h-6 text-purple-600" />}
            title="Users"
            value={23}
            change={72}
            color="bg-purple-600"
          />
          <DashboardCard
            icon={<Activity className="w-6 h-6 text-indigo-600" />}
            title="Activities"
            value={78}
            change={82}
            color="bg-indigo-600"
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-3 gap-8">
          {/* Quick Actions */}
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

          {/* Recent Activity */}
          <div className="col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: "#1b68b3" }}>
                Recent Activity
              </h2>
              <button onClick={handleViewAll} className="text-sm text-gray-50 hover:text-grey-800">
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
      </div>
    </div>
  )
}

export default AdminDashboard

