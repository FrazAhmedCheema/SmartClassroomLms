import { configureStore } from '@reduxjs/toolkit';
import teacherReducer from './slices/teacherSlice';
import classesReducer from './slices/classesSlice';

const store = configureStore({
  reducer: {
    teacher: teacherReducer,
    classes: classesReducer,
  },
});

export default store;
