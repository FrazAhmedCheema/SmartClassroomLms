import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaUsers, FaChalkboardTeacher, FaBook } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="bg-blue-800 text-white h-screen w-64 fixed left-0 top-0 pt-20">
      <div className="p-4">
        <nav>
          <ul className="space-y-2">
            <li>
              <Link to="/sub-admin/dashboard" className="flex items-center gap-3 py-2 px-4 hover:bg-white hover:text-blue-800 rounded transition-all duration-200">
                <FaHome /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/sub-admin/students" className="flex items-center gap-3 py-2 px-4 hover:bg-white hover:text-blue-800 rounded transition-all duration-200">
                <FaUsers /> Manage Students
              </Link>
            </li>
            <li>
              <Link to="/sub-admin/teachers" className="flex items-center gap-3 py-2 px-4 hover:bg-white hover:text-blue-800 rounded transition-all duration-200">
                <FaChalkboardTeacher /> Manage Teachers
              </Link>
            </li>
            <li>
              <Link to="/sub-admin/classes" className="flex items-center gap-3 py-2 px-4 hover:bg-white hover:text-blue-800 rounded transition-all duration-200">
                <FaBook /> Manage Courses
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
