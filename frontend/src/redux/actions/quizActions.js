import axios from 'axios';
import { setQuizLoading, setQuizSuccess, setQuizFailure } from '../slices/quizSlice';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchQuizzes = (classId) => async (dispatch) => {
  dispatch(setQuizLoading());
  try {
    const response = await api.get(`/quiz/${classId}`);
    if (response.data.success) {
      dispatch(setQuizSuccess(response.data.quizzes)); // Ensure quizzes are dispatched to Redux
    } else {
      throw new Error(response.data.message || 'Failed to fetch quizzes');
    }
  } catch (error) {
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
