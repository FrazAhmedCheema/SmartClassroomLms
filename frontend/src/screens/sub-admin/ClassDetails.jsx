import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Mail, 
  Star,
  UserCircle,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

const ClassDetails = () => {
  const { isAuthenticated } = useSelector(state => state.subAdminAuth);
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sub-admin/login');
      return;
    }

    const fetchClassDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/sub-admin/classes/${id}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch class details');
        }

        const data = await response.json();
        console.log('Fetched class details:', data);
        setClassData(data.class);
      } catch (error) {
        console.error('Error fetching class details:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load class details',
          icon: 'error',
          confirmButtonText: 'Go Back'
        }).then(() => {
          navigate('/sub-admin/classes');
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [id, navigate, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 border-4 border-t-4 border-t-indigo-600 border-indigo-100 rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-semibold text-lg">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4 bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-2">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-2">Class Not Found</p>
          <p className="text-gray-500 mb-6">The class you're looking for doesn't exist or you don't have permission to view it.</p>
          <button 
            onClick={() => navigate('/sub-admin/classes')}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 duration-300"
          >
            Back to Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/sub-admin/classes')}
            className="flex items-center gap-2 px-5 py-3 bg-white text-indigo-600 rounded-xl 
                     hover:bg-indigo-50 transition-all duration-300 shadow-md border border-indigo-100 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Classes</span>
          </button>

          <div className="flex items-center gap-3 px-5 py-2.5 bg-white rounded-xl shadow-md border border-amber-100">
            <Star 
              className="h-5 w-5 text-yellow-500" 
              fill="currentColor"  // Changed this line
            />
            <h2 className="text-gray-700 font-medium">Class ID: <span className="text-indigo-600">{classData?.classId}</span></h2>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Class Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Class Header Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="h-16 bg-gradient-to-r from-indigo-500 to-blue-600 relative">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm">
                  <div className="absolute top-1/2 transform -translate-y-1/2 left-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white/90 font-medium">Course Details</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-3">{classData?.className}</h1>
                <div className="flex flex-wrap items-center gap-6 text-gray-600">
                  <span className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                    <Users size={18} className="text-blue-600" />
                    <span className="font-medium">{classData?.students?.length || 0} Students</span>
                  </span>
                  <span className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                    <GraduationCap size={18} className="text-purple-600" />
                    <span className="font-medium">Section {classData?.section}</span>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Students List Card with Enhanced Styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="h-6 w-6 text-indigo-600" />
                  Enrolled Students
                </h2>
                <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium">
                  Total: {classData?.students?.length || 0}
                </span>
              </div>

              {classData?.students?.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No students enrolled in this class yet.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gradient-to-r from-indigo-50 to-blue-50">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Student Info
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classData?.students?.map((student, index) => (
                        <tr key={student._id} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                                {student.name[0]}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">Roll No: {student.rollNo}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-4 h-4 mr-2 text-indigo-500" />
                              {student.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Teacher & Stats */}
          <div className="space-y-8">
            {/* Teacher Card */}
            {classData?.teacher ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-indigo-500"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                  Teacher Information
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-center mb-6">
                    <div className="h-24 w-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                      <span className="text-2xl font-bold">
                        {classData.teacher.name[0]}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-xs text-gray-500 mb-1">Full Name</p>
                      <p className="font-medium text-gray-800">{classData.teacher.name}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-xs text-gray-500 mb-1">Email Address</p>
                      <div className="font-medium text-gray-800 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-indigo-500" />
                        {classData.teacher.email}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-amber-500"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  No Teacher Assigned
                </h2>
                <p className="text-gray-600">There is currently no teacher assigned to this class.</p>
              </motion.div>
            )}
            
            {/* Class Statistics Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Star 
                  className="h-5 w-5 text-yellow-500" 
                  fill="currentColor"  // Changed this line
                />
                Class Summary
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <p className="text-xs font-medium text-indigo-600 mb-1">Students</p>
                  <p className="text-2xl font-bold text-indigo-800">{classData?.students?.length || 0}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-xs font-medium text-blue-600 mb-1">Section</p>
                  <p className="text-2xl font-bold text-blue-800">{classData?.section || 'N/A'}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl col-span-2">
                  <p className="text-xs font-medium text-purple-600 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <p className="font-semibold text-gray-800">Active</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ClassDetails;