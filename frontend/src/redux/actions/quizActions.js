import axios from 'axios';
import { 
  setQuizLoading, 
  setQuizSuccess, 
  setQuizFailure,
  addQuiz,
  removeQuiz
} from '../slices/quizSlice';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchQuizzes = (classId) => async (dispatch, getState) => {
  if (!classId) {
    console.error('Class ID is missing. Cannot fetch quizzes.');
    return;
  }

  const state = getState();
  const quizState = state.quiz || { lastFetched: null };

  // Check cache
  if (quizState.lastFetched && Date.now() - quizState.lastFetched < CACHE_DURATION) {
    console.log('Using cached quiz data');
    return;
  }

  dispatch(setQuizLoading());
  try {
    console.log('Fetching quizzes for class ID:', classId);
    const response = await api.get(`/quiz/${classId}`);
    console.log('API response for quizzes:', response.data);

    if (response.data.success) {
      console.log('Quizzes fetched successfully:', response.data.quizzes);
      dispatch(setQuizSuccess(response.data.quizzes));
    } else {
      throw new Error(response.data.message || 'Failed to fetch quizzes');
    }
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    dispatch(setQuizFailure(error.message));
  }
};

export const fetchQuizItem = async (quizId) => {
  try {
    const response = await api.get(`/quiz/item/${quizId}`);
    if (response.data.success) {
      return { success: true, quiz: response.data.quiz };
    } else {
      throw new Error(response.data.message || 'Failed to fetch quiz');
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteQuiz = (quizId) => async (dispatch) => {
  try {
    const response = await api.delete(`/quiz/item/${quizId}`);
    if (response.data.success) {
      dispatch(removeQuiz(quizId));
      return { payload: { success: true } };
    }
    throw new Error(response.data.message || 'Failed to delete quiz');
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return { payload: { success: false, error: error.message } };
  }
};
