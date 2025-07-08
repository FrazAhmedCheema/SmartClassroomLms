import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check, CheckCheck, X, Clock, BookOpen, FileText, MessageCircle, User, Trash2, ArrowLeft, RefreshCw, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  fetchTeacherNotifications,
  markTeacherNotificationAsRead,
  markAllTeacherNotificationsAsRead,
  deleteTeacherNotification,
  addDebugTeacherDiscussionNotification
} from '../../redux/slices/teacherNotificationSlice';

const TeacherNotifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, loading, error } = useSelector(state => state.teacherNotifications);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [refreshing, setRefreshing] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Discussion notification debug tracking
  const discussionNotifications = notifications.filter(n => n.type === 'discussion');
  const hasDiscussionNotifications = discussionNotifications.length > 0;

  // Initial fetch
  useEffect(() => {
    dispatch(fetchTeacherNotifications()).then(action => {
      if (action.payload && action.payload.notifications) {
        const allNotifs = action.payload.notifications;
        console.log(`[DEBUG] Received ${allNotifs.length} total teacher notifications`);
        
        // Log notification types distribution
        const typeCount = {};
        allNotifs.forEach(n => {
          typeCount[n.type] = (typeCount[n.type] || 0) + 1;
        });
        console.log('[DEBUG] Teacher notification types:', typeCount);
        
        // Specifically check for discussion notifications
        const discussionNotifs = allNotifs.filter(n => n.type === 'discussion');
        console.log(`[DEBUG] Found ${discussionNotifs.length} teacher discussion notifications`);
        if (discussionNotifs.length > 0) {
          console.log('[DEBUG] First teacher discussion notification:', discussionNotifs[0]);
        }
      }
    });
    
    // Auto refresh every 30 seconds
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing teacher notifications...');
      dispatch(fetchTeacherNotifications());
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [dispatch]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    dispatch(fetchTeacherNotifications()).finally(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  };
  
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'read':
        return notification.isRead;
      default:
        return true;
    }
  });

  const handleMarkAsRead = (notificationId) => {
    dispatch(markTeacherNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllTeacherNotificationsAsRead());
  };

  const handleDeleteNotification = (notificationId) => {
    dispatch(deleteTeacherNotification(notificationId));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'announcement':
        return <MessageCircle size={20} className="text-blue-500" />;
      case 'assignment':
        return <FileText size={20} className="text-orange-500" />;
      case 'quiz':
        return <BookOpen size={20} className="text-green-500" />;
      case 'material':
        return <FileText size={20} className="text-purple-500" />;
      case 'discussion':
        return <MessageCircle size={20} className="text-indigo-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return 'bg-white border-gray-200';
    
    switch (type) {
      case 'announcement':
        return 'bg-blue-50 border-blue-200';
      case 'assignment':
        return 'bg-orange-50 border-orange-200';
      case 'quiz':
        return 'bg-green-50 border-green-200';
      case 'material':
        return 'bg-purple-50 border-purple-200';
      case 'discussion':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Teacher Notifications</h1>
                <p className="text-gray-600 mt-1">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                title="Show debug info"
              >
                <Info size={20} />
              </button>
              <button
                onClick={handleManualRefresh}
                className={`p-2 rounded-lg transition-all flex items-center ${refreshing ? 'animate-spin text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Refresh notifications"
                disabled={refreshing}
              >
                <RefreshCw size={20} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors flex items-center gap-2"
                >
                  <CheckCheck size={16} />
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Debug Information Panel */}
        {showDebugInfo && (
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-sm border border-gray-300">
            <h3 className="font-bold mb-2">Debug Information</h3>
            <p><strong>Total teacher notifications:</strong> {notifications.length}</p>
            <p><strong>Teacher discussion notifications:</strong> {discussionNotifications.length}</p>
            {hasDiscussionNotifications ? (
              <div className="mt-2">
                <p className="font-semibold">Teacher discussion notifications found:</p>
                <ul className="list-disc pl-5 mt-1">
                  {discussionNotifications.map((n, idx) => (
                    <li key={idx} className="mb-1">
                      "{n.title}" - {n.message} 
                      <span className="text-xs text-gray-500 ml-1">
                        (Created: {new Date(n.createdAt).toLocaleString()})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-2 text-orange-600">No teacher discussion notifications found in the system.</p>
            )}
            <button 
              onClick={() => window.open('http://localhost:8080/teacher/notifications/discussion-debug', '_blank')}
              className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded text-xs"
            >
              View detailed debug info
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'read', label: 'Read', count: notifications.length - unreadCount }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-[#1b68b3] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Debug Actions */}
        {showDebugInfo && (
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-sm border border-gray-300">
            <h3 className="font-bold mb-2">Notification Debug Actions</h3>
            <div className="flex mt-3 gap-2">
              <button 
                onClick={() => {
                  fetch('http://localhost:8080/teacher/notifications/discussion-debug', {
                    credentials: 'include'
                  })
                  .then(res => res.json())
                  .then(data => {
                    console.log('[DEBUG] Teacher discussion notifications debug data:', data);
                    alert(`Found ${data.totalCount} teacher discussion notifications in system`);
                  })
                  .catch(err => console.error('Error fetching teacher debug info:', err));
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs"
              >
                Check teacher discussion notifications
              </button>
              <button 
                onClick={() => {
                  const classId = prompt('Enter a class ID to create a test teacher notification:');
                  if (classId) {
                    fetch('http://localhost:8080/teacher/notifications/test', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ classId, type: 'discussion' })
                    })
                    .then(res => res.json())
                    .then(data => {
                      console.log('[DEBUG] Test teacher notification created:', data);
                      if (data.success) {
                        alert('Test teacher notification created successfully!');
                        dispatch(fetchTeacherNotifications());
                      } else {
                        alert(`Error: ${data.message}`);
                      }
                    })
                    .catch(err => console.error('Error creating test teacher notification:', err));
                  }
                }}
                className="px-3 py-1.5 bg-green-600 text-white rounded text-xs"
              >
                Create test teacher notification
              </button>
              <button 
                onClick={() => {
                  dispatch(addDebugTeacherDiscussionNotification());
                  alert('Added debug teacher discussion notification locally. This is only for UI testing!');
                }}
                className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs"
              >
                Add UI test teacher notification
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#1b68b3] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <Bell size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading teacher notifications</h3>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => dispatch(fetchTeacherNotifications())}
                className="mt-4 px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors"
              >
                Try again
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-300 mb-4">
                <Bell size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'No teacher notifications yet' : 
                 filter === 'unread' ? 'No unread teacher notifications' : 'No read teacher notifications'}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' ? 'You\'ll see notifications here when students initiate discussions.' :
                 filter === 'unread' ? 'All your notifications have been read.' : 'You haven\'t read any notifications yet.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl border-2 border-l-4 p-6 transition-all hover:shadow-md ${getNotificationColor(notification.type, notification.isRead)}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-semibold ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                            title="Mark as read"
                          >
                            <Check size={16} className="text-blue-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification._id)}
                          className="p-2 hover:bg-red-100 rounded-full transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                    
                    <p className={`text-base mb-4 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                        </div>
                        {notification.studentName && (
                          <div className="flex items-center space-x-1">
                            <User size={14} />
                            <span>by {notification.studentName}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium text-[#1b68b3]">
                        {notification.className}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherNotifications;
