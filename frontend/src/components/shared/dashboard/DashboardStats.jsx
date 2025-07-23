import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, CheckSquare, Clock, GraduationCap, MessageCircle } from 'lucide-react';

const statsConfig = {
  teacher: [
    { icon: BookOpen, title: 'Active Classes', key: 'activeClasses', description: 'Currently ongoing' },
    { icon: Users, title: 'Total Students', key: 'totalStudents', description: 'Enrolled students' },
    { icon: CheckSquare, title: 'Assignments', key: 'assignments', description: 'Pending reviews' },
    { icon: Clock, title: 'Recent Submissions', key: 'recentSubmissions', description: 'Last 7 days' },
  ],
  student: [
    { icon: BookOpen, title: 'Enrolled Classes', key: 'enrolledClasses', description: 'Active courses' },
    { icon: CheckSquare, title: 'To-do', key: 'todos', description: 'Pending tasks' },
    { icon: MessageCircle, title: 'Ongoing Discussions', key: 'discussions', description: 'Active threads' },
    { icon: Clock, title: 'Recent Activity', key: 'recentActivity', description: 'Last 7 days' },
  ]
};

const DashboardStats = ({ userRole, stats }) => {
  const config = statsConfig[userRole.toLowerCase()];
  
  // Add debug log to verify stats
  console.log('Stats in DashboardStats:', stats);

  // Fallback if no stats are available
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {config.map((stat, index) => (
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
            <p className="text-3xl font-bold mb-2" style={{ color: '#1b68b3' }}>--</p>
            <p className="text-sm text-gray-500">{stat.description}</p>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {config.map((stat, index) => (
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
          <p className="text-3xl font-bold mb-2" style={{ color: '#1b68b3' }}>
            {/* Safely render stats value, handling objects with msg property */}
            {(() => {
              const value = stats?.[stat.key];
              if (value === null || value === undefined) return '0';
              if (typeof value === 'object' && value.msg !== undefined) return value.msg;
              if (typeof value === 'object') return JSON.stringify(value);
              return String(value);
            })()}
          </p>
          <p className="text-sm text-gray-500">{stat.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;
