import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, Calendar, Clock, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import useMediaQuery from '../../hooks/useMediaQuery';
import Swal from 'sweetalert2';
import Navbar from '../../components/sub-admin/Navbar';
import Sidebar from '../../components/sub-admin/Sidebar';

const ClassDetails = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  // Define dummy data directly in component for testing
  const classData = {
    id: parseInt(id),
    name: 'Math 101',
    description: 'Introduction to Mathematics',
    startDate: '2024-01-15',
    room: 'Room 101',
    teacher: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      expertise: 'Mathematics',
      qualification: 'PhD in Mathematics',
      experience: '10 years'
    },
    schedule: 'Monday 10:00 AM - 12:00 PM',
    totalStudents: 30,
    students: [
      { id: 1, rollNo: '001', name: 'Alice Smith', email: 'alice@example.com', status: 'active' },
      { id: 2, rollNo: '002', name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive' }
    ]
  };

  useEffect(() => {
    if (!classData) {
      Swal.fire({
        title: 'Error!',
        text: 'Class not found',
        icon: 'error',
        confirmButtonText: 'Go Back'
      }).then(() => {
        navigate('/sub-admin/classes');
      });
    }
  }, [classData, navigate]);

  if (!classData) return null;

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
            className="space-y-6"
          >
            {/* Back Button */}
            <button
              onClick={() => navigate('/sub-admin/classes')}
              className="flex items-center gap-2 px-4 py-2 bg-[#1b68b3] text-white rounded-lg 
                       hover:bg-[#154d85] transition-all duration-300"
            >
              <ArrowLeft size={20} />
              <span>Back to Classes</span>
            </button>

            {/* Class Details Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#1b68b3' }}>
                {classData.name}
              </h1>
              
              {/* Enhanced Class Header */}
              <div className="bg-white rounded-xl shadow-md p-8 mb-8 border border-blue-100
                              transform hover:scale-[1.01] transition-transform duration-300">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 
                              bg-clip-text text-transparent mb-3">{classData.name}</h1>
                <p className="text-gray-600 mb-6 text-lg">{classData.description}</p>
                <div className="grid grid-cols-4 gap-6">
                  {/* Class Info Cards */}
                  <div className="bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-colors">
                    <div className="flex items-center text-blue-800">
                      <Calendar className="w-5 h-5 mr-3" />
                      <span className="font-medium">Start Date</span>
                    </div>
                    <p className="mt-2 text-gray-700">{classData.startDate}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-colors">
                    <div className="flex items-center text-blue-800">
                      <Clock className="w-5 h-5 mr-3" />
                      <span className="font-medium">Schedule</span>
                    </div>
                    <p className="mt-2 text-gray-700">{classData.schedule}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-colors">
                    <div className="flex items-center text-blue-800">
                      <Users className="w-5 h-5 mr-3" />
                      <span className="font-medium">Total Students</span>
                    </div>
                    <p className="mt-2 text-gray-700">{classData.totalStudents} Students</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-colors">
                    <div className="flex items-center text-blue-800">
                      <BookOpen className="w-5 h-5 mr-3" />
                      <span className="font-medium">Room</span>
                    </div>
                    <p className="mt-2 text-gray-700">{classData.room}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Information Card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 
                            bg-clip-text text-transparent mb-4">Teacher Information</h2>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    {/* Teacher Info Items */}
                    <div className="transform hover:scale-102 transition-transform">
                      <p className="text-xs font-semibold text-blue-900 mb-1 uppercase tracking-wider">Name</p>
                      <p className="text-sm font-medium text-gray-800 bg-white/50 p-2 rounded-md shadow-sm">
                        {classData.teacher.name}
                      </p>
                    </div>
                    <div className="transform hover:scale-102 transition-transform">
                      <p className="text-xs font-semibold text-blue-900 mb-1 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-gray-800 bg-white/50 p-2 rounded-md shadow-sm">
                        {classData.teacher.email}
                      </p>
                    </div>
                    <div className="transform hover:scale-102 transition-transform">
                      <p className="text-xs font-semibold text-blue-900 mb-1 uppercase tracking-wider">Expertise</p>
                      <p className="text-sm font-medium text-gray-800 bg-white/50 p-2 rounded-md shadow-sm">
                        {classData.teacher.expertise}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="transform hover:scale-102 transition-transform">
                      <p className="text-xs font-semibold text-blue-900 mb-1 uppercase tracking-wider">Qualification</p>
                      <p className="text-sm font-medium text-gray-800 bg-white/50 p-2 rounded-md shadow-sm">
                        {classData.teacher.qualification}
                      </p>
                    </div>
                    <div className="transform hover:scale-102 transition-transform">
                      <p className="text-xs font-semibold text-blue-900 mb-1 uppercase tracking-wider">Experience</p>
                      <p className="text-sm font-medium text-gray-800 bg-white/50 p-2 rounded-md shadow-sm">
                        {classData.teacher.experience}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Students List Card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 
                            bg-clip-text text-transparent mb-6">Enrolled Students</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                        Roll No
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classData.students.map((student) => (
                      <tr key={student.id} 
                          className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.rollNo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            student.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;
