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

// ...other assignment controller methods...
