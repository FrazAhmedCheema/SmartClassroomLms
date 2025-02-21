import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, CheckSquare, Clock, GraduationCap } from 'lucide-react';

const statsConfig = {
  teacher: [
    { icon: BookOpen, title: 'Active Classes', value: '5', description: 'Currently ongoing' },
    { icon: Users, title: 'Total Students', value: '150', description: 'Enrolled students' },
    { icon: CheckSquare, title: 'Assignments', value: '12', description: 'Pending reviews' },
    { icon: Clock, title: 'Upcoming', value: '3', description: 'Next 24 hours' },
  ],
  student: [
    { icon: BookOpen, title: 'Enrolled Classes', value: '6', description: 'Active courses' },
    { icon: GraduationCap, title: 'Current GPA', value: '3.5', description: 'Semester average' },
    { icon: CheckSquare, title: 'Pending Tasks', value: '8', description: 'Due this week' },
    { icon: Clock, title: 'Study Hours', value: '24h', description: 'This week' },
  ]
};

const DashboardStats = ({ userRole }) => {
  const stats = statsConfig[userRole.toLowerCase()];

  return (
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
  );
};

export default DashboardStats;
