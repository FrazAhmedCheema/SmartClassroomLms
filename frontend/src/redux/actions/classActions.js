import axios from 'axios';
import {
  fetchBasicInfoStart, fetchBasicInfoSuccess, fetchBasicInfoFailure,
  fetchClassworkStart, fetchClassworkSuccess, fetchClassworkFailure, addClasswork, updateClasswork, removeClasswork,
  fetchTopicsStart, fetchTopicsSuccess, fetchTopicsFailure, addTopic, updateTopic, removeTopic,
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
  if (!classId) {
    console.error('Class ID is missing. Cannot fetch class info.');
    return;
  }

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

// Topic-related actions
export const fetchTopics = (classId) => async (dispatch, getState) => {
  if (!classId) return;
  
  const { topics } = getState().class;
  if (topics.data && isCacheValid(topics.lastFetched)) {
    return; // Use cached data
  }
  
  dispatch(fetchTopicsStart());
  try {
    const response = await api.get(`/classwork/topics/${classId}`);
    if (response.data.success) {
      dispatch(fetchTopicsSuccess(response.data.topics));
    } else {
      throw new Error(response.data.message || 'Failed to fetch topics');
    }
  } catch (error) {
    console.error('Error fetching topics:', error);
    dispatch(fetchTopicsFailure(error.message));
  }
};

export const createTopic = (classId, topicData) => async (dispatch) => {
  try {
    const { name, category } = topicData; // Ensure only required fields are sent
    const response = await api.post(`/classwork/topics`, { name, category, classId });
    if (response.data.success) {
      dispatch(addTopic(response.data.topic));
      return { success: true, topic: response.data.topic };
    } else {
      throw new Error(response.data.message || 'Failed to create topic');
    }
  } catch (error) {
    console.error('Error creating topic:', error);
    return { success: false, error: error.response?.data?.message || error.message || 'Failed to create topic' };
  }
};

export const updateTopicAction = (topicId, topicData) => async (dispatch) => {
  try {
    const response = await api.put(`/classwork/topics/${topicId}`, topicData);
    if (response.data.success) {
      dispatch(updateTopic(response.data.topic));
      return { success: true, topic: response.data.topic };
    } else {
      throw new Error(response.data.message || 'Failed to update topic');
    }
  } catch (error) {
    console.error('Error updating topic:', error);
    return { success: false, error: error.response?.data?.message || error.message || 'Failed to update topic' };
  }
};

export const deleteTopicAction = (topicId) => async (dispatch) => {
  try {
    const response = await api.delete(`/classwork/topics/${topicId}`);
    if (response.data.success) {
      dispatch(removeTopic(topicId));
      return { success: true, message: response.data.message };
    } else {
      throw new Error(response.data.message || 'Failed to delete topic');
    }
  } catch (error) {
    console.error('Error deleting topic:', error);
    return { success: false, error: error.message || 'Failed to delete topic' };
  }
};

// Classwork-related actions
export const fetchClasswork = (classId, topicId = null) => async (dispatch, getState) => {
  if (!classId) return;
  
  const { classwork } = getState().class;
  const useCache = classwork.data && isCacheValid(classwork.lastFetched) && !topicId;
  
  if (useCache) {
    return;
  }
  
  dispatch(fetchClassworkStart());
  try {
    const response = await api.get(`/assignment/${classId}`);
    
    if (response.data.success) {
      dispatch(fetchClassworkSuccess(response.data.assignments));
    } else {
      throw new Error(response.data.message || 'Failed to fetch assignments');
    }
  } catch (error) {
    console.error('Error fetching assignments:', error);
    dispatch(fetchClassworkFailure(error.message));
  }
};

export const getClassworkItem = async (classworkId) => {
  try {
    const response = await api.get(`/classwork/item/${classworkId}`);
    if (response.data.success) {
      return { 
        success: true, 
        classwork: response.data.classwork,
        typeSpecificData: response.data.typeSpecificData
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch classwork item');
    }
  } catch (error) {
    console.error('Error fetching classwork item:', error);
    return { success: false, error: error.message || 'Failed to fetch classwork item' };
  }
};

export const createClassworkItem = (classId, formData, files) => async (dispatch) => {
  try {
    // Create FormData for both assignments and quizzes
    const payload = {
      title: formData.title,
      instructions: formData.instructions || '',
      // payload.type should be 'assignment' or 'quiz'
      type: formData.type || 'assignment',
      points: formData.points,
      dueDate: formData.dueDate,
      createdBy: formData.createdBy,
      topicId: formData.topicId
    };

    const data = new FormData();
    
    // Add form fields
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        data.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    });
    
    // Add files if any
    if (files?.length > 0) {
      files.forEach(file => {
        data.append('files', file);
      });
    }
    
    // Determine endpoint based on type: quiz or assignment
    const endpoint = payload.type === 'quiz'
      ? `/quiz/${classId}/create-quiz`
      : `/assignment/${classId}/create-assignment`;
    
    const response = await api.post(endpoint, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    if (response.data.success) {
      // Use quiz key if available; fallback to assignment
      dispatch(addClasswork(response.data.quiz || response.data.assignment));
      return { success: true, assignment: response.data.quiz || response.data.assignment };
    } else {
      throw new Error(response.data.message || 'Failed to create classwork item');
    }
  } catch (error) {
    console.error('Error creating assignment:', error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const updateClassworkItem = (classworkId, formData, files) => async (dispatch) => {
  try {
    // Create FormData object for file uploads
    const data = new FormData();
    
    // Add form fields to FormData
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        data.append(key, value);
      }
    });
    
    // Add files to FormData
    if (files && files.length > 0) {
      files.forEach(file => {
        data.append('files', file);
      });
    }
    
    // Send the request
    const response = await axios.put(`http://localhost:8080/classwork/item/${classworkId}`, data, {
      withCredentials: true,
    });
    
    if (response.data.success) {
      dispatch(updateClasswork(response.data.classwork));
      return { 
        success: true, 
        classwork: response.data.classwork, 
        message: response.data.message 
      };
    } else {
      throw new Error(response.data.message || 'Failed to update classwork item');
    }
  } catch (error) {
    console.error('Error updating classwork item:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to update classwork item'
    };
  }
};

export const deleteClassworkItem = (classworkId) => async (dispatch) => {
  try {
    const response = await api.delete(`/classwork/item/${classworkId}`);
    if (response.data.success) {
      dispatch(removeClasswork(classworkId));
      return { success: true, message: response.data.message };
    } else {
      throw new Error(response.data.message || 'Failed to delete classwork item');
    }
  } catch (error) {
    console.error('Error deleting classwork item:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to delete classwork item'
    };
  }
};

export const removeClassworkAttachment = (classworkId, attachmentId) => async (dispatch) => {
  try {
    const response = await api.delete(`/classwork/item/${classworkId}/attachment/${attachmentId}`);
    if (response.data.success) {
      dispatch(updateClasswork(response.data.classwork));
      return { 
        success: true, 
        classwork: response.data.classwork, 
        message: response.data.message 
      };
    } else {
      throw new Error(response.data.message || 'Failed to remove attachment');
    }
  } catch (error) {
    console.error('Error removing attachment:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to remove attachment'
    };
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
