const Class = require('../models/Class');
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const Discussion = require('../models/Discussion');

exports.getClassById = async (req, res) => {
    try {
        // Validate user information
        if (!req.user || !req.user.id || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'User information missing'
            });
        }

        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Find the class by ID and populate students and teacher
        const classData = await Class.findById(id)
            .populate({
                path: 'students',
                select: 'name email registrationId'
            })
            .populate({
                path: 'teacherId',
                select: 'name email'
            });

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Verify access rights
        if (userRole === 'teacher' && classData.teacherId._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this class'
            });
        } else if (userRole === 'student') {
            const student = await Student.findById(userId);
            if (!student.enrolledClasses || !student.enrolledClasses.includes(id)) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not enrolled in this class'
                });
            }
        }

        // Format students array
        const formattedStudents = classData.students.map(student => ({
            id: student._id,
            name: student.name,
            email: student.email,
            registrationId: student.registrationId
        }));

        const formattedResponse = {
            _id: classData._id,
            className: classData.className,
            section: classData.section,
            classCode: classData.classCode,
            teacherId: classData.teacherId._id,
            students: formattedStudents,
            teachers: [
                {
                    id: classData.teacherId._id,
                    name: classData.teacherId.name,
                    email: classData.teacherId.email
                }
            ],
            coverImage: 'https://gstatic.com/classroom/themes/img_code.jpg',
            announcements: [
                {
                    id: 1,
                    author: classData.teacherId.name,
                    authorRole: 'Teacher',
                    content: 'Welcome to our class! Please review the syllabus and let me know if you have any questions.',
                    createdAt: new Date().toISOString(),
                    attachments: [],
                }
            ],
            createdAt: classData.createdAt
        };

        res.status(200).json({
            success: true,
            class: formattedResponse
        });
    } catch (error) {
        console.error('Error in getClassById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching class details',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.getBasicClassInfo = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .select('className section teacherId coverImage announcements classCode')
      .populate('teacherId', 'name email');

    if (!classData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    // Process announcements to ensure they have the proper format
    const processedAnnouncements = classData.announcements.map(announcement => {
      // Make sure author always has a name
      if (!announcement.author || !announcement.author.name) {
        return {
          ...announcement.toObject(),
          author: {
            name: classData.teacherId.name || 'Teacher'
          }
        };
      }
      return announcement;
    });

    const formattedResponse = {
      _id: classData._id,
      className: classData.className,
      section: classData.section,
      classCode: classData.classCode,
      teacherId: classData.teacherId._id,
      teacher: {
        name: classData.teacherId.name,
        email: classData.teacherId.email
      },
      teachers: [
        {
          id: classData.teacherId._id,
          name: classData.teacherId.name,
          email: classData.teacherId.email
        }
      ],
      coverImage: classData.coverImage || 'https://gstatic.com/classroom/themes/img_code.jpg',
      announcements: processedAnnouncements
    };

    res.json({ success: true, class: formattedResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClasswork = async (req, res) => {
  try {
    const classwork = await Class.findById(req.params.id)
      .select('assignments')
      .populate('assignments');
    res.json({ success: true, classwork: classwork.assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPeople = async (req, res) => {
  try {
    const people = await Class.findById(req.params.id)
      .select('students teacherId')
      .populate('students', 'name email registrationId')
      .populate('teacherId', 'name email');
    res.json({ success: true, people: { teacher: people.teacherId, students: people.students } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDiscussionById = async (req, res) => {
  try {
    const { id, topicId } = req.params;
    const classData = await Class.findById(id)
      .select('discussions')
      .populate({
        path: 'discussions',
        match: { _id: topicId },
        populate: {
          path: 'author',
          select: 'name email'
        }
      });

    const discussion = classData?.discussions?.find(d => d._id.toString() === topicId);
    
    if (!discussion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Discussion not found' 
      });
    }

    res.json({ 
      success: true, 
      discussion 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getClassworkById = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    const classData = await Class.findById(id)
      .select('assignments')
      .populate({
        path: 'assignments',
        match: { _id: assignmentId }
      });

    if (!classData?.assignments?.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assignment not found' 
      });
    }

    res.json({ 
      success: true, 
      assignment: classData.assignments[0] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getDiscussions = async (req, res) => {
  try {
    console.log('Fetching discussions for class:', req.params.id);
    
    const classData = await Class.findById(req.params.id)
      .select('discussions')
      .populate({
        path: 'discussions',
        populate: [{
          path: 'author',
          select: 'name email'
        }, {
          path: 'messages.author',
          select: 'name email'
        }]
      });

    if (!classData) {
      console.log('Class not found');
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    // Add debug logging
    console.log('Found discussions:', classData.discussions?.length || 0);
    console.log('Discussion IDs:', classData.discussions?.map(d => d._id));

    res.json({ 
      success: true, 
      discussions: classData.discussions || [] 
    });
  } catch (error) {
    console.error('Error in getDiscussions:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.createAnnouncement = async (req, res) => {
    try {
        console.log('Creating announcement with data:', req.body);
        
        const { classId, content, authorName } = req.body;
        
        if (!classId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Class ID and content are required'
            });
        }
        
        // Find the class with students populated
        const classDoc = await Class.findById(classId);
        if (!classDoc) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        console.log('Found class:', classDoc.className);

        try {
            // Define the announcement structure explicitly matching our desired format
            const newAnnouncement = {
                content: content,
                author: {
                    name: authorName && authorName !== "Loading..." ? authorName : classDoc.teacherId.name || "Teacher"
                },
                authorRole: 'Teacher',
                createdAt: new Date(),
                attachments: []
            };

            console.log('New announcement prepared:', newAnnouncement);

            // Add the announcement to the beginning of the array
            classDoc.announcements.unshift(newAnnouncement);
            await classDoc.save();
            
            console.log('Class saved with new announcement');

            // Create notifications for all students in the class using notification helper
            const { createClassworkNotifications } = require('../utils/notificationHelper');
            const teacherName = newAnnouncement.author.name;
            
            await createClassworkNotifications(
                classId,
                'announcement',
                'Announcement',
                teacherName,
                {
                    announcementId: classDoc.announcements[0]._id
                }
            );

            // Return success response with the full announcement object
            res.status(201).json({
                success: true,
                message: 'Announcement created successfully',
                announcement: classDoc.announcements[0]
            });
        } catch (saveError) {
            console.error('Error saving announcement:', saveError);
            res.status(500).json({
                success: false,
                message: 'Error saving announcement',
                error: saveError.message
            });
        }
    } catch (error) {
        console.error('Error in createAnnouncement controller:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating announcement',
            error: error.message
        });
    }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const { classId, announcementId } = req.body;
    
    if (!classId || !announcementId) {
      return res.status(400).json({
        success: false,
        message: 'Class ID and announcement ID are required'
      });
    }
    
    // Find the class
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Find the announcement index
    const announcementIndex = classDoc.announcements.findIndex(
      announcement => announcement._id.toString() === announcementId
    );
    
    if (announcementIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    // Remove the announcement
    classDoc.announcements.splice(announcementIndex, 1);
    await classDoc.save();
    
    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteAnnouncement:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting announcement',
      error: error.message
    });
  }
};

exports.addComment = async (req, res) => {
    try {
        const { classId, announcementId, content, authorName, authorRole, userId } = req.body;
        // Use userId from request body if available, otherwise fall back to req.user
        const authorId = userId || req.user?.id;
        
        console.log("Comment request details:", {
            classId,
            announcementId,
            authorName,
            authorRole,
            userId: userId || "not provided",
            authUserId: req.user?.id || "not authenticated"
        });
        
        if (!classId || !announcementId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Find the class
        const classDoc = await Class.findById(classId);
        if (!classDoc) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }
        
        // Find the announcement
        const announcement = classDoc.announcements.id(announcementId);
        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }
        
        // Determine the author model based on role
        const authorModelName = authorRole === 'Teacher' ? 'Teacher' : 'Student';
        let verifiedAuthorName = authorName;
        
        // Get the correct user name from database
        try {
            if (authorId) {
                const AuthorModel = mongoose.model(authorModelName);
                const author = await AuthorModel.findById(authorId).select('name');
                
                if (author && author.name) {
                    console.log(`Found ${authorModelName} with ID ${authorId}, name: ${author.name}`);
                    verifiedAuthorName = author.name;
                } else {
                    console.log(`Using provided name as fallback: ${authorName}`);
                }
            }
        } catch (err) {
            console.error("Could not verify author:", err);
        }
        
        // Create new comment
        const newComment = {
            content,
            author: {
                name: verifiedAuthorName || 'Unknown User',
                id: authorId
            },
            authorModel: authorModelName,
            authorRole: authorRole || 'Student',
            createdAt: new Date()
        };
        
        console.log("Final comment data being sent:", newComment);
        
        // Add comment to the announcement
        if (!announcement.comments) {
            announcement.comments = [];
        }
        
        announcement.comments.push(newComment);
        await classDoc.save();
        
        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            comment: newComment
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message
        });
    }
};

exports.deleteComment = async (req, res) => {
  try {
    const { classId, announcementId, commentId } = req.body;
    
    if (!classId || !announcementId || !commentId) {
      return res.status(400).json({
        success: false,
        message: 'Class ID, announcement ID, and comment ID are required'
      });
    }
    
    // Find the class
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Find the announcement
    const announcement = classDoc.announcements.id(announcementId);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    // Find the comment index
    const commentIndex = announcement.comments.findIndex(
      comment => comment._id.toString() === commentId
    );
    
    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Remove the comment
    announcement.comments.splice(commentIndex, 1);
    await classDoc.save();
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteComment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};
