import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check, CheckCheck, X, Clock, BookOpen, FileText, MessageCircle, User, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  fetchTeacherNotifications,
  markTeacherNotificationAsRead,
  markAllTeacherNotificationsAsRead,
  deleteTeacherNotification
} from '../../redux/slices/teacherNotificationSlice';

const TeacherNotifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, loading, error } = useSelector(state => state.teacherNotifications);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [refreshing, setRefreshing] = useState(false);

  // Initial fetch
  useEffect(() => {
    dispatch(fetchTeacherNotifications());
    
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
                <ArrowLeft size={24} className="text-white" />
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
                onClick={handleManualRefresh}
                className={`p-2 rounded-lg transition-all flex items-center ${refreshing ? 'animate-spin text-blue-600' : 'hover:bg-gray-100 text-white'}`}
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

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 w-fit">
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
                    ? 'bg-[#145091] text-white shadow-sm'
                    : 'bg-[#1b68b3] text-white hover:bg-[#145091]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

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
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors"
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification._id)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 size={16} />
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
