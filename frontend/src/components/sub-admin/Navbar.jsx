import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, Bell, Settings } from 'lucide-react'; // Add these imports
import Swal from 'sweetalert2';
import logo from '../../assets/logo.png';
import profilePic from '../../assets/admin-profile-picture.jpg';

const Navbar = () => {
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
    <nav className="bg-white shadow-md px-6 py-3 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo and Brand Section */}
          <div className="flex items-center space-x-4">
            <img 
              src={logo} 
              alt="Logo" 
              className="h-12 hover:scale-105 transition-transform duration-300" 
            />
            <h1 className="text-2xl font-bold text-blue-800 hidden md:block">
              Smart Classroom LMS
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
          

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
                <ChevronDown className="w-4 h-4 text-white absolute bottom-0 right-0 bg-blue-600 rounded-full p-[2px]" />
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 
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
