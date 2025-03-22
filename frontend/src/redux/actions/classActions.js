import axios from 'axios';
import {
  fetchBasicInfoStart, fetchBasicInfoSuccess, fetchBasicInfoFailure,
  fetchClassworkStart, fetchClassworkSuccess, fetchClassworkFailure,
  fetchPeopleStart, fetchPeopleSuccess, fetchPeopleFailure,
  fetchDiscussionsStart, fetchDiscussionsSuccess, fetchDiscussionsFailure,
  updateDiscussions,
} from '../slices/classSlice';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const isCacheValid = (lastFetched) => {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < CACHE_DURATION;
};

export const fetchBasicInfo = (classId) => async (dispatch, getState) => {
  if (!classId) return;
  
  const { basicInfo } = getState().class;
  if (basicInfo.data && isCacheValid(basicInfo.lastFetched)) {
    return; // Use cached data
  }
  
  dispatch(fetchBasicInfoStart());
  try {
    const response = await api.get(`/class/${classId}/basic`);
    if (response.data.success) {
      dispatch(fetchBasicInfoSuccess(response.data.class));
    } else {
      throw new Error(response.data.message || 'Failed to fetch class info');
    }
  } catch (error) {
    console.error('Error fetching class info:', error);
    dispatch(fetchBasicInfoFailure(error.message));
  }
};

export const fetchClasswork = (classId) => async (dispatch, getState) => {
  if (!classId) return;
  
  const { classwork } = getState().class;
  if (classwork.data && isCacheValid(classwork.lastFetched)) {
    return; // Use cached data
  }
  
  dispatch(fetchClassworkStart());
  try {
    const response = await api.get(`/class/${classId}/classwork`);
    dispatch(fetchClassworkSuccess(response.data.classwork));
  } catch (error) {
    dispatch(fetchClassworkFailure(error.message));
  }
};

export const fetchPeople = (classId) => async (dispatch, getState) => {
  if (!classId) return;
  
  const { people } = getState().class;
  if (people.data && isCacheValid(people.lastFetched)) {
    return; // Use cached data
  }
  
  dispatch(fetchPeopleStart());
  try {
    const response = await api.get(`/class/${classId}/people`);
    dispatch(fetchPeopleSuccess(response.data.people));
  } catch (error) {
    dispatch(fetchPeopleFailure(error.message));
  }
};

export const fetchDiscussions = (classId) => async (dispatch, getState) => {
  if (!classId) return;
  
  const { discussions } = getState().class;
  // Only fetch if we don't have data or cache is invalid
  if (discussions.data && isCacheValid(discussions.lastFetched)) {
    console.log('Using cached discussions data');
    return;
  }
  
  dispatch(fetchDiscussionsStart());
  try {
    console.log('Fetching fresh discussions data');
    const response = await api.get(`/class/${classId}/discussions`);
    
    // Add timestamp to the response data
    const discussionsWithTimestamp = {
      ...response.data,
      timestamp: Date.now()
    };
    
    dispatch(fetchDiscussionsSuccess(response.data.discussions));
  } catch (error) {
    console.error('Error fetching discussions:', error);
    dispatch(fetchDiscussionsFailure(error.message));
  }
};

export { updateDiscussions };
