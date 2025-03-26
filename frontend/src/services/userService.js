import axios from 'axios';

// Cache for user profile data
const userProfileCache = new Map();

const userService = {
  /**
   * Get current user profile based on role
   */
  getCurrentUserProfile: async (role) => {
    const endpoint = role === 'Teacher' 
      ? 'http://localhost:8080/teacher/profile'
      : 'http://localhost:8080/student/profile';
    
    try {
      console.log(`Fetching current user profile for ${role}`);
      const response = await axios.get(endpoint, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const user = role === 'Teacher' ? response.data.teacher : response.data.student;
        if (user) {
          console.log(`Found ${role} profile:`, user.name);
          return user;
        }
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ${role} profile:`, error);
      return null;
    }
  },
  
  /**
   * Get user by ID with caching
   */
  getUserById: async (userId, role) => {
    if (userProfileCache.has(userId)) {
      return userProfileCache.get(userId);
    }
    
    const endpoint = role === 'Teacher'
      ? `http://localhost:8080/teacher/profile/${userId}`
      : `http://localhost:8080/student/profile/${userId}`;
    
    try {
      const response = await axios.get(endpoint);
      if (response.data.success) {
        const user = role === 'Teacher' ? response.data.teacher : response.data.student;
        if (user) {
          userProfileCache.set(userId, user);
          return user;
        }
      }
      return null;
    } catch (error) {
      console.error(`Error fetching user by ID:`, error);
      return null;
    }
  }
};

export default userService;
