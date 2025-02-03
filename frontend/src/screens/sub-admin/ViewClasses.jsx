import React, { useState } from 'react';
import { Search, Users, ChevronDown, ChevronUp, UserCircle, Calendar, Clock, Filter } from 'lucide-react';
import Navbar from '../../components/sub-admin/Navbar';
import Sidebar from '../../components/sub-admin/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useClasses } from '../../context/ClassesContext';

const ViewClasses = () => {
  const navigate = useNavigate();
  const [expandedClass, setExpandedClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { classesData } = useClasses();

  const handleBack = () => {
    navigate('/sub-admin/dashboard');
  };

  const filteredClasses = classesData.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (classId) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  const handleClassClick = (classId) => {
    navigate(`/sub-admin/classes/${classId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <Sidebar />
      
      <div className="ml-64 pt-16 px-8 py-6">
        {/* Header Section with darker blue */}
        <div className="mb-8 bg-white rounded-xl p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-blue-800 mb-6">Class Management</h1>
          
          {/* Search Bar with darker blue accents */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="Search classes or teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 rounded-lg border-2 border-blue-200 
                         focus:border-blue-700 focus:outline-none focus:ring-2 
                         focus:ring-blue-300 transition-all duration-200
                         pl-12 text-gray-600 text-lg bg-blue-50"
              />
              <Search className="absolute left-4 top-3.5 text-blue-700" size={22} />
            </div>
            <button className="px-4 py-3 bg-blue-100 text-blue-800 rounded-lg 
                           hover:bg-blue-200 transition-colors duration-200
                           flex items-center space-x-2">
              <Filter size={20} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Classes Grid with darker blue accents */}
        <div className="grid gap-6">
          {filteredClasses.map((cls) => (
            <div key={cls.id} 
                 className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                 onClick={() => handleClassClick(cls.id)}>
              <div className="p-6 cursor-pointer hover:bg-blue-50 transition-colors duration-200" onClick={() => toggleExpand(cls.id)}>
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-blue-800 hover:text-blue-900 transition-colors">
                      {cls.name}
                    </h2>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center">
                        <UserCircle className="w-5 h-5 mr-2 text-blue-700" />
                        <span className="font-medium">{cls.teacher.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-700" />
                        <span>{cls.schedule.split(' ')[0]}, {cls.schedule.split(' ')[1]}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-blue-700" />
                        <span>{cls.schedule.split(' ').slice(2).join(' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="bg-blue-100 px-4 py-2 rounded-lg">
                      <div className="flex items-center text-blue-800">
                        <Users size={20} className="mr-2" />
                        <span className="font-semibold">{cls.totalStudents} Students</span>
                      </div>
                    </div>
                    {expandedClass === cls.id ? (
                      <ChevronUp className="text-blue-700 hover:text-blue-800 transition-colors" size={28} />
                    ) : (
                      <ChevronDown className="text-blue-700 hover:text-blue-800 transition-colors" size={28} />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded section with darker blue */}
              {expandedClass === cls.id && (
                <div className="border-t border-gray-100 p-6 animate-fadeIn">
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">Teacher Information</h3>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Name</p>
                          <p className="text-gray-800 font-semibold">{cls.teacher.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Email</p>
                          <p className="text-gray-800 font-semibold">{cls.teacher.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Expertise</p>
                          <p className="text-gray-800 font-semibold">{cls.teacher.expertise}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-blue-800 mb-4">Enrolled Students</h3>
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll No</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {cls.students.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.rollNo}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                                  ${student.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'}`}>
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
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Add this to your global CSS or tailwind.config.js
const styles = {
  '.animate-fadeIn': {
    animation: 'fadeIn 0.3s ease-in-out',
  },
  '@keyframes fadeIn': {
    '0%': {
      opacity: '0',
      transform: 'translateY(-10px)'
    },
    '100%': {
      opacity: '1',
      transform: 'translateY(0)'
    }
  }
};

export default ViewClasses;
