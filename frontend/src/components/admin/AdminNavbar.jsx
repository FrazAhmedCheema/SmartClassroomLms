import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut, ChevronDown, Bell, Settings, User } from "lucide-react"
import Swal from "sweetalert2"
import logo from "../../assets/logo2.png"
import profilePic from "../../assets/admin-profile-picture.jpg"

const AdminNavbar = ({ title = "Admin Dashboard" }) => {
  const navigate = useNavigate()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const handleLogout = async () => {
    Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      background: "#fff",
      borderRadius: "1rem",
      customClass: {
        title: "text-2xl font-bold text-gray-800",
        content: "text-lg text-gray-600",
        confirmButton:
          "px-6 py-3 text-white rounded-lg text-sm font-medium transition-all duration-200 ease-in-out hover:bg-blue-700",
        cancelButton:
          "px-6 py-3 text-white rounded-lg text-sm font-medium transition-all duration-200 ease-in-out hover:bg-red-700",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch("http://localhost:8080/admin/logout", {
            method: "POST",
            credentials: "include",
          })
          if (response.ok) {
            navigate("/admin/login")
          }
        } catch (err) {
          console.error("Logout error:", err)
        }
      }
    })
  }

  return (
    <header className="shadow-sm" style={{ backgroundColor: "#1b68b3", height: "64px" }}>
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4" style={{ height: "64px" }}>
          <div className="flex items-center space-x-4">
            <img
              src={logo || "/placeholder.svg"}
              alt="Logo"
              className="h-14 hover:opacity-80 transition-opacity duration-300 ml-2"
              style={{ height: "60px", width: "auto" }} // Control the size of the logo image
            />
          </div>
          <h1 className="text-white font-bold text-xl -ml-12">{title}</h1> {/* Added -ml-12 for leftward shift */}
          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="relative">
              <button
                className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all duration-300"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="flex flex-col text-right">
                  <span className="text-white/80 font-medium text-sm">Welcome,</span>
                  <span className="text-white font-bold">Administrator</span>
                </div>
                <img
                  src={profilePic || "/placeholder.svg"}
                  alt="Admin"
                  className="w-10 h-10 rounded-full border-2 border-white/20 shadow-md hover:shadow-lg transition-all duration-300"
                />
                <ChevronDown className="w-4 h-4 text-white/80" />
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                  <a
                    href="#"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-[#1b68b3] transition-colors duration-200"
                  >
                    <User className="w-4 h-4 mr-3" />
                    <span className="font-medium">Profile Settings</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-[#1b68b3] transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    <span className="font-medium">System Settings</span>
                  </a>
                  <hr className="my-2 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminNavbar