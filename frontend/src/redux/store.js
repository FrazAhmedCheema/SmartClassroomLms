import { configureStore } from '@reduxjs/toolkit';
import teacherReducer from './slices/teacherSlice';
import classesReducer from './slices/classesSlice';

const store = configureStore({
  reducer: {
    teacher: teacherReducer,
    classes: classesReducer,
  },
});

export { store }; // Export as named export
