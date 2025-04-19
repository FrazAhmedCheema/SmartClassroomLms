const Assignment = require('../models/Assignment');
const { uploadFile, deleteFile } = require('../utils/s3Service');

exports.createAssignment = async (req, res) => {
  try {
    const { classId } = req.params;
    let { title, instructions, points, dueDate, topicId, createdBy } = req.body;

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
      attachments
    });

    const savedAssignment = await assignment.save();

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
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Delete attachments from S3 if they exist
    if (assignment.attachments && assignment.attachments.length > 0) {
      for (const attachment of assignment.attachments) {
        try {
          await deleteFile(attachment.key);
        } catch (error) {
          console.error('Error deleting file from S3:', error);
          // Continue with deletion even if S3 deletion fails
        }
      }
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment',
      error: error.message
    });
  }
};

// ...other assignment controller methods...
