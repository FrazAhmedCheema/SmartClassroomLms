import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const checkAuthStatus = createAsyncThunk(
  'teacher/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Checking auth status...');
      const response = await fetch('http://localhost:8080/teacher/auth-status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Auth status response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Auth status success:', data);
        return data;
      } else {
        const errorData = await response.json();
        console.error('Auth status error:', errorData);
        return rejectWithValue(errorData);
      }
    } catch (error) {
      console.error('Auth status exception:', error);
      return rejectWithValue(error.message || 'Authentication check failed');
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

const initialState = {
  isAuthenticated: false,
  loading: true,
  teacherId: null,
  role: null, // Add role to initial state
  error: null,
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
      state.teacherId = action.payload.teacherId;
      state.role = 'teacher'; // Set role explicitly
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
      state.role = null; // Clear role on logout
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.teacherId = action.payload.teacherId;
        state.role = 'teacher'; // Set role when auth check is successful
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.teacherId = null;
        state.role = null; // Clear role on auth check failure
        state.error = action.payload || 'Authentication failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.teacherId = null;
        state.error = null;
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
