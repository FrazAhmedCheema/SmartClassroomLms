import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Jan', Institutes: 40, Requests: 24, Users: 20 },
  { name: 'Feb', Institutes: 30, Requests: 13, Users: 22 },
  { name: 'Mar', Institutes: 20, Requests: 18, Users: 25 },
  { name: 'Apr', Institutes: 27, Requests: 39, Users: 30 },
  { name: 'May', Institutes: 18, Requests: 48, Users: 35 },
  { name: 'Jun', Institutes: 23, Requests: 38, Users: 40 },
];

const LineChartComponent = () => {
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
