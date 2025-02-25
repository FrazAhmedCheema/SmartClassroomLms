import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const checkAuthStatus = createAsyncThunk(
  'teacher/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/teacher/auth-status', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'teacher/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/teacher/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const teacherSlice = createSlice({
  name: 'teacher',
  initialState: {
    isAuthenticated: false,
    loading: true,
    teacherId: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.teacherId = action.payload.teacherId;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.teacherId = null;
      });
  },
});

export default teacherSlice.reducer;
