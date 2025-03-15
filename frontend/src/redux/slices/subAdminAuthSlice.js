import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  loading: false,
  error: null,
  subAdmin: null
};

export const checkSubAdminAuthStatus = createAsyncThunk(
  'subAdminAuth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/sub-admin/check-auth', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (!response.ok || !data.authenticated) {
        throw new Error('Not authenticated');
      }

      return { authenticated: true };
    } catch (error) {
      return rejectWithValue('Auth check failed');
    }
  }
);

const subAdminAuthSlice = createSlice({
  name: 'subAdminAuth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
      if (action.payload === true) {
        state.error = null; // Clear errors when starting new request
      }
    },
    loginSuccess: (state, action) => {
      console.log('Login success with data:', action.payload);
      state.isAuthenticated = true;
      state.subAdmin = action.payload;
      state.loading = false;
      state.error = null;
    },
    loginFail: (state, action) => {
      console.log('Login failed:', action.payload);
      state.isAuthenticated = false;
      state.subAdmin = null;
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.subAdmin = null;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkSubAdminAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkSubAdminAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.subAdmin = action.payload;
        state.error = null;
      })
      .addCase(checkSubAdminAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.subAdmin = null;
        state.error = action.payload;
      });
  }
});

export const { setLoading, loginSuccess, loginFail, logout, clearError } = subAdminAuthSlice.actions;
export default subAdminAuthSlice.reducer;
