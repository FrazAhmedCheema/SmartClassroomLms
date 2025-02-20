import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, CheckSquare, Clock, MessageSquare, Camera, Folder } from 'lucide-react';

const StudentDashboard = () => {
  const stats = [
    { icon: BookOpen, title: 'Enrolled Classes', value: '6', description: 'Active courses' },
    { icon: GraduationCap, title: 'Current GPA', value: '3.5', description: 'Semester average' },
    { icon: CheckSquare, title: 'Pending Tasks', value: '8', description: 'Due this week' },
    { icon: Clock, title: 'Study Hours', value: '24h', description: 'This week' },
  ];

  const classes = [
    { title: 'Machine Learning', instructor: 'Umer Ramzan', color: '#1b68b3', initial: 'A' },
    { title: 'Parallel Computing', instructor: 'Faizan-ul-Mustafa', color: '#1b68b3', initial: 'B' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white rounded-xl shadow-lg p-8 border-l-4"
          style={{ borderLeftColor: '#1b68b3' }}
        >
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1b68b3' }}>
            Welcome back, Student!
          </h1>
          <p className="text-gray-600 text-lg">
            Track your academic progress and upcoming tasks.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg border-b-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ borderBottomColor: '#1b68b3' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(27, 104, 179, 0.1)' }}>
                  <stat.icon className="w-6 h-6" style={{ color: '#1b68b3' }} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold mb-2" style={{ color: '#1b68b3' }}>{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Classes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1b68b3' }}>Enrolled Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((classItem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-white rounded-xl shadow-lg p-6 border-l-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{ borderLeftColor: classItem.color }}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold" style={{ color: classItem.color }}>
                    {classItem.title}
                  </h3>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: classItem.color }}
                  >
                    {classItem.initial}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-1">{classItem.instructor}</p>
                <div className="flex justify-between mt-4">
                  <button className="flex items-center space-x-2 text-gray-200 hover:text-gray-900">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button className="flex items-center space-x-2 text-gray-200 hover:text-gray-900">
                    <Camera className="w-5 h-5" />
                  </button>
                  <button className="flex items-center space-x-2 text-gray-200 hover:text-gray-900">
                    <Folder className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
