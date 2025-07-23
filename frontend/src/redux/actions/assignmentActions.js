import axios from 'axios';
import { 
  FETCH_ASSIGNMENTS_REQUEST,
  FETCH_ASSIGNMENTS_SUCCESS,
  FETCH_ASSIGNMENTS_FAILURE,
  FETCH_TEACHER_ASSIGNMENTS_REQUEST,
  FETCH_TEACHER_ASSIGNMENTS_SUCCESS,
  FETCH_TEACHER_ASSIGNMENTS_FAILURE
} from '../constants/assignmentConstants';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Action to fetch assignments for a student
export const fetchAssignments = () => async (dispatch, getState) => {
  try {
    dispatch({ type: FETCH_ASSIGNMENTS_REQUEST });

    console.log('Fetching student assignments...');
    const { data } = await api.get('/assignment/student-assignments');
    console.log('Received student assignments data:', data);

    dispatch({
      type: FETCH_ASSIGNMENTS_SUCCESS,
      payload: data.assignments
    });

    return { success: true, assignments: data.assignments };
  } catch (error) {
    console.error('Error in fetchAssignments:', error);
    dispatch({
      type: FETCH_ASSIGNMENTS_FAILURE,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    });
    return { success: false, message: error.message };
  }
};

// Action to fetch assignments for a teacher
export const fetchTeacherAssignments = () => async (dispatch, getState) => {
  try {
    dispatch({ type: FETCH_TEACHER_ASSIGNMENTS_REQUEST });

    console.log('Fetching teacher assignments...');
    const { data } = await api.get('/assignment/teacher-assignments');
    console.log('Received teacher assignments data:', data);

    dispatch({
      type: FETCH_TEACHER_ASSIGNMENTS_SUCCESS,
      payload: data.assignments
    });

    return { success: true, assignments: data.assignments };
  } catch (error) {
    console.error('Error in fetchTeacherAssignments:', error);
    dispatch({
      type: FETCH_TEACHER_ASSIGNMENTS_FAILURE,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    });
    return { success: false, message: error.message };
  }
};
