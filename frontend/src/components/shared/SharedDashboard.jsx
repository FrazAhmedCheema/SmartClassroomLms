import React, { useState, useEffect } from 'react';
import DashboardStats from './dashboard/DashboardStats';

const SharedDashboard = ({ userRole }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:8080/${userRole.toLowerCase()}/stats`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Add validation to ensure stats data is properly formatted
          console.log('Raw stats data:', result.data);
          
          // Ensure all values are primitive types or null/undefined
          const sanitizedStats = Object.keys(result.data || {}).reduce((acc, key) => {
            const value = result.data[key];
            // Convert objects to strings or extract meaningful values
            if (typeof value === 'object' && value !== null) {
              if (value.msg) {
                acc[key] = value.msg;
              } else {
                acc[key] = JSON.stringify(value);
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {});
          
          console.log('Sanitized stats data:', sanitizedStats);
          setStats(sanitizedStats);
        } else {
          throw new Error(result.message || 'Failed to fetch stats');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userRole]);

  if (loading) {
    return (
      <div className="bg-gray-50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">Error loading dashboard stats: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Add error boundary for stats rendering
  const renderStats = () => {
    try {
      return <DashboardStats userRole={userRole} stats={stats} />;
    } catch (renderError) {
      console.error('Error rendering DashboardStats:', renderError);
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">Error rendering dashboard stats. Please check console for details.</p>
          <pre className="text-xs text-gray-600 mt-2 overflow-auto">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>
      );
    }
  };

  return (
    <div className="bg-gray-50">
      {renderStats()}
    </div>
  );
};

export default SharedDashboard;
