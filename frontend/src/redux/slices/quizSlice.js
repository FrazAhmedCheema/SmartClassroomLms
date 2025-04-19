import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  quizzes: [],  // Changed from data to quizzes for clarity
  loading: false,
  error: null,
  lastFetched: null
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setQuizLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setQuizSuccess: (state, action) => {
      state.loading = false;
      state.quizzes = action.payload;
      state.error = null;
      state.lastFetched = Date.now();
    },
    setQuizFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addQuiz: (state, action) => {
      state.quizzes.unshift(action.payload);
    },
    updateQuiz: (state, action) => {
      state.quizzes = state.quizzes.map(quiz => 
        quiz._id === action.payload._id ? action.payload : quiz
      );
    },
    deleteQuiz: (state, action) => {
      state.quizzes = state.quizzes.filter(quiz => quiz._id !== action.payload);
    },
    removeQuiz: (state, action) => {
      state.quizzes = state.quizzes.filter(quiz => quiz._id !== action.payload);
    }
  },
});

export const { 
  setQuizLoading, 
  setQuizSuccess, 
  setQuizFailure,
  addQuiz,
  updateQuiz,
  deleteQuiz,
  removeQuiz
} = quizSlice.actions;

export default quizSlice.reducer;
