import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const LineChartComponent = ({ institutes, requests, users }) => {
  // Create sample data with current values as the latest point
  const data = [
    { name: 'Jan', Institutes: Math.round(institutes * 0.4), Requests: Math.round(requests * 0.4), Users: Math.round(users * 0.4) },
    { name: 'Feb', Institutes: Math.round(institutes * 0.5), Requests: Math.round(requests * 0.5), Users: Math.round(users * 0.5) },
    { name: 'Mar', Institutes: Math.round(institutes * 0.6), Requests: Math.round(requests * 0.6), Users: Math.round(users * 0.6) },
    { name: 'Apr', Institutes: Math.round(institutes * 0.7), Requests: Math.round(requests * 0.7), Users: Math.round(users * 0.7) },
    { name: 'May', Institutes: Math.round(institutes * 0.8), Requests: Math.round(requests * 0.8), Users: Math.round(users * 0.8) },
    { name: 'Current', Institutes: institutes, Requests: requests, Users: users },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Institutes" stroke="#1b68b3" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Requests" stroke="#4BC0C0" />
          <Line type="monotone" dataKey="Users" stroke="#FFB547" />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default LineChartComponent;
