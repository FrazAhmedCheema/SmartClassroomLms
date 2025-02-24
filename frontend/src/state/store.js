import { configureStore } from '@reduxjs/toolkit';
import teacherReducer from './teacher/teacherSlice';

export const store = configureStore({
  reducer: {
    teacher: teacherReducer,
  },
});
