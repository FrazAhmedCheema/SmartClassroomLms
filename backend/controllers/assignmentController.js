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

// ...other assignment controller methods...
