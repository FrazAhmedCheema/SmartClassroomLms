import React, { useState } from 'react';
import { motion } from 'framer-motion';

const NotificationDebugger = () => {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/student/debug/notifications', {
        credentials: 'include'
      });
      const data = await response.json();
      setDebugData(data);
      console.log('Debug data:', data);
    } catch (error) {
      console.error('Error fetching debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTestNotification = async () => {
    setTestLoading(true);
    try {
      const response = await fetch('http://localhost:8080/student/test/notification', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Test notification result:', data);
      alert('Test notification created! Check the notifications tab.');
    } catch (error) {
      console.error('Error creating test notification:', error);
      alert('Error creating test notification. Check console.');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Notification System Debugger</h1>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={fetchDebugData}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Fetch Debug Data'}
          </button>
          
          <button
            onClick={createTestNotification}
            disabled={testLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {testLoading ? 'Creating...' : 'Create Test Notification'}
          </button>
        </div>

        {debugData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-100 p-6 rounded-lg"
          >
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Student ID:</h3>
                <p className="text-gray-700">{debugData.debug?.studentId}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Notification Count:</h3>
                <p className="text-gray-700">{debugData.debug?.notificationCount}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Enrolled Classes:</h3>
                <p className="text-gray-700">{debugData.debug?.enrolledClasses}</p>
                {debugData.debug?.classes && (
                  <ul className="list-disc ml-5">
                    {debugData.debug.classes.map(cls => (
                      <li key={cls.id}>{cls.name} (Teacher: {cls.teacher})</li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold">Total Notifications in DB:</h3>
                <p className="text-gray-700">{debugData.debug?.totalNotificationsInDB}</p>
              </div>
              
              {debugData.debug?.notifications && debugData.debug.notifications.length > 0 && (
                <div>
                  <h3 className="font-semibold">Notifications:</h3>
                  <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-60">
                    {JSON.stringify(debugData.debug.notifications, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NotificationDebugger;
