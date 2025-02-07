import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, Mail, Calendar, Clock, Users, BookOpen } from 'lucide-react';
import Swal from 'sweetalert2';
import Navbar from '../../components/sub-admin/Navbar';
import Sidebar from '../../components/sub-admin/Sidebar';

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <Navbar />
      <Sidebar />
      
      <div className="ml-64 pt-20 px-8 py-6">
        {/* Updated Back Button with blue default color */}
        <div className="mb-10 mt-4">
          <button
            onClick={() => navigate('/sub-admin/classes')}
            className="group flex items-center space-x-2 bg-blue-600 px-6 py-3 rounded-xl
                      transition-all duration-300 shadow-sm text-white
                      hover:shadow-lg hover:shadow-blue-100
                      hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-800
                      border-2 border-blue-500
                      transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5 text-white transition-colors mr-2" />
            <span className="font-medium">Back to Classes</span>
          </button>
        </div>

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

        {/* Teacher Information Cards with smaller sizing */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-blue-100">
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
        </div>

        {/* Enhanced Students List */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-blue-100">
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
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;
