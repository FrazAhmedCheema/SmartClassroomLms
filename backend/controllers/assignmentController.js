const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const { uploadFile, deleteFile } = require('../utils/s3Service');
const Class = require('../models/Class'); // Add this import
const { createClassworkNotifications } = require('../utils/notificationHelper');

exports.createAssignment = async (req, res) => {
  try {
    const { classId } = req.params;
    let { title, instructions, points, dueDate, topicId, createdBy, category } = req.body;

    // Create attachment array from uploaded files
    let attachments = [];
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          const key = `assignments/${classId}/${Date.now()}-${file.originalname}`;
          const uploadResult = await uploadFile(file, key);
          
          attachments.push({
            fileName: file.originalname,
            fileType: file.mimetype,
            key: key,
            url: uploadResult.Location
          });
        }
      } catch (error) {
        console.error('Error uploading files:', error);
        // Continue without attachments if upload fails
      }
    }

    const assignment = new Assignment({
      title,
      instructions: instructions || '',
      classId,
      topicId: topicId || null,
      points: Number(points) || 0,
      dueDate: dueDate || null,
      createdBy,
      category: category || 'general',
      attachments
    });

    const savedAssignment = await assignment.save();

    // Update class to include the new assignment
    await Class.findByIdAndUpdate(
      classId,
      { $push: { assignments: savedAssignment._id } },
      { new: true }
    );

    // Create notifications for students
    try {
      // Get teacher name for notification
      const classWithTeacher = await Class.findById(classId).populate('teacherId', 'name');
      const teacherName = classWithTeacher?.teacherId?.name || 'Teacher';
      
      await createClassworkNotifications(
        classId, 
        'assignment', 
        title, 
        teacherName,
        {
          workId: savedAssignment._id,
          dueDate: dueDate,
          points: points
        }
      );
    } catch (notificationError) {
      console.error('Error creating assignment notifications:', notificationError);
      // Don't fail the assignment creation if notifications fail
    }

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment: savedAssignment
    });

  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: error.message
    });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const { classId } = req.params;
    const assignments = await Assignment.find({ classId })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      assignments
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
};

exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('topicId', 'name');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.status(200).json({
      success: true,
      assignment
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment',
      error: error.message
    });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // 1. Delete assignment attachments from AWS
    if (assignment.attachments && assignment.attachments.length > 0) {
      for (const attachment of assignment.attachments) {
        try {
          await deleteFile(attachment.key);
          console.log(`Deleted assignment attachment: ${attachment.fileName}`);
        } catch (error) {
          console.error(`Error deleting assignment attachment: ${attachment.fileName}`, error);
        }
      }
    }

    // 2. Get and delete submissions directly using the studentSubmissions array
    const submissions = await Submission.find({
      _id: { $in: assignment.studentSubmissions }
    });

    for (const submission of submissions) {
      // Delete submission files from S3
      if (submission.files && submission.files.length > 0) {
        for (const file of submission.files) {
          try {
            await deleteFile(file.key);
            console.log(`Deleted submission file: ${file.fileName}`);
          } catch (error) {
            console.error(`Error deleting submission file: ${file.fileName}`, error);
          }
        }
      }
    }

    // 3. Delete all submissions in one operation
    await Submission.deleteMany({
      _id: { $in: assignment.studentSubmissions }
    });

    // 4. Finally delete the assignment
    await Assignment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Assignment and all related data deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteAssignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment',
      error: error.message
    });
  }
};

// Get all assignments for a student
exports.getStudentAssignments = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get all classes the student is enrolled in
    const classes = await Class.find({ students: studentId });
    const classIds = classes.map(c => c._id);
    
    // Get all assignments from these classes with submission status
    const assignments = await Assignment.find({ classId: { $in: classIds } })
      .populate('classId', 'className section')
      .lean();
    
    // Get all submissions for this student
    const submissions = await Submission.find({ 
      assignmentId: { $in: assignments.map(a => a._id) },
      studentId
    }).lean();
    
    // Create a map of assignment ID to submission
    const submissionMap = {};
    submissions.forEach(sub => {
      submissionMap[sub.assignmentId.toString()] = sub;
    });
    
    // Add submission status to each assignment
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = submissionMap[assignment._id.toString()];
      return { 
        ...assignment, 
        class: assignment.classId, // Rename for frontend
        submission
      };
    });
    
    res.status(200).json({
      success: true,
      assignments: assignmentsWithStatus
    });
  } catch (error) {
    console.error('Error in getStudentAssignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
};

// Get all assignments for a teacher
exports.getTeacherAssignments = async (req, res) => {
  try {
    const teacherId = req.user._id;
    
    // Get all classes where user is a teacher
    const classes = await Class.find({ 
      $or: [
        { teacher: teacherId },
        { additionalTeachers: teacherId }
      ]
    });
    
    const classIds = classes.map(c => c._id);
    
    // Get all assignments from these classes
    const assignments = await Assignment.find({ classId: { $in: classIds } })
      .populate('classId', 'className section')
      .lean();
    
    // Get all submissions for these assignments
    const submissions = await Submission.find({
      assignmentId: { $in: assignments.map(a => a._id) },
      status: 'submitted'  // Only get submitted assignments
    }).select('assignmentId status submittedAt gradedAt grade').lean();
    
    // Group submissions by assignment
    const submissionsByAssignment = {};
    submissions.forEach(sub => {
      const assignmentId = sub.assignmentId.toString();
      if (!submissionsByAssignment[assignmentId]) {
        submissionsByAssignment[assignmentId] = [];
      }
      submissionsByAssignment[assignmentId].push(sub);
    });
    
    // Add submissions to each assignment
    const assignmentsWithSubmissions = assignments.map(assignment => {
      return {
        ...assignment,
        class: assignment.classId, // Rename for frontend
        submissions: submissionsByAssignment[assignment._id.toString()] || []
      };
    });
    
    console.log('Sending assignments with submissions:', {
      totalAssignments: assignmentsWithSubmissions.length,
      totalSubmissions: submissions.length,
      pendingSubmissions: submissions.filter(s => !s.gradedAt).length
    });
    
    res.status(200).json({
      success: true,
      assignments: assignmentsWithSubmissions
    });
  } catch (error) {
    console.error('Error in getTeacherAssignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
};
