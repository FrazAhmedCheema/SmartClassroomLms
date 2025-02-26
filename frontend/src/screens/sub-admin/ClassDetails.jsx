import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="text-[#1b68b3] text-xl">Loading class details...</div>
      </div>
    );
  }

  if (!classData) return null;

  return (
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
            Class Information
          </h1>
          
          {/* Enhanced Class Header */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8 border border-blue-100
                          transform hover:scale-[1.01] transition-transform duration-300">
            <h1 className="text-4xl font-bold bg-gradient-to-r 
                          bg-clip-text text-transparent mb-3" style={{ color: '#1b68b3' }}>{classData.className}</h1>
            <div className="grid grid-cols-3 gap-6">
              {/* Class Info Cards */}
              <div className="bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-colors">
                <div className="flex items-center text-blue-800">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span className="font-medium" >Section</span>
                </div>
                <p className="mt-2 text-gray-700">{classData.section}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-colors">
                <div className="flex items-center text-blue-800">
                  <Clock className="w-5 h-5 mr-3" />
                  <span className="font-medium">Class Code</span>
                </div>
                <p className="mt-2 text-gray-700">{classData.classCode}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-colors">
                <div className="flex items-center text-blue-800">
                  <Users className="w-5 h-5 mr-3" />
                  <span className="font-medium">Total Students</span>
                </div>
                <p className="mt-2 text-gray-700">{classData.students?.length || 0} Students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Information Card */}
        {classData.teacher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r
                          bg-clip-text text-transparent mb-4" style={{ color: '#1b68b3' }}>Teacher Information</h2>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="space-y-4">
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
              </div>
            </div>
          </motion.div>
        )}

        {/* Students List Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r
                        bg-clip-text text-transparent mb-6" style={{ color: '#1b68b3' }}>Enrolled Students</h2>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classData.students && classData.students.map((student) => (
                  <tr key={student._id} 
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
                  </tr>
                ))}
              </tbody>
            </table>
            
            {(!classData.students || classData.students.length === 0) && (
              <div className="text-center text-gray-500 py-8">
                No students enrolled in this class.
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ClassDetails;
