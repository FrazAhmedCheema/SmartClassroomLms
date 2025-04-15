import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: [],
  loading: false,
  error: null,
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
      state.data = action.payload; // Store quizzes in the state
      state.error = null;
    },
    setQuizFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { setQuizLoading, setQuizSuccess, setQuizFailure } = quizSlice.actions;
export default quizSlice.reducer;
