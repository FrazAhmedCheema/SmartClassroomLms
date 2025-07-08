import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for notification operations
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[DEBUG] Fetching student notifications...');
      const response = await fetch('http://localhost:8080/student/notifications', {
        credentials: 'include'
      });
      
      console.log('[DEBUG] Notification fetch response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] Error fetching notifications:', errorText);
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      console.log('[DEBUG] Notification data received:', data);
      
      // Log notification types for debugging
      if (data.notifications && data.notifications.length > 0) {
        const types = {};
        data.notifications.forEach(n => {
          types[n.type] = (types[n.type] || 0) + 1;
        });
        console.log('[DEBUG] Notification types breakdown:', types);
        
        // Check specifically for discussion notifications
        const discussionNotifs = data.notifications.filter(n => n.type === 'discussion');
        console.log(`[DEBUG] Found ${discussionNotifs.length} discussion notifications`);
        
        // Check if notifications have metadata
        const hasMetadata = data.notifications.some(n => n.metadata);
        console.log(`[DEBUG] Notifications with metadata: ${hasMetadata ? 'Yes' : 'No'}`);
        if (!hasMetadata) {
          console.log('[DEBUG] Warning: Notifications don\'t have metadata field, which is needed for discussion links');
        }
        
        // Check most recent notification
        const sortedNotifs = [...data.notifications].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        if (sortedNotifs.length > 0) {
          console.log('[DEBUG] Most recent notification:', sortedNotifs[0]);
        }
      }
      
      return data;
    } catch (error) {
      console.error('[DEBUG] Exception in fetchNotifications:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching unread notification count...');
      const response = await fetch('http://localhost:8080/student/notifications/unread-count', {
        credentials: 'include'
      });
      
      console.log('Unread count response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching unread count:', errorText);
        throw new Error('Failed to fetch unread count');
      }
      
      const data = await response.json();
      console.log('Unread count data received:', data);
      return data.unreadCount;
    } catch (error) {
      console.error('Exception in fetchUnreadCount:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8080/student/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/student/notifications/mark-all-read', {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8080/student/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  lastFetched: null
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add a debug action to manually create a discussion notification for testing
    addDebugDiscussionNotification: (state) => {
      const debugNotification = {
        _id: `debug-${Date.now()}`,
        title: 'Debug Discussion',
        message: 'This is a debug discussion notification created at ' + new Date().toLocaleString(),
        type: 'discussion',
        isRead: false,
        teacherName: 'Debug Teacher',
        className: 'Debug Class',
        createdAt: new Date().toISOString()
      };
      
      console.log('[DEBUG] Adding debug notification:', debugNotification);
      state.notifications.unshift(debugNotification);
      state.unreadCount += 1;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    updateNotificationReadStatus: (state, action) => {
      const { notificationId, isRead } = action.payload;
      const notification = state.notifications.find(n => n._id === notificationId);
      if (notification) {
        const wasUnread = !notification.isRead;
        notification.isRead = isRead;
        if (wasUnread && isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.lastFetched = Date.now();
        
        // Log discussion notifications for debugging
        const discussionNotifications = action.payload.notifications.filter(n => n.type === 'discussion');
        console.log(`Found ${discussionNotifications.length} discussion notifications:`, 
          discussionNotifications.length > 0 ? discussionNotifications : 'None');
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch unread count
      .addCase(fetchUnreadCount.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Mark notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
      })
      
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notificationIndex = state.notifications.findIndex(n => n._id === notificationId);
        if (notificationIndex !== -1) {
          const notification = state.notifications[notificationIndex];
          if (!notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(notificationIndex, 1);
        }
      });
  }
});

export const {
  clearNotifications,
  addNotification,
  updateNotificationReadStatus,
  addDebugDiscussionNotification
} = notificationSlice.actions;

export default notificationSlice.reducer;
