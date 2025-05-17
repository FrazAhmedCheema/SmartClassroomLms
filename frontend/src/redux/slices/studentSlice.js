import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const checkStudentAuthStatus = createAsyncThunk(
  'student/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Checking student auth status...');
      const response = await fetch('http://localhost:8080/student/auth-status', {
        credentials: 'include',
      });

      console.log('Student auth status response:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Student auth status success:', data);
        return {
          studentId: data.student?._id, // Ensure studentId is extracted correctly
          name: data.student?.name,
          email: data.student?.email,
        };
      } else {
        const errorData = await response.json();
        console.error('Student auth status error:', errorData);
        return rejectWithValue(errorData);
      }
    } catch (error) {
      console.error('Student auth status exception:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const studentLogout = createAsyncThunk(
  'student/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/student/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Logout failed');
      return null;
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
    role: 'student', // Add role field
    error: null,
  },
  reducers: {
    setStudentLoading: (state) => {
      state.loading = true;
    },
    setStudentSuccess: (state, action) => {
      console.log('Setting student success state:', action.payload);
      state.isAuthenticated = true;
      state.studentId = action.payload.studentId;
      state.loading = false;
      state.error = null;
    },
    setStudentFailure: (state, action) => {
      state.isAuthenticated = false;
      state.studentId = null;
      state.loading = false;
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkStudentAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkStudentAuthStatus.fulfilled, (state, action) => {
        console.log('Student auth fulfilled:', action.payload);
        state.loading = false;
        state.isAuthenticated = true;
        state.studentId = action.payload.studentId; // Ensure studentId is set
        state.name = action.payload.name; // Add name to state
        state.role = 'student'; // Set role on auth success
        state.error = null;
      })
      .addCase(checkStudentAuthStatus.rejected, (state, action) => {
        console.error('Student auth rejected:', action.payload);
        state.loading = false;
        state.isAuthenticated = false;
        state.studentId = null;
        state.error = action.payload;
      })
      .addCase(studentLogout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(studentLogout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.loading = false;
        state.studentId = null;
        state.error = null;
      })
      .addCase(studentLogout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setStudentLoading,
  setStudentSuccess,
  setStudentFailure
} = studentSlice.actions;

export default studentSlice.reducer;
