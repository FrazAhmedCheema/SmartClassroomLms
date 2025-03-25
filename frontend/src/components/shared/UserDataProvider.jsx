import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { fetchPeople } from '../../redux/actions/classActions';

// Create a context for user data
const UserDataContext = createContext();

export const UserDataProvider = ({ children, classId }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  
  // Get auth states
  const teacherState = useSelector(state => state.teacher);
  const studentState = useSelector(state => state.student);
  const userId = teacherState.isAuthenticated ? teacherState.teacherId : studentState.isAuthenticated ? studentState.studentId : null;
  const userRole = teacherState.isAuthenticated ? 'teacher' : 'student';
  
  // Get people data from class slice
  const peopleData = useSelector(state => state.class.people.data);
  
  // Current user data
  const [userData, setUserData] = useState({
    name: userRole === 'teacher' ? 'Teacher' : 'Student',
    id: userId,
    role: userRole
  });
  
  // Fetch people data if we don't have it
  useEffect(() => {
    if (classId && !peopleData && userId) {
      dispatch(fetchPeople(classId));
    }
  }, [classId, peopleData, userId, dispatch]);
  
  // Update user data when people data changes
  useEffect(() => {
    if (peopleData && userId) {
      if (userRole === 'teacher' && peopleData.teacher) {
        setUserData({
          name: peopleData.teacher.name,
          id: userId,
          role: 'teacher'
        });
      } else if (userRole === 'student' && peopleData.students) {
        const student = peopleData.students.find(s => s._id.toString() === userId);
        if (student) {
          setUserData({
            name: student.name,
            id: userId,
            role: 'student'
          });
        }
      }
      setLoading(false);
    }
  }, [peopleData, userId, userRole]);
  
  return (
    <UserDataContext.Provider value={{ userData, loading }}>
      {children}
    </UserDataContext.Provider>
  );
};

// Custom hook to use the user data
export const useUserData = () => useContext(UserDataContext);

export default UserDataProvider;
