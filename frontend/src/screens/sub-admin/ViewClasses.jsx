import React, { useState, useEffect } from 'react';
import { Search, Users, UserCircle, Filter, BookOpen, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ViewClasses = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.subAdminAuth);
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    section: '',
    teacher: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sub-admin/login');
      return;
    }

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
        if (error.response?.status === 401) {
          navigate('/sub-admin/login');
          console.error('Error fetching classes:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [navigate, isAuthenticated]);

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = 
      cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.teacher?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSection = !filters.section || cls.section === filters.section;
    const matchesTeacher = !filters.teacher || cls.teacher?.id === filters.teacher;

    return matchesSearch && matchesSection && matchesTeacher;
  });

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClassClick = (classId) => {
    navigate(`/sub-admin/classes/${classId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 border-4 border-t-4 border-t-blue-600 border-blue-100 rounded-full animate-spin"></div>
          <p className="text-blue-600 font-semibold text-lg">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto relative"
        style={{ zIndex: 20 }}
      >
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8 border-b-4 border-blue-500">
          <div className="flex items-center gap-3">
            <BookOpen size={28} className="text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              Class Management
            </h1>
          </div>
          
          {/* Search and Filter Section */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by class name, section, or teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-200 
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all
                         bg-white text-gray-700 placeholder-gray-400 shadow-sm"
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            </div>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg 
                       hover:from-blue-700 hover:to-blue-600 transition-all duration-300 
                       flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Filter size={18} />
              <span className="font-medium">Filters</span>
            </button>
          </div>
          
          {/* Filter Panel - Animated */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-4"
              >
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Section</label>
                      <select
                        value={filters.section}
                        onChange={(e) => handleFilterChange('section', e.target.value)}
                        className="w-full rounded-lg border-gray-200 bg-gray-50 hover:bg-gray-50/75 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all duration-200 py-2.5 px-3 text-gray-700"
                      >
                        <option value="">All Sections</option>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Teacher</label>
                      <select
                        value={filters.teacher}
                        onChange={(e) => handleFilterChange('teacher', e.target.value)}
                        className="w-full rounded-lg border-gray-200 bg-gray-50 hover:bg-gray-50/75 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all duration-200 py-2.5 px-3 text-gray-700"
                      >
                        <option value="">All Teachers</option>
                        {Array.from(new Set(classes.filter(c => c.teacher).map(c => c.teacher)))
                          .map(teacher => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  {/* Reset Filters Button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setFilters({ section: '', teacher: '' })}
                      className="px-4 py-2 text-sm font-medium text-white hover:text-gray-800 flex items-center gap-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Classes List Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Classes ({filteredClasses.length})</h2>
          <button className="text-white font-medium flex items-center hover:text-white">
            <span>View All</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Classes Grid */}
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          <AnimatePresence>
            {filteredClasses.map((cls, index) => (
              <motion.div
                key={cls._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="group relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
                onClick={() => handleClassClick(cls.classId)}
              >
                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(27, 104, 179, 0.15) 2px, transparent 0)`,
                    backgroundSize: '24px 24px'
                  }}></div>
                </div>

                {/* Color Strip */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                <div className="p-6 relative">
                  {/* Header Section */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {cls.className}
                        </h2>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium border border-blue-100">
                          Section {cls.section}
                        </span>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-medium border border-purple-100">
                          Code: {cls.classCode}
                        </span>
                      </div>
                    </div>

                    {/* Student Count Badge */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-blue-200 rounded-lg blur-sm group-hover:blur-md transition-all"></div>
                      <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-2 rounded-lg text-white shadow-lg">
                        <div className="flex items-center gap-2">
                          <Users size={18} />
                          <span className="font-bold">{cls.students?.length || 0}</span>
                        </div>
                        <div className="text-xs text-blue-100 mt-0.5">Students</div>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Info Section */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      {cls.teacher ? (
                        <>
                          <div className="relative">
                            <div className="absolute inset-0 bg-indigo-300 rounded-full blur-sm"></div>
                            <div className="relative h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                              {cls.teacher.name[0]}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Instructor</div>
                            <div className="font-semibold text-gray-800">{cls.teacher.name}</div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                          <AlertTriangle size={18} />
                          <span className="font-medium">No Teacher Assigned</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 flex justify-end">
                    <div className="relative group/btn">
                      <div className="absolute inset-0 bg-blue-200 rounded-lg blur-sm opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                      <button className="relative px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium flex items-center gap-2 transform group-hover:translate-y-[-2px] transition-all">
                        View Details
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-indigo-600/0 opacity-0 group-hover:opacity-5 transition-opacity"></div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredClasses.length === 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-2 bg-white rounded-2xl p-12 shadow-lg flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <BookOpen size={32} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Classes Found</h3>
              <p className="text-gray-500 text-center max-w-md">
                There are no classes matching your search criteria. Try adjusting your filters or create a new class.
              </p>
              <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create New Class
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ViewClasses;