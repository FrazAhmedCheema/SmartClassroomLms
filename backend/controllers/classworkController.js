const Classwork = require('../models/Classwork');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const Material = require('../models/Material');
const Question = require('../models/Question');
const Class = require('../models/Class');
const Topic = require('../models/Topic');
const fs = require('fs');
const path = require('path');
const { getClassFolder, uploadFile } = require('../utils/googleDriveService');
const { createClassworkNotifications } = require('../utils/notificationHelper');

// Handle file uploads and save to Google Drive
const uploadFilesToDrive = async (files, classId) => {
  if (!files || files.length === 0) return [];
  
  try {
    // Get or create class folder
    const classFolder = await getClassFolder(classId);
    
    // Upload each file to Google Drive
    const uploadPromises = files.map(async (file) => {
      const uploadResult = await uploadFile(file, [classFolder.id]);
      
      // Extract file extension for file type
      const fileExt = path.extname(file.originalname).slice(1).toLowerCase();
      
      // Delete temporary file
      fs.unlinkSync(file.path);
      
      // Return attachment object
      return {
        fileName: file.originalname,
        fileType: fileExt || 'unknown',
        driveFileId: uploadResult.id,
        driveViewLink: uploadResult.webViewLink,
        driveDownloadLink: uploadResult.webContentLink
      };
    });
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    // Clean up temp files on error
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    
    throw error;
  }
};

// Create classwork
exports.createClasswork = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Classwork created successfully',
      classwork: {} // Will be populated with real data later
    });
  } catch (error) {
    console.error('Error creating classwork:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create classwork',
      error: error.message
    });
  }
};

// Get all classwork for a class
exports.getClassworks = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      classworks: [] // Will be populated with real data later
    });
  } catch (error) {
    console.error('Error getting classworks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get classworks',
      error: error.message
    });
  }
};

// Get single classwork by ID
exports.getClasswork = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      classwork: {}, // Will be populated with real data later
      typeSpecificData: {} // Will be populated with real data later
    });
  } catch (error) {
    console.error('Error getting classwork:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get classwork',
      error: error.message
    });
  }
};

// Update classwork
exports.updateClasswork = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Classwork updated successfully',
      classwork: {} // Will be populated with real data later
    });
  } catch (error) {
    console.error('Error updating classwork:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update classwork',
      error: error.message
    });
  }
};

// Delete classwork
exports.deleteClasswork = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Classwork deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting classwork:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete classwork',
      error: error.message
    });
  }
};

// Remove attachment from classwork
exports.removeAttachment = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Attachment removed successfully',
      classwork: {} // Will be populated with real data later
    });
  } catch (error) {
    console.error('Error removing attachment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove attachment',
      error: error.message
    });
  }
};

// Create a new topic
exports.createTopic = async (req, res) => {
  const { name, category, classId } = req.body;

  if (!name || !category || !classId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: name, category, or classId'
    });
  }

  try {
    const newTopic = new Topic({ name, category, classId });
    await newTopic.save();

    res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      topic: newTopic
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create topic',
      error: error.message
    });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { classId } = req.params;
    let { title, instructions, points, dueDate, topicId, createdBy } = req.body;

    // Parse JSON strings if needed
    try {
      if (typeof dueDate === 'string' && dueDate.startsWith('"')) {
        dueDate = JSON.parse(dueDate);
      }
      if (typeof points === 'string') {
        points = Number(points);
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }

    console.log('Processing assignment data:', {
      title, instructions, points, dueDate, topicId, createdBy, classId
    });

    // Validate required fields
    if (!title || !classId || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, classId, and createdBy are required'
      });
    }

    // Create classwork entry
    const classwork = new Classwork({
      title,
      instructions: instructions || '',
      type: 'assignment',
      classId,
      topicId: topicId || null,
      points: points || 0,
      dueDate: dueDate || null,
      createdBy,
      attachments: []
    });

    const savedClasswork = await classwork.save();

    // Create assignment entry
    const assignment = new Assignment({
      classworkId: savedClasswork._id,
      maxPoints: Number(points) || 0,
      dueDate,
      allowLateSubmissions: false
    });

    await assignment.save();

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
          workId: savedClasswork._id,
          dueDate: dueDate,
          points: points
        }
      );
    } catch (notificationError) {
      console.error('Error creating assignment notifications from classworkController:', notificationError);
      // Don't fail the assignment creation if notifications fail
    }

    // Return response
    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      classwork: savedClasswork
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
