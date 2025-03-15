import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from 'react-redux';
import axios from "axios"
import { ChevronLeft } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'

const AdminNotifications = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector(state => state.adminAuth);
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await axios.get("http://localhost:8080/admin/notifications", {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        })
        console.log(response.data)
        if (response.status === 200) {
          setNotifications(response.data.notifications)
          setLoading(false)
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/admin/login")
        }
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [navigate, isAuthenticated])

  return (
    <div className="min-h-screen bg-gray-100" style={{ backgroundColor: "#f4f7fa" }}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-grey-50 hover:text-grey-80"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-4xl font-bold" style={{ color: "#1b68b3" }}>
            All Notifications
          </h1>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div>
                    <h3 className="font-bold text-gray-800">{notification.title}</h3>
                    <p className="text-sm text-gray-500">{notification.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminNotifications
