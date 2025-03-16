import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#1b68b3', '#4BC0C0', '#FFB547'];

const PieChartComponent = ({ institutes, requests, users }) => {
  const data = [
    { name: 'Institutes', value: institutes || 0 },
    { name: 'Requests', value: requests || 0 },
    { name: 'Users', value: users || 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie 
            data={data} 
            cx="50%" 
            cy="50%" 
            innerRadius={60}
            outerRadius={90} 
            fill="#8884d8" 
            dataKey="value" 
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default PieChartComponent;
