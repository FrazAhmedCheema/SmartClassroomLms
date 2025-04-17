import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  basicInfo: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null
  },
  classwork: {
    data: [], // Change from null to empty array
    loading: false,
    error: null,
    lastFetched: null
  },
  topics: {
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
      console.log('fetchClassworkSuccess called with payload:', action.payload);
      state.classwork.loading = false;
      state.classwork.data = action.payload;
      state.classwork.error = null;
      state.classwork.lastFetched = Date.now();
      console.log('Updated classwork state:', state.classwork);
    },
    fetchClassworkFailure: (state, action) => {
      state.classwork.loading = false;
      state.classwork.error = action.payload;
    },
    addClasswork: (state, action) => {
      if (state.classwork.data) {
        state.classwork.data = [action.payload, ...state.classwork.data];
      } else {
        state.classwork.data = [action.payload];
      }
      state.classwork.lastFetched = Date.now();
    },
    updateClasswork: (state, action) => {
      if (state.classwork.data) {
        state.classwork.data = state.classwork.data.map(item => 
          item._id === action.payload._id ? action.payload : item
        );
        state.classwork.lastFetched = Date.now();
      }
    },
    removeClasswork: (state, action) => {
      state.classwork.data = state.classwork.data.filter(item => item._id !== action.payload);
      state.classwork.lastFetched = Date.now(); // Update the timestamp to reflect the change
    },

    // Topics
    fetchTopicsStart: (state) => {
      state.topics.loading = true;
      state.topics.error = null;
    },
    fetchTopicsSuccess: (state, action) => {
      state.topics.loading = false;
      state.topics.data = action.payload;
      state.topics.error = null;
      state.topics.lastFetched = Date.now();
    },
    fetchTopicsFailure: (state, action) => {
      state.topics.loading = false;
      state.topics.error = action.payload;
    },
    addTopic: (state, action) => {
      if (state.topics.data) {
        state.topics.data = [action.payload, ...state.topics.data];
      } else {
        state.topics.data = [action.payload];
      }
      state.topics.lastFetched = Date.now();
    },
    updateTopic: (state, action) => {
      if (state.topics.data) {
        state.topics.data = state.topics.data.map(topic => 
          topic._id === action.payload._id ? action.payload : topic
        );
        state.topics.lastFetched = Date.now();
      }
    },
    removeTopic: (state, action) => {
      if (state.topics.data) {
        state.topics.data = state.topics.data.filter(topic => 
          topic._id !== action.payload
        );
        state.topics.lastFetched = Date.now();
      }
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

    resetClassState: () => initialState, // Reset the class slice to its initial state
  }
});

export const {
  fetchBasicInfoStart, fetchBasicInfoSuccess, fetchBasicInfoFailure,
  fetchClassworkStart, fetchClassworkSuccess, fetchClassworkFailure, addClasswork, updateClasswork, removeClasswork,
  fetchTopicsStart, fetchTopicsSuccess, fetchTopicsFailure, addTopic, updateTopic, removeTopic,
  fetchPeopleStart, fetchPeopleSuccess, fetchPeopleFailure,
  fetchDiscussionsStart, fetchDiscussionsSuccess, fetchDiscussionsFailure,
  clearDiscussionsData,
  updateDiscussions,
  resetClassState // Export the reset action
} = classSlice.actions;

export default classSlice.reducer;
