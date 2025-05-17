import axios from 'axios';
import {
  fetchBasicInfoStart, fetchBasicInfoSuccess, fetchBasicInfoFailure,
  fetchClassworkStart, fetchClassworkSuccess, fetchClassworkFailure, addClasswork, updateClasswork, removeClasswork,
  fetchTopicsStart, fetchTopicsSuccess, fetchTopicsFailure, addTopic, updateTopic, removeTopic,
  fetchPeopleStart, fetchPeopleSuccess, fetchPeopleFailure,
  fetchDiscussionsStart, fetchDiscussionsSuccess, fetchDiscussionsFailure,
  updateDiscussions,
  setCurrentClass // Add this import
} from '../slices/classSlice';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Update cache validation to check both time and classId
const isCacheValid = (cache, currentClassId) => {
  if (!cache?.lastFetched || !cache?.classId) return false;
  const isTimeValid = Date.now() - cache.lastFetched < CACHE_DURATION;
  const isClassValid = cache.classId === currentClassId;
  return isTimeValid && isClassValid;
};

export const fetchBasicInfo = (classId) => async (dispatch, getState) => {
  if (!classId) {
    console.error('Class ID is missing. Cannot fetch class info.');
    return;
  }

  // First dispatch setCurrentClass action
  dispatch(setCurrentClass(classId));

  const { basicInfo } = getState().class;
  if (basicInfo.data && isCacheValid(basicInfo, classId)) {
    console.log('Using cached basic info data');
    return;
  }

  dispatch(fetchBasicInfoStart());
  try {
    const response = await api.get(`/class/${classId}/basic`);
    if (response.data.success) {
      dispatch(fetchBasicInfoSuccess({
        data: response.data.class,
        classId
      }));
    }
  } catch (error) {
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
export const fetchClasswork = (classId) => async (dispatch, getState) => {
  const state = getState();
  
  // Validate cache for this specific class
  if (isCacheValid(state.class.classwork, classId)) {
    return;
  }

  dispatch(fetchClassworkStart());
  try {
    console.log('Fetching classwork items...');
    const [assignmentsResponse, quizzesResponse, materialsResponse, questionsResponse] = await Promise.all([
      api.get(`/assignment/${classId}`),
      api.get(`/quiz/${classId}`),
      api.get(`/material/${classId}`),
      api.get(`/question/${classId}`) // Add this line to fetch questions
    ]);
    
    console.log('Assignments response:', assignmentsResponse.data);
    console.log('Quizzes response:', quizzesResponse.data);
    console.log('Materials response:', materialsResponse.data);
    console.log('Questions response:', questionsResponse.data);
    
    // Process all responses
    const assignments = assignmentsResponse.data.success ? 
      assignmentsResponse.data.assignments.map(a => ({...a, type: 'assignment'})) : [];
    
    const quizzes = quizzesResponse.data.success ? 
      quizzesResponse.data.quizzes.map(q => ({...q, type: 'quiz'})) : [];
    
    const materials = materialsResponse.data.success ? 
      materialsResponse.data.materials.map(m => ({...m, type: 'material'})) : [];
    
    // Process questions properly
    const questions = questionsResponse.data.success ? 
      questionsResponse.data.questions.map(q => ({...q, type: 'question'})) : [];
    
    console.log('Processed assignments:', assignments.length);
    console.log('Processed quizzes:', quizzes.length);
    console.log('Processed materials:', materials.length);
    console.log('Processed questions:', questions.length);
    
    const allClasswork = [...assignments, ...quizzes, ...materials, ...questions].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    console.log('Combined classwork items:', allClasswork);
    dispatch(fetchClassworkSuccess({
      data: allClasswork,
      classId
    }));
  } catch (error) {
    console.error('Error fetching classwork:', error);
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

export const createClassworkItem = (classId, formData) => async (dispatch) => {
  try {
    let endpoint;

    // Determine the endpoint based on the type
    const type = formData.get('type');
    if (type === 'quiz') {
      endpoint = `/quiz/${classId}/create-quiz`;
    } else if (type === 'material') {
      endpoint = `/material/${classId}/create-material`; // Call the material creation endpoint
    } else if (type === 'question') {
      endpoint = `/question/${classId}/create-question`; // New endpoint for questions
    } else {
      endpoint = `/assignment/${classId}/create-assignment`;
    }

    console.log(`Creating ${type} with endpoint: ${endpoint}`);
    
    const response = await api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.success) {
      const resultData = response.data.quiz || response.data.assignment || 
                         response.data.material || response.data.question;
      
      console.log(`Successfully created ${type}:`, resultData);
      dispatch(addClasswork(resultData));
      return { success: true, classwork: resultData };
    } else {
      throw new Error(response.data.message || 'Failed to create classwork item');
    }
  } catch (error) {
    console.error('Error creating classwork item:', error);
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

export const deleteAssignment = (assignmentId) => async (dispatch) => {
  try {
    const response = await api.delete(`/assignment/${assignmentId}`);
    if (response.data.success) {
      dispatch(removeClasswork(assignmentId)); // Update Redux state immediately
      return { success: true };
    }
    throw new Error(response.data.message || 'Failed to delete assignment');
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return { success: false, error: error.message };
  }
};

export const fetchMaterials = (classId) => async (dispatch) => {
  try {
    const response = await api.get(`/material/${classId}`);
    if (response.data.success) {
      return response.data.materials;
    } else {
      throw new Error(response.data.message || 'Failed to fetch materials');
    }
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
};

export const deleteMaterial = (materialId) => async (dispatch) => {
  try {
    const response = await api.delete(`/material/item/${materialId}`); // Call the correct endpoint
    if (response.data.success) {
      dispatch(removeClasswork(materialId)); // Update Redux state immediately
      return { success: true };
    }
    throw new Error(response.data.message || 'Failed to delete material');
  } catch (error) {
    console.error('Error deleting material:', error);
    return { success: false, error: error.message };
  }
};

// Add delete question action
export const deleteQuestion = (questionId) => async (dispatch) => {
  try {
    const response = await api.delete(`/question/item/${questionId}`);
    if (response.data.success) {
      dispatch(removeClasswork(questionId)); // Update Redux state immediately
      return { success: true };
    }
    throw new Error(response.data.message || 'Failed to delete question');
  } catch (error) {
    console.error('Error deleting question:', error);
    return { success: false, error: error.message };
  }
};

export const submitPollVote = (questionId, response) => async (dispatch) => {
  try {
    const apiResponse = await api.post(`/question/item/${questionId}/vote`, { response });
    if (apiResponse.data.success) {
      // Fetch updated question data to refresh the UI
      const questionResponse = await api.get(`/question/item/${questionId}`);
      if (questionResponse.data.success) {
        dispatch(updateClasswork(questionResponse.data.question));
      }
      return { success: true };
    }
    throw new Error(apiResponse.data.message);
  } catch (error) {
    console.error('Error submitting poll vote:', error);
    return { success: false, error: error.message };
  }
};

export const getPollResults = async (questionId) => {
  try {
    const response = await api.get(`/question/item/${questionId}/results`);
    if (response.data.success) {
      return {
        success: true,
        results: response.data.results,
        totalVotes: response.data.totalVotes
      };
    }
    throw new Error(response.data.message);
  } catch (error) {
    console.error('Error fetching poll results:', error);
    return { success: false, error: error.message };
  }
};

export const clearCache = (classId) => (dispatch) => {
  // Reset state but keep current classId
  dispatch(resetClassState({ keepClassId: true }));
  // Refetch data for current class
  dispatch(fetchBasicInfo(classId));
  dispatch(fetchClasswork(classId));
  // ...other fetch actions
};
