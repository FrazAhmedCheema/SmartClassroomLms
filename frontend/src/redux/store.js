import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import classesReducer from './slices/classesSlice';
import teacherReducer from './slices/teacherSlice'; 
import studentReducer from './slices/studentSlice';
import enrolledClassesReducer from './slices/enrolledClassesSlice';
import adminAuthReducer from './slices/adminAuthSlice';
import subAdminAuthReducer from './slices/subAdminAuthSlice';
import classReducer from './slices/classSlice';
import quizReducer from './slices/quizSlice';
import notificationReducer from './slices/notificationSlice';
import teacherNotificationReducer from './slices/teacherNotificationSlice';
import assignmentsReducer from './reducers/assignmentReducers';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['student', 'teacher', 'subAdminAuth'] // Only persist these reducers
};

const rootReducer = combineReducers({
  classes: classesReducer,
  teacher: teacherReducer,
  student: studentReducer,
  enrolledClasses: enrolledClassesReducer,
  adminAuth: adminAuthReducer,
  subAdminAuth: subAdminAuthReducer,
  class: classReducer,
  quiz: quizReducer,
  notifications: notificationReducer,
  teacherNotifications: teacherNotificationReducer,
  assignments: assignmentsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export const clearPersistedState = async () => {
  try {
    await persistor.purge(); // Clear persisted state
    console.log('Persisted state cleared successfully.');
  } catch (error) {
    console.error('Error clearing persisted state:', error);
  }
};

// Example usage: Call `clearPersistedState()` in your app initialization or debugging process.

// Keep the default export for backward compatibility
export default store;
