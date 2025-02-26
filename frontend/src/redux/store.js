import { configureStore } from '@reduxjs/toolkit';
import teacherReducer from './slices/teacherSlice';
import classesReducer from './slices/classesSlice';
import studentReducer from './slices/studentSlice';
import enrolledClassesReducer from './slices/enrolledClassesSlice';

const store = configureStore({
  reducer: {
    teacher: teacherReducer,
    classes: classesReducer,
    student: studentReducer,
    enrolledClasses: enrolledClassesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export { store };
