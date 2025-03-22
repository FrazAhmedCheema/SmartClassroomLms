import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  basicInfo: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null
  },
  classwork: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null
  },
  people: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null
  },
  discussions: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null
  }
};

const classSlice = createSlice({
  name: 'class',
  initialState,
  reducers: {
    // Basic Info
    fetchBasicInfoStart: (state) => {
      state.basicInfo.loading = true;
      state.basicInfo.error = null;
    },
    fetchBasicInfoSuccess: (state, action) => {
      state.basicInfo.loading = false;
      state.basicInfo.data = action.payload;
      state.basicInfo.error = null;
      state.basicInfo.lastFetched = Date.now();
    },
    fetchBasicInfoFailure: (state, action) => {
      state.basicInfo.loading = false;
      state.basicInfo.error = action.payload;
    },

    // Classwork
    fetchClassworkStart: (state) => {
      state.classwork.loading = true;
      state.classwork.error = null;
    },
    fetchClassworkSuccess: (state, action) => {
      state.classwork.loading = false;
      state.classwork.data = action.payload;
      state.classwork.error = null;
      state.classwork.lastFetched = Date.now();
    },
    fetchClassworkFailure: (state, action) => {
      state.classwork.loading = false;
      state.classwork.error = action.payload;
    },

    // People
    fetchPeopleStart: (state) => {
      state.people.loading = true;
      state.people.error = null;
    },
    fetchPeopleSuccess: (state, action) => {
      state.people.loading = false;
      state.people.data = action.payload;
      state.people.error = null;
      state.people.lastFetched = Date.now();
    },
    fetchPeopleFailure: (state, action) => {
      state.people.loading = false;
      state.people.error = action.payload;
    },

    // Discussions
    fetchDiscussionsStart: (state) => {
      state.discussions.loading = true;
      state.discussions.error = null;
    },
    fetchDiscussionsSuccess: (state, action) => {
      state.discussions.loading = false;
      state.discussions.data = action.payload;
      state.discussions.error = null;
      state.discussions.lastFetched = Date.now();
    },
    fetchDiscussionsFailure: (state, action) => {
      state.discussions.loading = false;
      state.discussions.error = action.payload;
    },

    clearDiscussionsData: (state) => {
      state.discussions.data = null;
      state.discussions.lastFetched = null;
    },

    updateDiscussions: (state, action) => {
      state.discussions.data = action.payload;
      state.discussions.lastFetched = Date.now();
    },
  }
});

export const {
  fetchBasicInfoStart, fetchBasicInfoSuccess, fetchBasicInfoFailure,
  fetchClassworkStart, fetchClassworkSuccess, fetchClassworkFailure,
  fetchPeopleStart, fetchPeopleSuccess, fetchPeopleFailure,
  fetchDiscussionsStart, fetchDiscussionsSuccess, fetchDiscussionsFailure,
  clearDiscussionsData,
  updateDiscussions
} = classSlice.actions;

export default classSlice.reducer;
