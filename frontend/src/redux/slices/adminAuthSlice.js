import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  admin: null,
  loading: false,
  error: null
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
      if (action.payload === true) {
        state.error = null;
      }
    },
    loginSuccess: (state, action) => {
      console.log('Login success with admin data:', action.payload);
      state.isAuthenticated = true;
      state.admin = action.payload;
      state.loading = false;
      state.error = null;
    },
    loginFail: (state, action) => {
      console.log('Login failed with error:', action.payload);
      state.isAuthenticated = false;
      state.admin = null;
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.admin = null;
      state.loading = false;
      state.error = null;
    }
  }
});

export const { setLoading, loginSuccess, loginFail, logout } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
