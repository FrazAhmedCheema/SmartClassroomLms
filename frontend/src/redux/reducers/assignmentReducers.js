import {
  FETCH_ASSIGNMENTS_REQUEST,
  FETCH_ASSIGNMENTS_SUCCESS,
  FETCH_ASSIGNMENTS_FAILURE,
  FETCH_TEACHER_ASSIGNMENTS_REQUEST,
  FETCH_TEACHER_ASSIGNMENTS_SUCCESS,
  FETCH_TEACHER_ASSIGNMENTS_FAILURE
} from '../constants/assignmentConstants';

const initialState = {
  assignments: [],
  teacherAssignments: [],
  loading: false,
  error: null
};

export const assignmentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ASSIGNMENTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case FETCH_ASSIGNMENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        assignments: action.payload
      };
    case FETCH_ASSIGNMENTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case FETCH_TEACHER_ASSIGNMENTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case FETCH_TEACHER_ASSIGNMENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        teacherAssignments: action.payload
      };
    case FETCH_TEACHER_ASSIGNMENTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

export default assignmentsReducer;
