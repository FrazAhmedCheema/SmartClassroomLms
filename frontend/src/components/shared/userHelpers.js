// Helper functions for author display
export const getAuthorName = (post, isTeacher, actualTeacherName) => {
  // If the current user is a teacher and this post is by a teacher, display "You"
  if (isTeacher && post.authorRole === 'Teacher') {
    return "You";
  }
  
  // For students or teacher viewing student posts, show the actual name
  return post.author?.name || actualTeacherName;
};

export const getAuthorInitial = (post, isTeacher, actualTeacherName) => {
  // If the current user is a teacher and this post is by a teacher, display "Y"
  if (isTeacher && post.authorRole === 'Teacher') {
    return "Y";
  }
  
  // For students or teacher viewing student posts, show the actual initial
  return (post.author?.name || actualTeacherName).charAt(0);
};
