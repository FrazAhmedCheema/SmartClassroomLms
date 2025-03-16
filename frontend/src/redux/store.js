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

// Keep the default export for backward compatibility
export default store;
