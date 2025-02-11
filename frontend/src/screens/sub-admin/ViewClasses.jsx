import React, { useState, useEffect } from 'react';
import { Search, Users, UserCircle, Calendar, Clock, Filter } from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery';
import { motion } from 'framer-motion';
import Navbar from '../../components/sub-admin/Navbar';
import Sidebar from '../../components/sub-admin/Sidebar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ViewClasses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  // Dummy classesData for display
  const classesData = [
    {
      id: 1,
      name: 'Math 101',
      teacher: { name: 'John Doe', email: 'john.doe@example.com', expertise: 'Mathematics' },
      schedule: 'Monday 10:00 AM - 12:00 PM',
      totalStudents: 30,
      students: [
        { id: 1, rollNo: '001', name: 'Alice', status: 'active' },
        { id: 2, rollNo: '002', name: 'Bob', status: 'inactive' },
        // ...more students
      ],
    },
    {
      id: 2,
      name: 'Physics 101',
      teacher: { name: 'Jane Smith', email: 'jane.smith@example.com', expertise: 'Physics' },
      schedule: 'Wednesday 2:00 PM - 4:00 PM',
      totalStudents: 25,
      students: [
        { id: 3, rollNo: '003', name: 'Charlie', status: 'active' },
        { id: 4, rollNo: '004', name: 'David', status: 'inactive' },
        // ...more students
      ],
    },
    // ...more classes
  ];

  const handleBack = () => {
    navigate('/sub-admin/dashboard');
  };

  const filteredClasses = classesData.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClassClick = (classId) => {
    navigate(`/sub-admin/classes/${classId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
      />
      
      <div className={`transition-all duration-300 pt-16 
        ${isSidebarOpen ? 'ml-64' : isMobile ? 'ml-0' : 'ml-20'}`}>
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Header Section */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#1b68b3' }}>
                Class Management
              </h1>
              
              {/* Search and Filter Section */}
              <div className="mt-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search classes or teachers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 rounded-lg border-2 border-[#1b68b3] 
                             focus:border-[#154d85] focus:outline-none transition-all
                             bg-white text-gray-600 placeholder-gray-400"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>
                <button 
                  className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#154d85] 
                           transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Filter size={20} />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Classes List */}
            <div className="grid gap-6">
              {filteredClasses.map((cls) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => handleClassClick(cls.id)} // Only handle click for navigation
                >
                  <div className="p-6 hover:bg-blue-50 transition-colors duration-200">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2 text-gray-600"  >
                        <h2 className="text-2xl font-bold text-[#1b68b3]">
                          {cls.name}
                        </h2>
                        <div className="flex items-center space-x-4 text-gray-600">
                          <div className="flex items-center">
                            <UserCircle className="w-5 h-5 mr-2 text-[#1b68b3]" />
                            <span className="font-medium">{cls.teacher.name}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-[#1b68b3]" />
                            <span>{cls.schedule.split(' ')[0]}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-[#1b68b3]" />
                            <span>{cls.schedule.split(' ').slice(1).join(' ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#1b68b3] bg-opacity-10 px-4 py-2 rounded-lg">
                        <div className="flex items-center text-[#1b68b3]">
                          <Users size={20} className="mr-2" />
                          <span className="font-semibold">{cls.totalStudents} Students</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ViewClasses;
