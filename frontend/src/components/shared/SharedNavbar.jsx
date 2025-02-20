import React, { useState } from 'react';
import { HiMenuAlt3 } from 'react-icons/hi';
import { Search, Bell, Plus, User, LogOut } from 'lucide-react';
import logo from '../../assets/logo.png';
import Swal from 'sweetalert2';

const SharedNavbar = ({ toggleSidebar, isSidebarOpen, isMobile, userRole, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout();
      }
    });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 h-16">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <HiMenuAlt3 size={24} className="text-[#1b68b3]" />
          </button>
          <img src={logo} alt="Logo" className="h-12" />
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl px-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg bg-gray-50 border border-gray-200 
                     focus:outline-none focus:border-[#1b68b3] focus:ring-1 focus:ring-[#1b68b3]
                     placeholder-gray-400 text-gray-600"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Plus size={24} className="text-[#1b68b3]" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg relative">
            <Bell size={24} className="text-[#1b68b3]" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <User size={24} className="text-[#1b68b3]" />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                <div className="px-4 py-2 text-sm text-gray-500">{userRole}</div>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SharedNavbar;
