import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, CheckSquare, Calendar } from 'lucide-react';

const TeacherDashboard = () => {
  const stats = [
    { icon: BookOpen, title: 'Active Classes', value: '5', description: 'Currently ongoing classes' },
    { icon: Users, title: 'Total Students', value: '150', description: 'Students enrolled' },
    { icon: CheckSquare, title: 'Assignments', value: '12', description: 'Pending reviews' },
    { icon: Calendar, title: 'Upcoming Classes', value: '3', description: 'Next 24 hours' },
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
            Welcome back, Teacher!
          </h1>
          <p className="text-gray-600 text-lg">
            Here's what's happening with your classes today.
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

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1b68b3' }}>Recent Activity</h2>
          <div className="space-y-4">
            {/* Add your recent activity items here */}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
