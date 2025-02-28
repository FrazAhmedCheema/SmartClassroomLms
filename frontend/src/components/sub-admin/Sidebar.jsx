import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaChalkboardTeacher, FaBook } from 'react-icons/fa';
import { HiMenuAlt3 } from 'react-icons/hi';
import useMediaQuery from '../../hooks/useMediaQuery';

const Sidebar = ({ isOpen, toggle, isMobile }) => {
  const location = useLocation();

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <div 
      className={`fixed left-0 h-screen transition-all duration-300 overflow-hidden z-40
        ${isOpen ? 'w-56' : isMobile ? 'w-0' : 'w-20'}`}  // Increased widths
      style={{ 
        background: 'linear-gradient(to bottom, #1b68b3, #154d85)',
        color: 'white',
        top: '4rem'
      }}
    >
      <div className="p-3"> {/* Increased padding */}
        <nav>
          <ul className="space-y-3"> {/* Increased spacing */}
            {[
              { path: '/sub-admin/dashboard', icon: <FaHome size={22} />, title: 'Dashboard' }, // Increased icon sizes
              { path: '/sub-admin/students', icon: <FaUsers size={22} />, title: 'Students' },
              { path: '/sub-admin/teachers', icon: <FaChalkboardTeacher size={22} />, title: 'Teachers' },
              { path: '/sub-admin/classes', icon: <FaBook size={22} />, title: 'Courses' },
            ].map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 
                    ${isActiveLink(item.path) 
                      ? 'bg-white shadow-lg' 
                      : 'hover:bg-opacity-20 hover:bg-white'}`} // Increased padding
                  style={{ 
                    color: isActiveLink(item.path) ? '#1b68b3' : 'white',
                    fontWeight: isActiveLink(item.path) ? '600' : '400'
                  }}
                >
                  <span className="min-w-[24px]">{item.icon}</span> {/* Increased min-width */}
                  <span className={`whitespace-nowrap text-base ${!isOpen && !isMobile ? 'hidden' : 'block'}`}> {/* Increased font size */}
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;



