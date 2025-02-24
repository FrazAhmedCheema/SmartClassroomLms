import React from 'react';
import DashboardStats from './dashboard/DashboardStats';

const SharedDashboard = ({ userRole }) => {
  return (
    <div className="bg-gray-50">
      <DashboardStats userRole={userRole} />
    </div>
  );
};

export default SharedDashboard;
