import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, Bell, Settings } from 'lucide-react'; // Add these imports
import Swal from 'sweetalert2';
import logo from '../../assets/logo.png';
import profilePic from '../../assets/admin-profile-picture.jpg';
import { HiMenuAlt3 } from 'react-icons/hi'; // Add this import

const Navbar = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
  const navigate = useNavigate();

  const handleLogout = async() => {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
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
        // Send logout request
       const response = await fetch("http://localhost:8080/sub-admin/logout", {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
        
        .then(() => {
          localStorage.removeItem('subAdminUsername');
          navigate('/sub-admin/login');
          Swal.fire({
            title: 'Logged Out!',
            text: 'You have been successfully logged out.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        })
        .catch((error) => {
          navigate('/sub-admin/login');
          console.error("Logout failed:", error);
          alert("Logout failed. Please try again.");
        });
      }
    });
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50" style={{ height: '4rem' }}>
      <div className="h-full px-4">
        <div className="flex justify-between items-center h-full">
          {/* Logo and Brand Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-full transition-all duration-300 bg-[#1b68b3] hover:bg-white
                ${isMobile ? 'block' : 'hidden'}`}
              style={{ 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <HiMenuAlt3 
                size={24} 
                onMouseEnter={(e) => e.currentTarget.style.color = '#1b68b3'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                style={{ color: 'white' }}  // Changed this line
                className="transform transition-all duration-300 hover:text-[#1b68b3]"
              />
            </button>
            <img 
              src={logo} 
              alt="Logo" 
              className="h-10 hover:scale-105 transition-transform duration-300" 
            />
            <h1 className="text-xl font-bold text-[#1b68b3] hidden md:block">
              Smart Classroom LMS
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Profile Section */}
            <div className="flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex flex-col text-right">
                <span className="text-gray-600 text-sm">Welcome,</span>
                <span className="text-gray-800 font-bold">Sub Admin</span>
              </div>
              <div className="relative">
                <img 
                  src={profilePic} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-white hover:border-blue-300 transition-colors cursor-pointer"
                />
                <ChevronDown className="w-4 h-4 text-white absolute bottom-0 right-0 bg-[#1b68b3] rounded-full p-[2px]" />
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-[#1b68b3] hover:bg-[#154d85] text-white px-4 py-2 
                       rounded-lg transition-all duration-300 shadow-md hover:shadow-lg
                       transform hover:-translate-y-0.5"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;






