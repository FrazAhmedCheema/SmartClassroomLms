import React, { useState, useEffect } from 'react';
import { Search, Users, UserCircle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ViewClasses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('http://localhost:8080/sub-admin/classes', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched classes:', data);
          setClasses(data.classes || []);
        } else {
          console.error('Failed to fetch classes');
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const filteredClasses = classes.filter(cls =>
    cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.teacher?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClassClick = (classId) => {
    navigate(`/sub-admin/classes/${classId}`);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="text-[#1b68b3] text-xl">Loading classes...</div>
      </div>
    );
  }

  return (
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
                placeholder="Search by class name or section..."
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
              key={cls._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleClassClick(cls.classId)}
            >
              <div className="p-6 hover:bg-blue-50 transition-colors duration-200">
                <div className="flex justify-between items-center">
                  <div className="space-y-2 text-gray-600">
                    <h2 className="text-2xl font-bold" style={{ color: '#1b68b3' }}>
                      {cls.className}
                    </h2>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center">
                        <UserCircle className="w-5 h-5 mr-2"style={{ color: 'black' }} />
                        <span className="font-medium" style={{ color: '#1b68b3' }}>
                          {cls.teacher ? cls.teacher.name : 'No Teacher Assigned'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Section: {cls.section}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Code: {cls.classCode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1b68b3] bg-opacity-10 px-4 py-2 rounded-lg">
                    <div className="flex items-center " >
                      <Users size={20} className="mr-2" style={{ color: 'black' }}/>
                      <span className="font-semibold" style={{color : '#1b68b3'}}>{cls.students?.length || 0} Students</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {filteredClasses.length === 0 && !loading && (
            <div className="text-center text-gray-500 py-8">
              No classes found.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ViewClasses;
