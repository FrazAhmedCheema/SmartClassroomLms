import { configureStore } from '@reduxjs/toolkit';
import classesReducer from './slices/classesSlice';
import teacherReducer from './slices/teacherSlice'; 
import studentReducer from './slices/studentSlice';
import enrolledClassesReducer from './slices/enrolledClassesSlice';

// Change from const store to export const store
export const store = configureStore({
  reducer: {
    classes: classesReducer,
    teacher: teacherReducer,
    student: studentReducer,
    enrolledClasses: enrolledClassesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Keep the default export for backward compatibility
export default store;
