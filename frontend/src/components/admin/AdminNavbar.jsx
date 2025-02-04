


// import { useState } from "react"
// import { useNavigate } from "react-router-dom"
// import { LogOut, ChevronDown, Bell, Settings, User } from "lucide-react"
// import Swal from "sweetalert2"
// import logo from "../../assets/logo.png"
// import profilePic from "../../assets/admin-profile-picture.jpg"

// const AdminNavbar = ({ title = "Admin Dashboard" }) => {
//   const navigate = useNavigate()
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

//   const handleLogout = async () => {
//     Swal.fire({
//       title: "Confirm Logout",
//       text: "Are you sure you want to log out?",
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, log out",
//       cancelButtonText: "Cancel",
//       background: "#fff",
//       borderRadius: "1rem",
//       customClass: {
//         title: "text-2xl font-bold text-gray-800",
//         content: "text-lg text-gray-600",
//         confirmButton:
//           "px-6 py-3 text-white rounded-lg text-sm font-medium transition-all duration-200 ease-in-out hover:bg-blue-700",
//         cancelButton:
//           "px-6 py-3 text-white rounded-lg text-sm font-medium transition-all duration-200 ease-in-out hover:bg-red-700",
//       },
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           const response = await fetch("http://localhost:8080/admin/logout", {
//             method: "POST",
//             credentials: "include",
//           })
//           if (response.ok) {
//             navigate("/admin/login")
//           }
//         } catch (err) {
//           console.error("Logout error:", err)
//         }
//       }
//     })
//   }

//   return (
//     <header className="bg-white border-b border-gray-100 shadow-sm">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center py-4">
//           <div className="flex items-center space-x-8">
//             <img
//               src={logo || "/placeholder.svg"}
//               alt="Logo"
//               className="h-12 hover:opacity-80 transition-opacity duration-300"
//             />
//             <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text hidden md:block">
//               {title}
//             </h1>
//           </div>
//           <div className="flex items-center space-x-6">
//             <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300">
//               <Bell className="w-6 h-6" />
//               <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
//             </button>
//             <div className="relative">
//               <button
//                 className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition-all duration-300"
//                 onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
//               >
//                 <div className="flex flex-col text-right">
//                   <span className="text-gray-600 font-medium text-sm">Welcome,</span>
//                   <span className="text-gray-900 font-bold">Administrator</span>
//                 </div>
//                 <img
//                   src={profilePic || "/placeholder.svg"}
//                   alt="Admin"
//                   className="w-10 h-10 rounded-full border-2 border-white shadow-md hover:shadow-lg transition-all duration-300"
//                 />
//                 <ChevronDown className="w-4 h-4 text-gray-600" />
//               </button>
//               {isProfileMenuOpen && (
//                 <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
//                   <a
//                     href="#"
//                     className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
//                   >
//                     <User className="w-4 h-4 mr-3" />
//                     <span className="font-medium">Profile Settings</span>
//                   </a>
//                   <a
//                     href="#"
//                     className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
//                   >
//                     <Settings className="w-4 h-4 mr-3" />
//                     <span className="font-medium">System Settings</span>
//                   </a>
//                   <hr className="my-2 border-gray-100" />
//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
//                   >
//                     <LogOut className="w-4 h-4 mr-3" />
//                     <span className="font-medium">Sign Out</span>
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   )
// }

// export default AdminNavbar








import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut, ChevronDown, Bell, Settings, User } from "lucide-react"
import Swal from "sweetalert2"
import logo from "../../assets/logo.png"
import profilePic from "../../assets/admin-profile-picture.jpg"

const AdminNavbar = ({ title = "Admin Dashboard" }) => {
  const navigate = useNavigate()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3) // Example count

  const handleLogout = async () => {
    Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1b68b3",
      cancelButtonColor: "#e53e3e",
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      background: "#fff",
      customClass: {
        title: "text-2xl font-bold text-gray-800",
        content: "text-lg text-gray-600",
        confirmButton: "px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700",
        cancelButton: "px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
      }
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
    <header className="bg-white border-b border-gray-100 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <img
              src={logo}
              alt="Logo"
              className="h-12 hover:opacity-75 transition-opacity duration-300 cursor-pointer"
              onClick={() => navigate('/admin/dashboard')}
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text hidden md:block">
              {title}
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              className="relative p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300"
              onClick={() => navigate('/admin/notifications')}
            >
              <Bell className="w-6 h-6" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button
                className="flex items-center space-x-3 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all duration-300"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="flex flex-col text-right">
                  <span className="text-gray-600 font-medium text-sm">Welcome,</span>
                  <span className="text-blue-800 font-bold">Administrator</span>
                </div>
                <img
                  src={profilePic}
                  alt="Admin"
                  className="w-10 h-10 rounded-full border-2 border-blue-300 shadow-md hover:shadow-lg transition-all duration-300"
                />
                <ChevronDown className="w-4 h-4 text-blue-600" />
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center">
                    <img
                      src={profilePic}
                      alt="Admin"
                      className="w-12 h-12 rounded-full mr-4 border-2 border-blue-300"
                    />
                    <div>
                      <p className="text-blue-800 font-bold">Administrator</p>
                      <p className="text-gray-500 text-sm">admin@system.com</p>
                    </div>
                  </div>
                  <a
                    href="#"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <User className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-medium">Profile Settings</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <Settings className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-medium">System Settings</span>
                  </a>
                  <hr className="my-2 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
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