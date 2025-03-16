import React, { useState, useEffect } from 'react';
import DashboardStats from './dashboard/DashboardStats';

const SharedDashboard = ({ userRole }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`http://localhost:8080/${userRole.toLowerCase()}/stats`, {
          credentials: 'include'
        });
        const result = await response.json();
        // Set only the data property from the response
        setStats(result.data);
        console.log('Stats data:', result.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userRole]);

  if (loading) {
    return <div className="animate-pulse">Loading stats...</div>;
  }

  return (
    <div className="bg-gray-50">
      <DashboardStats userRole={userRole} stats={stats} />
    </div>
  );
};

export default SharedDashboard;
