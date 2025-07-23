import React, { useState, useEffect, useRef } from 'react';
import { HiMenuAlt3 } from 'react-icons/hi';
import { Search, Plus, User, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import CreateClassModal from '../teacher/CreateClassModal';
import NotificationDropdown from './NotificationDropdown';
import TeacherNotificationDropdown from '../teacher/TeacherNotificationDropdown';
import SearchDropdown from './SearchDropdown';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import logo from '../../assets/logo.png';
import Swal from 'sweetalert2';
import { logout } from '../../redux/slices/teacherSlice';

const SharedNavbar = ({ toggleSidebar, isSidebarOpen, isMobile, userRole, userName, onLogout, onCreateClass, onSearch }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const searchRef = useRef(null);
  
  // Use global search hook
  const {
    searchTerm,
    searchResults,
    isSearchOpen,
    handleSearch,
    clearSearch,
    setIsSearchOpen
  } = useGlobalSearch(userRole);

  // Handle clicking outside search to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsSearchOpen]);

  // Legacy support for onSearch prop (for dashboard filtering)
  useEffect(() => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  }, [searchTerm, onSearch]);

  const handleCreateClass = (classData) => {
    // Pass the data to parent component
    if (onCreateClass) {
      onCreateClass(classData);
    }
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await onLogout();
          Swal.fire({
            title: 'Logged out!',
            text: 'You have been logged out successfully.',
            icon: 'success',
            confirmButtonColor: '#1b68b3',
          });
        } catch (error) {
          console.error('Error logging out:', error);
          Swal.fire({
            title: 'Error!',
            text: error.message || 'Failed to logout',
            icon: 'error',
            confirmButtonColor: '#1b68b3',
          });
        }
      }
    });
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 h-16">
        {/* Left section with logo */}
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
          <div className="flex-1 max-w-2xl px-4" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchTerm.trim() && setIsSearchOpen(true)}
                className="w-full px-4 py-2 pl-10 pr-10 rounded-lg bg-gray-50 border border-gray-200 
                     focus:outline-none focus:border-[#1b68b3] focus:ring-1 focus:ring-[#1b68b3]
                     placeholder-gray-400 text-gray-600"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
{searchTerm && (
  <button
    onClick={clearSearch}
    className="absolute right-3 inset-y-0 my-auto text-gray-400 hover:text-gray-600 
               p-0 bg-transparent border-none outline-none focus:outline-none"
    style={{
      backgroundColor: 'transparent',
      boxShadow: 'none',
      WebkitTapHighlightColor: 'transparent', // Mobile fix
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <X size={16} />
  </button>
)}


              
              {/* Search Dropdown */}
              <SearchDropdown
                searchResults={searchResults}
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                searchTerm={searchTerm}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {userRole === 'Teacher' && (
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={24} className="text-[#1b68b3]" />
              </button>
            )}
            
            {/* Notification Dropdown - Show for both students and teachers */}
            {userRole === 'Student' && <NotificationDropdown />}
            {userRole === 'Teacher' && <TeacherNotificationDropdown />}
            
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <User size={24} className="text-[#1b68b3]" />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                  <div className="px-4 py-2 text-sm text-gray-500">
                    {userName ? `${userName} (${userRole})` : userRole}
                  </div>
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

      {/* Modal */}
      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateClass}
      />
    </>
  );
};

export default SharedNavbar;
