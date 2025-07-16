const Class = require('../models/Class');
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const Discussion = require('../models/Discussion');
const StudentInvitation = require('../models/StudentInvitation');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Class ID is required'
    });
  }

  try {
    const classData = await Class.findById(id)
      .populate('teacherId', 'name email')
      .populate('additionalTeachers', 'name email')
      .populate('students', 'name email registrationId');

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Combine main teacher and additional teachers
    const allTeachers = [classData.teacherId];
    if (classData.additionalTeachers && classData.additionalTeachers.length > 0) {
      allTeachers.push(...classData.additionalTeachers);
    }

    res.status(200).json({
      success: true,
      people: {
        teachers: allTeachers,
        students: classData.students || []
      }
    });
  } catch (error) {
    console.error('Error fetching class people:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class people',
      error: error.message
    });
  }
};

exports.addTeacher = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  const requestingUserId = req.user.id;

  if (!id || !email) {
    return res.status(400).json({
      success: false,
      message: 'Class ID and teacher email are required'
    });
  }

  try {
    // Find the class and verify the requesting user is a teacher of this class
    const classData = await Class.findById(id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if the requesting user is the main teacher or an additional teacher
    const isMainTeacher = classData.teacherId.toString() === requestingUserId;
    const isAdditionalTeacher = classData.additionalTeachers && 
      classData.additionalTeachers.some(teacherId => teacherId.toString() === requestingUserId);

    if (!isMainTeacher && !isAdditionalTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers of this class can add other teachers'
      });
    }

    // Find the teacher by email
    const teacherToAdd = await Teacher.findOne({ email: email.toLowerCase() });
    if (!teacherToAdd) {
      return res.status(404).json({
        success: false,
        message: 'Teacher with this email not found'
      });
    }

    // Check if teacher is already the main teacher
    if (classData.teacherId.toString() === teacherToAdd._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'This teacher is already the main teacher of this class'
      });
    }

    // Check if teacher is already an additional teacher
    if (classData.additionalTeachers && 
        classData.additionalTeachers.some(teacherId => teacherId.toString() === teacherToAdd._id.toString())) {
      return res.status(400).json({
        success: false,
        message: 'This teacher is already added to this class'
      });
    }

    // Add the teacher to additionalTeachers array
    classData.additionalTeachers = classData.additionalTeachers || [];
    classData.additionalTeachers.push(teacherToAdd._id);
    await classData.save();

    // Also add this class to the teacher's classes array
    await Teacher.findByIdAndUpdate(teacherToAdd._id, { 
      $addToSet: { classes: classData._id } 
    });

    // Return the added teacher info
    res.status(200).json({
      success: true,
      message: 'Teacher added successfully',
      teacher: {
        _id: teacherToAdd._id,
        name: teacherToAdd.name,
        email: teacherToAdd.email
      }
    });
  } catch (error) {
    console.error('Error adding teacher to class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add teacher to class',
      error: error.message
    });
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
        console.log('req.user object:', req.user); // Debug log
        
        const { classId, content, authorName } = req.body;
        
        // Check if req.user exists and has an id
        if (!req.user || !req.user.id) {
            console.error('Authentication failed: req.user is', req.user);
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        const loggedInUserId = req.user.id; // Get the logged-in user ID
        console.log('Logged-in user ID:', loggedInUserId);
        
        if (!classId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Class ID and content are required'
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

        // Get the actual logged-in teacher's information
        const loggedInTeacher = await Teacher.findById(loggedInUserId);
        if (!loggedInTeacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        console.log('Found class:', classDoc.className);
        console.log('Logged-in teacher:', loggedInTeacher.name);

        try {
            // Use the logged-in teacher's name for the announcement
            const newAnnouncement = {
                content: content,
                author: {
                    name: loggedInTeacher.name,
                    id: loggedInTeacher._id
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
        
        // Check if req.user exists and has an id
        if (!req.user || !req.user.id) {
            console.error('Authentication failed for comment: req.user is', req.user);
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        // Use the logged-in user's ID from the authentication middleware
        const authorId = req.user.id;
        
        console.log("Comment request details:", {
            classId,
            announcementId,
            content,
            authorRole,
            loggedInUserId: authorId
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
        
        // Determine the author model based on role and get the actual user from database
        const authorModelName = authorRole === 'Teacher' ? 'Teacher' : 'Student';
        let verifiedAuthorName = 'Unknown User';
        
        // Get the correct user name from database using the logged-in user's ID
        try {
            if (authorId) {
                const AuthorModel = mongoose.model(authorModelName);
                const author = await AuthorModel.findById(authorId).select('name');
                
                if (author && author.name) {
                    console.log(`Found ${authorModelName} with ID ${authorId}, name: ${author.name}`);
                    verifiedAuthorName = author.name;
                } else {
                    console.log(`${authorModelName} not found with ID ${authorId}`);
                    return res.status(404).json({
                        success: false,
                        message: `${authorModelName} not found`
                    });
                }
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
        } catch (err) {
            console.error("Error verifying author:", err);
            return res.status(500).json({
                success: false,
                message: 'Error verifying author identity'
            });
        }
        
        // Create new comment
        const newComment = {
            content,
            author: {
                name: verifiedAuthorName,
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

exports.updateClass = async (req, res) => {
    try {
        console.log('Updating class with data:', req.body);
        
        const { id } = req.params;
        const { className, section } = req.body;
        
        // Check if req.user exists and has an id
        if (!req.user || !req.user.id) {
            console.error('Authentication failed: req.user is', req.user);
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        const loggedInUserId = req.user.id;
        console.log('Logged-in user ID:', loggedInUserId);
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Class ID is required'
            });
        }
        
        if (!className && !section) {
            return res.status(400).json({
                success: false,
                message: 'At least one field (className or section) is required'
            });
        }
        
        // Find the class
        const classDoc = await Class.findById(id);
        if (!classDoc) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }
        
        // Check if teacher has permission to update this class
        const isMainTeacher = classDoc.teacherId.toString() === loggedInUserId;
        const isAdditionalTeacher = classDoc.additionalTeachers && classDoc.additionalTeachers.some(
            teacherId => teacherId.toString() === loggedInUserId
        );
        
        if (!isMainTeacher && !isAdditionalTeacher) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this class'
            });
        }
        
        // Update the class fields
        const updateFields = {};
        if (className) updateFields.className = className.trim();
        if (section) updateFields.section = section.trim();
        
        const updatedClass = await Class.findByIdAndUpdate(
            id,
            updateFields,
            { new: true, runValidators: true }
        ).populate('teacherId', 'name email');
        
        console.log('Class updated successfully:', updatedClass.className);
        
        res.status(200).json({
            success: true,
            message: 'Class updated successfully',
            class: {
                _id: updatedClass._id,
                className: updatedClass.className,
                section: updatedClass.section,
                classCode: updatedClass.classCode,
                teacherId: updatedClass.teacherId._id,
                teacher: {
                    name: updatedClass.teacherId.name,
                    email: updatedClass.teacherId.email
                },
                coverImage: updatedClass.coverImage || 'https://gstatic.com/classroom/themes/img_code.jpg'
            }
        });
        
    } catch (error) {
        console.error('Error updating class:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating class',
            error: error.message
        });
    }
};

// Invite student to class
exports.inviteStudent = async (req, res) => {
    try {
        console.log('Inviting student with data:', req.body);
        
        const { classId, email } = req.body;
        
        // Check if req.user exists and has an id
        if (!req.user || !req.user.id) {
            console.error('Authentication failed: req.user is', req.user);
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        const loggedInUserId = req.user.id;
        console.log('Logged-in user ID:', loggedInUserId);
        
        if (!classId || !email) {
            return res.status(400).json({
                success: false,
                message: 'Class ID and email are required'
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
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
        
        // Get the logged-in teacher's information
        const loggedInTeacher = await Teacher.findById(loggedInUserId);
        if (!loggedInTeacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }
        
        console.log('Found class:', classDoc.className);
        console.log('Logged-in teacher:', loggedInTeacher.name);
        
        // Check if teacher has permission to invite to this class
        const isMainTeacher = classDoc.teacherId.toString() === loggedInUserId;
        const isAdditionalTeacher = classDoc.additionalTeachers.some(
            teacherId => teacherId.toString() === loggedInUserId
        );
        
        if (!isMainTeacher && !isAdditionalTeacher) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to invite students to this class'
            });
        }
        
        // Check if invitation already exists for this email and class
        const existingInvitation = await StudentInvitation.findOne({
            email: email.toLowerCase(),
            classId,
            status: 'pending'
        });
        
        if (existingInvitation) {
            return res.status(400).json({
                success: false,
                message: 'An invitation has already been sent to this email for this class'
            });
        }
        
        // Check if student is already enrolled
        const existingStudent = await Student.findOne({
            email: email.toLowerCase(),
            enrolledClasses: classId
        });
        
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Student is already enrolled in this class'
            });
        }
        
        // Generate invitation token
        const invitationData = {
            email: email.toLowerCase(),
            classId,
            invitedBy: loggedInUserId,
            invitedByName: loggedInTeacher.name,
            timestamp: Date.now()
        };
        
        const token = jwt.sign(invitationData, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        // Create invitation record
        const invitation = new StudentInvitation({
            email: email.toLowerCase(),
            classId,
            invitedBy: loggedInUserId,
            invitedByName: loggedInTeacher.name,
            token
        });
        
        await invitation.save();
        
        // Send invitation email
        await sendStudentInvitationEmail(
            email.toLowerCase(),
            loggedInTeacher.name,
            classDoc.className,
            token
        );
        
        console.log('Student invitation sent successfully');
        
        res.status(201).json({
            success: true,
            message: 'Invitation sent successfully',
            invitation: {
                email: email.toLowerCase(),
                className: classDoc.className,
                invitedBy: loggedInTeacher.name,
                sentAt: invitation.createdAt
            }
        });
        
    } catch (error) {
        console.error('Error inviting student:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending invitation',
            error: error.message
        });
    }
};

// Send student invitation email
const sendStudentInvitationEmail = async (email, teacherName, className, token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const invitationLink = `${frontendUrl}/invite?token=${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: email,
        subject: `Invitation to join ${className}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1b68b3; font-size: 28px; margin: 0;">Smart Classroom LMS</h1>
                        <p style="color: #666; font-size: 16px; margin: 10px 0;">You're invited to join a class!</p>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h2 style="color: #333; font-size: 22px; margin-bottom: 15px;">Class Invitation</h2>
                        <p style="color: #555; font-size: 16px; line-height: 1.6;">
                            <strong>${teacherName}</strong> has invited you to join the class:
                        </p>
                        <div style="background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1b68b3;">
                            <h3 style="color: #1b68b3; margin: 0; font-size: 20px;">${className}</h3>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${invitationLink}" 
                           style="display: inline-block; background-color: #1b68b3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; transition: background-color 0.3s;">
                            Join Class
                        </a>
                    </div>
                    
                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <p style="color: #856404; margin: 0; font-size: 14px;">
                            <strong>Note:</strong> This invitation will expire in 7 days. Click the button above to join the class instantly.
                        </p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                        <p style="color: #888; font-size: 14px; margin: 0;">
                            If you have any questions, please contact your teacher or system administrator.
                        </p>
                        <p style="color: #888; font-size: 12px; margin: 10px 0 0 0;">
                            If the button doesn't work, copy and paste this link: ${invitationLink}
                        </p>
                    </div>
                </div>
            </div>
        `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Student invitation email sent to:', email);
};
