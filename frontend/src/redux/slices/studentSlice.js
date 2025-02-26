import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const checkStudentAuthStatus = createAsyncThunk(
  'student/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/student/auth-status', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const studentLogoutThunk = createAsyncThunk(
  'student/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/student/logout', {
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

const studentSlice = createSlice({
  name: 'student',
  initialState: {
    isAuthenticated: false,
    loading: true,
    studentId: null,
    error: null,
  },
  reducers: {
    setStudentLoading: (state) => {
      state.loading = true;
    },
    setStudentSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.studentId = action.payload;
      state.loading = false;
      state.error = null;
    },
    setStudentFailure: (state, action) => {
      state.isAuthenticated = false;
      state.studentId = null;
      state.loading = false;
      state.error = action.payload;
    },
    studentLogout: (state) => {
      state.isAuthenticated = false;
      state.studentId = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkStudentAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkStudentAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.studentId = action.payload.studentId;
      })
      .addCase(checkStudentAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      .addCase(studentLogoutThunk.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.studentId = null;
      });
  },
});

export const {
  setStudentLoading,
  setStudentSuccess,
  setStudentFailure,
  studentLogout
} = studentSlice.actions;

export default studentSlice.reducer;
