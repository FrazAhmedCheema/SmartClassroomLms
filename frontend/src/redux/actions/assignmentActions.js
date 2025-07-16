import axios from 'axios';
import { 
  FETCH_ASSIGNMENTS_REQUEST,
  FETCH_ASSIGNMENTS_SUCCESS,
  FETCH_ASSIGNMENTS_FAILURE,
  FETCH_TEACHER_ASSIGNMENTS_REQUEST,
  FETCH_TEACHER_ASSIGNMENTS_SUCCESS,
  FETCH_TEACHER_ASSIGNMENTS_FAILURE
} from '../constants/assignmentConstants';

// Action to fetch assignments for a student
export const fetchAssignments = () => async (dispatch, getState) => {
  try {
    dispatch({ type: FETCH_ASSIGNMENTS_REQUEST });

    const { student } = getState();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student.token}`
      },
      withCredentials: true
    };

    const { data } = await axios.get('/api/assignment/student-assignments', config);

    dispatch({
      type: FETCH_ASSIGNMENTS_SUCCESS,
      payload: data.assignments
    });

    return { success: true, assignments: data.assignments };
  } catch (error) {
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

    const { teacher } = getState();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacher.token}`
      },
      withCredentials: true
    };

    console.log('Fetching teacher assignments...');
    const { data } = await axios.get('http://localhost:8080/assignment/teacher-assignments', config);
    console.log('Received assignments data:', data);

    dispatch({
      type: FETCH_TEACHER_ASSIGNMENTS_SUCCESS,
      payload: data.assignments
    });

    return { success: true, assignments: data.assignments };
  } catch (error) {
    dispatch({
      type: FETCH_TEACHER_ASSIGNMENTS_FAILURE,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    });
    return { success: false, message: error.message };
  }
};
