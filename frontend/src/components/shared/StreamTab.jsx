import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CreateAnnouncementForm from './CreateAnnouncementForm';
import { formatDistanceToNow } from 'date-fns';
import { Send, Link, File, Image, Calendar, Paperclip, User, Clock, Trash2, MoreVertical, Edit, Pencil } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux'; // Import useSelector hook
import userService from '../../services/userService';
import Swal from 'sweetalert2'; // Add this import at the top with other imports

const defaultClassData = {
  coverImage: 'https://gstatic.com/classroom/themes/img_code.jpg', // default cover image
  section: 'Loading...',
  className: 'Loading...',
  teachers: [{ name: 'Teacher' }],
  classCode: 'Loading...',
  announcements: []
};

const StreamTab = ({ classData = defaultClassData, userRole }) => {
  const isTeacher = userRole === 'Teacher';
  
  // Get authenticated user information from Redux store
  const teacherState = useSelector(state => state.teacher);
  const studentState = useSelector(state => state.student);
  
  // Extract the IDs correctly
  const teacherId = teacherState?.teacherId || null;
  const studentId = studentState?.studentId || null;
  
  // Log complete state for debugging
  useEffect(() => {
    if (!isTeacher) {
      console.log("Complete student state:", JSON.stringify(studentState, null, 2));
      console.log("Student ID from state:", studentId);
      
      // Find user ID in local storage as backup
      const localStorageData = localStorage.getItem('persist:root');
      if (localStorageData) {
        try {
          const parsedData = JSON.parse(localStorageData);
          if (parsedData.student) {
            const studentData = JSON.parse(parsedData.student);
            console.log("Student data from localStorage:", studentData);
            if (studentData.studentId && !studentId) {
              console.log("Found student ID in localStorage:", studentData.studentId);
              // We could use this ID as a backup
            }
          }
        } catch (e) {
          console.error("Error parsing localStorage:", e);
        }
      }
    }
  }, [isTeacher, studentState, studentId]);
  
  // Get people data from class slice if available
  const classState = useSelector(state => state.class);
  const peopleData = classState?.people?.data;
  
  // Find actual student name if this is a student user
  const [studentName, setStudentName] = useState("Student");
  const [actualStudentId, setActualStudentId] = useState(null);
  
  // Use custom logic to find student ID if not available in Redux
  useEffect(() => {
    // If Redux has student ID, use it
    if (studentId) {
      setActualStudentId(studentId);
      return;
    }
    
    // Try to find the student ID from people data
    if (!isTeacher && peopleData?.students && peopleData.students.length > 0) {
      // If there's only one student, assume it's the current user (for demo purposes)
      if (peopleData.students.length === 1) {
        console.log("Only one student in class, assuming it's the current user");
        setActualStudentId(peopleData.students[0]._id);
      }
    }
  }, [isTeacher, studentId, peopleData]);
  
  // Look up actual student name from people data if available
  useEffect(() => {
    if (!isTeacher && peopleData?.students) {
      // Try with actual student ID first
      const studentIdToUse = actualStudentId || studentId;
      
      if (studentIdToUse) {
        const currentStudent = peopleData.students.find(s => s._id === studentIdToUse);
        if (currentStudent?.name) {
          console.log("✅ Found student name in Redux store:", currentStudent.name);
          setStudentName(currentStudent.name);
        } else {
          console.log("Student not found with ID:", studentIdToUse);
        }
      } else if (peopleData.students.length > 0) {
        // If we still don't have an ID but have students, use the first one for demo
        console.log("Using first student in class for demo:", peopleData.students[0].name);
        setStudentName(peopleData.students[0].name);
        setActualStudentId(peopleData.students[0]._id);
      }
    }
  }, [isTeacher, peopleData, studentId, actualStudentId]);
  
  // Function to fetch student info directly if not in redux store
  const fetchStudentInfo = async () => {
    if (!studentId) return;
    
    try {
      console.log("Fetching student info for ID:", studentId);
      const response = await axios.get(`http://localhost:8080/student/profile/${studentId}`);
      if (response.data.success && response.data.student) {
        console.log("Fetched student data:", response.data.student);
        setStudentName(response.data.student.name);
      }
    } catch (error) {
      console.error("Error fetching student info:", error);
    }
  };
  
  // First, define the safe class data
  const safeClassData = {
    ...defaultClassData,
    ...classData,
    teachers: classData?.teachers || defaultClassData.teachers,
    classCode: classData?.classCode || 'Loading...'
  };
  
  // After safeClassData is defined, we can use it for other state initializations
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  
  // Get the actual teacher name from the class data
  const [actualTeacherName, setActualTeacherName] = useState(
    safeClassData.teachers[0]?.name || "Teacher"
  );
  
  // Update teacher name whenever class data changes
  useEffect(() => {
    if (classData?.teachers?.[0]?.name) {
      setActualTeacherName(classData.teachers[0].name);
    } else {
      setActualTeacherName("Teacher");
    }
  }, [classData]);
  
  // Fetch announcements when class data changes
  useEffect(() => {
    if (classData?._id) {
      fetchAnnouncements(classData._id);
    } else if (classData?.announcements?.length > 0) {
      setAnnouncements(classData.announcements);
      setIsLoading(false);
    }
  }, [classData]);
  
  // Add a state for verified user profile
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  
  // Fetch current user profile when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await userService.getCurrentUserProfile(userRole);
        if (profile) {
          console.log(`Got current user profile:`, profile);
          setCurrentUserProfile(profile);
          
          // If this is a student, update the student name
          if (!isTeacher) {
            setStudentName(profile.name);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    fetchUserProfile();
  }, [isTeacher, userRole]);
  
  // Helper functions for author display
  const getAuthorName = (post) => {
    // If the current user is a teacher and this post is by a teacher, display "You"
    if (isTeacher && post.authorRole === 'Teacher') {
      return "You";
    }
    
    // For students or teacher viewing student posts, show the actual name
    return post.author?.name || actualTeacherName;
  };
  
  const getAuthorInitial = (post) => {
    // If the current user is a teacher and this post is by a teacher, display "Y"
    if (isTeacher && post.authorRole === 'Teacher') {
      return "Y";
    }
    
    // For students or teacher viewing student posts, show the actual initial
    return (post.author?.name || actualTeacherName).charAt(0);
  };
  
  const fetchAnnouncements = async (classId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:8080/class/${classId}/basic`);
      if (response.data.success && response.data.class.announcements) {
        setAnnouncements(response.data.class.announcements);
      } else {
        console.warn('No announcements found in API response');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnnouncement = async (content) => {
    try {
      setIsLoading(true);
      
      // Create temporary announcement with correct author name
      const tempAnnouncement = {
        _id: Date.now().toString(),
        content,
        author: { 
          // If teacher, show "You" in the UI but still pass the actual name to server
          name: isTeacher ? "You" : actualTeacherName
        },
        authorRole: 'Teacher',
        createdAt: new Date().toISOString(),
        attachments: []
      };
      
      // Update UI immediately
      setAnnouncements([tempAnnouncement, ...announcements]);
      
      try {
        // Save to server with the actual teacher name, not "You"
        const response = await axios.post(
          'http://localhost:8080/class/announcement', 
          { 
            classId: safeClassData._id, 
            content,
            authorName: actualTeacherName // Always send the actual name to the server
          }
        );
        
        if (response.data.success) {
          await fetchAnnouncements(safeClassData._id);
        }
      } catch (error) {
        console.error('API error:', error);
      }
    } catch (error) {
      console.error('Error creating announcement:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      // Replace window.confirm with SweetAlert
      const result = await Swal.fire({
        title: 'Delete Announcement',
        text: 'Are you sure you want to delete this announcement?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });
      
      if (!result.isConfirmed) return;
      
      setIsLoading(true);
      
      // Optimistic UI update
      setAnnouncements(announcements.filter(a => a._id !== announcementId));
      
      await axios.delete('http://localhost:8080/class/announcement', {
        data: {
          classId: safeClassData._id,
          announcementId
        }
      });
      
      // Success toast
      Swal.fire({
        title: 'Deleted!',
        text: 'The announcement has been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      await fetchAnnouncements(safeClassData._id);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      
      // Error toast
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete announcement. Please try again.',
        icon: 'error'
      });
      
      await fetchAnnouncements(safeClassData._id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (announcementId, commentId) => {
    try {
      // Replace window.confirm with SweetAlert
      const result = await Swal.fire({
        title: 'Delete Comment',
        text: 'Are you sure you want to delete this comment?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });
      
      if (!result.isConfirmed) return;
      
      setIsLoading(true);
      
      // Optimistic UI update
      const updatedAnnouncements = announcements.map(announcement => {
        if (announcement._id === announcementId) {
          return {
            ...announcement,
            comments: announcement.comments.filter(
              comment => comment._id !== commentId
            )
          };
        }
        return announcement;
      });
      
      setAnnouncements(updatedAnnouncements);
      
      // Send delete request to the server
      await axios.delete('http://localhost:8080/class/announcement/comment', {
        data: {
          classId: safeClassData._id,
          announcementId,
          commentId
        }
      });
      
      // Success toast
      Swal.fire({
        title: 'Deleted!',
        text: 'The comment has been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Fetch updated data
      await fetchAnnouncements(safeClassData._id);
    } catch (error) {
      console.error('Error deleting comment:', error);
      
      // Error toast
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete comment. Please try again.',
        icon: 'error'
      });
      
      await fetchAnnouncements(safeClassData._id);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a helper function to check if the logged-in user is the author of a comment
  const isCommentAuthor = (comment) => {
    console.log('Checking isCommentAuthor for comment:', comment);
    console.log('Current user ID:', studentId || teacherId);
    console.log('Comment author ID:', comment.author?.id);
  
    // Teachers can delete any comment; students can delete only their own
    return userRole === 'Teacher' || comment.author?.id === (studentId || teacherId);
  };

  const handleCommentSubmit = async (announcementId, commentText) => {
    if (!commentText.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Use our verified profile name if available
      const currentUser = {
        name: isTeacher ? actualTeacherName : (currentUserProfile?.name || studentName),
        role: isTeacher ? "Teacher" : "Student",
        id: isTeacher ? teacherId : (currentUserProfile?._id || actualStudentId || studentId)
      };
      
      console.log("📝 Submitting comment as:", currentUser.name);
      console.log("👤 User role:", currentUser.role);
      console.log("🆔 User ID:", currentUser.id);
      
      // Create temporary comment with verified name
      const tempComment = {
        _id: Date.now().toString(),
        content: commentText,
        author: {
          name: isTeacher ? "You" : currentUser.name,
          id: currentUser.id
        },
        authorRole: currentUser.role,
        createdAt: new Date().toISOString()
      };
      
      // Update UI optimistically with verified name
      const updatedAnnouncements = announcements.map(announcement => {
        if (announcement._id === announcementId) {
          return {
            ...announcement,
            comments: [...(announcement.comments || []), tempComment]
          };
        }
        return announcement;
      });
      
      setAnnouncements(updatedAnnouncements);
      
      // Clear input field
      setCommentInputs({
        ...commentInputs,
        [announcementId]: ''
      });
      
      // Send to server with detailed user info
      const response = await axios.post('http://localhost:8080/class/announcement/comment', {
        classId: safeClassData._id,
        announcementId,
        content: commentText,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        userId: currentUser.id
      }, {
        withCredentials: true // Include cookies for authentication
      });
      
      console.log("Server response for comment:", response.data);
      
      // Instead of refreshing all announcements, update only the specific one
      if (response.data.success && response.data.comment) {
        const serverComment = response.data.comment;
        
        // Keep the verified name for display
        if (!isTeacher) {
          serverComment.author.name = currentUser.name;
        }
        
        // Replace the temporary comment with the server response
        const finalUpdatedAnnouncements = announcements.map(announcement => {
          if (announcement._id === announcementId) {
            const comments = announcement.comments.filter(c => c._id !== tempComment._id);
            return {
              ...announcement,
              comments: [...comments, serverComment]
            };
          }
          return announcement;
        });
        
        setAnnouncements(finalUpdatedAnnouncements);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to fetch student data when needed
  const fetchPeopleData = async () => {
    if (!safeClassData._id) return;
    
    try {
      console.log("Fetching people data for class:", safeClassData._id);
      const response = await axios.get(`http://localhost:8080/class/${safeClassData._id}/people`);
      
      console.log("API People Response:", response.data);
      
      if (response.data.success && response.data.people?.students?.length > 0) {
        // Store all students for easier debugging
        console.log("All students in class:", response.data.people.students.map(s => ({
          id: s._id,
          name: s.name
        })));
        
        // If we have a student ID, find the current student
        const studentIdToUse = actualStudentId || studentId;
        if (studentIdToUse) {
          const currentStudent = response.data.people.students.find(s => s._id === studentIdToUse);
          if (currentStudent?.name) {
            console.log("✅ Found student name in API response:", currentStudent.name);
            setStudentName(currentStudent.name);
          } else {
            console.log("⚠️ Student with ID", studentIdToUse, "not found in class roster");
            // If not found by ID but there are students, use the first one for demo
            setStudentName(response.data.people.students[0].name);
            setActualStudentId(response.data.people.students[0]._id);
          }
        } else if (response.data.people.students.length > 0) {
          // If we don't have an ID but have students, use the first one for demo
          console.log("Using first student for demo:", response.data.people.students[0].name);
          setStudentName(response.data.people.students[0].name);
          setActualStudentId(response.data.people.students[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching people data:", error);
    }
  };
  
  // Call fetchPeopleData when needed
  useEffect(() => {
    if (!isTeacher && !peopleData && safeClassData._id) {
      fetchPeopleData();
    }
  }, [isTeacher, peopleData, safeClassData._id]);

  // Add state for comment actions menu
  const [activeCommentMenu, setActiveCommentMenu] = useState(null);
  // Add hover state for comment action buttons
  const [hoverState, setHoverState] = useState({});

  // Toggle comment menu function
  const toggleCommentMenu = (commentId, e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    if (activeCommentMenu === commentId) {
      setActiveCommentMenu(null);
    } else {
      setActiveCommentMenu(commentId);
    }
  };
  
  // Handle document clicks to close active menu
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeCommentMenu) {
        setActiveCommentMenu(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeCommentMenu]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-6"
    >
      {/* Class banner with improved glass effect */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-72 rounded-2xl relative bg-cover bg-center mb-8 overflow-hidden"
        style={{ 
          backgroundImage: `url(${safeClassData.coverImage})`,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.2) 100%)'
        }}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-0 left-0 right-0 p-8"
          >
            <div className="inline-block px-4 py-1.5 rounded-full mb-4" 
                style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.3)', 
                  backdropFilter: 'blur(10px)'
                }}>
              <span className="text-white text-sm font-medium">{safeClassData.section}</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              {safeClassData.className}
            </h1>
            <div className="flex items-center flex-wrap gap-2">
              <div className="px-4 py-1.5 rounded-full flex items-center space-x-2" 
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                    backdropFilter: 'blur(10px)'
                  }}>
                <User size={14} style={{ color: 'white' }} />
                <span className="text-sm text-white">
                  Teacher: {isTeacher ? "You" : actualTeacherName}
                </span>
              </div>
                {isTeacher && safeClassData.classCode !== 'Loading...' && (
                  <div className="px-4 py-1.5 rounded-full flex items-center space-x-2"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                        backdropFilter: 'blur(10px)'
                      }}>
                    <span className="text-sm text-white">Class Code: {safeClassData.classCode}</span>
                  </div>
                )}
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Announcement form - always visible for teachers */}
      {isTeacher && (
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <CreateAnnouncementForm
            onSubmit={handleCreateAnnouncement}
            isLoading={isLoading}
          />
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Announcements list with professional design */}
      <div className="space-y-6">
        {!isLoading && announcements.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500">No announcements yet. Be the first to post!</p>
          </div>
        )}
        
        {announcements.map((post, index) => (
          <motion.div
            key={post._id || `announcement-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl overflow-hidden shadow-sm"
          >
            <div className="p-6">
              <div className="flex items-center mb-4 justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" 
                       style={{ backgroundColor: '#1b68b3', color: 'white' }}>
                    {getAuthorInitial(post)}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900">
                        {getAuthorName(post)}
                      </h3>
                      {(post.authorRole === 'Teacher') && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                          Teacher
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-xs mt-1 text-gray-500">
                      <Clock size={12} className="mr-1" />
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                
                {/* Add delete button for teacher */}
                {isTeacher && (
                  <button 
                    onClick={() => handleDeleteAnnouncement(post._id)}
                    className="p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Delete announcement"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                )}
              </div>
              
              <p className="whitespace-pre-wrap mb-4 leading-relaxed text-gray-700">{post.content}</p>
              
              {/* Attachments with improved UI */}
              {post.attachments?.length > 0 && (
                <div className="mt-4 mb-4">
                  {post.attachments.map((attachment, i) => {
                    const [isHovered, setIsHovered] = useState(false);
                    return (
                      <div 
                        key={`${post._id}-attachment-${i}`} // Added unique key
                        className="flex items-center p-3 border rounded-lg transition-colors"
                        style={{
                          backgroundColor: isHovered ? '#eff6ff' : '#f9fafb',
                          borderColor: isHovered ? '#bfdbfe' : '#e5e7eb',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                      >
                        <div className="p-2 rounded-md mr-3" style={{ backgroundColor: '#dbeafe' }}>
                          <File className="w-5 h-5" style={{ color: '#2563eb' }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: '#2563eb' }}>{attachment.name}</p>
                          <p className="text-xs" style={{ color: '#6b7280' }}>PDF Document</p>
                        </div>
                        <button className="p-2 rounded-full" style={{ backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                          <Paperclip className="w-4 h-4" style={{ color: isHovered ? '#1b68b3' : '#6b7280' }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Display comments */}
              {post.comments && post.comments.length > 0 && (
                <div className="mt-4 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
                  <div className="space-y-3">
                    {post.comments.map((comment, commentIndex) => (
                      <div key={comment._id || `comment-${commentIndex}`} className="flex items-start group relative">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3" 
                             style={{ backgroundColor: comment.authorRole === 'Teacher' ? '#1e40af' : '#4b5563', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          {/* Display appropriate initial */}
                          {isTeacher && comment.authorRole === 'Teacher' ? 'Y' : comment.author?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 relative">
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 transition-shadow hover:shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900 text-sm">
                                  {isTeacher && comment.authorRole === 'Teacher' ? 'You' : comment.author?.name || 'User'}
                                </span>
                                {comment.authorRole === 'Teacher' && (
                                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
                                    Teacher
                                  </span>
                                )}
                              </div>
                              
                              {/* Comment actions menu button - styled more elegantly with white background */}
                              {isCommentAuthor(comment) && (
                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                  <button 
                                    onClick={(e) => toggleCommentMenu(comment._id, e)}
                                    onMouseEnter={() => setHoverState({ ...hoverState, [comment._id]: true })}
                                    onMouseLeave={() => setHoverState({ ...hoverState, [comment._id]: false })}
                                    className={`p-1.5 rounded-full transition-all duration-200 ${
                                      activeCommentMenu === comment._id ? 'bg-gray-100' : 
                                      hoverState[comment._id] ? 'bg-gray-50' : 'bg-white'
                                    }`}
                                    style={{ backgroundColor: 'white' }}
                                    title="Comment actions"
                                  >
                                    <MoreVertical size={14} className={
                                      activeCommentMenu === comment._id ? 'text-gray-700' : 
                                      hoverState[comment._id] ? 'text-gray-600' : 'text-gray-400'
                                    } />
                                  </button>
                                  
                                  {/* Enhanced dropdown menu with elegant styling */}
                                  {activeCommentMenu === comment._id && (
                                    <div 
                                      className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-10 py-2 w-32 transform origin-top-right transition-transform"
                                      style={{ 
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                        animation: 'scaleIn 0.2s ease-out',
                                        backgroundColor: 'white' 
                                      }}
                                    >
                                      {/* Only delete option with white background */}
                                      <button 
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-all duration-200 group"
                                        style={{ backgroundColor: 'white' }}
                                        onClick={() => {
                                          handleDeleteComment(post._id, comment._id);
                                          setActiveCommentMenu(null);
                                        }}
                                      >
                                        <Trash2 size={15} className="mr-2 text-gray-500 group-hover:text-red-500 transition-colors" />
                                        <span className="font-medium">Delete</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <p className="text-gray-800 text-sm">{comment.content}</p>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 ml-2">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Comment input - remove initial circle */}
              <div className="mt-4 pt-3 flex items-center" style={{ borderTop: post.comments?.length ? 'none' : '1px solid #f3f4f6' }}>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Add class comment..." 
                    className="w-full py-2 px-3 bg-white border-2 border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                    style={{ 
                      transition: 'all 0.2s ease', 
                      color: '#333333', 
                      fontWeight: '500',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    value={commentInputs[post._id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCommentSubmit(post._id, commentInputs[post._id] || '');
                      }
                    }}
                  />
                </div>
                <button 
                  className="ml-2 p-2 rounded-full" 
                  style={{ backgroundColor: 'rgba(27, 104, 179, 0.1)', color: '#1b68b3' }}
                  onClick={() => handleCommentSubmit(post._id, commentInputs[post._id] || '')}
                  disabled={!commentInputs[post._id]?.trim()}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Add a style block for animations */}
      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default StreamTab;
