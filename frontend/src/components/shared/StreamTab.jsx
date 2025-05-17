import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import CreateAnnouncementForm from './CreateAnnouncementForm';
import ClassBanner from './ClassBanner';
import AnnouncementCard from './AnnouncementCard';
import { getAuthorName, getAuthorInitial } from './userHelpers';
import { 
  fetchAnnouncements, 
  handleCreateAnnouncement, 
  handleDeleteAnnouncement, 
  handleDeleteComment, 
  handleCommentSubmit,
  fetchPeopleData,
  isCommentAuthor 
} from './streamTabApi';

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
    
    // ... existing fetchStudentInfo implementation ...
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
      console.log("Fetching announcements for class ID:", classData._id);
      fetchAnnouncements(classData._id, setIsLoading, setAnnouncements);
    } else {
      console.warn("Class data is missing or incomplete:", classData);
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
    
    // Comment out for now to prevent errors with missing userService
    // fetchUserProfile();
  }, [isTeacher, userRole]);
  
  // Call fetchPeopleData when needed
  useEffect(() => {
    if (!isTeacher && !peopleData && safeClassData._id) {
      fetchPeopleData(safeClassData, studentId, actualStudentId, setStudentName, setActualStudentId);
    }
  }, [isTeacher, peopleData, safeClassData, studentId, actualStudentId]);

  // Wrapper functions that use the API functions
  const handleCreateAnnouncementWrapper = (content) => {
    handleCreateAnnouncement(
      content, 
      safeClassData, 
      isTeacher, 
      actualTeacherName, 
      announcements, 
      setAnnouncements, 
      setIsLoading, 
      (classId) => fetchAnnouncements(classId, setIsLoading, setAnnouncements)
    );
  };

  const handleDeleteAnnouncementWrapper = (announcementId) => {
    handleDeleteAnnouncement(
      announcementId, 
      safeClassData, 
      announcements, 
      setAnnouncements, 
      setIsLoading, 
      (classId) => fetchAnnouncements(classId, setIsLoading, setAnnouncements)
    );
  };

  const handleDeleteCommentWrapper = (announcementId, commentId) => {
    handleDeleteComment(
      announcementId, 
      commentId, 
      safeClassData, 
      announcements, 
      setAnnouncements, 
      setIsLoading, 
      (classId) => fetchAnnouncements(classId, setIsLoading, setAnnouncements)
    );
  };

  const handleCommentSubmitWrapper = (announcementId, commentText) => {
    handleCommentSubmit(
      announcementId, 
      commentText, 
      safeClassData, 
      isTeacher, 
      actualTeacherName, 
      teacherId, 
      studentName, 
      currentUserProfile, 
      actualStudentId, 
      studentId, 
      announcements, 
      setAnnouncements, 
      setIsLoading, 
      commentInputs, 
      setCommentInputs
    );
  };

  const isCommentAuthorWrapper = (comment) => {
    return isCommentAuthor(comment, userRole, studentId, teacherId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-6"
    >
      <div>
        {(() => {
          try {
            // Main rendering logic
            return (
              <>
                {/* Show warning if class data is missing */}
                {!classData?._id && (
                  <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg text-center">
                    <AlertCircle className="inline-block mr-2" />
                    <span>Class data is unavailable. Please try again later.</span>
                  </div>
                )}

                {/* Class banner */}
                {classData?._id && (
                  <ClassBanner
                    safeClassData={safeClassData}
                    isTeacher={isTeacher}
                    actualTeacherName={actualTeacherName}
                  />
                )}

                {/* Announcement form */}
                {isTeacher && classData?._id && (
                  <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
                    <CreateAnnouncementForm
                      onSubmit={handleCreateAnnouncementWrapper}
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

                {/* Announcements list */}
                <div className="space-y-6">
                  {!isLoading && announcements.length === 0 && (
                    <div className="bg-white rounded-xl p-8 text-center">
                      <p className="text-gray-500">No announcements yet. Be the first to post!</p>
                    </div>
                  )}

                  {announcements.map((post, index) => (
                    <AnnouncementCard
                      key={post._id || `announcement-${index}`}
                      post={post}
                      index={index}
                      isTeacher={isTeacher}
                      getAuthorInitial={(post) =>
                        getAuthorInitial(post, isTeacher, actualTeacherName)
                      }
                      getAuthorName={(post) =>
                        getAuthorName(post, isTeacher, actualTeacherName)
                      }
                      commentInputs={commentInputs}
                      setCommentInputs={setCommentInputs}
                      handleCommentSubmit={handleCommentSubmitWrapper}
                      handleDeleteComment={handleDeleteCommentWrapper}
                      handleDeleteAnnouncement={handleDeleteAnnouncementWrapper}
                      isCommentAuthor={isCommentAuthorWrapper}
                    />
                  ))}
                </div>
              </>
            );
          } catch (error) {
            console.error('Error rendering StreamTab:', error);
            return (
              <div className="text-red-500 text-center">
                <p>Something went wrong while rendering the StreamTab.</p>
              </div>
            );
          }
        })()}
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
