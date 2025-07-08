import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for teacher notification operations
export const fetchTeacherNotifications = createAsyncThunk(
  'teacherNotifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[DEBUG] Fetching teacher notifications...');
      const response = await fetch('http://localhost:8080/teacher/notifications', {
        credentials: 'include'
      });
      
      console.log('[DEBUG] Teacher notification fetch response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] Error fetching teacher notifications:', errorText);
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      console.log('[DEBUG] Teacher notification data received:', data);
      
      // Log notification types for debugging
      if (data.notifications && data.notifications.length > 0) {
        const types = {};
        data.notifications.forEach(n => {
          types[n.type] = (types[n.type] || 0) + 1;
        });
        console.log('[DEBUG] Teacher notification types breakdown:', types);
        
        // Check specifically for discussion notifications
        const discussionNotifs = data.notifications.filter(n => n.type === 'discussion');
        console.log(`[DEBUG] Found ${discussionNotifs.length} teacher discussion notifications`);
        
        // Check if notifications have metadata
        const hasMetadata = data.notifications.some(n => n.metadata);
        console.log(`[DEBUG] Teacher notifications with metadata: ${hasMetadata ? 'Yes' : 'No'}`);
        if (!hasMetadata) {
          console.log('[DEBUG] Warning: Teacher notifications don\'t have metadata field, which may be needed for discussion links');
        }
        
        // Check most recent notification
        const sortedNotifs = [...data.notifications].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        if (sortedNotifs.length > 0) {
          console.log('[DEBUG] Most recent teacher notification:', sortedNotifs[0]);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Exception in fetchTeacherNotifications:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTeacherUnreadCount = createAsyncThunk(
  'teacherNotifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/teacher/notifications/unread-count', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching teacher unread count:', errorText);
        throw new Error('Failed to fetch unread count');
      }
      
      const data = await response.json();
      return data.unreadCount;
    } catch (error) {
      console.error('Exception in fetchTeacherUnreadCount:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const markTeacherNotificationAsRead = createAsyncThunk(
  'teacherNotifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8080/teacher/notifications/${notificationId}/read`, {
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

export const markAllTeacherNotificationsAsRead = createAsyncThunk(
  'teacherNotifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/teacher/notifications/mark-all-read', {
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

export const deleteTeacherNotification = createAsyncThunk(
  'teacherNotifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8080/teacher/notifications/${notificationId}`, {
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

const teacherNotificationSlice = createSlice({
  name: 'teacherNotifications',
  initialState,
  reducers: {
    // Add a debug action to manually create a discussion notification for testing
    addDebugTeacherDiscussionNotification: (state) => {
      const debugNotification = {
        _id: `teacher-debug-${Date.now()}`,
        title: 'Debug Discussion',
        message: 'This is a debug teacher discussion notification created at ' + new Date().toLocaleString(),
        type: 'discussion',
        isRead: false,
        studentName: 'Debug Student',
        className: 'Debug Class',
        createdAt: new Date().toISOString()
      };
      
      console.log('[DEBUG] Adding debug teacher notification:', debugNotification);
      state.notifications.unshift(debugNotification);
      state.unreadCount += 1;
    },
    clearTeacherNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
    },
    addTeacherNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    updateTeacherNotificationReadStatus: (state, action) => {
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
      .addCase(fetchTeacherNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.lastFetched = Date.now();
      })
      .addCase(fetchTeacherNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch unread count
      .addCase(fetchTeacherUnreadCount.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchTeacherUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchTeacherUnreadCount.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Mark notification as read
      .addCase(markTeacherNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Mark all notifications as read
      .addCase(markAllTeacherNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
      })
      
      // Delete notification
      .addCase(deleteTeacherNotification.fulfilled, (state, action) => {
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
  clearTeacherNotifications,
  addTeacherNotification,
  updateTeacherNotificationReadStatus,
  addDebugTeacherDiscussionNotification
} = teacherNotificationSlice.actions;

export default teacherNotificationSlice.reducer;
