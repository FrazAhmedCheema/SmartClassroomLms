import axios from 'axios';
import Swal from 'sweetalert2';

export const fetchAnnouncements = async (classId, setIsLoading, setAnnouncements) => {
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

export const handleCreateAnnouncement = async (content, safeClassData, isTeacher, actualTeacherName, announcements, setAnnouncements, setIsLoading, fetchAnnouncementsFunc) => {
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
        await fetchAnnouncementsFunc(safeClassData._id);
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

export const handleDeleteAnnouncement = async (announcementId, safeClassData, announcements, setAnnouncements, setIsLoading, fetchAnnouncementsFunc) => {
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
    
    await fetchAnnouncementsFunc(safeClassData._id);
  } catch (error) {
    console.error('Error deleting announcement:', error);
    
    // Error toast
    Swal.fire({
      title: 'Error',
      text: 'Failed to delete announcement. Please try again.',
      icon: 'error'
    });
    
    await fetchAnnouncementsFunc(safeClassData._id);
  } finally {
    setIsLoading(false);
  }
};

export const handleDeleteComment = async (announcementId, commentId, safeClassData, announcements, setAnnouncements, setIsLoading, fetchAnnouncementsFunc) => {
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
    await fetchAnnouncementsFunc(safeClassData._id);
  } catch (error) {
    console.error('Error deleting comment:', error);
    
    // Error toast
    Swal.fire({
      title: 'Error',
      text: 'Failed to delete comment. Please try again.',
      icon: 'error'
    });
    
    await fetchAnnouncementsFunc(safeClassData._id);
  } finally {
    setIsLoading(false);
  }
};

export const handleCommentSubmit = async (announcementId, commentText, safeClassData, isTeacher, actualTeacherName, teacherId, studentName, currentUserProfile, actualStudentId, studentId, announcements, setAnnouncements, setIsLoading, commentInputs, setCommentInputs) => {
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

export const fetchPeopleData = async (safeClassData, studentId, actualStudentId, setStudentName, setActualStudentId) => {
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

export const isCommentAuthor = (comment, userRole, studentId, teacherId) => {
  console.log('Checking isCommentAuthor for comment:', comment);
  console.log('Current user ID:', studentId || teacherId);
  console.log('Comment author ID:', comment.author?.id);

  // Teachers can delete any comment; students can delete only their own
  return userRole === 'Teacher' || comment.author?.id === (studentId || teacherId);
};
