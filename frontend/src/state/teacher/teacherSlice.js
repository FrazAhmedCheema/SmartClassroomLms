import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const checkAuthStatus = createAsyncThunk(
  'teacher/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/teacher/check-auth', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        return data.teacherId;
      }
      return rejectWithValue('Not authenticated');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  teacherId: null,
  isAuthenticated: false,
  loading: true, // Changed to true by default
  error: null
};

const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    setTeacherLoading: (state) => {
      state.loading = true;
    },
    setTeacherSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.teacherId = action.payload;
      state.loading = false;
      state.error = null;
    },
    setTeacherFailure: (state, action) => {
      state.isAuthenticated = false;
      state.teacherId = null;
      state.loading = false;
      state.error = action.payload;
    },
    teacherLogout: (state) => {
      state.isAuthenticated = false;
      state.teacherId = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.teacherId = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.teacherId = null;
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setTeacherLoading,
  setTeacherSuccess,
  setTeacherFailure,
  teacherLogout
} = teacherSlice.actions;

export default teacherSlice.reducer;
