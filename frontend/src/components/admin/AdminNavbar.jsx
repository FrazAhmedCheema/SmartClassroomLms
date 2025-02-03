import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';
import logo from '../../assets/logo.png';
import profilePic from '../../assets/admin-profile-picture.jpg';

const AdminNavbar = ({ title = "Admin Dashboard" }) => {
  const navigate = useNavigate();

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
          const response = await fetch('http://localhost:8080/admin/logout', {
            method: 'POST',
            credentials: 'include'
          });
          if (response.ok) {
            navigate('/admin/login');
          }
        } catch (err) {
          console.error('Logout error:', err);
        }
      }
    });
  };

  return (
    <header className="shadow-lg" style={{ backgroundColor: '#1b68b3' }}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <img 
              src={logo} 
              alt="Logo" 
              className="h-14 filter invert brightness-0 hover:scale-105 transition-transform" 
            />
            <h1 className="text-2xl font-bold text-white hidden md:block">
              {title}
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 bg-blue-700/50 px-4 py-2 rounded-lg">
              <div className="flex flex-col text-right">
                <span className="text-white font-medium text-sm">Welcome Back,</span>
                <span className="text-white font-bold">Administrator</span>
              </div>
              <div className="relative group">
                <img 
                  src={profilePic} 
                  alt="Admin" 
                  className="w-10 h-10 rounded-full border-2 border-white hover:border-blue-300 transition-colors cursor-pointer"
                />
                <ChevronDown className="w-4 h-4 text-white absolute bottom-0 right-0 bg-blue-600 rounded-full p-[2px]" />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
